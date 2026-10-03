export function parseXUsername(rawValue: string) {
  const raw = rawValue.trim()
  if (!raw) return null

  if (raw.startsWith('@')) {
    const username = raw.slice(1).trim()
    return username || null
  }

  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (host !== 'x.com' && host !== 'twitter.com') return null
    const username = url.pathname.split('/').filter(Boolean)[0]?.replace(/^@/, '')
    return username || null
  } catch {
    const username = raw.replace(/^@/, '').trim()
    return username || null
  }
}

type XUserResponse = {
  data?: {
    id?: string
    username?: string
    public_metrics?: {
      followers_count?: number
    }
  }
  errors?: Array<{ detail?: string; title?: string }>
}

export async function fetchXMetrics(rawValue: string, bearerToken: string) {
  const username = parseXUsername(rawValue)
  if (!username) return null

  const response = await fetch(
    `https://api.x.com/2/users/by/username/${encodeURIComponent(username)}?user.fields=public_metrics`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Authorization: `Bearer ${bearerToken}`,
        Accept: 'application/json',
      },
    }
  )

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`X API request failed (${response.status}): ${body.slice(0, 300)}`)
  }

  const payload = (await response.json()) as XUserResponse
  const user = payload.data
  if (!user) return null

  const followerCount = Number(user.public_metrics?.followers_count)
  return {
    userId: user.id ?? null,
    username: user.username ?? username,
    followerCount:
      Number.isFinite(followerCount) && followerCount >= 0 ? followerCount : null,
  }
}
