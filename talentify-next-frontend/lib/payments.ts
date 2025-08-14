import { toast } from 'sonner'

export async function markPaymentCompleted(
  paymentId?: string,
  offerId?: string
) {
  const res = await fetch('/api/payments/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: paymentId, offer_id: offerId }),
  })
  const json = await res.json().catch(() => ({ error: 'unknown error' }))
  if (!res.ok || json.error) {
    toast.error(json.error || '支払い完了の更新に失敗しました')
    throw new Error(json.error || 'request failed')
  }
  return json
}
