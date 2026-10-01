export type OfferTimeRange = {
  startMinutes: number
  endMinutes: number
}

const TIME_RANGE_PATTERN = /^\s*(\d{1,2}):(\d{2})\s*(?:〜|～|~|-|–|—)\s*(\d{1,2}):(\d{2})\s*$/
const CLOCK_PATTERN = /^\s*(\d{1,2}):(\d{2})\s*$/

function toMinutes(hour: number, minute: number): number | null {
  if (
    !Number.isInteger(hour) ||
    !Number.isInteger(minute) ||
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59
  ) {
    return null
  }
  return hour * 60 + minute
}

function parseClock(value: string | null | undefined): number | null {
  if (!value) return null
  const match = value.match(CLOCK_PATTERN)
  if (!match) return null
  return toMinutes(Number(match[1]), Number(match[2]))
}

export function parseOfferClockRange(
  start: string | null | undefined,
  end: string | null | undefined
): OfferTimeRange | null {
  const startMinutes = parseClock(start)
  const endMinutes = parseClock(end)

  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return null
  }

  return { startMinutes, endMinutes }
}

export function parseOfferTimeRange(value: string | null | undefined): OfferTimeRange | null {
  if (!value) return null

  const match = value.match(TIME_RANGE_PATTERN)
  if (!match) return null

  const startMinutes = toMinutes(Number(match[1]), Number(match[2]))
  const endMinutes = toMinutes(Number(match[3]), Number(match[4]))

  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return null
  }

  return { startMinutes, endMinutes }
}

export function offerClockFromMinutes(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60)
  const minute = totalMinutes % 60
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
}

export function formatOfferTimeRange(range: OfferTimeRange): string {
  return `${offerClockFromMinutes(range.startMinutes)}〜${offerClockFromMinutes(range.endMinutes)}`
}

export function buildOfferStorageDate(date: string, minutes: number): Date {
  const [year, month, day] = date.split('-').map(Number)
  const hour = Math.floor(minutes / 60)
  const minute = minutes % 60
  return new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0))
}

function storedTimeToMinutes(value: string | Date | null | undefined): number | null {
  if (!value) return null

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null
    return value.getUTCHours() * 60 + value.getUTCMinutes()
  }

  const trimmed = value.trim()
  const direct = trimmed.match(/^(\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  const embedded = trimmed.match(/[T\s](\d{1,2}):(\d{2})(?::\d{2}(?:\.\d+)?)?$/)
  const match = direct ?? embedded
  if (!match) return null

  return toMinutes(Number(match[1]), Number(match[2]))
}

export function parseStoredOfferTimeRange(
  start: string | Date | null | undefined,
  end: string | Date | null | undefined
): OfferTimeRange | null {
  const startMinutes = storedTimeToMinutes(start)
  const endMinutes = storedTimeToMinutes(end)

  if (startMinutes == null || endMinutes == null || endMinutes <= startMinutes) {
    return null
  }

  return { startMinutes, endMinutes }
}

export function storedOfferTimeToClock(
  value: string | Date | null | undefined
): string | null {
  const minutes = storedTimeToMinutes(value)
  return minutes == null ? null : offerClockFromMinutes(minutes)
}

export function timeRangesOverlap(a: OfferTimeRange, b: OfferTimeRange) {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes
}
