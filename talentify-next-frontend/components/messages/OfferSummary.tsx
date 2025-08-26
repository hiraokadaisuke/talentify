'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

export type OfferSummaryInfo = {
  status?: string | null
  date?: string | null
  reward?: string | number | null
  location?: string | null
}

export default function OfferSummary({ offer }: { offer: OfferSummaryInfo | null }) {
  if (!offer) return null
  return (
    <Card className="mb-2">
      <CardHeader className="py-2">
        <CardTitle className="text-sm">オファー情報</CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-1">
        <div>ステータス: {offer.status ?? '不明'}</div>
        {offer.date && <div>日付: {offer.date}</div>}
        {offer.reward && <div>報酬: {offer.reward}</div>}
        {offer.location && <div>場所: {offer.location}</div>}
      </CardContent>
    </Card>
  )
}

