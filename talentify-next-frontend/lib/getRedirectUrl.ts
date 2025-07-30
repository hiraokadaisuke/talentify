export function getRedirectUrl(role: string) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_VERCEL_URL ?? ''

  // Always redirect to the auth callback so that Supabase session tokens
  // contained in the confirmation link can be exchanged properly. Pass the
  // desired role via query parameters instead of using localStorage.
  return `${baseUrl}/auth/callback?role=${encodeURIComponent(role)}`
}
