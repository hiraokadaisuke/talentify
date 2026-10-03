'use client'

import type { ComponentType } from 'react'
import {
  Calendar as BigCalendar,
  dateFnsLocalizer,
  Views,
} from 'react-big-calendar'
import type {
  DayPropGetter,
  EventProps,
  SlotInfo,
} from 'react-big-calendar'
import format from 'date-fns/format'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import getDay from 'date-fns/getDay'
import ja from 'date-fns/locale/ja'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { StoreScheduleEvent } from '@/utils/storeSchedule'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
  getDay,
  locales: { ja },
})

type CalendarEvent = StoreScheduleEvent & { isMore?: boolean }

type Props = {
  events: CalendarEvent[]
  date: Date
  onNavigate: (date: Date) => void
  EventComponent: ComponentType<EventProps<CalendarEvent>>
  dayPropGetter: DayPropGetter
  onSelectEvent: (event: CalendarEvent) => void
  onSelectSlot: (slot: SlotInfo) => void
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
    <BigCalendar<CalendarEvent>
      culture="ja"
      toolbar={false}
      className="mx-auto w-full"
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      views={[Views.MONTH]}
      date={date}
      onNavigate={(nextDate) => onNavigate(nextDate)}
      style={{ height: 400 }}
      components={{ event: EventComponent }}
      dayPropGetter={dayPropGetter}
      eventPropGetter={(event) => {
        if (event.isMore) {
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
      onSelectEvent={(event) => onSelectEvent(event)}
      selectable
      formats={{ weekdayFormat: 'eeeeee' }}
      onSelectSlot={(slot) => onSelectSlot(slot)}
    />
  )
}
