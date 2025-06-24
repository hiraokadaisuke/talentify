'use client'
import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import listPlugin from '@fullcalendar/list'
import interactionPlugin from '@fullcalendar/interaction'
import AvailabilityModal from '../../components/AvailabilityModal'
import EventDetailModal from '../../components/EventDetailModal'

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'

export default function SchedulePage() {
  const [events, setEvents] = useState([])
  const [selectedDate, setSelectedDate] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/events`)
        if (res.ok) {
          const data = await res.json()
          setEvents(data.map(e => ({
            id: e._id,
            title: `${e.storeName} ${e.title}`,
            start: e.start,
            end: e.end,
            extendedProps: e
          })))
        }
      } catch (e) {
        console.error(e)
      }
    }
    fetchEvents()
  }, [])

  const handleDateClick = info => {
    setSelectedDate(info.date)
  }

  const handleEventClick = info => {
    setSelectedEvent(info.event.extendedProps)
  }

  const saveAvailability = async data => {
    try {
      await fetch(`${API_BASE}/api/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          performerId: data.performerId,
          date: data.date,
          startTime: data.startTime,
          endTime: data.endTime,
          area: data.area
        })
      })
    } catch (e) {
      console.error(e)
    }
    setSelectedDate(null)
  }

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">スケジュール</h1>
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ start: 'today', center: 'title', end: 'dayGridMonth,timeGridWeek,listWeek' }}
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
      />
      <AvailabilityModal
        open={!!selectedDate}
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
        onSave={saveAvailability}
      />
      <EventDetailModal
        open={!!selectedEvent}
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
      />
    </main>
  )
}
