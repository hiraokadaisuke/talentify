'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
} from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import ja from 'date-fns/locale/ja'
import isSameDay from 'date-fns/isSameDay'
import addMonths from 'date-fns/addMonths'
import subMonths from 'date-fns/subMonths'
import { createClient } from '@/utils/supabase/client'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import OfferModal from '@/components/modals/OfferModal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu'
import {
  mapOfferStatus,
  parseStatusesParam,
  stringifyStatuses,
  filterEvents,
  DEFAULT_STATUSES,
  type StoreScheduleEvent,
} from '@/utils/storeSchedule'
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalFooter,
} from '@/components/ui/modal'

const locales = { ja }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

const STATUS_LABEL: Record<string, string> = {
  scheduled: '予定',
  completed: '完了',
  cancelled: 'キャンセル',
  no_show: '欠席',
}

const STATUS_BADGE: Record<
  keyof typeof STATUS_LABEL,
  'default' | 'success' | 'destructive' | 'secondary'
> = {
  scheduled: 'default',
  completed: 'success',
  cancelled: 'destructive',
  no_show: 'secondary',
}

const STATUS_CLASS: Record<keyof typeof STATUS_LABEL, string> = {
  scheduled: '!text-blue-600',
  completed: '!text-green-600',
  cancelled: '!text-red-600',
  no_show: '!text-orange-600',
}

export default function StoreSchedulePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()

  const includeCompletedParam = searchParams.get('includeCompleted')
  const statusParam = searchParams.get('statuses')
  const qParam = searchParams.get('q') || ''

  const [includeCompleted, setIncludeCompleted] = useState(
    includeCompletedParam !== 'false'
  )
  const [statuses, setStatuses] = useState(() =>
    parseStatusesParam(statusParam)
  )
  const [q, setQ] = useState(qParam)
  const [debouncedQ, setDebouncedQ] = useState(qParam)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q), 300)
    return () => clearTimeout(t)
  }, [q])

  const [events, setEvents] = useState<StoreScheduleEvent[]>([])
  const [date, setDate] = useState(new Date())
  const [slot, setSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [offerModalOpen, setOfferModalOpen] = useState(false)
  const [selected, setSelected] = useState<StoreScheduleEvent | null>(null)

  useEffect(() => {
    const loadOffers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const statusesQuery = ['confirmed', 'cancelled', 'no_show']
      if (includeCompleted) statusesQuery.push('completed')

      const { data, error } = await supabase
        .from('offers')
        .select(
          'id, talent_id, date, status, start_time, notes, talents(stage_name)'
        )
        .eq('user_id', user.id)
        .in('status', statusesQuery)

      if (error) {
        console.error('Failed to fetch offers', error)
        return
      }

      const mapped = (data || []).map((o: any) => ({
        title: o.talents?.stage_name || '出演',
        start: new Date(
          o.start_time ? `${o.date}T${o.start_time}` : `${o.date}`
        ),
        end: new Date(
          o.start_time ? `${o.date}T${o.start_time}` : `${o.date}`
        ),
        talentId: o.talent_id,
        offerId: o.id,
        talentName: o.talents?.stage_name || '出演',
        status: mapOfferStatus(o.status),
        startTime: o.start_time,
        notes: o.notes,
      })) as StoreScheduleEvent[]

      setEvents(mapped)
    }

    loadOffers()
  }, [supabase, includeCompleted])

  useEffect(() => {
    const params = new URLSearchParams()
    if (!includeCompleted) params.set('includeCompleted', 'false')
    const statusStr = stringifyStatuses(statuses)
    if (statusStr) params.set('statuses', statusStr)
    if (debouncedQ) params.set('q', debouncedQ)
    const query = params.toString()
    router.replace(query ? `/store/schedule?${query}` : '/store/schedule')
  }, [includeCompleted, statuses, debouncedQ, router])

  const filtered = useMemo(
    () => filterEvents(events, statuses, debouncedQ),
    [events, statuses, debouncedQ]
  )
  const eventsByDate = useMemo(() => {
    const map: Record<string, StoreScheduleEvent[]> = {}
    filtered.forEach((e) => {
      const key = format(e.start, 'yyyy-MM-dd')
      ;(map[key] ||= []).push(e)
    })
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.start.getTime() - b.start.getTime())
    )
    return map
  }, [filtered])

  type CalendarEvent = StoreScheduleEvent & { isMore?: boolean }

  const calendarEvents: CalendarEvent[] = useMemo(() => {
    const result: CalendarEvent[] = []
    Object.entries(eventsByDate).forEach(([dateStr, evs]) => {
      const show = evs.slice(0, 2)
      result.push(...show)
      const more = evs.length - show.length
      if (more > 0) {
        const date = new Date(dateStr)
        result.push({
          title: `+${more}`,
          start: date,
          end: date,
          talentId: '',
          offerId: '',
          talentName: '',
          status: 'scheduled',
          isMore: true,
        })
      }
    })
    return result
  }, [eventsByDate])

  const dayPropGetter = (date: Date) => {
    const isToday = isSameDay(date, new Date())
    const dow = date.getDay()
    const key = format(date, 'yyyy-MM-dd')
    const list = eventsByDate[key] || []
    const title = list
      .map((e) => `${e.talentName} (${STATUS_LABEL[e.status]})`)
      .join('\n')
    let className = ''
    if (isToday) className = 'bg-blue-50'
    else if (dow === 0 || dow === 6) className = 'bg-gray-50'
    return { className, title: title || undefined }
  }

  const EventComponent = ({ event }: { event: CalendarEvent }) => {
    if (event.isMore) return <span className="truncate">{event.title}</span>
    return (
      <span
        className="truncate"
        title={`${event.talentName} (${STATUS_LABEL[event.status]})`}
      >
        {event.talentName} ({STATUS_LABEL[event.status]})
      </span>
    )
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">スケジュール</h1>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="min-h-[44px]"
            onClick={() => setDate(new Date())}
            aria-label="今日"
          >
            今日
          </Button>
        </div>
        <div className="flex-1 flex items-center justify-center gap-2">
          <Button
            size="sm"
            className="min-h-[44px]"
            onClick={() => setDate(subMonths(date, 1))}
            aria-label="前の月"
          >
            ◀
          </Button>
          <span className="text-sm font-medium">
            {format(date, 'yyyy年M月')}
          </span>
          <Button
            size="sm"
            className="min-h-[44px]"
            onClick={() => setDate(addMonths(date, 1))}
            aria-label="次の月"
          >
            ▶
          </Button>
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <Input
            type="search"
            placeholder="演者名検索"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="h-11 w-32 sm:w-48"
            aria-label="演者名検索"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="min-h-[44px]"
                aria-label="ステータスフィルタ"
              >
                ステータス
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40">
              {DEFAULT_STATUSES.map((s) => (
                <DropdownMenuCheckboxItem
                  key={s}
                  checked={statuses.includes(s)}
                  onCheckedChange={(checked) =>
                    setStatuses((prev) =>
                      checked
                        ? [...prev, s]
                        : prev.filter((p) => p !== s)
                    )
                  }
                >
                  {STATUS_LABEL[s]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={includeCompleted}
              onChange={(e) => setIncludeCompleted(e.target.checked)}
              className="h-4 w-4"
              aria-label="完了を表示"
            />
            完了
          </label>
        </div>
      </div>
      <div className="flex justify-end gap-4 mb-2 text-xs">
        {DEFAULT_STATUSES.map((s) => (
          <div key={s} className="flex items-center gap-1">
            <Badge variant={STATUS_BADGE[s]} className="px-1"></Badge>
            {STATUS_LABEL[s]}
          </div>
        ))}
      </div>
      <BigCalendar
        culture="ja"
        toolbar={false}
        className="mx-auto w-[80%]"
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        views={[Views.MONTH]}
        date={date}
        onNavigate={(d) => setDate(d)}
        style={{ height: 480 }}
        components={{ event: EventComponent }}
        dayPropGetter={dayPropGetter}
        eventPropGetter={(e) => {
          const event = e as CalendarEvent
          if (event.isMore)
            return {
              style: {
                backgroundColor: 'transparent',
                border: 'none',
                padding: 0,
                color: '#4b5563',
              },
              className: 'text-xs truncate',
            }
          return {
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
            },
            className: `cursor-pointer text-xs truncate ${STATUS_CLASS[event.status]}`,
          }
        }}
        onSelectEvent={(e) => {
          const event = e as CalendarEvent
          if (event.isMore) return
          setSelected(event)
        }}
        selectable
        formats={{ weekdayFormat: 'eeeeee' }}
        onSelectSlot={(s) => {
          setSlot(s)
          setOfferModalOpen(true)
        }}
      />
      <OfferModal
        open={offerModalOpen}
        onOpenChange={setOfferModalOpen}
        initialDate={slot ? slot.start : null}
      />
      <Modal open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <ModalContent className="max-w-sm">
          {selected && (
            <>
              <ModalHeader>
                <ModalTitle>{selected.talentName}</ModalTitle>
              </ModalHeader>
              <div className="space-y-2 text-sm">
                <div>
                  <Badge variant={STATUS_BADGE[selected.status]}>
                    {STATUS_LABEL[selected.status]}
                  </Badge>
                </div>
                <div>開始: {format(selected.start, 'yyyy-MM-dd HH:mm')}</div>
                {selected.notes && (
                  <div className="whitespace-pre-wrap">{selected.notes}</div>
                )}
              </div>
              <ModalFooter>
                <Link
                  href={`/talents/${selected.talentId}`}
                  className="text-blue-600 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  プロフィール
                </Link>
                <Link
                  href={`/store/offers/${selected.offerId}`}
                  className="text-blue-600 underline"
                >
                  詳細
                </Link>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <style jsx global>{`
        .rbc-header {
          position: sticky;
          top: 0;
          z-index: 1;
          background: white;
        }
      `}</style>
    </main>
  )
}
