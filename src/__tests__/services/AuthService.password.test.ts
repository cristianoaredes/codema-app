import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { AuthService } from '@/services/auth/AuthService'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn((_email, _options) => Promise.resolve({ error: null })),
      updateUser: vi.fn((_data) => Promise.resolve({ error: null })),
      getUser: vi.fn(() => Promise.resolve({ data: { user: { id: 'u1' } }, error: null })),
    },
    from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({ error: null }) })),
  },
}))

vi.mock('@/utils/email/emailRateLimit', () => ({
  canSendEmail: vi.fn(() => ({ canSend: true, attemptsUsed: 0, maxAttempts: 3 })),
  recordEmailAttempt: vi.fn(),
  formatTimeRemaining: vi.fn(() => '1h'),
}))

vi.mock('@/utils/monitoring/auditLogger', () => ({
  logAuthEvent: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@/utils/system/metricsCollector', () => ({
  recordMetric: vi.fn(),
  recordAuthEvent: vi.fn(),
  recordError: vi.fn(),
}))

describe('AuthService reset/update password', () => {
  const service = AuthService.getInstance()

type SupabaseMock = {
  auth: {
    resetPasswordForEmail: ReturnType<typeof vi.fn>;
    updateUser: ReturnType<typeof vi.fn>;
    getUser: ReturnType<typeof vi.fn>;
  };
  from: ReturnType<typeof vi.fn>;
};

describe('AuthService reset/update password', () => {
  const service = AuthService.getInstance()
  let supabase: SupabaseMock
  let rateLimitUtils: { canSendEmail: ReturnType<typeof vi.fn>; recordEmailAttempt: ReturnType<typeof vi.fn>; formatTimeRemaining: ReturnType<typeof vi.fn> }

  beforeAll(async () => {
    const supabaseModule = await import('@/integrations/supabase/client')
    const rateLimitModule = await import('@/utils/email/emailRateLimit')
    supabase = (supabaseModule as typeof supabaseModule).supabase
    rateLimitUtils = rateLimitModule as typeof rateLimitModule
  })

  beforeEach(() => vi.clearAllMocks())

  it('envia reset de senha quando permitido pelo rate limit', async () => {
    rateLimitUtils.canSendEmail.mockReturnValue({ canSend: true, attemptsUsed: 0, maxAttempts: 3 })
    const res = await service.resetPassword({ email: 'x@y.com' })
    expect(res.error).toBeNull()
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled()
  })

  it('bloqueia reset de senha quando atinge rate limit', async () => {
    rateLimitUtils.canSendEmail.mockReturnValue({ canSend: false, attemptsUsed: 3, maxAttempts: 3, nextAvailableIn: 3600 })
    const res = await service.resetPassword({ email: 'x@y.com' })
    expect(res.error).toMatch(/Limite de emails atingido/i)
  })

  it('atualiza senha com sucesso', async () => {
    const res = await service.updatePassword('NewStrongPass1')
    expect(res.error).toBeNull()
    expect(supabase.auth.updateUser).toHaveBeenCalled()
  })
})

