import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * Format date in Japanese with weekday, e.g. 2025年8月14日(木)
 * @param date string or Date
 * @returns formatted string or empty string if invalid
 */
export function formatJaWeekday(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return ''
  return format(d, 'yyyy年M月d日(E)', { locale: ja })
}
