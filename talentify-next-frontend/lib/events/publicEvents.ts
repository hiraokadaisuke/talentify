import { createServiceClient } from '@/lib/supabase/service'
import { storedOfferTimeToClock } from '@/lib/offers/timeRange'

export type PublicEvent = {
  id: string
  offerId: string
  slug: string
  publicationStatus: string
  publishAt: string | null
  publishedAt: string | null
  publicNote: string | null
  showTime: boolean
  offerStatus: string | null
  date: string
  dateKey: string
  startTime: string | null
  endTime: string | null
  talent: {
    id: string
    name: string
    avatarUrl: string | null
    bio: string | null
    twitterUrl: string | null
    instagramUrl: string | null
    youtubeUrl: string | null
    tiktokUrl: string | null
  }
  store: {
    id: string
    name: string
    prefecture: string | null
    address: string | null
    avatarUrl: string | null
  }
}

const PUBLIC_EVENT_SELECT = `
  id,
  offer_id,
  slug,
  status,
  publish_at,
  published_at,
  show_time,
  public_note,
  offer:offers!event_publications_offer_id_fkey(
    id,
    date,
    start_time,
    end_time,
    status,
    talent_id,
    store_id,
    talent:talents(
      id,
      stage_name,
      display_name,
      avatar_url,
      bio,
      profile,
      twitter_url,
      instagram_url,
      youtube_url,
      social_tiktok
    ),
    store:stores!offers_store_id_fkey(
      id,
      store_name,
      store_prefect,
      store_address,
      avatar_url
    )
  )
`

function one<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null
  return Array.isArray(value) ? value[0] ?? null : value
}

function isPublicationVisible(row: any, now = new Date()) {
  if (!row) return false
  if (row.status === 'published' || row.status === 'ended') return true
  if (row.status === 'scheduled') {
    return Boolean(row.publish_at && new Date(row.publish_at).getTime() <= now.getTime())
  }
  if (row.status === 'canceled') {
    return Boolean(row.published_at)
  }
  return false
}

export function toTokyoDateKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = parts.find((part) => part.type === 'year')?.value
  const month = parts.find((part) => part.type === 'month')?.value
  const day = parts.find((part) => part.type === 'day')?.value

  return year && month && day ? `${year}-${month}-${day}` : ''
}

function mapPublicEvent(row: any): PublicEvent | null {
  const offer = one<any>(row?.offer)
  const talent = one<any>(offer?.talent)
  const store = one<any>(offer?.store)

  if (!offer?.id || !offer?.date || !talent?.id || !store?.id) return null
  if (offer.status === 'no_show') return null

  const dateKey = toTokyoDateKey(offer.date)
  if (!dateKey) return null

  return {
    id: row.id,
    offerId: offer.id,
    slug: row.slug,
    publicationStatus: row.status,
    publishAt: row.publish_at ?? null,
    publishedAt: row.published_at ?? null,
    publicNote: row.public_note ?? null,
    showTime: Boolean(row.show_time),
    offerStatus: offer.status ?? null,
    date: offer.date,
    dateKey,
    startTime: row.show_time ? storedOfferTimeToClock(offer.start_time) : null,
    endTime: row.show_time ? storedOfferTimeToClock(offer.end_time) : null,
    talent: {
      id: talent.id,
      name: talent.stage_name || talent.display_name || '演者',
      avatarUrl: talent.avatar_url ?? null,
      bio: talent.bio || talent.profile || null,
      twitterUrl: talent.twitter_url ?? null,
      instagramUrl: talent.instagram_url ?? null,
      youtubeUrl: talent.youtube_url ?? null,
      tiktokUrl: talent.social_tiktok ?? null,
    },
    store: {
      id: store.id,
      name: store.store_name || '店舗',
      prefecture: store.store_prefect ?? null,
      address: store.store_address ?? null,
      avatarUrl: store.avatar_url ?? null,
    },
  }
}

export async function getPublicEvents() {
  const supabase = createServiceClient() as any
  const { data, error } = await supabase
    .from('event_publications')
    .select(PUBLIC_EVENT_SELECT)
    .in('status', ['published', 'scheduled', 'canceled', 'ended'])
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.error('Failed to load public events', error)
    return [] as PublicEvent[]
  }

  const now = new Date()
  return (data || [])
    .filter((row: any) => isPublicationVisible(row, now))
    .map(mapPublicEvent)
    .filter((event: PublicEvent | null): event is PublicEvent => Boolean(event))
    .sort((a: PublicEvent, b: PublicEvent) => {
      const dateCompare = a.dateKey.localeCompare(b.dateKey)
      if (dateCompare !== 0) return dateCompare
      return (a.startTime || '99:99').localeCompare(b.startTime || '99:99')
    })
}

export async function getPublicEventBySlug(slug: string) {
  const supabase = createServiceClient() as any
  const { data, error } = await supabase
    .from('event_publications')
    .select(PUBLIC_EVENT_SELECT)
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data || !isPublicationVisible(data)) {
    if (error) console.error('Failed to load public event', error)
    return null
  }

  return mapPublicEvent(data)
}
