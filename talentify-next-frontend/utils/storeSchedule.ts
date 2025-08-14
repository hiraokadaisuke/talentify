import type { Event as BigCalendarEvent } from 'react-big-calendar'

export type DisplayStatus =
  | 'scheduled'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export interface StoreScheduleEvent extends BigCalendarEvent {
  talentId: string
  offerId: string
  talentName: string
  status: DisplayStatus
  startTime?: string | null
  notes?: string | null
}

export const DEFAULT_STATUSES: DisplayStatus[] = [
  'scheduled',
  'completed',
  'cancelled',
  'no_show',
]

const RAW_STATUS_MAP: Record<string, DisplayStatus> = {
  confirmed: 'scheduled',
  pending: 'scheduled',
  completed: 'completed',
  cancelled: 'cancelled',
  no_show: 'no_show',
}

export function mapOfferStatus(status: string | null | undefined): DisplayStatus {
  if (!status) return 'scheduled'
  return RAW_STATUS_MAP[status] ?? 'scheduled'
}

export function parseStatusesParam(param: string | null): DisplayStatus[] {
  if (!param) return DEFAULT_STATUSES
  const parts = param.split(',')
  return DEFAULT_STATUSES.filter((s) => parts.includes(s))
}

export function stringifyStatuses(statuses: DisplayStatus[]): string | null {
  if (statuses.length === DEFAULT_STATUSES.length) return null
  return statuses.join(',')
}

export function filterEvents(
  events: StoreScheduleEvent[],
  statuses: DisplayStatus[],
  q: string
): StoreScheduleEvent[] {
  const qLower = q.toLowerCase()
  return events.filter(
    (e) =>
      statuses.includes(e.status) &&
      (!qLower || e.talentName.toLowerCase().includes(qLower))
  )
}
