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

export default function TalentCard({ talent }: { talent: PublicTalent }) {
  const imageSrc = talent.avatar_url && isValidHttpUrl(talent.avatar_url)
    ? talent.avatar_url
    : '/avatar-default.svg'

  const name = getTalentName(talent)
  const affiliation = getTalentAffiliation(talent)
  const capabilities = getTalentCapabilities(talent)
  const subInfo = [talent.genre, affiliation, talent.area].filter(Boolean)

  return (
    <Link
      href={`/talents/${talent.id}`}
      className="block rounded-2xl border border-gray-200 bg-white shadow-sm transition overflow-hidden hover:shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] bg-gray-100">
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
          <p className="mt-1 text-sm text-gray-500 line-clamp-1">{subInfo.join(' / ')}</p>
        )}

        {capabilities.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {capabilities.slice(0, 4).map(capability => (
              <span
                key={capability}
                className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
              >
                #{capability}
              </span>
            ))}
          </div>
        )}

        {talent.bio && (
          <p className="mt-3 text-sm text-gray-600 line-clamp-2">{talent.bio}</p>
        )}

        <p className="mt-4 text-sm font-medium text-gray-600">{formatRateEstimate(talent.rate)}</p>

        <span className="mt-4 flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 text-sm font-medium text-white transition hover:bg-blue-700">
          詳細を見る
        </span>
      </div>
    </Link>
  )
}
