import Image from 'next/image'
import Link from 'next/link'
import { FaInstagram, FaTiktok, FaXTwitter, FaYoutube } from 'react-icons/fa6'
import { extractAreaTokens } from '@/lib/search/calendarAvailability'
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
  const subInfo = [talent.genre, affiliation].filter(Boolean)
  const areas = [...new Set(extractAreaTokens(talent.area))]
  const socialLinks = [
    { label: 'X', href: talent.twitter_url, icon: FaXTwitter },
    { label: 'Instagram', href: talent.instagram_url, icon: FaInstagram },
    { label: 'YouTube', href: talent.youtube_url, icon: FaYoutube },
    { label: 'TikTok', href: talent.social_tiktok, icon: FaTiktok },
  ].filter(item => item.href && isValidHttpUrl(item.href))

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)] transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-[0_16px_36px_rgba(255,90,31,.10)]">
      <Link href={`/talents/${talent.id}`} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-inset">
        <div className="relative aspect-[4/3] bg-slate-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain"
            loading="lazy"
            sizes="(min-width: 1280px) 24vw, (min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
          />
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/talents/${talent.id}`} className="block rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300">
          <p className="text-lg font-bold line-clamp-1">{name}</p>
          {subInfo.length > 0 && (
            <p className="mt-1 text-sm text-slate-500 line-clamp-1">{subInfo.join(' / ')}</p>
          )}
        </Link>

        {areas.length > 0 && <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="mb-2 text-xs font-semibold text-slate-500">活動エリア</p>
          <div className="flex flex-wrap gap-1.5">{areas.slice(0, 4).map(area => <span key={area} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{area}</span>)}</div>
          {areas.length > 4 && <details className="mt-1"><summary className="min-h-9 cursor-pointer py-2 text-xs font-semibold text-[#C2410C]">ほか{areas.length - 4}地域を表示</summary><div className="flex flex-wrap gap-1.5">{areas.slice(4).map(area => <span key={area} className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700">{area}</span>)}</div></details>}
        </div>}

        {socialLinks.length > 0 && (
          <div className="mt-3 flex items-center gap-2" aria-label="SNSリンク">
            {socialLinks.map(({ label, href, icon: Icon }) => (
              <a
                key={label}
                href={href!}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name}の${label}を開く`}
                title={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-base text-slate-700 transition hover:border-orange-200 hover:bg-orange-50 hover:text-[#C2410C] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300"
              >
                <Icon />
              </a>
            ))}
          </div>
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

        {talent.bio && (
          <p className="mt-3 text-sm text-slate-600 line-clamp-2">{talent.bio}</p>
        )}

        <p className="mt-4 text-sm font-medium text-slate-600">{formatRateEstimate(talent.rate)}</p>

        <Link
          href={`/talents/${talent.id}`}
          className="mt-4 flex h-10 w-full items-center justify-center rounded-xl bg-[#FF5A1F] text-sm font-bold text-white transition group-hover:bg-[#E94F18] focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:ring-offset-2"
        >
          詳細を見る
        </Link>
      </div>
    </article>
  )
}
