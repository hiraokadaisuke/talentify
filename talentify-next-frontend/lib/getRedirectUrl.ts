export function getRedirectUrl(role: string) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app'

  // Always redirect to the auth callback so that Supabase session tokens
  // contained in the confirmation link can be exchanged properly. The
  // callback page will handle inserting profile rows and redirecting the user
  // to the appropriate edit page based on their role stored in localStorage.
  return `${baseUrl}/auth/callback`
}
