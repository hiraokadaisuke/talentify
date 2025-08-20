import {
  mapOfferStatus,
  parseStatusesParam,
  stringifyStatuses,
  filterEvents,
  DEFAULT_STATUSES,
  type StoreScheduleEvent,
} from '../utils/storeSchedule'

describe('store schedule utils', () => {
  test('mapOfferStatus maps raw statuses to display statuses', () => {
    expect(mapOfferStatus('confirmed')).toBe('scheduled')
    expect(mapOfferStatus('completed')).toBe('completed')
    expect(mapOfferStatus('cancelled')).toBe('cancelled')
    expect(mapOfferStatus('canceled')).toBe('cancelled')
    expect(mapOfferStatus('no_show')).toBe('no_show')
    expect(mapOfferStatus('unknown')).toBe('scheduled')
  })

  test('parse and stringify statuses round trip', () => {
    const s: typeof DEFAULT_STATUSES = ['scheduled', 'completed']
    const str = stringifyStatuses(s)
    expect(str).toBe('scheduled,completed')
    expect(parseStatusesParam(str)).toEqual(s)
    expect(stringifyStatuses(DEFAULT_STATUSES)).toBeNull()
  })

  test('filterEvents filters by status and query', () => {
    const events: StoreScheduleEvent[] = [
      {
        title: 'A',
        start: new Date(),
        end: new Date(),
        talentId: '1',
        offerId: '1',
        talentName: 'Alice',
        status: 'scheduled',
      },
      {
        title: 'B',
        start: new Date(),
        end: new Date(),
        talentId: '2',
        offerId: '2',
        talentName: 'Bob',
        status: 'completed',
      },
    ]

    expect(filterEvents(events, ['scheduled'], '')).toHaveLength(1)
    expect(filterEvents(events, DEFAULT_STATUSES, 'bo')).toHaveLength(1)
  })
})
