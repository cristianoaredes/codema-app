import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/services/auth/AuthService'

// Mock supabase client used inside AuthService
vi.mock('@/integrations/supabase/client', () => {
  return {
    supabase: {
      auth: {
        signInWithPassword: vi.fn(),
        signInWithOtp: vi.fn(),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
        signOut: vi.fn(),
        updateUser: vi.fn(),
        resetPasswordForEmail: vi.fn(),
      },
      from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({}) })),
      functions: { invoke: vi.fn() },
    },
  }
})

// Utilities used in AuthService
vi.mock('@/utils', async (orig) => {
  const original = await orig()
  return {
    ...original,
    metricsCollector: { recordAuthEvent: vi.fn(), recordError: vi.fn(), recordMetric: vi.fn() },
    withResilientOperation: async (fn: () => Promise<unknown>) => fn(),
    authCircuitBreaker: {},
    healthMonitor: { performFullHealthCheck: vi.fn().mockResolvedValue({ overall: 'healthy' }) },
    canSendEmail: vi.fn(() => ({ canSend: true, attemptsUsed: 0, maxAttempts: 3 })),
    recordEmailAttempt: vi.fn(),
    formatTimeRemaining: vi.fn(() => '1h'),
    createPersistentSession: vi.fn(),
    checkPersistentSession: vi.fn(async () => ({ isValid: false })),
    getPersistentSessions: vi.fn(),
    revokePersistentSession: vi.fn(async () => ({ error: null })),
    revokeAllPersistentSessions: vi.fn(async () => ({ error: null })),
  }
})

// Importa o mock após vi.mock para Vitest resolver o alias corretamente
import { supabase } from '@/integrations/supabase/client'

describe('AuthService', () => {
  const authService = AuthService.getInstance()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('faz login com sucesso e retorna user e session', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({
      data: { user: { id: 'u1', email: 'a@b.com' }, session: { access_token: 't', user: { id: 'u1' } } },
      error: null,
    })

    const res = await authService.signIn({ email: 'a@b.com', password: 'secret123' })
    expect(res.error).toBeNull()
    expect(res.user?.id).toBe('u1')
    expect(res.session).toBeTruthy()
  })

  it('mapeia erro de credenciais inválidas para mensagem em pt-br', async () => {
    supabase.auth.signInWithPassword.mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid login credentials' } })

    const res = await authService.signIn({ email: 'a@b.com', password: 'wrong' })
    expect(res.error).toBe('Email ou senha incorretos')
  })
})
