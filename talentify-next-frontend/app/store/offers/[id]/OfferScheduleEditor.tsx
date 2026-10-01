'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { CalendarClock, Loader2, Pencil, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getTodayJstDateString } from '@/utils/jstDate'

type OfferScheduleEditorProps = {
  offerId: string
  status: string
  date: string | null
  timeRange: string | null
  invoiceStatus: string | null
}

function parseTimeRange(value: string | null) {
  if (!value) return { start: '', end: '' }
  const normalized = value.replace(/[～~–—-]/g, '〜').replace(/\s+/g, '')
  const [start = '', end = ''] = normalized.split('〜')
  return { start, end }
}

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : ''
}

export default function OfferScheduleEditor({
  offerId,
  status,
  date,
  timeRange,
  invoiceStatus,
}: OfferScheduleEditorProps) {
  const router = useRouter()
  const initialTimes = useMemo(() => parseTimeRange(timeRange), [timeRange])
  const [editing, setEditing] = useState(false)
  const [visitDate, setVisitDate] = useState(dateInputValue(date))
  const [startTime, setStartTime] = useState(initialTimes.start)
  const [endTime, setEndTime] = useState(initialTimes.end)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (editing) return
    setVisitDate(dateInputValue(date))
    setStartTime(initialTimes.start)
    setEndTime(initialTimes.end)
  }, [date, editing, initialTimes.end, initialTimes.start])

  if (status !== 'pending') return null

  const estimateLocked = invoiceStatus != null && !['draft', 'rejected'].includes(invoiceStatus)
  const minDate = getTodayJstDateString()

  const cancelEditing = () => {
    setVisitDate(dateInputValue(date))
    setStartTime(initialTimes.start)
    setEndTime(initialTimes.end)
    setEditing(false)
  }

  const save = async () => {
    if (!visitDate || !startTime || !endTime) {
      toast.error('日付と時間帯を入力してください')
      return
    }
    if (visitDate < minDate) {
      toast.error('本日以降の日付を選択してください')
      return
    }
    if (startTime >= endTime) {
      toast.error('終了時刻は開始時刻より後を選択してください')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/offers/${offerId}/schedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: visitDate,
          start_time: startTime,
          end_time: endTime,
        }),
      })
      const body = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(body?.error || '日時の変更に失敗しました')
      }

      toast.success('出演日時を変更しました')
      setEditing(false)
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : '日時の変更に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          <CalendarClock className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">出演日時の変更</h2>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                契約成立前のみ変更できます。変更内容は演者へ通知されます。
              </p>
            </div>

            {!editing && !estimateLocked && (
              <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="mr-1.5 h-4 w-4" />
                日時を変更
              </Button>
            )}
          </div>

          {estimateLocked ? (
            <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-800">
              見積提出後は日時を変更できません。変更する場合は先に見積の「修正を依頼する」で下書きへ戻してください。
            </div>
          ) : editing ? (
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">出演日</label>
                  <Input
                    type="date"
                    min={minDate}
                    value={visitDate}
                    onChange={event => setVisitDate(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">開始時刻</label>
                  <Input
                    type="time"
                    value={startTime}
                    onChange={event => setStartTime(event.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-600">終了時刻</label>
                  <Input
                    type="time"
                    value={endTime}
                    onChange={event => setEndTime(event.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={save} disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  変更を保存
                </Button>
                <Button type="button" variant="ghost" onClick={cancelEditing} disabled={saving}>
                  <X className="mr-1.5 h-4 w-4" />
                  キャンセル
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
