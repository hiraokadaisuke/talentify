import { resolveNextAppUserStatus } from '@/lib/auth/user-state'

describe('resolveNextAppUserStatus', () => {
  it('allows pending_email_verification to onboarding', () => {
    expect(resolveNextAppUserStatus('pending_email_verification', 'onboarding')).toBe(
      'onboarding'
    )
  })

  it('does not roll active back to onboarding', () => {
    expect(resolveNextAppUserStatus('active', 'onboarding')).toBe('active')
  })

  it('keeps suspended even if callback asks onboarding', () => {
    expect(resolveNextAppUserStatus('suspended', 'onboarding')).toBe('suspended')
  })

  it('always allows transition to suspended', () => {
    expect(resolveNextAppUserStatus('onboarding', 'suspended')).toBe('suspended')
  })
})
