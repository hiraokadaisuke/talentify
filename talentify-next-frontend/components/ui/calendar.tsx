import React from 'react'
import { cn } from '@/lib/utils'

type Event = {
  date: string
  title: string
}

interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
  events?: Event[]
}

export function Calendar({ className, events = [], ...props }: CalendarProps) {
  return (
    <div className={cn('p-2', className)} {...props}>
      <ul className="space-y-1">
        {events.map((e) => (
          <li key={e.date} className="text-sm">
            {e.date}: {e.title}
          </li>
        ))}
      </ul>
    </div>
  )
}
