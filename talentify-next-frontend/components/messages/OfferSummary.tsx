'use client'

import Link from 'next/link'

export type OfferSummaryInfo = {
  status?: string | null
  date?: string | null
  reward?: string | number | null
  location?: string | null
  time?: string | null
}

export default function OfferSummary({
  offer,
  role,
  offerId,
}: {
  offer: OfferSummaryInfo | null
  role: 'store' | 'talent'
  offerId?: string | null
}) {
  if (!offer) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-500">
        オファー情報を読み込めませんでした。詳細画面から内容をご確認ください。
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
      <h4 className="mb-2 text-sm font-semibold text-gray-900">オファー概要</h4>
      <div className="grid gap-2 text-xs text-gray-700 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white px-2 py-1.5">来店日: {offer.date ?? '未設定'}</div>
        <div className="rounded-lg bg-white px-2 py-1.5">報酬: {offer.reward ?? '未設定'}</div>
        <div className="rounded-lg bg-white px-2 py-1.5">希望時間: {offer.time ?? '未設定'}</div>
        <div className="rounded-lg bg-white px-2 py-1.5">ステータス: {offer.status ?? '確認中'}</div>
      </div>
      {offerId && (
        <div className="mt-3">
          <Link
            href={'/' + role + '/offers/' + offerId}
            className="inline-flex rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100"
          >
            オファー詳細で確認・操作
          </Link>
        </div>
      )}
    </div>
  )
}
