export function getRedirectUrl(role: string) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app'

  return `${baseUrl}/profile/setup?role=${role}`
}
