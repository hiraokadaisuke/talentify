import { z } from 'zod'
import { SIGNUP_ROLES, type SignupRole } from '@/lib/auth/signup'

export const RESEND_CONFIRMATION_COOLDOWN_SECONDS = 60

export const resendConfirmationSchema = z.object({
  email: z.string().trim().email(),
  role: z.enum(SIGNUP_ROLES).optional(),
  captchaToken: z.string().min(1).optional(),
})

export type ResendConfirmationCode =
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'NOT_FOUND_OR_ALREADY_VERIFIED'
  | 'RESEND_FAILED'
  | 'OK'

export function mapSupabaseResendError(
  error: { code?: string; message?: string } | null
): Exclude<ResendConfirmationCode, 'INVALID_INPUT' | 'OK'> {
  const code = error?.code?.toLowerCase() ?? ''
  const message = error?.message?.toLowerCase() ?? ''

  if (code.includes('over_email_send_rate_limit') || message.includes('rate limit')) {
    return 'RATE_LIMITED'
  }

  if (
    message.includes('not found') ||
    message.includes('user not found') ||
    message.includes('already verified')
  ) {
    return 'NOT_FOUND_OR_ALREADY_VERIFIED'
  }

  return 'RESEND_FAILED'
}

export function toSignupRole(value: string | null | undefined): SignupRole | undefined {
  if (!value) {
    return undefined
  }

  return SIGNUP_ROLES.includes(value as SignupRole)
    ? (value as SignupRole)
    : undefined
}
