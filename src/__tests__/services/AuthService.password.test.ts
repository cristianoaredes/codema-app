import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/services/auth/AuthService'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }),
    },
    from: vi.fn(() => ({ insert: vi.fn().mockResolvedValue({}) })),
  },
}))

vi.mock('@/utils', async (orig) => {
  const original = await orig()
  return {
    ...original,
    canSendEmail: vi.fn(() => ({ canSend: true, attemptsUsed: 0, maxAttempts: 3 })),
    recordEmailAttempt: vi.fn(),
    formatTimeRemaining: vi.fn(() => '1h'),
  }
})

describe('AuthService reset/update password', () => {
  const service = AuthService.getInstance()
  const supabaseModule = await import('@/integrations/supabase/client')
  const utilsModule = await import('@/utils')
  const { supabase } = supabaseModule as { supabase: typeof supabaseModule.supabase }
  const utils = utilsModule as typeof utilsModule

  beforeEach(() => vi.clearAllMocks())

  it('envia reset de senha quando permitido pelo rate limit', async () => {
    utils.canSendEmail.mockReturnValue({ canSend: true, attemptsUsed: 0, maxAttempts: 3 })
    const res = await service.resetPassword({ email: 'x@y.com' })
    expect(res.error).toBeNull()
    expect(supabase.auth.resetPasswordForEmail).toHaveBeenCalled()
  })

  it('bloqueia reset de senha quando atinge rate limit', async () => {
    utils.canSendEmail.mockReturnValue({ canSend: false, attemptsUsed: 3, maxAttempts: 3, nextAvailableIn: 3600 })
    const res = await service.resetPassword({ email: 'x@y.com' })
    expect(res.error).toMatch(/Limite de emails atingido/i)
  })

  it('atualiza senha com sucesso', async () => {
    const res = await service.updatePassword('NewStrongPass1')
    expect(res.error).toBeNull()
    expect(supabase.auth.updateUser).toHaveBeenCalled()
  })
})

