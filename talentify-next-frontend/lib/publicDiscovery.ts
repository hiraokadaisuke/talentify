import { getPublicEvents, toTokyoDateKey, type PublicEvent } from '@/lib/events/publicEvents'

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
  const events = await getPublicEvents()
  const today = toTokyoDateKey(new Date())
  const grouped = new Map<string, PublicPerformerSummary>()

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
