'use client'

import { useMemo } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SubmittedOfferContentCardProps = {
  submittedOffer: {
    preferredDate: string | null
    preferredTimeRange: string | null
    reward: number | null
    message: string | null
  }
}

type SubmittedOfferFieldKey = 'preferredDate' | 'preferredTimeRange' | 'reward' | 'message'

type SubmittedOfferField = {
  key: SubmittedOfferFieldKey
  label: string
  value: string
  multiline?: boolean
}

const EMPTY_LABEL = '未入力'

function normalizeText(value: string | null | undefined) {
  if (typeof value !== 'string') return EMPTY_LABEL
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : EMPTY_LABEL
}

function formatPreferredDate(value: string | null) {
  if (!value) return EMPTY_LABEL

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return EMPTY_LABEL

  return format(date, 'yyyy/MM/dd (EEE)', { locale: ja })
}

function formatReward(value: number | null) {
  if (value == null || Number.isNaN(value)) return EMPTY_LABEL
  return `${value.toLocaleString('ja-JP')}円`
}

function formatPreferredTimeRange(value: string | null) {
  const normalized = normalizeText(value)
  if (normalized === EMPTY_LABEL) return EMPTY_LABEL

  const normalizedDelimiter = normalized.replace(/~/g, '〜').replace(/\s*〜\s*/g, '〜')
  const [start, end] = normalizedDelimiter.split('〜')

  if (!start || !end) {
    return normalizedDelimiter
  }

  return `${start}〜${end}`
}

export default function SubmittedOfferContentCard({ submittedOffer }: SubmittedOfferContentCardProps) {
  const fields = useMemo<SubmittedOfferField[]>(() => {
    return [
      {
        key: 'preferredDate',
        label: '希望日',
        value: formatPreferredDate(submittedOffer.preferredDate),
      },
      {
        key: 'preferredTimeRange',
        label: '希望時間帯（開始〜終了）',
        value: formatPreferredTimeRange(submittedOffer.preferredTimeRange),
      },
      {
        key: 'reward',
        label: '提示金額',
        value: formatReward(submittedOffer.reward),
      },
      {
        key: 'message',
        label: 'メッセージ',
        value: normalizeText(submittedOffer.message),
        multiline: true,
      },
    ]
  }, [submittedOffer.preferredDate, submittedOffer.preferredTimeRange, submittedOffer.reward, submittedOffer.message])

  return (
    <Card className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <CardHeader className="space-y-1 px-4 pt-4 sm:px-5 sm:pt-5">
        <CardTitle className="text-base font-semibold text-slate-900 sm:text-lg">オファー内容</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 pt-1 sm:px-5 sm:pb-5">
        <dl className="space-y-3 text-sm">
          {fields.map(field => (
            <div key={field.key} className="grid gap-1 sm:grid-cols-[220px_1fr] sm:items-start sm:gap-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{field.label}</dt>
              <dd className={field.multiline ? 'whitespace-pre-wrap text-sm font-medium text-slate-900' : 'text-sm font-semibold text-slate-900'}>
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  )
}
