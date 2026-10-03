type YouTubeIdentifier =
  | { kind: 'forHandle'; value: string }
  | { kind: 'id'; value: string }
  | { kind: 'forUsername'; value: string }

type YouTubeChannelResponse = {
  items?: Array<{
    id?: string
    statistics?: {
      subscriberCount?: string
      hiddenSubscriberCount?: boolean
    }
  }>
}

export type YouTubeMetrics = {
  channelId: string | null
  subscriberCount: number | null
  hiddenSubscriberCount: boolean
}

export function parseYouTubeIdentifier(rawValue: string): YouTubeIdentifier | null {
  const raw = rawValue.trim()
  if (!raw) return null

  if (raw.startsWith('@')) {
    const handle = raw.slice(1).trim()
    return handle ? { kind: 'forHandle', value: handle } : null
  }

  if (/^UC[A-Za-z0-9_-]{20,}$/.test(raw)) {
    return { kind: 'id', value: raw }
  }

  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (host !== 'youtube.com' && host !== 'm.youtube.com') return null

    const parts = url.pathname.split('/').filter(Boolean)
    const first = parts[0]
    if (!first) return null

    if (first.startsWith('@')) {
      return { kind: 'forHandle', value: first.slice(1) }
    }

    if (first === 'channel' && parts[1]) {
      return { kind: 'id', value: parts[1] }
    }

    if (first === 'user' && parts[1]) {
      return { kind: 'forUsername', value: parts[1] }
    }

    return null
  } catch {
    const plain = raw.replace(/^@/, '').trim()
    return plain ? { kind: 'forHandle', value: plain } : null
  }
}

export async function fetchYouTubeMetrics(
  rawValue: string,
  apiKey: string
): Promise<YouTubeMetrics | null> {
  const identifier = parseYouTubeIdentifier(rawValue)
  if (!identifier) return null

  const params = new URLSearchParams({
    part: 'statistics',
    key: apiKey,
  })
  params.set(identifier.kind, identifier.value)

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`,
    {
      method: 'GET',
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    }
  )

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    throw new Error(`YouTube API request failed (${response.status}): ${body.slice(0, 300)}`)
  }

  const payload = (await response.json()) as YouTubeChannelResponse
  const channel = payload.items?.[0]
  if (!channel) return null

  const hidden = Boolean(channel.statistics?.hiddenSubscriberCount)
  const parsedCount = Number(channel.statistics?.subscriberCount)
  const subscriberCount =
    !hidden && Number.isFinite(parsedCount) && parsedCount >= 0 ? parsedCount : null

  return {
    channelId: channel.id ?? null,
    subscriberCount,
    hiddenSubscriberCount: hidden,
  }
}
