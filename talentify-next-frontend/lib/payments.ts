import { toast } from 'sonner'

export async function markPaymentCompleted(
  paymentId: string,
  opts: { paid_at?: string } = {}
) {
  const res = await fetch('/api/payments', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: paymentId, status: 'completed', ...opts }),
  })
  const json = await res.json().catch(() => ({ error: 'unknown error' }))
  if (!res.ok || json.error) {
    toast.error(json.error || '支払い完了の更新に失敗しました')
    throw new Error(json.error || 'request failed')
  }
  return json.data
}
