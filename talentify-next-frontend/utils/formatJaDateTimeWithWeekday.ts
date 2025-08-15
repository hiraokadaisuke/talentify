import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * Format date time in Japanese with weekday.
 * Example: 2025年8月14日(木) 09:30
 *
 * @param d string or Date
 * @returns formatted string or empty string if invalid
 */
export function formatJaDateTimeWithWeekday(d: string | Date): string {
  const date = typeof d === 'string' ? new Date(d) : d
  if (isNaN(date.getTime())) return ''
  return format(date, "yyyy年M月d日(E) HH:mm", { locale: ja })
}
