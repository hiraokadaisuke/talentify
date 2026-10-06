import Link from 'next/link'
import { Images } from 'lucide-react'

const formats = [
  { key: 'poster', label: 'A4縦' },
  { key: 'feed', label: 'SNS投稿' },
  { key: 'story', label: 'ストーリー' },
] as const

export default function PromotionMaterialsCard({
  offerId,
  offerStatus,
}: {
  offerId: string
  offerStatus: string
}) {
  if (!['accepted', 'confirmed', 'completed'].includes(offerStatus)) {
    return null
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
          <Images className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-slate-950">告知素材</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            店内掲示・SNS告知用の画像を自動作成します。日付、演者名、店舗名、演者写真と「主催：来店ナビ」を反映します。
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {formats.map(format => (
          <Link
            key={format.key}
            href={`/store/offers/${offerId}/materials#${format.key}`}
            className="inline-flex min-h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-2 py-2 text-center text-[11px] font-bold text-slate-700 transition hover:border-orange-200 hover:bg-orange-50"
          >
            {format.label}
          </Link>
        ))}
      </div>

      <Link
        href={`/store/offers/${offerId}/materials`}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#0B1F3B] px-4 text-sm font-black text-white transition hover:bg-[#081426]"
      >
        プレビュー・写真選択
      </Link>
    </section>
  )
}
