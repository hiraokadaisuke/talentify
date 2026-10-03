'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'

import type { CSSProperties, ComponentType } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SlotInfo } from 'react-big-calendar'
import { useRouter } from 'next/navigation'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import parseISO from 'date-fns/parseISO'
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
import isValid from 'date-fns/isValid'

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
import {
  type DisplayStatus,
  mapOfferStatus,
} from '@/utils/storeSchedule'
import { toast } from 'sonner'
import { AlertCircle, CalendarDays, RotateCcw } from 'lucide-react'
import { storedOfferTimeToClock } from '@/lib/offers/timeRange'

const locales = { ja }

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
  allDay: boolean
  isMore?: boolean
}

const STATUS_LABEL: Record<DisplayStatus, string> = {
  scheduled: '来店予定',
  completed: '完了',
  cancelled: 'キャンセル',
  no_show: '来店なし',
}

const MOBILE_STATUS_LABEL: Record<DisplayStatus, string> = {
  scheduled: '予定',
  completed: '完了',
  cancelled: '中止',
  no_show: '来店なし',
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

const STATUS_INDICATOR_COLORS: Record<DisplayStatus, string> = {
  scheduled: 'bg-amber-400 dark:bg-amber-500',
  completed: 'bg-emerald-500',
  cancelled: 'bg-rose-500',
  no_show: 'bg-slate-400 dark:bg-slate-500',
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

function buildDateTime(dateStr?: string | null, timeStr?: string | null) {
  if (!dateStr) return null
  const trimmedDate = dateStr.trim()
  if (!trimmedDate) return null

  const clock = storedOfferTimeToClock(timeStr)
  const normalizedTime = clock ? `${clock}:00` : '00:00:00'

  const iso = `${trimmedDate}T${normalizedTime}`
  const parsed = parseISO(iso)
  return isValid(parsed) ? parsed : null
}

function toJstDateString(
  dateStr: string | null | undefined,
  formatter: Intl.DateTimeFormat | null
) {
  if (!dateStr || !formatter) return null
  const parsed = new Date(dateStr)
  if (Number.isNaN(parsed.getTime())) return null
  const formatted = formatter.format(parsed)
  const [year, month, day] = formatted.split('/')
  if (!year || !month || !day) return null
  return `${year.padStart(2, '0')}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
}

export default function ScheduleCalendar({
  initialUserId,
  initialTalentId,
  initialIdentityError = false,
}: {
  initialUserId: string | null
  initialTalentId: string | null
  initialIdentityError?: boolean
}) {
  const router = useRouter()
  const [calendarLib, setCalendarLib] = useState<{
    Calendar: ComponentType<any>
    Views: any
    localizer: any
  } | null>(null)
  const [jstFormatter, setJstFormatter] = useState<Intl.DateTimeFormat | null>(null)
  const headerFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        year: 'numeric',
        month: 'long',
      }),
    []
  )
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('ja-JP', {
        timeZone: 'Asia/Tokyo',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      }),
    []
  )
  const supabase = useMemo(() => createClient(), [])
  const [talentId, setTalentId] = useState<string | null>(initialTalentId)
  const [userId, setUserId] = useState<string | null>(initialUserId)
  const [calendarDate, setCalendarDate] = useState<Date | null>(null)
  const [today, setToday] = useState<Date | null>(null)
  const [availabilitySettings, setAvailabilitySettings] =
    useState<AvailabilitySettings | null>(null)
  const [overrides, setOverrides] = useState<Record<string, AvailabilityStatus>>({})
  const [events, setEvents] = useState<TalentCalendarEvent[]>([])
  const [calendarEvents, setCalendarEvents] = useState<TalentCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [identityLoading, setIdentityLoading] = useState(false)
  const [identityError, setIdentityError] = useState(initialIdentityError)
  const [calendarLoadError, setCalendarLoadError] = useState(false)
  const [hasLoadedCalendarData, setHasLoadedCalendarData] = useState(false)
  const [updatingDates, setUpdatingDates] = useState<Record<string, boolean>>({})
  const [updatingDefaultMode, setUpdatingDefaultMode] = useState(false)
  const [bulkUpdating, setBulkUpdating] = useState(false)
  const [ready, setReady] = useState(false)
  const headerLabel = useMemo(() => {
    if (!calendarDate) return ''
    return headerFormatter.format(calendarDate)
  }, [calendarDate, headerFormatter])

  const formatTime = useCallback(
    (value: Date) => timeFormatter.format(value),
    [timeFormatter]
  )

  const defaultStatus: AvailabilityStatus = useMemo(() => {
    if (!availabilitySettings) return 'ok'
    return availabilitySettings.default_mode === 'default_ok' ? 'ok' : 'ng'
  }, [availabilitySettings])

  useEffect(() => {
    let mounted = true
    void (async () => {
      const mod = await import('react-big-calendar')
      if (!mounted) return
      const CalendarComponent = (mod.Calendar ?? mod.default) as ComponentType<any>
      const localizer = mod.dateFnsLocalizer({
        format,
        parse,
        startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 0 }),
        getDay,
        locales,
      })
      setCalendarLib({
        Calendar: CalendarComponent,
        Views: mod.Views,
        localizer,
      })
    })()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('ja-JP', {
      timeZone: 'Asia/Tokyo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
    setJstFormatter(formatter)
  }, [])

  useEffect(() => {
    const now = new Date()
    setCalendarDate(now)
    setToday(startOfToday())
    setReady(true)
  }, [])

  const loadIdentity = useCallback(async () => {
    setIdentityLoading(true)
    setIdentityError(false)

    try {
      const { data, error } = await supabase.auth.getUser()

      if (error || !data.user) {
        console.error('Failed to retrieve authenticated user', error)
        throw error ?? new Error('Authenticated user not found')
      }

      const { data: talent, error: talentError } = await supabase
        .from('talents')
        .select('id')
        .eq('user_id', data.user.id)
        .maybeSingle()

      if (talentError) {
        throw talentError
      }

      setUserId(data.user.id)
      setTalentId(talent?.id ?? null)
    } catch (error) {
      console.error('Failed to load talent schedule identity', error)
      setUserId(null)
      setTalentId(null)
      setIdentityError(true)
      toast.error('ユーザー情報の取得に失敗しました')
    } finally {
      setIdentityLoading(false)
    }
  }, [supabase])


  const fetchCalendarData = useCallback(async () => {
    if (!talentId || !userId || !calendarDate || !jstFormatter) return

    const start = startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 0 })
    const end = endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 0 })
    const calendarFrom = format(start, 'yyyy-MM-dd')
    const calendarTo = format(end, 'yyyy-MM-dd')
    const { from, to } = monthRange(calendarDate)

    setLoading(true)
    setHasLoadedCalendarData(false)
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

      const startUTC = new Date(`${calendarFrom}T00:00:00+09:00`).toISOString()
      const endUTC = new Date(`${calendarTo}T23:59:59+09:00`).toISOString()

      const { data: offerRows, error: offerError } = await supabase
        .from('offers')
        .select(
          `
          id, date, status, start_time, end_time, notes,
          store:stores!offers_store_id_fkey(id, store_name)
        `
        )
        .eq('talent_id', talentId)
        .gte('date', startUTC)
        .lte('date', endUTC)
        .in('status', ['confirmed', 'completed', 'no_show'])

      if (offerError) {
        throw offerError
      }

      const mappedEvents = (offerRows ?? [])
        .map((offer: any) => {
          const jstDate = toJstDateString(offer.date as string | null, jstFormatter)
          if (!jstDate) {
            return null
          }

          const hasStartTime = Boolean(offer.start_time)
          const hasEndTime = Boolean(offer.end_time)
          const startDate =
            buildDateTime(jstDate, offer.start_time as string | null) ??
            buildDateTime(jstDate, null)

          if (!startDate) {
            return null
          }

          const endDate = hasEndTime
            ? buildDateTime(jstDate, offer.end_time as string | null) ?? startDate
            : startDate

          const storeName =
            (offer.store?.store_name as string | null) ??
            '出演'

          return {
            id: offer.id as string,
            title: storeName,
            start: startDate,
            end: endDate,
            status: mapOfferStatus(offer.status),
            storeName,
            allDay: !hasStartTime || !hasEndTime,
          } satisfies TalentCalendarEvent
        })
        .filter((event): event is TalentCalendarEvent => event != null)

      setEvents(mappedEvents)
      setCalendarLoadError(false)
      setHasLoadedCalendarData(true)
    } catch (error) {
      console.error('Failed to load talent schedule data', error)
      setAvailabilitySettings(null)
      setOverrides({})
      setEvents([])
      setCalendarLoadError(true)
      setHasLoadedCalendarData(false)
      toast.error('スケジュールの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [calendarDate, jstFormatter, supabase, talentId, userId])

  useEffect(() => {
    void fetchCalendarData()
  }, [fetchCalendarData])

  useEffect(() => {
    if (events.length === 0) {
      setCalendarEvents([])
      return
    }

    const map = new Map<string, TalentCalendarEvent[]>()
    for (const event of events) {
      const key = format(event.start, 'yyyy-MM-dd')
      if (!map.has(key)) {
        map.set(key, [])
      }
      map.get(key)!.push(event)
    }

    const next: TalentCalendarEvent[] = []
    for (const [dateKey, list] of map.entries()) {
      const sorted = [...list].sort(
        (a, b) => a.start.getTime() - b.start.getTime()
      )
      const visible = sorted.slice(0, 2)
      next.push(...visible)
      if (sorted.length > visible.length) {
        const date = new Date(`${dateKey}T00:00:00`)
        next.push({
          id: `${dateKey}-more`,
          title: `+${sorted.length - visible.length}`,
          start: date,
          end: date,
          status: 'scheduled',
          storeName: '',
          isMore: true,
          allDay: true,
        })
      }
    }

    setCalendarEvents(next)
  }, [events])

  const dayPropGetter = useCallback(
    (date: Date) => {
      if (!availabilitySettings || !today || !calendarDate) return {}
      const key = format(date, 'yyyy-MM-dd')
      const status = overrides[key] ?? defaultStatus
      const isOutsideMonth = !isSameMonth(date, calendarDate)
      const classNames: string[] = []
      const style: CSSProperties = {}

      if (isOutsideMonth) {
        classNames.push('calendar-outside-month')
      } else if (status === 'ng') {
        classNames.push('calendar-unavailable')
        style.backgroundColor = AVAILABILITY_COLORS.ng
      }

      if (isSameDay(date, today)) {
        style.boxShadow = 'inset 0 0 0 2px rgba(59, 130, 246, 0.6)'
      }

      const isPast = isBefore(startOfDay(date), today)
      if (isPast) {
        style.cursor = 'not-allowed'
      }

      return {
        className: classNames.join(' '),
        style,
        title: isPast ? '過去の日付は編集できません' : undefined,
      }
    },
    [availabilitySettings, overrides, defaultStatus, calendarDate, today]
  )

  const handleSlotSelect = useCallback(
    async (slot: SlotInfo) => {
      if (!availabilitySettings || !today) return
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
        toast.success(next === 'ng' ? '受付不可に変更しました' : '受付可能に戻しました')
      } catch (error) {
        console.error('Failed to update availability', error)
        setOverrides(previousOverrides)
        toast.error('受付状況の更新に失敗しました')
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
      if (!availabilitySettings || !calendarDate) return

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
    const hasCustomTime = !event.allDay && event.start != null && event.end != null
    let timeLabel: string | null = null
    if (hasCustomTime) {
      const startLabel = formatTime(event.start)
      const endLabel =
        event.end.getTime() !== event.start.getTime()
          ? formatTime(event.end)
          : null
      timeLabel = endLabel ? `${startLabel}-${endLabel}` : startLabel
    }
    const tooltipParts = [event.storeName, STATUS_LABEL[event.status]]
    if (timeLabel) {
      tooltipParts.push(timeLabel)
    }
    if (event.allDay) {
      tooltipParts.push('終日オファー')
    }
    return (
      <span className="block min-w-0" title={tooltipParts.join(' ')}>
        <span className="flex items-center justify-center gap-1 sm:hidden">
          <span
            aria-hidden
            className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_INDICATOR_COLORS[event.status]}`}
          />
          <Badge
            variant={STATUS_BADGE[event.status]}
            className="max-w-full flex-shrink-0 px-1.5 py-0 text-[9px] leading-4"
          >
            {MOBILE_STATUS_LABEL[event.status]}
          </Badge>
        </span>

        <span className="hidden min-w-0 items-center gap-1 truncate sm:flex">
          <span
            aria-hidden
            className={`h-2 w-2 flex-shrink-0 rounded-full ${STATUS_INDICATOR_COLORS[event.status]}`}
          />
          <span className="flex min-w-0 items-center gap-1 truncate">
            {timeLabel ? (
              <span className="text-xs text-muted-foreground">{timeLabel}</span>
            ) : null}
            <span className="truncate text-sm text-foreground">{event.storeName}</span>
          </span>
          <Badge
            variant={STATUS_BADGE[event.status]}
            className="flex-shrink-0 px-1 text-[10px]"
          >
            {STATUS_LABEL[event.status]}
          </Badge>
        </span>
      </span>
    )
  }

  if (
    !ready ||
    !calendarDate ||
    !today ||
    !calendarLib ||
    !calendarLib.localizer ||
    !calendarLib.Calendar ||
    !calendarLib.Views ||
    !jstFormatter ||
    identityLoading
  ) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <p className="text-sm text-muted-foreground">カレンダーを読み込んでいます…</p>
      </main>
    )
  }

  if (identityError) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
        >
          <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-semibold text-red-900">
            ユーザー情報を読み込めませんでした
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-red-700">
            通信状況を確認して、もう一度お試しください。
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 min-h-10"
            onClick={() => void loadIdentity()}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            再読み込み
          </Button>
        </div>
      </main>
    )
  }

  if (!talentId || !userId) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <div className="rounded-xl border bg-white px-4 py-6 text-center shadow-sm">
          <h2 className="text-sm font-semibold">演者プロフィールの登録が必要です</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            スケジュールを設定する前に、演者プロフィールを登録してください。
          </p>
          <Button
            type="button"
            className="mt-4 min-h-10"
            onClick={() => {
              router.push('/talent/edit')
            }}
          >
            プロフィールを登録
          </Button>
        </div>
      </main>
    )
  }

  if (!hasLoadedCalendarData && !calendarLoadError) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <p className="text-sm text-muted-foreground">スケジュールを読み込んでいます…</p>
      </main>
    )
  }

  if (calendarLoadError) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <h1 className="text-2xl font-bold">スケジュール管理</h1>
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center"
        >
          <AlertCircle className="mx-auto h-6 w-6 text-red-600" aria-hidden="true" />
          <h2 className="mt-2 text-sm font-semibold text-red-900">
            スケジュールを読み込めませんでした
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-red-700">
            空き状況や案件予定を正しく表示できていません。通信状況を確認して、もう一度お試しください。
          </p>
          <Button
            type="button"
            variant="outline"
            className="mt-4 min-h-10"
            disabled={loading}
            onClick={() => void fetchCalendarData()}
          >
            <RotateCcw className="mr-1.5 h-4 w-4" aria-hidden="true" />
            {loading ? '再読み込み中…' : '再読み込み'}
          </Button>
        </div>
      </main>
    )
  }

  const { Calendar: BigCalendar, Views, localizer } = calendarLib

  return (
    <main className="mx-auto w-full max-w-[1500px] space-y-4">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,.05)]">
        <div className="flex items-start gap-3 p-5 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#0B1F3B] text-[#FFC400]">
            <CalendarDays className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[11px] font-black tracking-[0.16em] text-[#C2410C]">TALENT SCHEDULE</p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">スケジュール管理</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">基本は受付可能です。予定が合わない日だけ「受付不可」にしてください。確定した来店予定は自動で表示されます。</p>
          </div>
        </div>
        <div className="h-1 bg-gradient-to-r from-[#FF3B2E] via-[#FF8A00] to-[#FFC400]" />
      </section>

      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-slate-950">受付状況</p>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              何も設定していない日は「受付可能」です。受付できない日だけ、カレンダーの日付をタップしてください。
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <span aria-hidden className="h-3 w-3 rounded border border-slate-300 bg-white" />
              <span>受付可能</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span
                aria-hidden
                className="grid h-4 w-4 place-items-center rounded bg-slate-200 text-[10px] font-black text-slate-600"
              >
                ×
              </span>
              <span>受付不可</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>来店予定</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-[44px_1fr_44px] items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-11 p-0 text-base"
            onClick={() => setCalendarDate(subMonths(calendarDate, 1))}
            aria-label="前の月"
          >
            ‹
          </Button>
          <span className="text-center text-lg font-bold text-slate-950 sm:text-xl">{headerLabel}</span>
          <Button
            variant="outline"
            size="sm"
            className="h-10 w-11 p-0 text-base"
            onClick={() => setCalendarDate(addMonths(calendarDate, 1))}
            aria-label="次の月"
          >
            ›
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,.05)] sm:p-4">
        {loading && (
          <p className="mb-2 text-sm text-muted-foreground">読み込み中…</p>
        )}
        <div className="min-w-0 overflow-hidden">
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
              style={{ height: 'clamp(380px, 105vw, 460px)' }}
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
      <style jsx global>{`
        .talent-calendar .rbc-month-view {
          border: none;
        }
        .talent-calendar .rbc-row-segment .rbc-event-content {
          flex: 1;
        }
        .talent-calendar .rbc-off-range-bg,
        .talent-calendar .calendar-outside-month {
          background: #f8fafc;
        }
        .talent-calendar .rbc-off-range {
          color: #cbd5e1;
        }
        .talent-calendar .calendar-unavailable {
          position: relative;
        }
        .talent-calendar .calendar-unavailable::after {
          content: '不可';
          position: absolute;
          left: 50%;
          top: 30px;
          transform: translateX(-50%);
          z-index: 2;
          border-radius: 9999px;
          background: rgba(71, 85, 105, 0.12);
          padding: 1px 6px;
          font-size: 10px;
          font-weight: 800;
          line-height: 16px;
          color: #475569;
          pointer-events: none;
          white-space: nowrap;
        }
        .talent-calendar .rbc-today {
          background-color: transparent;
        }
        @media (max-width: 640px) {
          .talent-calendar .rbc-month-view { font-size: 10px; }
          .talent-calendar .rbc-header { padding: 4px 0; font-weight: 700; }
          .talent-calendar .rbc-date-cell { padding-right: 4px; padding-top: 2px; }
          .talent-calendar .rbc-month-row { min-height: 64px; }
          .talent-calendar .rbc-row-segment { padding: 0 2px 1px; }
          .talent-calendar .rbc-event-content {
            min-width: 0;
            overflow: visible;
            font-size: 9px;
          }
          .talent-calendar .rbc-event {
            min-height: 16px;
            overflow: visible;
          }
          .talent-calendar .calendar-unavailable::after {
            top: 25px;
            padding: 0 5px;
            font-size: 9px;
            line-height: 15px;
          }
        }
      `}</style>
    </main>
  )
}
