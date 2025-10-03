import { eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns'

export type AvailabilityStatus = 'ok' | 'ng'

export type MonthlyBulkPayloadItem = {
  date: string
  status: AvailabilityStatus
}

export function buildMonthlyBulkPayload(
  referenceDate: Date,
  status: AvailabilityStatus
): MonthlyBulkPayloadItem[] {
  const interval = eachDayOfInterval({
    start: startOfMonth(referenceDate),
    end: endOfMonth(referenceDate),
  })

  return interval.map((date) => ({
    date: format(date, 'yyyy-MM-dd'),
    status,
  }))
}
