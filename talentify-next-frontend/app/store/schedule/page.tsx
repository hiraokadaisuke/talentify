'use client'

import { useEffect, useState, useMemo } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
  View,
  type Event as BigCalendarEvent,
} from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import ja from 'date-fns/locale/ja'
import { createClient } from '@/utils/supabase/client'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import OfferModal from '@/components/modals/OfferModal'

interface OfferEvent extends BigCalendarEvent {
  talentId: string
  offerId: string
  status: string
}

const locales = { ja }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

export default function StoreSchedulePage() {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const includeCompletedParam = searchParams.get('includeCompleted')
  const [includeCompleted, setIncludeCompleted] = useState(
    includeCompletedParam !== 'false'
  )
  const [events, setEvents] = useState<OfferEvent[]>([])
  const [view, setView] = useState<View>(Views.MONTH)
  const [slot, setSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    const loadOffers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const statuses = includeCompleted
        ? ['confirmed', 'completed']
        : ['confirmed']
      const { data, error } = await supabase
        .from('offers')
        .select('id, talent_id, date, status, talents(stage_name)')
        .eq('user_id', user.id)
        .in('status', statuses)

      if (error) {
        console.error('Failed to fetch offers', error)
        return
      }

      const mapped = (data || []).map((o: any) => ({
        title: o.talents?.stage_name || '出演',
        start: new Date(o.date),
        end: new Date(o.date),
        talentId: o.talent_id,
        offerId: o.id,
        status: o.status,
      })) as OfferEvent[]

      setEvents(mapped)
    }

    loadOffers()
  }, [supabase, includeCompleted])

  const eventStyleGetter = (event: OfferEvent) => {
    const base = 'rounded p-1'
    switch (event.status) {
      case 'completed':
        return { className: `bg-green-500 text-white ${base}` }
      case 'confirmed':
        return { className: `bg-blue-500 text-white ${base}` }
      default:
        return { className: `bg-gray-300 text-gray-600 ${base}` }
    }
  }

  const handleSelectEvent = (event: OfferEvent) => {
    router.push(`/store/offers/${event.offerId}`)
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSlot({ start, end })
    setModalOpen(true)
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">スケジュール</h1>
      <div className="space-x-2 mb-2">
        <button
          onClick={() => setView(Views.WEEK)}
          className={`px-3 py-1 border rounded ${view === Views.WEEK ? 'bg-blue-600 text-white' : ''}`}
        >
          週表示
        </button>
        <button
          onClick={() => setView(Views.MONTH)}
          className={`px-3 py-1 border rounded ${view === Views.MONTH ? 'bg-blue-600 text-white' : ''}`}
        >
          月表示
        </button>
        <label className="ml-4 text-sm">
          <input
            type="checkbox"
            className="mr-1"
            checked={includeCompleted}
            onChange={(e) => {
              const checked = e.target.checked
              setIncludeCompleted(checked)
              const params = new URLSearchParams(searchParams.toString())
              if (checked) {
                params.delete('includeCompleted')
              } else {
                params.set('includeCompleted', 'false')
              }
              const query = params.toString()
              router.replace(query ? `/store/schedule?${query}` : '/store/schedule')
            }}
          />
          完了を表示
        </label>
      </div>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        views={[Views.WEEK, Views.MONTH]}
        view={view}
        onView={(v) => setView(v)}
        style={{ height: 600 }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={handleSelectEvent}
        selectable
        onSelectSlot={handleSelectSlot}
      />
      <OfferModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        initialDate={slot ? slot.start : null}
      />
    </main>
  )
}

