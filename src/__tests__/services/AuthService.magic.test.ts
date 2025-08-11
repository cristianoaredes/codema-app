import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthService } from '@/services/auth/AuthService'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
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

describe('AuthService magic link', () => {
  beforeEach(() => vi.clearAllMocks())

  it('envia magic link com sucesso', async () => {
    const service = AuthService.getInstance()
    const res = await service.signInWithMagicLink('test@example.com')
    expect(res.error).toBeNull()
  })
})

