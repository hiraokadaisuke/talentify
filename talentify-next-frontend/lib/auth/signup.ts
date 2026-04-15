import { z } from 'zod'

export const SIGNUP_ROLES = ['talent', 'store', 'company'] as const
export const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(SIGNUP_ROLES),
})

export type SignupRole = (typeof SIGNUP_ROLES)[number]

export type SignupErrorCode =
  | 'INVALID_INPUT'
  | 'RATE_LIMITED'
  | 'EMAIL_ALREADY_EXISTS'
  | 'INVALID_EMAIL'
  | 'SIGNUP_FAILED'

export function mapSupabaseSignUpError(
  error: { code?: string; message?: string } | null
): SignupErrorCode {
  const code = error?.code?.toLowerCase() ?? ''
  const message = error?.message?.toLowerCase() ?? ''

  if (code.includes('over_email_send_rate_limit') || message.includes('rate limit')) {
    return 'RATE_LIMITED'
  }

  if (message.includes('already') || message.includes('registered')) {
    return 'EMAIL_ALREADY_EXISTS'
  }

  if (message.includes('invalid') && message.includes('email')) {
    return 'INVALID_EMAIL'
  }

  return 'SIGNUP_FAILED'
}
