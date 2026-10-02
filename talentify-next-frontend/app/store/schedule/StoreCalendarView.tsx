'use client'

import type { ComponentType } from 'react'
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
import 'react-big-calendar/lib/css/react-big-calendar.css'

const Calendar = BigCalendar as ComponentType<any>

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { ja },
})

type Props = {
  events: any[]
  date: Date
  onNavigate: (date: Date) => void
  EventComponent: ComponentType<{ event: any }>
  dayPropGetter: (date: Date) => { className?: string; title?: string }
  onSelectEvent: (event: any) => void
  onSelectSlot: (slot: any) => void
}

export default function StoreCalendarView({
  events,
  date,
  onNavigate,
  EventComponent,
  dayPropGetter,
  onSelectEvent,
  onSelectSlot,
}: Props) {
  return (
    <Calendar
      culture="ja"
      toolbar={false}
      className="mx-auto w-full"
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={[Views.MONTH]}
      date={date}
      onNavigate={onNavigate}
      style={{ height: 400 }}
      components={{ event: EventComponent }}
      dayPropGetter={dayPropGetter}
      eventPropGetter={(event: any) => {
        if (event?.isMore) {
          return {
            style: {
              backgroundColor: 'transparent',
              border: 'none',
              padding: 0,
              color: '#4b5563',
            },
            className: 'text-xs truncate',
          }
        }

        return {
          style: {
            backgroundColor: 'transparent',
            border: 'none',
            padding: 0,
          },
          className: 'cursor-pointer text-xs truncate',
        }
      }}
      onSelectEvent={onSelectEvent}
      selectable
      formats={{ weekdayFormat: 'eeeeee' }}
      onSelectSlot={onSelectSlot}
    />
  )
}
