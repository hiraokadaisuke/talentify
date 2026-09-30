import { parseOfferTimeRange, timeRangesOverlap } from '@/lib/offers/timeRange'

describe('offer time range helpers', () => {
  it.each([
    ['13:00〜15:00', { startMinutes: 780, endMinutes: 900 }],
    ['13:00～15:00', { startMinutes: 780, endMinutes: 900 }],
    ['13:00~15:00', { startMinutes: 780, endMinutes: 900 }],
    ['13:00-15:00', { startMinutes: 780, endMinutes: 900 }],
    ['9:30 – 11:00', { startMinutes: 570, endMinutes: 660 }],
  ])('parses supported time range format %s', (value, expected) => {
    expect(parseOfferTimeRange(value)).toEqual(expected)
  })

  it.each([
    null,
    '',
    '10:00~',
    '10時〜12時',
    '25:00〜26:00',
    '13:00〜12:00',
    '13:00〜13:00',
  ])('returns null for unsupported or invalid range %s', value => {
    expect(parseOfferTimeRange(value)).toBeNull()
  })

  it('treats touching ranges as non-overlapping', () => {
    const first = parseOfferTimeRange('13:00〜15:00')
    const second = parseOfferTimeRange('15:00〜17:00')

    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(timeRangesOverlap(first!, second!)).toBe(false)
  })

  it('detects partial overlap', () => {
    const first = parseOfferTimeRange('13:00〜15:00')
    const second = parseOfferTimeRange('14:00〜16:00')

    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(timeRangesOverlap(first!, second!)).toBe(true)
  })

  it('detects contained overlap', () => {
    const outer = parseOfferTimeRange('10:00〜18:00')
    const inner = parseOfferTimeRange('12:00〜13:00')

    expect(outer).not.toBeNull()
    expect(inner).not.toBeNull()
    expect(timeRangesOverlap(outer!, inner!)).toBe(true)
  })
})
