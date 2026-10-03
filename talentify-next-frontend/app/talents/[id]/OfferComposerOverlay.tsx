'use client'

import { useEffect, useMemo, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { getTodayJstDateString } from '@/utils/jstDate'

type OfferTargetSummary = {
  stageName: string
  residence?: string | null
  availability?: string | null
  minHours?: string | null
  transportation?: string | null
  rate?: number | null
}

type OfferComposerOverlayProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  talentId: string
  summary: OfferTargetSummary
  onSuccess: () => void
  initialDate?: string | null
}

const supabase = createClient()
const TIME_OPTIONS = Array.from({ length: 18 }, (_, i) => {
  const hour = i + 6
  return `${String(hour).padStart(2, '0')}:00`
})

export default function OfferComposerOverlay({
  open,
  onOpenChange,
  talentId,
  summary,
  onSuccess,
  initialDate = null,
}: OfferComposerOverlayProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [message, setMessage] = useState('')
  const [visitDate, setVisitDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [reward, setReward] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [discardConfirmOpen, setDiscardConfirmOpen] = useState(false)

  const dirty = useMemo(
    () =>
      message.trim().length > 0 ||
      visitDate.length > 0 ||
      startTime.length > 0 ||
      endTime.length > 0 ||
      reward.length > 0,
    [endTime, message, reward, startTime, visitDate]
  )

  const timeRange = startTime && endTime ? `${startTime}〜${endTime}` : ''
  const minVisitDate = getTodayJstDateString()

  useEffect(() => {
    if (open && initialDate) {
      setVisitDate(initialDate)
    }
  }, [initialDate, open])

  useEffect(() => {
    const updateViewport = () => {
      setIsMobile(window.innerWidth < 768)
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  const resetForm = () => {
    setMessage('')
    setVisitDate('')
    setStartTime('')
    setEndTime('')
    setReward('')
    setDiscardConfirmOpen(false)
    setSubmitting(false)
  }

  const requestClose = () => {
    if (!dirty || submitting) {
      onOpenChange(false)
      if (!submitting) resetForm()
      return
    }
    setDiscardConfirmOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return
    if (!visitDate) {
      toast.error('希望日を選択してください')
      return
    }
    if (visitDate < minVisitDate) {
      toast.error('希望日は本日以降を選択してください')
      return
    }
    if (!startTime || !endTime) {
      toast.error('希望時間帯を選択してください')
      return
    }
    if (startTime >= endTime) {
      toast.error('希望時間帯の終了時刻は開始時刻より後を選択してください')
      return
    }
    setSubmitting(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      toast.error('ログインしてください')
      setSubmitting(false)
      return
    }

    const { data: store } = await supabase.from('stores').select('id').eq('user_id', user.id).single()

    if (!store) {
      toast.error('店舗情報が見つかりません')
      setSubmitting(false)
      return
    }

    const res = await fetch('/api/offers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        store_id: store.id,
        talent_id: talentId,
        date: visitDate,
        start_time: startTime,
        end_time: endTime,
        time_range: timeRange,
        reward: reward.trim() ? Number(reward) : null,
        agreed: true,
        message,
      }),
    })

    const result = await res.json()
    if (!res.ok || !result.ok) {
      toast.error(result.reason ? String(result.reason) : '送信に失敗しました')
      setSubmitting(false)
      return
    }

    toast.success('オファーを送信しました')
    onSuccess()
    onOpenChange(false)
    resetForm()
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={nextOpen => (nextOpen ? onOpenChange(true) : requestClose())}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
          <Dialog.Content
            className={
              isMobile
                ? 'fixed inset-0 z-50 flex flex-col bg-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]'
                : 'fixed right-0 top-0 z-50 flex h-screen w-[min(92vw,640px)] min-w-[520px] flex-col bg-white shadow-xl'
            }
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 md:px-5">
              <Dialog.Title className="text-base font-semibold text-slate-900">オファーを送る</Dialog.Title>
              <button
                type="button"
                onClick={requestClose}
                aria-label="閉じる"
                className="rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4 md:px-5">
                <section className="space-y-2 rounded-xl border border-slate-200 bg-slate-100/80 p-3.5 text-sm shadow-sm">
                  <p className="text-xs font-semibold tracking-wide text-slate-600">オファー対象</p>
                  <SummaryRow label="キャスト名" value={summary.stageName} />
                  <SummaryRow label="拠点地域" value={summary.residence || '要相談'} />
                  <SummaryRow label="出演可能時間" value={summary.availability || '要相談'} />
                  <SummaryRow label="最低拘束時間" value={summary.minHours || '要相談'} />
                  <SummaryRow label="交通費" value={summary.transportation || '要相談'} />
                  <SummaryRow
                    label="出演料金目安"
                    value={summary.rate != null ? `${summary.rate.toLocaleString('ja-JP')}円〜` : '要相談'}
                  />
                </section>

                <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">希望日</label>
                    <Input
                      type="date"
                      value={visitDate}
                      min={minVisitDate}
                      onChange={e => setVisitDate(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">希望時間帯</label>
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                      <select
                        value={startTime}
                        onChange={e => setStartTime(e.target.value)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                        required
                      >
                        <option value="">開始</option>
                        {TIME_OPTIONS.map(option => (
                          <option key={`start-${option}`} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <span className="text-sm text-slate-500">〜</span>
                      <select
                        value={endTime}
                        onChange={e => setEndTime(e.target.value)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-slate-500 focus:outline-none"
                        required
                      >
                        <option value="">終了</option>
                        {TIME_OPTIONS.map(option => (
                          <option key={`end-${option}`} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">提示金額（円）</label>
                    <Input
                      type="number"
                      min={0}
                      step={1000}
                      inputMode="numeric"
                      value={reward}
                      onChange={e => setReward(e.target.value)}
                      placeholder="例: 30000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-700">メッセージ</label>
                    <Textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="出演依頼内容などを入力"
                      className="min-h-[120px]"
                    />
                  </div>
                </section>
              </div>

              <footer className="sticky bottom-0 grid grid-cols-[auto_1fr] items-center gap-2 border-t border-slate-200 bg-white px-4 py-3 md:flex md:justify-end md:px-5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={requestClose}
                  disabled={submitting}
                  className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                >
                  キャンセル
                </Button>
                <Button type="submit" disabled={submitting} className="min-h-11 bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18] md:min-h-9">
                  {submitting ? '送信中...' : 'オファー送信'}
                </Button>
              </footer>
            </form>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={discardConfirmOpen} onOpenChange={setDiscardConfirmOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-[60] bg-black/50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 z-[61] w-[min(92vw,420px)] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-5 shadow-lg">
            <Dialog.Title className="text-base font-semibold text-slate-900">入力内容を破棄しますか？</Dialog.Title>
            <p className="mt-2 text-sm text-slate-600">編集中の内容は保存されません。</p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDiscardConfirmOpen(false)}>
                編集を続ける
              </Button>
              <Button
                onClick={() => {
                  setDiscardConfirmOpen(false)
                  onOpenChange(false)
                  resetForm()
                }}
              >
                破棄して閉じる
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-slate-200 pb-1 last:border-b-0 last:pb-0">
      <span className="text-slate-500">{label}</span>
      <span className="text-right font-medium text-slate-900">{value}</span>
    </div>
  )
}
