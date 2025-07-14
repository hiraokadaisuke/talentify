export function getRedirectUrl(role: string) {
  const baseUrl =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : process.env.NEXT_PUBLIC_SITE_URL || 'https://talentify-xi.vercel.app'

  if (role === 'store') {
    return `${baseUrl}/store/edit`
  } else if (role === 'talent') {
    return `${baseUrl}/talent/edit`
  } else {
    return `${baseUrl}/`
  }
}
