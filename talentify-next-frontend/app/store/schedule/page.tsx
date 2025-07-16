'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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

interface OfferEvent extends BigCalendarEvent {
  talentId: string
  offerId: string
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
  const supabase = createClient()
  const [events, setEvents] = useState<OfferEvent[]>([])
  const [view, setView] = useState<View>(Views.MONTH)

  useEffect(() => {
    const loadOffers = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('offers')
        .select('id, talent_id, date, status, talents(stage_name)')
        .eq('user_id', user.id)
        .eq('status', 'accepted')

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
      })) as OfferEvent[]

      setEvents(mapped)
    }

    loadOffers()
  }, [supabase])

  const eventStyleGetter = (event: OfferEvent) => {
    const isPast = event.end < new Date()
    return {
      className: isPast
        ? 'bg-gray-300 text-gray-600 rounded p-1'
        : 'bg-blue-500 text-white rounded p-1',
    }
  }

  const handleSelectEvent = (event: OfferEvent) => {
    router.push(`/talents/${event.talentId}`)
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
      />
    </main>
  )
}

