export function parseInstagramUsername(rawValue: string) {
  const raw = rawValue.trim()
  if (!raw) return null

  if (raw.startsWith('@')) {
    const username = raw.slice(1).trim()
    return username || null
  }

  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (host !== 'instagram.com') return null
    const username = url.pathname.split('/').filter(Boolean)[0]?.replace(/^@/, '')
    return username || null
  } catch {
    const username = raw.replace(/^@/, '').trim()
    return username || null
  }
}

type InstagramBusinessDiscoveryResponse = {
  business_discovery?: {
    id?: string
    followers_count?: number
  }
  error?: {
    message?: string
    type?: string
    code?: number
  }
}

export async function fetchInstagramMetrics(args: {
  rawValue: string
  sourceUserId: string
  accessToken: string
  graphVersion: string
}) {
  const username = parseInstagramUsername(args.rawValue)
  if (!username) return null

  const version = args.graphVersion.trim().replace(/^\/+|\/+$/g, '')
  if (!version) {
    throw new Error('Instagram Graph API version is not configured')
  }

  const params = new URLSearchParams({
    fields: `business_discovery.username(${username}){followers_count,id}`,
    access_token: args.accessToken,
  })

  const response = await fetch(
    `https://graph.facebook.com/${encodeURIComponent(version)}/${encodeURIComponent(
      args.sourceUserId
    )}?${params.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }
  )

  const payload = (await response.json()) as InstagramBusinessDiscoveryResponse

  if (!response.ok || payload.error) {
    throw new Error(
      `Instagram API request failed (${response.status}): ${payload.error?.message ?? 'unknown error'}`
    )
  }

  const discovery = payload.business_discovery
  if (!discovery) return null

  const followerCount = Number(discovery.followers_count)
  return {
    userId: discovery.id ?? null,
    username,
    followerCount:
      Number.isFinite(followerCount) && followerCount >= 0 ? followerCount : null,
  }
}
