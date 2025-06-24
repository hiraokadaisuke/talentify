import React from 'react';
import { cn } from '@/lib/utils';

export function Calendar({ className, events = [], ...props }) {
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
  );
}
