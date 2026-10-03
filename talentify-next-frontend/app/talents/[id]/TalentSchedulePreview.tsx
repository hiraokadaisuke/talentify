'use client'

import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, ChevronRight, MapPin } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ScheduleResponse = {
  from: string
  to: string
  unavailableDates: string[]
  visits: {
    date: string
    prefectures: string[]
  }[]
}

type Props = {
  talentId: string
  onOfferDate: (date: string) => void
}

const WEEKDAYS = ['月', '火', '水', '木', '金', '土', '日']

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function toDateKey(year: number, monthIndex: number, day: number) {
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

function getMonthGrid(year: number, monthIndex: number) {
  const first = new Date(year, monthIndex, 1)
  const lastDay = new Date(year, monthIndex + 1, 0).getDate()
  const mondayOffset = (first.getDay() + 6) % 7
  const cells: Array<{ date: string; day: number } | null> = []

  for (let i = 0; i < mondayOffset; i += 1) cells.push(null)
  for (let day = 1; day <= lastDay; day += 1) {
    cells.push({ date: toDateKey(year, monthIndex, day), day })
  }
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function formatSelectedDate(date: string) {
  const [year, month, day] = date.split('-').map(Number)
  const parsed = new Date(year, month - 1, day)
  const weekday = ['日', '月', '火', '水', '木', '金', '土'][parsed.getDay()]
  return `${month}月${day}日（${weekday}）`
}

export default function TalentSchedulePreview({ talentId, onOfferDate }: Props) {
  const [data, setData] = useState<ScheduleResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setLoadError(false)

    fetch(`/api/talents/${talentId}/schedule`, { cache: 'no-store' })
      .then(async response => {
        if (!response.ok) {
          throw new Error('スケジュールを取得できませんでした')
        }
        return response.json() as Promise<ScheduleResponse>
      })
      .then(result => {
        if (!cancelled) setData(result)
      })
      .catch(error => {
        console.error(error)
        if (!cancelled) setLoadError(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [talentId])

  const unavailable = useMemo(
    () => new Set(data?.unavailableDates ?? []),
    [data?.unavailableDates]
  )
  const visitsByDate = useMemo(() => {
    const map = new Map<string, string[]>()
    for (const visit of data?.visits ?? []) {
      map.set(visit.date, visit.prefectures)
    }
    return map
  }, [data?.visits])

  const months = useMemo(() => {
    if (!data?.from) return []
    const [year, month] = data.from.split('-').map(Number)
    return Array.from({ length: 4 }, (_, index) => {
      const date = new Date(year, month - 1 + index, 1)
      return {
        year: date.getFullYear(),
        monthIndex: date.getMonth(),
      }
    })
  }, [data?.from])

  const selectedUnavailable = selectedDate ? unavailable.has(selectedDate) : false
  const selectedPrefectures = selectedDate ? visitsByDate.get(selectedDate) ?? [] : []
  const hasVisit = selectedPrefectures.length > 0

  return (
    <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-[#FF5A1F]" />
            <h2 className="text-lg font-bold text-slate-950">スケジュール</h2>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            今月から3か月先まで確認できます。通常日は受付可能です。
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded border border-slate-300 bg-white" />
            受付可能
          </span>
          <span className="flex items-center gap-1.5">
            <span className="grid h-4 w-4 place-items-center rounded bg-slate-200 text-[10px] font-black text-slate-600">×</span>
            受付不可
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            来店予定あり
          </span>
        </div>
      </div>

      {loading ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map(item => (
            <div key={item} className="h-56 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : loadError || !data ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          スケジュールを読み込めませんでした。
        </div>
      ) : (
        <>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {months.map(({ year, monthIndex }) => {
              const cells = getMonthGrid(year, monthIndex)
              return (
                <div key={`${year}-${monthIndex}`} className="rounded-xl border border-slate-200 p-3">
                  <p className="mb-2 text-center text-sm font-bold text-slate-900">
                    {year}年{monthIndex + 1}月
                  </p>
                  <div className="grid grid-cols-7 gap-1">
                    {WEEKDAYS.map(label => (
                      <div key={label} className="py-1 text-center text-[11px] font-medium text-slate-400">
                        {label}
                      </div>
                    ))}
                    {cells.map((cell, index) => {
                      if (!cell) {
                        return <div key={`blank-${index}`} className="aspect-square" />
                      }

                      const isUnavailable = unavailable.has(cell.date)
                      const visitPrefectures = visitsByDate.get(cell.date) ?? []
                      const hasVisitOnDate = visitPrefectures.length > 0
                      const selected = selectedDate === cell.date

                      return (
                        <button
                          key={cell.date}
                          type="button"
                          onClick={() => setSelectedDate(cell.date)}
                          aria-label={`${cell.date} ${isUnavailable ? '受付不可' : '受付可能'}${hasVisitOnDate ? ' 来店予定あり' : ''}`}
                          className={[
                            'relative aspect-square rounded-lg border text-sm transition',
                            selected
                              ? 'border-[#FF5A1F] ring-2 ring-[#FF5A1F]/15'
                              : 'border-transparent hover:border-slate-300',
                            isUnavailable
                              ? 'bg-slate-200 font-semibold text-slate-500'
                              : 'bg-white text-slate-800',
                          ].join(' ')}
                        >
                          <span>{cell.day}</span>
                          {isUnavailable && (
                            <span className="absolute right-1 top-0.5 text-[10px] font-black text-slate-500">×</span>
                          )}
                          {hasVisitOnDate && (
                            <span
                              className="absolute bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400"
                              title={
                                visitPrefectures.length > 0
                                  ? `来店予定あり（${visitPrefectures.join('・')}）`
                                  : '来店予定あり'
                              }
                            />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedDate && (
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{formatSelectedDate(selectedDate)}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm">
                    <span
                      className={
                        selectedUnavailable
                          ? 'rounded-full bg-slate-200 px-2.5 py-1 font-medium text-slate-600'
                          : 'rounded-full bg-emerald-50 px-2.5 py-1 font-medium text-emerald-700'
                      }
                    >
                      {selectedUnavailable ? '受付不可' : '受付可能'}
                    </span>
                    {hasVisit && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 font-medium text-amber-800">
                        <MapPin className="h-3.5 w-3.5" />
                        来店予定あり
                        {selectedPrefectures.length > 0
                          ? `（${selectedPrefectures.join('・')}）`
                          : ''}
                      </span>
                    )}
                  </div>
                  {hasVisit && (
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      店舗名・時間は非公開です。時間帯が重ならなければオファーできます。
                    </p>
                  )}
                </div>
                <Button
                  type="button"
                  onClick={() => onOfferDate(selectedDate)}
                  disabled={selectedUnavailable}
                  className="min-h-10 shrink-0 bg-[#FF5A1F] font-bold text-white hover:bg-[#E94F18]"
                >
                  {selectedUnavailable ? 'この日は受付不可' : 'この日でオファーする'}
                  {!selectedUnavailable && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  )
}
