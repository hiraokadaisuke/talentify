'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

type Props = {
  offerId: string
  role: 'store' | 'talent'
  status: string
  canceledAt?: string | null
  canceledByRole?: string | null
  cancelReason?: string | null
  cancellationPhase?: string | null
  invoiceId?: string | null
}

function actorLabel(role: string | null | undefined) {
  if (role === 'store') return '店舗'
  if (role === 'talent') return '演者'
  return '不明'
}

function phaseLabel(phase: string | null | undefined) {
  return phase === 'post_contract' ? '契約成立後' : '契約成立前'
}

export default function OfferCancellationSection({
  offerId,
  role,
  status,
  canceledAt = null,
  canceledByRole = null,
  cancelReason = null,
  cancellationPhase = null,
  invoiceId = null,
}: Props) {
  const router = useRouter()
  const [localStatus, setLocalStatus] = useState(status)
  const [localCanceledAt, setLocalCanceledAt] = useState(canceledAt)
  const [localCanceledByRole, setLocalCanceledByRole] = useState(canceledByRole)
  const [localReason, setLocalReason] = useState(cancelReason)
  const [localPhase, setLocalPhase] = useState(cancellationPhase)
  const [reason, setReason] = useState('')
  const [editing, setEditing] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  if (localStatus === 'canceled') {
    return (
      <Alert className="border-amber-200 bg-amber-50">
        <AlertTitle>キャンセル済み</AlertTitle>
        <AlertDescription className="mt-2 space-y-1 text-sm">
          <div>区分：{phaseLabel(localPhase)}</div>
          <div>実行者：{actorLabel(localCanceledByRole)}</div>
          {localCanceledAt && (
            <div>キャンセル日時：{formatJaDateTimeWithWeekday(localCanceledAt)}</div>
          )}
          <div className="whitespace-pre-wrap">理由：{localReason || '理由未登録'}</div>
          {localPhase === 'post_contract' && (
            <div className="pt-2 text-xs text-amber-800">
              締結済みの契約内容・締結書兼請求書は履歴として保持されています。
              {invoiceId && (
                <>
                  {' '}
                  <Link
                    href={role === 'store' ? `/store/invoices/${invoiceId}` : `/talent/invoices/${invoiceId}`}
                    className="font-semibold underline"
                  >
                    締結書兼請求書を確認
                  </Link>
                </>
              )}
            </div>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  const canCancel =
    role === 'store'
      ? localStatus === 'pending' || localStatus === 'confirmed'
      : localStatus === 'confirmed'

  if (!canCancel) return null

  const postContract = localStatus === 'confirmed'
  const actionLabel = postContract ? '契約をキャンセル' : 'オファーを取り下げる'

  const submit = async () => {
    const trimmedReason = reason.trim()
    if (trimmedReason.length < 5 || trimmedReason.length > 1000) {
      toast.error('キャンセル理由は5文字以上1000文字以内で入力してください')
      return
    }

    const confirmMessage = postContract
      ? '締結済みの取引をキャンセルします。締結書兼請求書は履歴として残ります。よろしいですか？'
      : 'このオファーを取り下げますか？'

    if (!window.confirm(confirmMessage)) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/offers/${offerId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmedReason }),
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || 'キャンセルに失敗しました')
      }

      setLocalStatus('canceled')
      setLocalCanceledAt(body.canceled_at ?? new Date().toISOString())
      setLocalCanceledByRole(body.canceled_by_role ?? role)
      setLocalReason(body.cancel_reason ?? trimmedReason)
      setLocalPhase(body.cancellation_phase ?? (postContract ? 'post_contract' : 'pre_contract'))
      setEditing(false)
      toast.success(postContract ? '締結済みの取引をキャンセルしました' : 'オファーを取り下げました')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'キャンセルに失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3">
      {editing ? (
        <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div>
            <p className="text-sm font-semibold text-amber-900">{actionLabel}</p>
            <p className="mt-1 text-xs leading-5 text-amber-800">
              {postContract
                ? '契約成立後のキャンセルです。相手へ理由を通知し、締結書兼請求書は履歴として保持します。'
                : '契約成立前のキャンセルです。相手へ理由を通知します。'}
            </p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">
              キャンセル理由
            </label>
            <textarea
              value={reason}
              onChange={event => setReason(event.target.value)}
              maxLength={1000}
              rows={4}
              className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              placeholder="相手に伝わるよう、理由を入力してください"
            />
            <div className="mt-1 text-right text-xs text-slate-500">{reason.length}/1000</div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => void submit()}
              disabled={submitting}
            >
              {submitting ? '処理中...' : actionLabel}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEditing(false)
                setReason('')
              }}
              disabled={submitting}
            >
              戻る
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          onClick={() => setEditing(true)}
          data-testid="offer-cancel-button"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
