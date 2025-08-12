export const s = (v: unknown): string => (typeof v === 'string' ? v : '')

export const n = (v: unknown): number => {
  if (typeof v === 'number') return v
  if (typeof v === 'string') {
    const num = Number(v)
    return isNaN(num) ? 0 : num
  }
  return 0
}

export function j<T>(v: unknown, defaultValue: T): T {
  if (v == null) return defaultValue
  if (typeof v === 'string') {
    try {
      return JSON.parse(v) as T
    } catch {
      return defaultValue
    }
  }
  return v as T
}
