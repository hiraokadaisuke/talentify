'use client'

import 'react-big-calendar/lib/css/react-big-calendar.css'

import type { CSSProperties, ComponentType } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { SlotInfo } from 'react-big-calendar'
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
import eachDayOfInterval from 'date-fns/eachDayOfInterval'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Modal, ModalContent, ModalFooter, ModalHeader, ModalTitle } from '@/components/ui/modal'
import { Switch } from '@/components/ui/switch'
import { type AvailabilityStatus } from './utils'
import { createClient } from '@/utils/supabase/client'
import { getTalentId } from '@/utils/getTalentId'
import {
  type DisplayStatus,
  mapOfferStatus,
} from '@/utils/storeSchedule'
import { toast } from 'sonner'

const locales = { ja }

type DefaultMode = 'ok' | 'ng'

type AvailabilitySettings = {
  default_mode: DefaultMode
  timezone: string
  week_pattern: Record<string, AvailabilityStatus> | null
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
const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土']

function buildWeekPatternDraft(
  defaultMode: DefaultMode,
  pattern: Record<string, AvailabilityStatus> | null
) {
  const result: Record<string, AvailabilityStatus> = {}
  for (let i = 0; i < 7; i += 1) {
    const key = i.toString()
    result[key] = pattern?.[key] ?? defaultMode
  }
  return result
}

function getDateKeyFromDate(date: Date) {
  return format(date, 'yyyy-MM-dd')
}

function getWeekdayKeyFromDate(date: Date) {
  return date.getDay().toString()
}

function getWeekdayKeyFromDateKey(dateKey: string) {
  const [yearStr, monthStr, dayStr] = dateKey.split('-')
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
  if (
    Number.isNaN(year) ||
    Number.isNaN(month) ||
    Number.isNaN(day)
  ) {
    return null
  }
  const utcDate = new Date(Date.UTC(year, month - 1, day))
  return utcDate.getUTCDay().toString()
}

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

  let normalizedTime = '00:00:00'
  if (timeStr && timeStr.trim()) {
    const trimmedTime = timeStr.trim()
    normalizedTime = /^\d{2}:\d{2}$/.test(trimmedTime)
      ? `${trimmedTime}:00`
      : trimmedTime
  }

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

export default function ScheduleCalendar() {
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
  const [talentId, setTalentId] = useState<string | null>(null)
  const [calendarDate, setCalendarDate] = useState<Date | null>(null)
  const [today, setToday] = useState<Date | null>(null)
  const [availabilitySettings, setAvailabilitySettings] =
    useState<AvailabilitySettings | null>(null)
  const [overrides, setOverrides] = useState<Record<string, AvailabilityStatus>>({})
  const [weekPatternModalOpen, setWeekPatternModalOpen] = useState(false)
  const [weekPatternDraft, setWeekPatternDraft] = useState<
    Record<string, AvailabilityStatus>
  >({})
  const [weekPatternActive, setWeekPatternActive] = useState(false)
  const [events, setEvents] = useState<TalentCalendarEvent[]>([])
  const [calendarEvents, setCalendarEvents] = useState<TalentCalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [updatingDates, setUpdatingDates] = useState<Record<string, boolean>>({})
  const [updatingDefaultMode, setUpdatingDefaultMode] = useState(false)
  const [updatingWeekPattern, setUpdatingWeekPattern] = useState(false)
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

  const getBaseStatusForDateKey = useCallback(
    (dateKey: string): AvailabilityStatus => {
      if (!availabilitySettings) return 'ok'
      const weekdayKey = getWeekdayKeyFromDateKey(dateKey)
      const patternStatus =
        (weekdayKey && availabilitySettings.week_pattern?.[weekdayKey]) ?? null
      return patternStatus ?? availabilitySettings.default_mode
    },
    [availabilitySettings]
  )

  const getBaseStatusForDate = useCallback(
    (date: Date): AvailabilityStatus =>
      getBaseStatusForDateKey(getDateKeyFromDate(date)),
    [getBaseStatusForDateKey]
  )

  const resolveNextStatus = useCallback(
    (
      dateKey: string,
      currentOverrides: Record<string, AvailabilityStatus>
    ): 'ok' | 'ng' | 'default' => {
      const currentOverride = currentOverrides[dateKey]
      if (currentOverride === 'ok') return 'ng'
      if (currentOverride === 'ng') return 'default'
      const base = getBaseStatusForDateKey(dateKey)
      return base === 'ok' ? 'ng' : 'ok'
    },
    [getBaseStatusForDateKey]
  )

  const getDisplayStatusForDate = useCallback(
    (date: Date): AvailabilityStatus => {
      const dateKey = getDateKeyFromDate(date)
      const override = overrides[dateKey]
      if (override) {
        return override
      }
      return getBaseStatusForDate(date)
    },
    [getBaseStatusForDate, overrides]
  )

  useEffect(() => {
    let mounted = true
    void (async () => {
      const mod = await import('react-big-calendar')
      if (!mounted) return
      const CalendarComponent = (mod.Calendar ?? mod.default) as ComponentType<any>
      const localizer = mod.dateFnsLocalizer({
        format,
        parse,
        startOfWeek: (date) => startOfWeek(date, { weekStartsOn: 1 }),
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

  const fetchCalendarData = useCallback(async () => {
    if (!talentId || !calendarDate || !jstFormatter) return

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
      availabilityUrl.searchParams.set('talent_id', talentId)
      availabilityUrl.searchParams.set('from', from)
      availabilityUrl.searchParams.set('to', to)

      const availabilityResponse = await fetch(availabilityUrl.toString(), {
        credentials: 'include',
      })

      if (availabilityResponse.status === 404) {
        setAvailabilitySettings(null)
        setOverrides({})
        setWeekPatternDraft({})
        setWeekPatternActive(false)
      } else {
        if (!availabilityResponse.ok) {
          throw new Error('Failed to fetch availability')
        }

        const availabilityData: {
          settings: {
            default_mode: DefaultMode
            timezone: string
            week_pattern: Record<string, AvailabilityStatus> | null
          }
          dates: { date: string; status: AvailabilityStatus }[]
        } = await availabilityResponse.json()

        setAvailabilitySettings({
          default_mode: availabilityData.settings.default_mode,
          timezone: availabilityData.settings.timezone ?? DEFAULT_TIMEZONE,
          week_pattern: availabilityData.settings.week_pattern ?? null,
        })

        const overridesMap = availabilityData.dates.reduce(
          (acc, current) => {
            acc[current.date] = current.status
            return acc
          },
          {} as Record<string, AvailabilityStatus>
        )
        setOverrides(overridesMap)
        setWeekPatternActive(Boolean(availabilityData.settings.week_pattern))
        setWeekPatternDraft(
          buildWeekPatternDraft(
            availabilityData.settings.default_mode,
            availabilityData.settings.week_pattern ?? null
          )
        )
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
        .in('status', ['confirmed', 'completed'])

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
    } catch (error) {
      console.error('Failed to load talent schedule data', error)
      toast.error('スケジュールの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }, [calendarDate, jstFormatter, supabase, talentId])

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
      const status = getDisplayStatusForDate(date)
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
    [availabilitySettings, calendarDate, getDisplayStatusForDate, today]
  )

  const applyAvailabilityChanges = useCallback(
    async (dateKeys: string[]) => {
      if (!availabilitySettings || dateKeys.length === 0) return

      const uniqueKeys = Array.from(new Set(dateKeys))
      if (uniqueKeys.some((key) => updatingDates[key])) {
        return
      }

      const previousOverrides = overrides
      const optimisticOverrides = { ...overrides }
      const payload: { date: string; status: 'ok' | 'ng' | 'default' }[] = []

      for (const key of uniqueKeys) {
        const nextStatus = resolveNextStatus(key, previousOverrides)
        payload.push({ date: key, status: nextStatus })
        if (nextStatus === 'default') {
          delete optimisticOverrides[key]
        } else {
          optimisticOverrides[key] = nextStatus
        }
      }

      if (payload.length === 0) {
        return
      }

      setOverrides(optimisticOverrides)
      setUpdatingDates((prev) => ({
        ...prev,
        ...Object.fromEntries(uniqueKeys.map((key) => [key, true])),
      }))

      try {
        const response = await fetch('/api/availability/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dates: payload }),
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
          const next = { ...prev }
          for (const key of uniqueKeys) {
            delete next[key]
          }
          return next
        })
      }
    },
    [availabilitySettings, fetchCalendarData, overrides, resolveNextStatus, updatingDates]
  )

  const handleSlotSelect = useCallback(
    async (slot: SlotInfo) => {
      if (!availabilitySettings || !today) return
      const selectedSlots = Array.isArray(slot.slots) && slot.slots.length > 0
        ? slot.slots
        : [slot.start]
      const normalizedKeys = selectedSlots
        .map((value) => {
          if (!value) return null
          const normalized = startOfDay(value as Date)
          if (isBefore(normalized, today)) {
            return null
          }
          return getDateKeyFromDate(normalized)
        })
        .filter((value): value is string => Boolean(value))

      if (normalizedKeys.length === 0) {
        return
      }

      await applyAvailabilityChanges(normalizedKeys)
    },
    [applyAvailabilityChanges, availabilitySettings, today]
  )

  const handleWeekdayToggle = useCallback(
    async (weekday: number) => {
      if (!availabilitySettings || !calendarDate || !today) return

      const start = startOfWeek(startOfMonth(calendarDate), { weekStartsOn: 1 })
      const end = endOfWeek(endOfMonth(calendarDate), { weekStartsOn: 1 })
      const keys = eachDayOfInterval({ start, end })
        .filter((date) => date.getDay() === weekday)
        .map((date) => startOfDay(date))
        .filter((date) => !isBefore(date, today))
        .map((date) => getDateKeyFromDate(date))

      if (keys.length === 0) {
        return
      }

      await applyAvailabilityChanges(keys)
    },
    [applyAvailabilityChanges, availabilitySettings, calendarDate, today]
  )

  const handleOpenWeekPatternModal = useCallback(() => {
    if (!availabilitySettings) return
    setWeekPatternDraft(
      buildWeekPatternDraft(
        availabilitySettings.default_mode,
        availabilitySettings.week_pattern ?? null
      )
    )
    setWeekPatternActive(Boolean(availabilitySettings.week_pattern))
    setWeekPatternModalOpen(true)
  }, [availabilitySettings])

  const handleWeekPatternDayToggle = useCallback(
    (weekday: number) => {
      if (!availabilitySettings) return
      const key = weekday.toString()
      setWeekPatternDraft((prev) => {
        const current = prev[key] ?? availabilitySettings.default_mode
        const next: AvailabilityStatus = current === 'ok' ? 'ng' : 'ok'
        return { ...prev, [key]: next }
      })
      setWeekPatternActive(true)
    },
    [availabilitySettings]
  )

  const handleWeekPatternReset = useCallback(() => {
    if (!availabilitySettings) return
    setWeekPatternActive(false)
    setWeekPatternDraft(
      buildWeekPatternDraft(availabilitySettings.default_mode, null)
    )
  }, [availabilitySettings])

  const handleWeekPatternActiveChange = useCallback(
    (checked: boolean) => {
      if (!availabilitySettings) return
      if (checked) {
        setWeekPatternActive(true)
      } else {
        setWeekPatternActive(false)
        setWeekPatternDraft(
          buildWeekPatternDraft(availabilitySettings.default_mode, null)
        )
      }
    },
    [availabilitySettings]
  )

  const handleWeekPatternSave = useCallback(async () => {
    if (!availabilitySettings) return

    setUpdatingWeekPattern(true)
    try {
      const response = await fetch('/api/availability/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          default_mode: availabilitySettings.default_mode,
          timezone: availabilitySettings.timezone ?? DEFAULT_TIMEZONE,
          week_pattern: weekPatternActive ? weekPatternDraft : null,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save week pattern')
      }

      setAvailabilitySettings((prev) =>
        prev
          ? {
              ...prev,
              week_pattern: weekPatternActive ? { ...weekPatternDraft } : null,
            }
          : prev
      )
      toast.success('曜日パターンを保存しました')
      setWeekPatternModalOpen(false)
      await fetchCalendarData()
    } catch (error) {
      console.error('Failed to save week pattern', error)
      toast.error('曜日パターンの保存に失敗しました')
      await fetchCalendarData()
    } finally {
      setUpdatingWeekPattern(false)
    }
  }, [
    availabilitySettings,
    fetchCalendarData,
    weekPatternActive,
    weekPatternDraft,
  ])

  const handleDefaultModeChange = useCallback(
    async (mode: DefaultMode) => {
      if (!availabilitySettings || mode === availabilitySettings.default_mode) {
        return
      }

      const previous = availabilitySettings
      setAvailabilitySettings({ ...availabilitySettings, default_mode: mode })
      setWeekPatternDraft((prev) =>
        buildWeekPatternDraft(mode, weekPatternActive ? prev : null)
      )
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

        toast.success('基本可用性を更新しました')
        await fetchCalendarData()
      } catch (error) {
        console.error('Failed to update default availability mode', error)
        setAvailabilitySettings(previous)
        toast.error('基本可用性の更新に失敗しました')
        await fetchCalendarData()
      } finally {
        setUpdatingDefaultMode(false)
      }
    },
    [availabilitySettings, fetchCalendarData, weekPatternActive]
  )

  const handleBulkUpdate = useCallback(
    async (status: AvailabilityStatus) => {
      if (!availabilitySettings || !calendarDate) return

      const monthDays = eachDayOfInterval({
        start: startOfMonth(calendarDate),
        end: endOfMonth(calendarDate),
      })

      if (monthDays.length === 0) return

      const previousOverrides = overrides
      const optimisticOverrides = { ...overrides }
      const payload: { date: string; status: 'ok' | 'ng' | 'default' }[] = []

      for (const date of monthDays) {
        const dateKey = getDateKeyFromDate(date)
        const base = getBaseStatusForDateKey(dateKey)
        if (status === base) {
          if (optimisticOverrides[dateKey]) {
            delete optimisticOverrides[dateKey]
            payload.push({ date: dateKey, status: 'default' })
          }
        } else {
          optimisticOverrides[dateKey] = status
          payload.push({ date: dateKey, status })
        }
      }

      if (payload.length === 0) {
        return
      }

      setOverrides(optimisticOverrides)
      setBulkUpdating(true)

      try {
        const response = await fetch('/api/availability/override', {
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
      getBaseStatusForDateKey,
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
      <span className="flex items-center gap-1 truncate" title={tooltipParts.join(' ')}>
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
    )
  }

  const WeekdayHeaderComponent = useMemo(
    () =>
      function WeekdayHeader({ label, date }: { label: string; date: Date }) {
        const weekday = getDay(date)
        const status = getDisplayStatusForDate(date)
        return (
          <button
            type="button"
            className="w-full rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-muted"
            style={{
              backgroundColor: AVAILABILITY_COLORS[status],
            }}
            onClick={() => {
              void handleWeekdayToggle(weekday)
            }}
            title="この曜日の可用性をまとめて切り替える"
          >
            {label}
          </button>
        )
      },
    [getDisplayStatusForDate, handleWeekdayToggle]
  )

  if (
    !ready ||
    !calendarDate ||
    !today ||
    !calendarLib ||
    !calendarLib.localizer ||
    !calendarLib.Calendar ||
    !calendarLib.Views ||
    !jstFormatter
  ) {
    return (
      <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
        <p className="text-sm text-muted-foreground">カレンダーを読み込んでいます…</p>
      </main>
    )
  }

  const { Calendar: BigCalendar, Views, localizer } = calendarLib

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 p-4">
      <div className="sticky top-0 z-10 space-y-3 bg-background pb-2">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold">スケジュール管理</h1>
          <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-1 rounded-md border bg-white p-1 shadow-sm dark:bg-neutral-900">
              <Button
                type="button"
                size="sm"
                variant={
                  (availabilitySettings?.default_mode ?? 'ok') === 'ok'
                    ? 'default'
                    : 'ghost'
                }
                className="px-3"
                onClick={() => handleDefaultModeChange('ok')}
                disabled={updatingDefaultMode}
              >
                基本OK
              </Button>
              <Button
                type="button"
                size="sm"
                variant={
                  (availabilitySettings?.default_mode ?? 'ok') === 'ng'
                    ? 'default'
                    : 'ghost'
                }
                className="px-3"
                onClick={() => handleDefaultModeChange('ng')}
                disabled={updatingDefaultMode}
              >
                基本NG
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={handleOpenWeekPatternModal}
                disabled={!availabilitySettings}
              >
                曜日パターン設定
              </Button>
              <Badge
                variant={weekPatternActive ? 'default' : 'secondary'}
                className="px-2 py-1 text-xs"
              >
                {weekPatternActive ? '曜日パターン適用中' : '曜日パターン未設定'}
              </Badge>
            </div>
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
              components={{
                event: EventComponent,
                month: { header: WeekdayHeaderComponent },
              }}
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
      <Modal open={weekPatternModalOpen} onOpenChange={setWeekPatternModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>曜日パターン設定</ModalTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              各曜日ごとの基本ステータスを設定できます。パターンを無効にすると基本モードの設定が適用されます。
            </p>
          </ModalHeader>
          <div className="space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium">曜日ごとの可用性</p>
                <p className="text-xs text-muted-foreground">
                  ボタンをクリックして曜日ごとのOK/NGを切り替えます。
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="week-pattern-active"
                  checked={weekPatternActive}
                  onCheckedChange={handleWeekPatternActiveChange}
                  disabled={!availabilitySettings || updatingWeekPattern}
                />
                <label
                  htmlFor="week-pattern-active"
                  className="text-xs text-muted-foreground"
                >
                  {weekPatternActive ? 'パターン有効' : '基本のみ適用'}
                </label>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {WEEKDAY_LABELS.map((label, index) => {
                const key = index.toString()
                const status =
                  weekPatternDraft[key] ??
                  availabilitySettings?.default_mode ??
                  'ok'
                const isOk = status === 'ok'
                return (
                  <Button
                    key={key}
                    type="button"
                    variant={isOk ? 'default' : 'outline'}
                    className="justify-between"
                    onClick={() => handleWeekPatternDayToggle(index)}
                    disabled={!weekPatternActive || updatingWeekPattern}
                  >
                    <span>{label}</span>
                    <span className="text-xs">{isOk ? 'OK' : 'NG'}</span>
                  </Button>
                )
              })}
            </div>
            <div className="flex justify-end">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleWeekPatternReset}
                disabled={!availabilitySettings || updatingWeekPattern}
              >
                リセット
              </Button>
            </div>
          </div>
          <ModalFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setWeekPatternModalOpen(false)}
              disabled={updatingWeekPattern}
            >
              キャンセル
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleWeekPatternSave()
              }}
              disabled={updatingWeekPattern}
            >
              保存
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </main>
  )
}
