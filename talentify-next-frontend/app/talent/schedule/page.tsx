'use client'

import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  Calendar as BigCalendar,
  Views,
  dateFnsLocalizer,
  type SlotInfo,
} from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import ja from 'date-fns/locale/ja'
import addMonths from 'date-fns/addMonths'
import subMonths from 'date-fns/subMonths'
import startOfMonth from 'date-fns/startOfMonth'
import endOfMonth from 'date-fns/endOfMonth'
import endOfWeek from 'date-fns/endOfWeek'
import startOfDay from 'date-fns/startOfDay'
import startOfToday from 'date-fns/startOfToday'
import isBefore from 'date-fns/isBefore'
import isSameDay from 'date-fns/isSameDay'
import isSameMonth from 'date-fns/isSameMonth'

import 'react-big-calendar/lib/css/react-big-calendar.css'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  buildMonthlyBulkPayload,
  type AvailabilityStatus,
} from './utils'
import { createClient } from '@/utils/supabase/client'
import { getTalentId } from '@/utils/getTalentId'
import {
  type DisplayStatus,
  mapOfferStatus,
} from '@/utils/storeSchedule'
import {
  type OfferStatusDb,
  toDbOfferStatus,
} from '@/app/lib/offerStatus'
import { toast } from 'sonner'

const locales = { ja }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

type DefaultMode = 'default_ok' | 'default_ng'

type AvailabilitySettings = {
  default_mode: DefaultMode
  timezone: string | null
}

type TalentCalendarEvent = {
  id: string
  title: string
  start: Date
  end: Date
  status: DisplayStatus
  storeName: string
  isMore?: boolean
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  scheduled: '予定',
  completed: '完了',
  cancelled: 'キャンセル',
  no_show: '欠席',
}

const STATUS_BADGE: Record<
  DisplayStatus,
  'default' | 'success' | 'destructive' | 'secondary'
> = {
  scheduled: 'default',
  completed: 'success',
  cancelled: 'destructive',
  no_show: 'secondary',
}

const AVAILABILITY_COLORS: Record<AvailabilityStatus, string> = {
  ok: 'rgba(34, 197, 94, 0.16)',
  ng: 'rgba(148, 163, 184, 0.28)',
}

const DEFAULT_TIMEZONE = 'Asia/Tokyo'

function pad(value: number) {
  return String(value).padStart(2, '0')
}

function monthRange(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const from = `${year}-${pad(month + 1)}-01`
  const lastDay = new Date(year, month + 1, 0).getDate()
  const to = `${year}-${pad(month + 1)}-${pad(lastDay)}`
  return { from, to }
}

export default function TalentSchedulePage() {
  const supabase = useMemo(() => createClient(), [])
  const [talentId, setTalentId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState(() => new Date())
  const [availabilitySettings, setAvailabilitySettings] =
    useState<AvailabilitySettings | null>(null)
  const [overrides, setOverrides] = useState<Record<string, AvailabilityStatus>>({})
  const [events, setEvents] = useState<TalentCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingDates, setUpdatingDates] = useState<Record<string, boolean>>({})
  const [updatingDefaultMode, setUpdatingDefaultMode] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)

  const defaultStatus: AvailabilityStatus = useMemo(() => {
    if (!availabilitySettings) return 'ok'
    return availabilitySettings.default_mode === 'default_ok' ? 'ok' : 'ng'
  }, [availabilitySettings])

  useEffect(() => {
    let mounted = true
    getTalentId()
      .then((id) => {
        if (mounted) setTalentId(id)
      })
      .catch((error) => {
        console.error('Failed to resolve talent id', error)
        toast.error('タレント情報の取得に失敗しました')
      })
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    void (async () => {
      const { data, error } = await supabase.auth.getUser()
      if (!mounted) return
      if (error || !data.user) {
        console.error('Failed to retrieve authenticated user', error)
        toast.error('ユーザー情報の取得に失敗しました')
        return
      }
      setUserId(data.user.id)
    })()
    return () => {
      mounted = false
    }
  }, [supabase])

  const fetchCalendarData = useCallback(async () => {
    if (!talentId || !userId) return

    const start = startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 1 })
    const end = endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 1 })
    const calendarFrom = format(start, 'yyyy-MM-dd')
    const calendarTo = format(end, 'yyyy-MM-dd')
    const { from, to } = monthRange(calendarDate)

    setLoading(true)
    try {
      const availabilityUrl = new URL(
        '/api/availability',
        window.location.origin
      )
      availabilityUrl.searchParams.set('user_id', userId)
      availabilityUrl.searchParams.set('from', from)
      availabilityUrl.searchParams.set('to', to)

      const availabilityResponse = await fetch(availabilityUrl.toString(), {
        credentials: 'include',
      })

      if (availabilityResponse.status === 404) {
        setAvailabilitySettings(null)
        setOverrides({})
      } else {
        if (!availabilityResponse.ok) {
          throw new Error('Failed to fetch availability')
        }

        const availabilityData: {
          settings: AvailabilitySettings
          dates: { date: string; status: AvailabilityStatus }[]
        } = await availabilityResponse.json()

        setAvailabilitySettings({
          default_mode: availabilityData.settings.default_mode,
          timezone: availabilityData.settings.timezone ?? DEFAULT_TIMEZONE,
        })

        const baseStatus =
          availabilityData.settings.default_mode === 'default_ok' ? 'ok' : 'ng'

        const mappedOverrides = availabilityData.dates.reduce(
          (acc, current) => {
            if (current.status !== baseStatus) {
              acc[current.date] = current.status
            }
            return acc
          },
          {} as Record<string, AvailabilityStatus>
        )
        setOverrides(mappedOverrides)
      }

      const statusesForQuery = [
        'confirmed',
        'completed',
        'cancelled',
        'canceled',
        'no_show',
      ]
        .map(status => toDbOfferStatus(status))
        .filter((status): status is OfferStatusDb => Boolean(status))

      const { data: offerRows, error: offerError } = await supabase
        .from('offers')
        .select(
          `
          id, date, status, start_time, end_time, notes,
          store:stores!offers_store_id_fkey(id, store_name, display_name)
        `
        )
        .eq('talent_id', talentId)
        .gte('date', calendarFrom)
        .lte('date', calendarTo)
        .in('status', statusesForQuery)

      if (offerError) {
        throw offerError
      }

      const mappedEvents = (offerRows ?? []).map((offer: any) => {
        const datetime = offer.start_time
          ? `${offer.date}T${offer.start_time}`
          : `${offer.date}T00:00:00`
        const startDate = new Date(datetime)
        return {
          id: offer.id as string,
          title:
            (offer.store?.display_name as string | null) ??
            (offer.store?.store_name as string | null) ??
            '出演',
          start: startDate,
          end: startDate,
          status: mapOfferStatus(offer.status),
          storeName:
            (offer.store?.display_name as string | null) ??
            (offer.store?.store_name as string | null) ??
            '出演',
        } satisfies TalentCalendarEvent
      })

      setEvents(mappedEvents)
    } catch (error) {
      console.error('Failed to load talent schedule data', error)
      toast.error('スケジュールの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [calendarDate, supabase, talentId, userId])

  useEffect(() => {
    void fetchCalendarData()
  }, [fetchCalendarData])

  const eventsByDate = useMemo(() => {
    const map = new Map<string, TalentCalendarEvent[]>()
    for (const event of events) {
      const key = format(event.start, 'yyyy-MM-dd')
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(event)
    }
    for (const [, list] of map.entries()) {
      list.sort((a, b) => a.start.getTime() - b.start.getTime())
    }
    return map
  }, [events])

  const calendarEvents = useMemo(() => {
    const result: TalentCalendarEvent[] = []
    for (const [dateKey, list] of eventsByDate.entries()) {
      const visible = list.slice(0, 2)
      result.push(...visible)
      if (list.length > visible.length) {
        const date = new Date(`${dateKey}T00:00:00`)
        result.push({
          id: `${dateKey}-more`,
          title: `+${list.length - visible.length}`,
          start: date,
          end: date,
          status: 'scheduled',
          storeName: '',
          isMore: true,
        })
      }
    }
    return result
  }, [eventsByDate])

  const today = startOfToday()

  const dayPropGetter = useCallback(
    (date: Date) => {
      if (!availabilitySettings) return {}
      const key = format(date, 'yyyy-MM-dd')
      const status = overrides[key] ?? defaultStatus
      const style: CSSProperties = {
        backgroundColor: AVAILABILITY_COLORS[status],
      }
      if (!isSameMonth(date, calendarDate)) {
        style.opacity = 0.5
      }
      if (isSameDay(date, today)) {
        style.boxShadow = 'inset 0 0 0 2px rgba(59, 130, 246, 0.6)'
      }
      const isPast = isBefore(startOfDay(date), today)
      if (isPast) {
        style.cursor = 'not-allowed'
      }
      return {
        style,
        title: isPast ? '過去の日付は編集できません' : undefined,
      }
    },
    [availabilitySettings, overrides, defaultStatus, calendarDate, today]
  )

  const handleSlotSelect = useCallback(
    async (slot: SlotInfo) => {
      if (!availabilitySettings) return
      const selectedDate = slot.start
      if (!selectedDate) return
      const normalized = startOfDay(selectedDate)
      if (isBefore(normalized, today)) return

      const key = format(normalized, 'yyyy-MM-dd')
      if (updatingDates[key]) return

      const previousOverrides = overrides
      const current = overrides[key] ?? defaultStatus
      const next: AvailabilityStatus = current === 'ok' ? 'ng' : 'ok'

      const optimistic = { ...overrides }
      if (next === defaultStatus) {
        delete optimistic[key]
      } else {
        optimistic[key] = next
      }
      setOverrides(optimistic)
      setUpdatingDates((prev) => ({ ...prev, [key]: true }))

      try {
        const response = await fetch('/api/availability/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates: [{ date: key, status: next }] }),
        })

        if (!response.ok) {
          throw new Error('Failed to update availability')
        }
        toast.success('可用性を更新しました')
        await fetchCalendarData()
      } catch (error) {
        console.error('Failed to update availability', error)
        setOverrides(previousOverrides)
        toast.error('可用性の更新に失敗しました')
        await fetchCalendarData()
      } finally {
        setUpdatingDates((prev) => {
          const { [key]: _unused, ...rest } = prev
          return rest
        })
      }
    },
    [
      availabilitySettings,
      defaultStatus,
      fetchCalendarData,
      overrides,
      today,
      updatingDates,
    ]
  )

  const handleDefaultModeChange = useCallback(
    async (mode: DefaultMode) => {
      if (!availabilitySettings || mode === availabilitySettings.default_mode) {
        return
      }

      const previous = availabilitySettings
      setAvailabilitySettings({ ...availabilitySettings, default_mode: mode })
      setUpdatingDefaultMode(true)

      try {
        const response = await fetch('/api/availability/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            default_mode: mode,
            timezone: availabilitySettings.timezone ?? DEFAULT_TIMEZONE,
          }),
        })

        if (!response.ok) {
          throw new Error('Failed to save settings')
        }

        const newDefaultStatus: AvailabilityStatus = mode === 'default_ok' ? 'ok' : 'ng'
        setOverrides((prev) => {
          const nextOverrides = { ...prev }
          for (const [date, status] of Object.entries(nextOverrides)) {
            if (status === newDefaultStatus) {
              delete nextOverrides[date]
            }
          }
          return nextOverrides
        })
        await fetchCalendarData()
        toast.success('基本可用性を更新しました')
      } catch (error) {
        console.error('Failed to update default availability mode', error)
        setAvailabilitySettings(previous)
        toast.error('基本可用性の更新に失敗しました')
        await fetchCalendarData()
      } finally {
        setUpdatingDefaultMode(false)
      }
    },
    [availabilitySettings, fetchCalendarData]
  )

  const handleBulkUpdate = useCallback(
    async (status: AvailabilityStatus) => {
      if (!availabilitySettings) return

      const payload = buildMonthlyBulkPayload(calendarDate, status)
      if (payload.length === 0) return

      const previousOverrides = overrides
      const optimisticOverrides = { ...overrides }

      for (const item of payload) {
        if (status === defaultStatus) {
          delete optimisticOverrides[item.date]
        } else {
          optimisticOverrides[item.date] = status
        }
      }

      setOverrides(optimisticOverrides)
      setBulkUpdating(true)

      try {
        const response = await fetch('/api/availability/bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates: payload }),
        })

        if (!response.ok) {
          throw new Error('Failed to update availability')
        }

        toast.success('この月の可用性を更新しました')
        await fetchCalendarData()
      } catch (error) {
        console.error('Failed to bulk update availability', error)
        setOverrides(previousOverrides)
        toast.error('可用性の更新に失敗しました')
        await fetchCalendarData()
      } finally {
        setBulkUpdating(false)
      }
    },
    [
      availabilitySettings,
      calendarDate,
      defaultStatus,
      fetchCalendarData,
      overrides,
    ]
  )

  const EventComponent = ({ event }: { event: TalentCalendarEvent }) => {
    if (event.isMore) {
      return <span className="truncate text-muted-foreground">{event.title}</span>
    }
    return (
      <span
        className="flex items-center gap-1 truncate"
        title={`${event.storeName} ${STATUS_LABEL[event.status]}`}
      >
        <span className="text-sm text-foreground">{event.storeName}</span>
        <Badge variant={STATUS_BADGE[event.status]} className="px-1 text-[10px]">
          {STATUS_LABEL[event.status]}
        </Badge>
      </span>
    )
  }

  const headerLabel = format(calendarDate, 'yyyy年M月')

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
      <div className="sticky top-0 z-10 space-y-3 bg-background pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">スケジュール管理</h1>
          <div className="flex items-center gap-1 self-start rounded-md border bg-white p-1 shadow-sm dark:bg-neutral-900">
            <Button
              type="button"
              size="sm"
              variant={
                (availabilitySettings?.default_mode ?? 'default_ok') === 'default_ok'
                  ? 'default'
                  : 'ghost'
              }
              className="px-3"
              onClick={() => handleDefaultModeChange('default_ok')}
              disabled={updatingDefaultMode}
            >
              基本OK
            </Button>
            <Button
              type="button"
              size="sm"
              variant={
                (availabilitySettings?.default_mode ?? 'default_ok') === 'default_ng'
                  ? 'default'
                  : 'ghost'
              }
              className="px-3"
              onClick={() => handleDefaultModeChange('default_ng')}
              disabled={updatingDefaultMode}
            >
              基本NG
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
              aria-label="前の月"
            >
              ◀
            </Button>
            <span className="text-lg font-semibold">{headerLabel}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
              aria-label="次の月"
            >
              ▶
            </Button>
          </div>
          <div className="flex flex-col items-start gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={bulkUpdating || !availabilitySettings}
                  className="text-xs"
                >
                  月一括設定
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 text-xs">
                <DropdownMenuItem
                  onSelect={() => {
                    void handleBulkUpdate('ok')
                  }}
                  disabled={bulkUpdating}
                  className="text-xs"
                >
                  この月を全てOKにする
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    void handleBulkUpdate('ng')
                  }}
                  disabled={bulkUpdating}
                  className="text-xs"
                >
                  この月を全てNGにする
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span
                  aria-hidden
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: AVAILABILITY_COLORS.ok }}
                />
                <span>OK</span>
              </div>
              <div className="flex items-center gap-1">
                <span
                  aria-hidden
                  className="h-3 w-3 rounded"
                  style={{ backgroundColor: AVAILABILITY_COLORS.ng }}
                />
                <span>NG</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-white p-4 shadow-sm dark:bg-neutral-900">
        {loading && (
          <p className="mb-2 text-sm text-muted-foreground">読み込み中…</p>
        )}
        <div className="-mx-2 overflow-x-auto px-2">
          <div className="min-w-[720px]">
            <BigCalendar
              culture="ja"
              toolbar={false}
              className="talent-calendar"
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              views={[Views.MONTH]}
              date={calendarDate}
              onNavigate={(d) => setCalendarDate(d)}
              selectable
              onSelectSlot={handleSlotSelect}
              dayPropGetter={dayPropGetter}
              components={{ event: EventComponent }}
              formats={{ weekdayFormat: 'eee' }}
              style={{ height: 480 }}
              eventPropGetter={(event) => {
                const calendarEvent = event as TalentCalendarEvent
                if (calendarEvent.isMore) {
                  return {
                    style: {
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'rgb(107, 114, 128)',
                      padding: 0,
                    },
                    className: 'text-xs font-medium',
                  }
                }
                return {
                  style: {
                    backgroundColor: 'transparent',
                    border: 'none',
                    padding: 0,
                  },
                  className: 'text-xs',
                }
              }}
              popup={false}
            />
          </div>
        </div>
      </div>
      <style jsx global>{`
        .talent-calendar .rbc-month-view {
          border: none;
        }
        .talent-calendar .rbc-row-segment .rbc-event-content {
          flex: 1;
        }
        .talent-calendar .rbc-off-range-bg {
          opacity: 0.35;
        }
        .talent-calendar .rbc-today {
          background-color: transparent;
        }
      `}</style>
    </main>
  )
}
