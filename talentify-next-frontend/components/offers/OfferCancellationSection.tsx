'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { formatJaDateTimeWithWeekday } from '@/utils/formatJaDateTimeWithWeekday'

type CancellationRole = 'store' | 'talent'

type Props = {
  role: CancellationRole
  offerId: string
  status: string
  canceledAt?: string | null
  canceledByRole?: string | null
  cancellationReason?: string | null
  cancellationStage?: string | null
  invoiceId?: string | null
}

const MIN_REASON_LENGTH = 5
const MAX_REASON_LENGTH = 500

function actorLabel(role: string | null | undefined) {
  if (role === 'store') return '店舗'
  if (role === 'talent') return '演者'
  return '当事者'
}

export default function OfferCancellationSection({
  role,
  offerId,
  status,
  canceledAt = null,
  canceledByRole = null,
  cancellationReason = null,
  cancellationStage = null,
  invoiceId = null,
}: Props) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const isPostContract = status === 'confirmed' || status === 'accepted'
  const canCancel =
    role === 'store'
      ? status === 'pending' || isPostContract
      : isPostContract

  if (status === 'canceled') {
    const isContractCancellation = cancellationStage === 'post_contract'
    return (
      <Alert className={isContractCancellation ? 'border-red-200 bg-red-50' : undefined}>
        <AlertTitle>
          {isContractCancellation ? '契約後キャンセル済み' : 'キャンセル済み'}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-2 text-sm">
          {canceledAt && (
            <p>キャンセル日時：{formatJaDateTimeWithWeekday(canceledAt)}</p>
          )}
          <p>キャンセル者：{actorLabel(canceledByRole)}</p>
          {cancellationReason && (
            <div>
              <p className="font-medium">キャンセル理由</p>
              <p className="mt-1 whitespace-pre-wrap">{cancellationReason}</p>
            </div>
          )}
          {isContractCancellation && invoiceId && (
            <p className="pt-1">
              <Link
                href={role === 'store' ? `/store/invoices/${invoiceId}` : `/talent/invoices/${invoiceId}`}
                className="font-medium text-blue-700 underline underline-offset-2"
              >
                締結書兼請求書を確認する
              </Link>
              <span className="ml-2 text-xs text-slate-500">
                締結時点の記録として保持されています。
              </span>
            </p>
          )}
        </AlertDescription>
      </Alert>
    )
  }

  if (!canCancel) return null

  const title = isPostContract ? '契約後のキャンセル' : 'オファーの取り下げ'
  const buttonLabel = isPostContract ? '契約後キャンセルを申請' : 'オファーを取り下げる'

  const submit = async () => {
    const trimmed = reason.trim()
    if (trimmed.length < MIN_REASON_LENGTH) {
      toast.error('キャンセル理由を5文字以上で入力してください')
      return
    }
    if (trimmed.length > MAX_REASON_LENGTH) {
      toast.error('キャンセル理由は500文字以内で入力してください')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/offers/${offerId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: trimmed }),
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || 'キャンセルに失敗しました')
      }

      toast.success(
        body?.cancellation_stage === 'post_contract'
          ? '契約後キャンセルを記録しました'
          : 'オファーをキャンセルしました'
      )
      setEditing(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'キャンセルに失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  if (!editing) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-800">{title}</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">
              {isPostContract
                ? '締結書は削除せず、キャンセル日時・実行者・理由を取引履歴として残します。'
                : '取り下げ理由を相手へ通知し、取引履歴として残します。'}
            </p>
          </div>
          <Button type="button" variant="outline" onClick={() => setEditing(true)}>
            {buttonLabel}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <p className="text-sm font-semibold text-red-900">{title}</p>
      <p className="mt-1 text-xs leading-5 text-red-700">
        {isPostContract
          ? '契約成立後のキャンセルです。相手へ通知され、締結時点の書類は記録として保持されます。'
          : '相手へ通知されます。'}
      </p>

      <label className="mt-3 block text-xs font-medium text-slate-700">
        キャンセル理由（必須）
      </label>
      <Textarea
        value={reason}
        onChange={event => setReason(event.target.value)}
        maxLength={MAX_REASON_LENGTH}
        rows={4}
        className="mt-1 bg-white"
        placeholder="例：店舗都合により予定日の実施が難しくなったため"
      />
      <p className="mt-1 text-right text-xs text-slate-500">
        {reason.length}/{MAX_REASON_LENGTH}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="destructive"
          onClick={() => void submit()}
          disabled={submitting}
        >
          {submitting ? '処理中...' : '理由を記録してキャンセル'}
        </Button>
        <Button
          type="button"
          variant="ghost"
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
  )
}
