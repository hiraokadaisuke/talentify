export type OfferTimeRange = {
  startMinutes: number
  endMinutes: number
}

const TIME_RANGE_PATTERN = /^\s*(\d{1,2}):(\d{2})\s*(?:〜|～|~|-|–|—)\s*(\d{1,2}):(\d{2})\s*$/

export function parseOfferTimeRange(value: string | null | undefined): OfferTimeRange | null {
  if (!value) return null

  const match = value.match(TIME_RANGE_PATTERN)
  if (!match) return null

  const startHour = Number(match[1])
  const startMinute = Number(match[2])
  const endHour = Number(match[3])
  const endMinute = Number(match[4])

  if (
    !Number.isInteger(startHour) ||
    !Number.isInteger(startMinute) ||
    !Number.isInteger(endHour) ||
    !Number.isInteger(endMinute) ||
    startHour < 0 ||
    startHour > 23 ||
    endHour < 0 ||
    endHour > 23 ||
    startMinute < 0 ||
    startMinute > 59 ||
    endMinute < 0 ||
    endMinute > 59
  ) {
    return null
  }

  const startMinutes = startHour * 60 + startMinute
  const endMinutes = endHour * 60 + endMinute

  if (endMinutes <= startMinutes) return null

  return { startMinutes, endMinutes }
}

export function timeRangesOverlap(a: OfferTimeRange, b: OfferTimeRange) {
  return a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes
}
