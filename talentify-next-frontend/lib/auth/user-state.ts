export type AppUserStatus =
  | 'pending_email_verification'
  | 'onboarding'
  | 'active'
  | 'suspended'

/**
 * Route guard / middleware guidance:
 * - pending_email_verification: show verification check / resend mail flow
 * - onboarding: lock to onboarding pages
 * - active: allow full product access
 * - suspended: lock to suspended/support page
 */
export const APP_USER_STATUS_TRANSITIONS: Record<AppUserStatus, AppUserStatus[]> = {
  pending_email_verification: ['onboarding', 'suspended'],
  onboarding: ['active', 'suspended'],
  active: ['suspended'],
  suspended: [],
}

export function resolveNextAppUserStatus(
  current: AppUserStatus | null | undefined,
  next: AppUserStatus
): AppUserStatus {
  if (!current) {
    return next
  }

  if (current === next) {
    return current
  }

  if (current === 'suspended' || next === 'suspended') {
    return 'suspended'
  }

  return APP_USER_STATUS_TRANSITIONS[current].includes(next) ? next : current
}
