'use client'

import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarDays, Clock3, JapaneseYen, MessageSquareText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type SubmittedOfferContentCardProps = {
  submittedOffer: {
    preferredDate: string | null
    preferredTimeRange: string | null
    reward: number | null
    message: string | null
  }
}

const EMPTY_LABEL = '未設定'

function normalizeText(value: string | null | undefined) {
  if (typeof value !== 'string') return ''
  return value.trim()
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
  if (!normalized) return EMPTY_LABEL

  const normalizedDelimiter = normalized.replace(/~/g, '〜').replace(/\s*〜\s*/g, '〜')
  const [start, end] = normalizedDelimiter.split('〜')
  return start && end ? `${start}〜${end}` : normalizedDelimiter
}

export default function SubmittedOfferContentCard({ submittedOffer }: SubmittedOfferContentCardProps) {
  const message = normalizeText(submittedOffer.message)

  return (
    <Card className="rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
      <CardHeader className="border-b border-slate-100 px-4 py-3.5 sm:px-5">
        <CardTitle className="text-base font-black text-slate-950 sm:text-lg">オファー内容</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <CalendarDays className="h-3.5 w-3.5 text-[#C2410C]" />
              希望日
            </div>
            <p className="mt-1 text-sm font-black text-slate-900">
              {formatPreferredDate(submittedOffer.preferredDate)}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <Clock3 className="h-3.5 w-3.5 text-[#C2410C]" />
              希望時間
            </div>
            <p className="mt-1 text-sm font-black text-slate-900">
              {formatPreferredTimeRange(submittedOffer.preferredTimeRange)}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-orange-100 bg-orange-50/60 px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-[#C2410C] shadow-sm">
              <JapaneseYen className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[11px] font-bold text-slate-500">提示金額</p>
              <p className="text-lg font-black tracking-tight text-slate-950">
                {formatReward(submittedOffer.reward)}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="rounded-xl border border-slate-100 bg-white px-3.5 py-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
              <MessageSquareText className="h-3.5 w-3.5" />
              メッセージ
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
              {message}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
