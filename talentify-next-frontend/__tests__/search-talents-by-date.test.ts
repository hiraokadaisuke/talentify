import {
  mergeTalentAvailability,
  type AvailabilityDateRow,
  type AvailabilitySettingRow,
  type TalentRow,
} from '@/app/api/talents/search-by-date/route'

describe('mergeTalentAvailability', () => {
  const baseTalent = (overrides: Partial<TalentRow> = {}): TalentRow => ({
    id: 'talent-1',
    stage_name: 'Stage Name',
    display_name: 'Display Name',
    genre: 'Pop',
    area: 'Tokyo',
    avatar_url: 'https://example.com/avatar.png',
    rate: 10000,
    rating: 4.5,
    bio: 'Performer bio',
    media_appearance: 'Recent achievements',
    ...overrides,
  })

  it('excludes talents when default_ok but the date is overridden to ng', () => {
    const talents: TalentRow[] = [baseTalent({ id: 'talent-ok-ng' })]
    const settings: AvailabilitySettingRow[] = [
      { talent_id: 'talent-ok-ng', default_mode: 'default_ok' },
    ]
    const overrides: AvailabilityDateRow[] = [
      { talent_id: 'talent-ok-ng', status: 'ng' },
    ]

    const results = mergeTalentAvailability({
      talents,
      availabilitySettings: settings,
      availabilityDates: overrides,
      confirmedTalentIds: new Set(),
    })

    expect(results).toHaveLength(0)
  })

  it('includes talents when default_ng but overridden to ok', () => {
    const talents: TalentRow[] = [baseTalent({ id: 'talent-ng-ok' })]
    const settings: AvailabilitySettingRow[] = [
      { talent_id: 'talent-ng-ok', default_mode: 'default_ng' },
    ]
    const overrides: AvailabilityDateRow[] = [
      { talent_id: 'talent-ng-ok', status: 'ok' },
    ]

    const results = mergeTalentAvailability({
      talents,
      availabilitySettings: settings,
      availabilityDates: overrides,
      confirmedTalentIds: new Set(),
    })

    expect(results).toHaveLength(1)
    expect(results[0]).toMatchObject({
      id: 'talent-ng-ok',
      availability_status: 'ok',
      achievements: 'Recent achievements',
    })
  })

  it('excludes talents that already have a confirmed offer on the date', () => {
    const talents: TalentRow[] = [baseTalent({ id: 'talent-confirmed' })]
    const settings: AvailabilitySettingRow[] = [
      { talent_id: 'talent-confirmed', default_mode: 'default_ok' },
    ]

    const results = mergeTalentAvailability({
      talents,
      availabilitySettings: settings,
      availabilityDates: [],
      confirmedTalentIds: new Set(['talent-confirmed']),
    })

    expect(results).toHaveLength(0)
  })
})
