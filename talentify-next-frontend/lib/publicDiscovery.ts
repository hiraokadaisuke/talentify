import { getPublicEvents, toTokyoDateKey, type PublicEvent } from '@/lib/events/publicEvents'
import { createServiceClient } from '@/lib/supabase/service'

export type PublicStoreSummary = {
  id: string
  name: string
  prefecture: string | null
  address: string | null
  avatarUrl: string | null
  events: PublicEvent[]
  upcomingEvents: PublicEvent[]
  pastEvents: PublicEvent[]
  nextEvent: PublicEvent | null
}

export type PublicPerformerSummary = {
  id: string
  name: string
  avatarUrl: string | null
  bio: string | null
  twitterUrl: string | null
  instagramUrl: string | null
  youtubeUrl: string | null
  tiktokUrl: string | null
  events: PublicEvent[]
  upcomingEvents: PublicEvent[]
  pastEvents: PublicEvent[]
  nextEvent: PublicEvent | null
}

function activeEvent(event: PublicEvent, today: string) {
  return !['canceled', 'ended'].includes(event.publicationStatus) && event.dateKey >= today
}

function pastEvent(event: PublicEvent, today: string) {
  return event.publicationStatus !== 'canceled' && (event.publicationStatus === 'ended' || event.dateKey < today)
}

export async function getPublicStores(): Promise<PublicStoreSummary[]> {
  const events = await getPublicEvents()
  const today = toTokyoDateKey(new Date())
  const grouped = new Map<string, PublicStoreSummary>()

  for (const event of events) {
    if (event.publicationStatus === 'canceled') continue

    const current = grouped.get(event.store.id) ?? {
      id: event.store.id,
      name: event.store.name,
      prefecture: event.store.prefecture,
      address: event.store.address,
      avatarUrl: event.store.avatarUrl,
      events: [],
      upcomingEvents: [],
      pastEvents: [],
      nextEvent: null,
    }

    current.events.push(event)
    if (activeEvent(event, today)) current.upcomingEvents.push(event)
    if (pastEvent(event, today)) current.pastEvents.push(event)

    if (!current.prefecture && event.store.prefecture) current.prefecture = event.store.prefecture
    if (!current.address && event.store.address) current.address = event.store.address
    if (!current.avatarUrl && event.store.avatarUrl) current.avatarUrl = event.store.avatarUrl

    grouped.set(event.store.id, current)
  }

  return Array.from(grouped.values())
    .map((store) => {
      store.events.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      store.upcomingEvents.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      store.pastEvents.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
      store.nextEvent = store.upcomingEvents[0] ?? null
      return store
    })
    .sort((a, b) => {
      if (b.upcomingEvents.length !== a.upcomingEvents.length) {
        return b.upcomingEvents.length - a.upcomingEvents.length
      }
      return a.name.localeCompare(b.name, 'ja')
    })
}

export async function getPublicStoreById(id: string) {
  const stores = await getPublicStores()
  return stores.find((store) => store.id === id) ?? null
}

export async function getPublicPerformers(): Promise<PublicPerformerSummary[]> {
  const [events, profilesResult] = await Promise.all([
    getPublicEvents(),
    (createServiceClient() as any)
      .from('public_talent_profiles')
      .select(
        'id,stage_name,display_name,avatar_url,bio,twitter_url,instagram_url,youtube_url,social_tiktok'
      ),
  ])

  const today = toTokyoDateKey(new Date())
  const grouped = new Map<string, PublicPerformerSummary>()

  if (profilesResult.error) {
    console.error('Failed to load public performer profiles', profilesResult.error)
  } else {
    for (const profile of profilesResult.data || []) {
      if (!profile?.id) continue

      grouped.set(profile.id, {
        id: profile.id,
        name: profile.stage_name || profile.display_name || '演者',
        avatarUrl: profile.avatar_url ?? null,
        bio: profile.bio ?? null,
        twitterUrl: profile.twitter_url ?? null,
        instagramUrl: profile.instagram_url ?? null,
        youtubeUrl: profile.youtube_url ?? null,
        tiktokUrl: profile.social_tiktok ?? null,
        events: [],
        upcomingEvents: [],
        pastEvents: [],
        nextEvent: null,
      })
    }
  }

  for (const event of events) {
    if (event.publicationStatus === 'canceled') continue

    const current = grouped.get(event.talent.id) ?? {
      id: event.talent.id,
      name: event.talent.name,
      avatarUrl: event.talent.avatarUrl,
      bio: event.talent.bio,
      twitterUrl: event.talent.twitterUrl,
      instagramUrl: event.talent.instagramUrl,
      youtubeUrl: event.talent.youtubeUrl,
      tiktokUrl: event.talent.tiktokUrl,
      events: [],
      upcomingEvents: [],
      pastEvents: [],
      nextEvent: null,
    }

    current.events.push(event)
    if (activeEvent(event, today)) current.upcomingEvents.push(event)
    if (pastEvent(event, today)) current.pastEvents.push(event)

    if (!current.avatarUrl && event.talent.avatarUrl) current.avatarUrl = event.talent.avatarUrl
    if (!current.bio && event.talent.bio) current.bio = event.talent.bio
    if (!current.twitterUrl && event.talent.twitterUrl) current.twitterUrl = event.talent.twitterUrl
    if (!current.instagramUrl && event.talent.instagramUrl) current.instagramUrl = event.talent.instagramUrl
    if (!current.youtubeUrl && event.talent.youtubeUrl) current.youtubeUrl = event.talent.youtubeUrl
    if (!current.tiktokUrl && event.talent.tiktokUrl) current.tiktokUrl = event.talent.tiktokUrl

    grouped.set(event.talent.id, current)
  }

  return Array.from(grouped.values())
    .map((performer) => {
      performer.events.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      performer.upcomingEvents.sort((a, b) => a.dateKey.localeCompare(b.dateKey))
      performer.pastEvents.sort((a, b) => b.dateKey.localeCompare(a.dateKey))
      performer.nextEvent = performer.upcomingEvents[0] ?? null
      return performer
    })
    .sort((a, b) => {
      const aHasUpcoming = a.upcomingEvents.length > 0 ? 1 : 0
      const bHasUpcoming = b.upcomingEvents.length > 0 ? 1 : 0
      if (bHasUpcoming !== aHasUpcoming) return bHasUpcoming - aHasUpcoming
      if (b.upcomingEvents.length !== a.upcomingEvents.length) {
        return b.upcomingEvents.length - a.upcomingEvents.length
      }
      return a.name.localeCompare(b.name, 'ja')
    })
}

export async function getPublicPerformerById(id: string) {
  const performers = await getPublicPerformers()
  return performers.find((performer) => performer.id === id) ?? null
}
