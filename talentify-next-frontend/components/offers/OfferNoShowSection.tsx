'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

type Props = {
  role: 'store' | 'talent'
  offerId: string
  status: string
  scheduledEndAt?: string | null
  noShowAt?: string | null
  noShowReason?: string | null
  invoiceId?: string | null
}

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 500

function parseTokyoTimestamp(value: string | null | undefined) {
  if (!value) return null
  const normalized = value.replace(' ', 'T')
  const withOffset = /(?:Z|[+-]\d{2}:\d{2})$/i.test(normalized) ? normalized : `${normalized}+09:00`
  const parsed = new Date(withOffset)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

export default function OfferNoShowSection({
  role,
  offerId,
  status,
  scheduledEndAt = null,
  noShowAt = null,
  noShowReason = null,
  invoiceId = null,
}: Props) {
  const router = useRouter()
  const [now, setNow] = useState(() => Date.now())
  const [editing, setEditing] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  const scheduledEnd = useMemo(() => parseTokyoTimestamp(scheduledEndAt), [scheduledEndAt])

  if (status === 'no_show') {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTitle>来店なしとして記録されています</AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-sm">
          <p>記録者：店舗</p>
          {noShowAt && <p>記録日時：{formatJaDateTimeWithWeekday(noShowAt)}</p>}
          <div>
            <p className="font-medium">理由</p>
            <p className="mt-1 whitespace-pre-wrap">{noShowReason || '理由未登録'}</p>
          </div>
          <p className="text-xs text-red-800">
            この案件は支払い・レビューには進みません。締結書兼請求書は履歴として保持されます。
          </p>
          {invoiceId && (
            <Link
              href={role === 'store' ? `/store/invoices/${invoiceId}` : `/talent/invoices/${invoiceId}`}
              className="inline-block font-medium text-red-800 underline underline-offset-2"
            >
              締結書兼請求書を確認する
            </Link>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (role !== 'store' || status !== 'confirmed') return null

  const canReport = Boolean(scheduledEnd && scheduledEnd.getTime() <= now)
  if (!canReport) {
    return (
      <p className="text-xs leading-5 text-slate-500">
        「来店なし」の記録は、来店予定の終了時刻を過ぎると利用できます。
      </p>
    )
  }

  const submit = async () => {
    const trimmed = reason.trim()
    if (trimmed.length < MIN_REASON_LENGTH || trimmed.length > MAX_REASON_LENGTH) {
      toast.error('来店なしの理由は5文字以上500文字以内で入力してください')
      return
    }
    if (!window.confirm('演者が来店しなかった記録を確定します。締結書は残りますが、支払い・レビューには進みません。よろしいですか？')) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/offers/${offerId}/no-show`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmed }),
      })
      const body = await response.json().catch(() => null)
      if (!response.ok) throw new Error(body?.error || '来店なしの記録に失敗しました')
      toast.success('来店なしを記録しました')
      setEditing(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '来店なしの記録に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (!editing) {
    return (
      <div className="rounded-lg border border-dashed border-red-200 bg-red-50/50 p-3">
        <p className="text-sm font-semibold text-slate-800">来店がなかった場合</p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          演者が予定どおり来店しなかった場合のみ記録してください。理由は相手にも通知されます。
        </p>
        <Button type="button" variant="outline" className="mt-3 border-red-200 text-red-700 hover:bg-red-50" onClick={() => setEditing(true)}>
          来店なしを記録
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-900">来店なしを記録</p>
      <p className="mt-1 text-xs leading-5 text-red-700">
        記録後は変更できません。状況が分かるよう理由を入力してください。
      </p>
      <Textarea value={reason} onChange={event => setReason(event.target.value)} maxLength={MAX_REASON_LENGTH} rows={4} className="mt-3 bg-white" placeholder="例：予定時刻を過ぎても来店がなく、連絡にも応答がなかったため" />
      <p className="mt-1 text-right text-xs text-slate-500">{reason.length}/{MAX_REASON_LENGTH}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" variant="destructive" onClick={() => void submit()} disabled={submitting}>
          {submitting ? '処理中...' : '理由を記録して確定'}
        </Button>
        <Button type="button" variant="ghost" disabled={submitting} onClick={() => { setEditing(false); setReason('') }}>
          戻る
        </Button>
      </div>
    </div>
  )
}
