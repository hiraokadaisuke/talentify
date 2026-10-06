'use client'

import { useState } from 'react'
import { Check, Download, ImageIcon } from 'lucide-react'

const formats = [
  {
    key: 'poster',
    title: '店内ポスター',
    size: '1240 × 1754 px',
    usage: 'A4縦比率・店内掲示向け',
  },
  {
    key: 'feed',
    title: 'SNS投稿',
    size: '1080 × 1350 px',
    usage: 'Instagramなどの縦投稿向け',
  },
  {
    key: 'story',
    title: 'ストーリー',
    size: '1080 × 1920 px',
    usage: 'Instagramストーリー等の9:16向け',
  },
] as const

export default function MaterialGallery({
  offerId,
  photos,
  performerName,
  storeName,
}: {
  offerId: string
  photos: string[]
  performerName: string
  storeName: string
}) {
  const [selectedPhoto, setSelectedPhoto] = useState(0)

  const photoQuery = `photo=${selectedPhoto}`

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-5">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-[#C2410C]">
            <ImageIcon className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-base font-black text-slate-950">使用する写真</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              {photos.length > 1
                ? '演者が登録している写真から、告知素材に使用する写真を選べます。'
                : photos.length === 1
                  ? '現在登録されている演者写真を使用します。'
                  : '演者写真が未登録のため、来店ナビの背景デザインで生成します。'}
            </p>
          </div>
        </div>

        {photos.length > 0 && (
          <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
            {photos.map((photo, index) => {
              const selected = selectedPhoto === index
              return (
                <button
                  key={photo}
                  type="button"
                  onClick={() => setSelectedPhoto(index)}
                  className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 bg-slate-100 transition sm:h-28 sm:w-24 ${
                    selected ? 'border-[#FF5A1F] ring-2 ring-orange-100' : 'border-slate-200'
                  }`}
                  aria-label={`写真${index + 1}を使用`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  {selected && (
                    <span className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-[#FF5A1F] text-white shadow">
                      <Check className="h-4 w-4" />
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3">
          <h2 className="text-lg font-black text-slate-950">ダウンロード</h2>
          <p className="mt-1 text-sm text-slate-500">
            {performerName} / {storeName} の案件情報を自動反映しています。「主催：来店ナビ」は固定表示です。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {formats.map(format => {
            const previewUrl = `/api/store/offers/${offerId}/promo/${format.key}?${photoQuery}`
            const downloadUrl = `${previewUrl}&download=1`

            return (
              <article
                key={format.key}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]"
              >
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-black text-slate-950">{format.title}</h3>
                      <p className="mt-1 text-xs text-slate-500">{format.usage}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                      {format.size}
                    </span>
                  </div>
                </div>

                <div className="flex min-h-[360px] items-center justify-center bg-slate-100 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewUrl}
                    alt={`${format.title}プレビュー`}
                    className="max-h-[520px] w-auto max-w-full rounded-lg object-contain shadow-xl"
                  />
                </div>

                <div className="p-4">
                  <a
                    href={downloadUrl}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF5A1F] px-4 text-sm font-black text-white transition hover:bg-[#E94F18]"
                  >
                    <Download className="h-4 w-4" />
                    PNGをダウンロード
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}
