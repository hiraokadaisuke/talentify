import Image from 'next/image'
import Link from 'next/link'
import type { PublicTalent } from '@/types/talent'

function isValidHttpUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

function getTalentName(talent: PublicTalent) {
  return talent.stage_name || talent.display_name || '名前未設定'
}

function getTalentAffiliation(talent: PublicTalent) {
  return talent.affiliation || talent.agency || talent.company_name || null
}

function getTalentCapabilities(talent: PublicTalent) {
  if (Array.isArray(talent.capabilities) && talent.capabilities.length > 0) {
    return talent.capabilities
  }

  if (Array.isArray(talent.skills) && talent.skills.length > 0) {
    return talent.skills
  }

  return []
}

function formatRateEstimate(rate: number | null) {
  if (rate == null) {
    return '料金目安：要相談'
  }

  const manYen = rate / 10000
  const rounded = Number.isInteger(manYen)
    ? manYen.toString()
    : manYen.toFixed(1).replace(/\.0$/, '')

  return `料金目安：${rounded}万円〜`
}

function formatFollowerCount(value: number) {
  if (value >= 10000) {
    const man = value / 10000
    const digits = man >= 10 ? 0 : 1
    return `${man.toFixed(digits).replace(/\.0$/, '')}万`
  }
  return value.toLocaleString('ja-JP')
}

export default function TalentCard({ talent }: { talent: PublicTalent }) {
  const imageSrc = talent.avatar_url && isValidHttpUrl(talent.avatar_url)
    ? talent.avatar_url
    : '/avatar-default.svg'

  const name = getTalentName(talent)
  const affiliation = getTalentAffiliation(talent)
  const capabilities = getTalentCapabilities(talent)
  const subInfo = [talent.genre, affiliation, talent.area].filter(Boolean)
  const socialMetrics = [
    { label: 'X', value: talent.twitter_followers },
    { label: 'IG', value: talent.instagram_followers },
    { label: 'YT', value: talent.youtube_followers },
    { label: 'TT', value: talent.tiktok_followers },
  ].filter((item): item is { label: string; value: number } => typeof item.value === 'number')

  return (
    <Link
      href={`/talents/${talent.id}`}
      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_36px_rgba(255,90,31,.10)] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] bg-slate-100">
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover"
          loading="lazy"
          sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
        />
      </div>

      <div className="p-4">
        <p className="text-lg font-bold line-clamp-1">{name}</p>

        {subInfo.length > 0 && (
          <p className="mt-1 text-sm text-slate-500 line-clamp-1">{subInfo.join(' / ')}</p>
        )}

        {capabilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {capabilities.slice(0, 4).map(capability => (
              <span
                key={capability}
                className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
              >
                #{capability}
              </span>
            ))}
          </div>
        )}

        {socialMetrics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5" aria-label="SNSフォロワー数">
            {socialMetrics.map(item => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700"
              >
                <span className="text-slate-400">{item.label}</span>
                {formatFollowerCount(item.value)}
              </span>
            ))}
          </div>
        )}

        {talent.bio && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-2">{talent.bio}</p>
        )}

        <p className="mt-4 text-sm font-medium text-slate-600">{formatRateEstimate(talent.rate)}</p>

        <span className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#FF5A1F] text-sm font-bold text-white transition group-hover:bg-[#E94F18]">
          詳細を見る
        </span>
      </div>
    </Link>
  )
}
