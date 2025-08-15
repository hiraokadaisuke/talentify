import { formatJaDateTimeWithWeekday } from '../utils/formatJaDateTimeWithWeekday'

describe('formatJaDateTimeWithWeekday', () => {
  test('formats date correctly', () => {
    const d = new Date(2025, 7, 14, 9, 30)
    expect(formatJaDateTimeWithWeekday(d)).toBe('2025年8月14日(木) 09:30')
  })

  test('returns empty string for invalid date', () => {
    // @ts-expect-error invalid
    expect(formatJaDateTimeWithWeekday('invalid')).toBe('')
  })
})
