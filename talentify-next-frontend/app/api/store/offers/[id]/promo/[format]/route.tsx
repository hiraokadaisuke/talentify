import { ImageResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'edge'

type PromoFormat = 'poster' | 'feed' | 'story'

const FORMATS: Record<PromoFormat, { width: number; height: number; label: string }> = {
  poster: { width: 1240, height: 1754, label: 'A4ポスター' },
  feed: { width: 1080, height: 1350, label: 'SNS投稿' },
  story: { width: 1080, height: 1920, label: 'ストーリー' },
}

function isPromoFormat(value: string): value is PromoFormat {
  return value === 'poster' || value === 'feed' || value === 'story'
}

function uniquePhotos(avatarUrl: string | null, photos: unknown) {
  const candidates = [
    avatarUrl,
    ...(Array.isArray(photos) ? photos.filter((item): item is string => typeof item === 'string') : []),
  ].filter((item): item is string => Boolean(item && item.trim()))

  return Array.from(new Set(candidates))
}

function formatVisitDate(value: string) {
  const date = new Date(value)
  const dateLabel = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const weekday = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    weekday: 'short',
  })
    .format(date)
    .replace(/[()]/g, '')
  const year = new Intl.DateTimeFormat('ja-JP', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
  })
    .format(date)
    .replace('年', '')

  return { dateLabel, weekday, year }
}

async function loadNotoSansJp(text: string, weight: 700 | 900) {
  try {
    const cssUrl =
      `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&display=swap&text=${encodeURIComponent(text)}`
    const cssResponse = await fetch(cssUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      },
    })

    if (!cssResponse.ok) return null

    const css = await cssResponse.text()
    const match = css.match(/src:\s*url\(([^)]+)\)/)
    if (!match?.[1]) return null

    const fontResponse = await fetch(match[1])
    if (!fontResponse.ok) return null
    return await fontResponse.arrayBuffer()
  } catch {
    return null
  }
}

export async function GET(
  request: Request,
  { params }: { params: { id: string; format: string } }
) {
  if (!isPromoFormat(params.format)) {
    return new Response('Unsupported format', { status: 404 })
  }

  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { data: offer, error } = await supabase
    .from('offers')
    .select(
      `
        id,status,date,store_id,talent_id,
        talents(stage_name,display_name,avatar_url,photos,user_id),
        store:stores!offers_store_id_fkey(id,store_name,user_id)
      `
    )
    .eq('id', params.id)
    .maybeSingle()

  const data = offer as any
  if (error || !data) {
    return new Response('Offer not found', { status: 404 })
  }

  const isStoreOwner = data.store?.user_id === user.id
  const isTalentOwner = data.talents?.user_id === user.id
  if (!isStoreOwner && !isTalentOwner) {
    return new Response('Forbidden', { status: 403 })
  }

  if (!['accepted', 'confirmed', 'completed'].includes(String(data.status))) {
    return new Response('Materials are available after the deal is concluded', { status: 409 })
  }

  const { searchParams } = new URL(request.url)
  const photoIndexRaw = Number.parseInt(searchParams.get('photo') || '0', 10)
  const download = searchParams.get('download') === '1'

  const photos = uniquePhotos(data.talents?.avatar_url ?? null, data.talents?.photos)
  const photoIndex =
    Number.isFinite(photoIndexRaw) && photoIndexRaw >= 0 && photoIndexRaw < photos.length
      ? photoIndexRaw
      : 0
  const photoUrl = photos[photoIndex] || null

  const performerName =
    data.talents?.display_name || data.talents?.stage_name || '来店ゲスト'
  const storeName = data.store?.store_name || '店舗名未設定'
  const visitDate = formatVisitDate(data.date)
  const config = FORMATS[params.format]

  const isStory = params.format === 'story'
  const isFeed = params.format === 'feed'
  const padding = Math.round(config.width * 0.065)
  const sponsorFontSize = Math.round(config.width * 0.032)
  const dateFontSize = Math.round(config.width * (isStory ? 0.12 : 0.105))
  const nameFontSize = Math.round(config.width * (isStory ? 0.071 : 0.068))
  const visitFontSize = Math.round(config.width * (isStory ? 0.155 : 0.145))
  const storeFontSize = Math.round(config.width * 0.039)

  const fontText =
    `来店イベント主催来店ナビRAITENNAVI${performerName}${storeName}${visitDate.year}${visitDate.dateLabel}${visitDate.weekday}`
  const [boldFont, blackFont] = await Promise.all([
    loadNotoSansJp(fontText, 700),
    loadNotoSansJp(fontText, 900),
  ])

  const fonts = [
    ...(boldFont
      ? [
          {
            name: 'Noto Sans JP',
            data: boldFont,
            weight: 700 as const,
            style: 'normal' as const,
          },
        ]
      : []),
    ...(blackFont
      ? [
          {
            name: 'Noto Sans JP',
            data: blackFont,
            weight: 900 as const,
            style: 'normal' as const,
          },
        ]
      : []),
  ]

  const filename = `raiten-navi-${String(data.id).slice(0, 8)}-${params.format}.png`

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          display: 'flex',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          color: '#FFFFFF',
          fontFamily: fonts.length ? 'Noto Sans JP' : 'sans-serif',
          background:
            'linear-gradient(155deg, #081426 0%, #0B1F3B 44%, #131B35 70%, #081426 100%)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            backgroundImage:
              'radial-gradient(circle at 84% 16%, rgba(255,196,0,.36) 0%, rgba(255,196,0,0) 27%), radial-gradient(circle at 16% 70%, rgba(255,90,31,.34) 0%, rgba(255,90,31,0) 34%)',
          }}
        />

        <div
          style={{
            position: 'absolute',
            top: -Math.round(config.width * 0.2),
            right: -Math.round(config.width * 0.13),
            width: Math.round(config.width * 0.58),
            height: Math.round(config.width * 0.58),
            border: `${Math.round(config.width * 0.018)}px solid rgba(255,196,0,.30)`,
            borderRadius: 9999,
            display: 'flex',
          }}
        />

        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: isStory ? Math.round(config.height * 0.20) : Math.round(config.height * 0.18),
            height: isStory ? Math.round(config.height * 0.54) : Math.round(config.height * 0.53),
            display: 'flex',
            overflow: 'hidden',
          }}
        >
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              width={config.width}
              height={Math.round(config.height * 0.56)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: 'center 28%',
              }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background:
                  'linear-gradient(135deg, rgba(255,90,31,.22), rgba(255,196,0,.12), rgba(11,31,59,.94))',
                fontSize: Math.round(config.width * 0.06),
                fontWeight: 700,
              }}
            >
              RAITEN NAVI
            </div>
          )}

          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              background:
                'linear-gradient(180deg, rgba(8,20,38,.15) 0%, rgba(8,20,38,.02) 38%, rgba(8,20,38,.86) 100%)',
            }}
          />
        </div>

        <div
          style={{
            position: 'absolute',
            top: padding,
            left: padding,
            right: padding,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: `${Math.round(config.width * 0.014)}px ${Math.round(
                config.width * 0.026
              )}px`,
              borderRadius: 9999,
              background: '#FF5A1F',
              fontSize: sponsorFontSize,
              fontWeight: 900,
              letterSpacing: 0.5,
            }}
          >
            主催：来店ナビ
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: Math.round(config.width * 0.021),
              fontWeight: 700,
              letterSpacing: 3,
              color: '#FFC400',
            }}
          >
            RAITEN NAVI
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            top: isStory ? Math.round(config.height * 0.105) : Math.round(config.height * 0.095),
            left: padding,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: Math.round(config.width * 0.018),
            }}
          >
            <span
              style={{
                fontSize: dateFontSize,
                lineHeight: 1,
                fontWeight: 900,
                letterSpacing: -3,
              }}
            >
              {visitDate.dateLabel}
            </span>
            <span
              style={{
                marginBottom: Math.round(config.width * 0.01),
                padding: `${Math.round(config.width * 0.008)}px ${Math.round(
                  config.width * 0.014
                )}px`,
                display: 'flex',
                borderRadius: Math.round(config.width * 0.01),
                background: '#FFC400',
                color: '#081426',
                fontSize: Math.round(config.width * 0.028),
                fontWeight: 900,
              }}
            >
              {visitDate.weekday}
            </span>
          </div>
          <span
            style={{
              marginTop: Math.round(config.width * 0.008),
              fontSize: Math.round(config.width * 0.022),
              fontWeight: 700,
              letterSpacing: 2,
              color: 'rgba(255,255,255,.72)',
            }}
          >
            {visitDate.year} · SPECIAL VISIT
          </span>
        </div>

        <div
          style={{
            position: 'absolute',
            left: padding,
            right: padding,
            bottom: isStory ? Math.round(config.height * 0.105) : Math.round(config.height * 0.09),
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: Math.round(config.width * 0.023),
              fontWeight: 700,
              letterSpacing: 5,
              color: '#FFC400',
            }}
          >
            SPECIAL GUEST
          </div>
          <div
            style={{
              marginTop: Math.round(config.width * 0.008),
              display: 'flex',
              fontSize: nameFontSize,
              lineHeight: 1.14,
              fontWeight: 900,
              textShadow: '0 5px 24px rgba(0,0,0,.55)',
            }}
          >
            {performerName}
          </div>

          <div
            style={{
              marginTop: Math.round(config.width * 0.005),
              display: 'flex',
              alignItems: 'center',
              gap: Math.round(config.width * 0.02),
            }}
          >
            <span
              style={{
                display: 'flex',
                fontSize: visitFontSize,
                lineHeight: 0.98,
                fontWeight: 900,
                letterSpacing: -5,
                color: '#FFFFFF',
                textShadow: '0 6px 30px rgba(0,0,0,.55)',
              }}
            >
              来店
            </span>
            <span
              style={{
                marginTop: Math.round(config.width * 0.03),
                display: 'flex',
                fontSize: Math.round(config.width * 0.055),
                lineHeight: 1,
                fontWeight: 900,
                color: '#FF5A1F',
              }}
            >
              EVENT
            </span>
          </div>

          <div
            style={{
              marginTop: Math.round(config.width * (isFeed ? 0.025 : 0.035)),
              paddingTop: Math.round(config.width * 0.024),
              display: 'flex',
              borderTop: `${Math.max(2, Math.round(config.width * 0.003))}px solid rgba(255,255,255,.24)`,
              fontSize: storeFontSize,
              lineHeight: 1.35,
              fontWeight: 700,
            }}
          >
            {storeName}
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            left: padding,
            right: padding,
            bottom: Math.round(config.height * 0.025),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: Math.round(config.width * 0.018),
            fontWeight: 700,
            color: 'rgba(255,255,255,.66)',
          }}
        >
          <span style={{ display: 'flex' }}>主催：来店ナビ（RAITEN NAVI）</span>
          <span style={{ display: 'flex', color: '#FFC400' }}>来店イベント告知素材</span>
        </div>
      </div>
    ),
    {
      width: config.width,
      height: config.height,
      fonts,
      headers: {
        'Cache-Control': 'private, no-store',
        'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${filename}"`,
      },
    }
  )
}
