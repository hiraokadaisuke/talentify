import {
  extractAreaTokens,
  isDeclaredAvailable,
  isValidSearchWindow,
  matchesTalentFilter,
} from '@/lib/search/calendarAvailability'

describe('calendar availability helpers', () => {
  it('uses date override before the default availability mode', () => {
    expect(isDeclaredAvailable('default_ok', 'ng')).toBe(false)
    expect(isDeclaredAvailable('default_ng', 'ok')).toBe(true)
  })

  it('defaults to available when no availability setting exists', () => {
    expect(isDeclaredAvailable(undefined, undefined)).toBe(true)
  })

  it('requires the end time to be after the start time', () => {
    expect(isValidSearchWindow('13:00', '15:00')).toBe(true)
    expect(isValidSearchWindow('15:00', '15:00')).toBe(false)
    expect(isValidSearchWindow('16:00', '15:00')).toBe(false)
  })

  it('normalizes JSON-like area strings used by existing talent profiles', () => {
    expect(extractAreaTokens('["石川県","大阪府"]')).toEqual(['石川県', '大阪府'])
  })

  it('matches area and genre without requiring both filters', () => {
    const talent = { area: '["石川県"]', genre: 'ライター' }

    expect(matchesTalentFilter(talent, '石川県', 'ライター')).toBe(true)
    expect(matchesTalentFilter(talent, '大阪府', 'ライター')).toBe(false)
    expect(matchesTalentFilter(talent, undefined, 'ライター')).toBe(true)
  })
})
