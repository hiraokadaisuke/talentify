export type AvailabilityDefaultMode = 'default_ok' | 'default_ng'
export type AvailabilityStatus = 'ok' | 'ng'

export function timeToMinutes(value: string): number | null {
  const match = value.match(/^(\d{2}):(\d{2})$/)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null

  return hour * 60 + minute
}

export function isValidSearchWindow(start: string, end: string): boolean {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  return (
    startMinutes != null &&
    endMinutes != null &&
    endMinutes > startMinutes
  )
}

export function isDeclaredAvailable(
  defaultMode: AvailabilityDefaultMode | null | undefined,
  overrideStatus: AvailabilityStatus | null | undefined
): boolean {
  if (overrideStatus) return overrideStatus === 'ok'
  return (defaultMode ?? 'default_ok') === 'default_ok'
}

export function extractAreaTokens(area: string | string[] | null | undefined): string[] {
  if (Array.isArray(area)) return [...new Set(area.flatMap(item => extractAreaTokens(item)))]
  if (!area) return []

  const trimmed = area.trim()
  if (!trimmed) return []

  return trimmed
    .replace(/[\[\]"]+/g, '')
    .split(/[,、/\s]+/)
    .map(part => part.trim())
    .filter(Boolean)
}

export function matchesTalentFilter(
  talent: { area: string | null; genre: string | null },
  area?: string,
  genre?: string
): boolean {
  const areaMatch =
    !area ||
    talent.area?.includes(area) === true ||
    extractAreaTokens(talent.area).includes(area)

  const genreMatch = !genre || talent.genre === genre

  return areaMatch && genreMatch
}
