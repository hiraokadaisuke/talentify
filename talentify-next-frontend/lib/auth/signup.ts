import { z } from 'zod'
import { PRIVACY_VERSION, TERMS_VERSION } from '@/lib/legal/version'

export const SIGNUP_ROLES = ['talent', 'store'] as const
export const signUpSchema = z.object({
  email: z.string().email(),
  phone: z.string().transform(value => value.replace(/\D/g, '')).refine(value => /^\d{10,11}$/.test(value)),
  password: z.string().min(8),
  role: z.enum(SIGNUP_ROLES),
  acceptTerms: z.literal(true),
  acceptPrivacy: z.literal(true),
  termsVersion: z.literal(TERMS_VERSION),
  privacyVersion: z.literal(PRIVACY_VERSION),
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
