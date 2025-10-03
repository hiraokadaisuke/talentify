import { mergeAvailability } from '../lib/availability/mergeAvailability';

describe('mergeAvailability', () => {
  it('returns ok for each day when default mode is default_ok without exceptions', () => {
    const from = new Date('2024-01-01T00:00:00+09:00');
    const to = new Date('2024-01-03T00:00:00+09:00');

    expect(
      mergeAvailability({
        defaultMode: 'default_ok',
        dates: {},
        from,
        to,
      }),
    ).toEqual([
      { date: '2024-01-01', status: 'ok' },
      { date: '2024-01-02', status: 'ok' },
      { date: '2024-01-03', status: 'ok' },
    ]);
  });

  it('returns ng for each day when default mode is default_ng without exceptions', () => {
    const from = new Date('2024-05-10T12:00:00+09:00');
    const to = new Date('2024-05-11T12:00:00+09:00');

    expect(
      mergeAvailability({
        defaultMode: 'default_ng',
        dates: {},
        from,
        to,
      }),
    ).toEqual([
      { date: '2024-05-10', status: 'ng' },
      { date: '2024-05-11', status: 'ng' },
    ]);
  });

  it('overrides default mode with provided date exceptions', () => {
    const from = new Date('2024-06-01T00:00:00+09:00');
    const to = new Date('2024-06-03T00:00:00+09:00');

    expect(
      mergeAvailability({
        defaultMode: 'default_ok',
        dates: {
          '2024-06-02': 'ng',
          '2024-06-03': 'ok',
        },
        from,
        to,
      }),
    ).toEqual([
      { date: '2024-06-01', status: 'ok' },
      { date: '2024-06-02', status: 'ng' },
      { date: '2024-06-03', status: 'ok' },
    ]);
  });

  it('includes boundary days and handles timezone conversion to Asia/Tokyo', () => {
    const from = new Date('2024-03-31T15:00:00Z'); // 2024-04-01T00:00:00+09:00
    const to = new Date('2024-04-02T14:59:59Z'); // 2024-04-02T23:59:59+09:00

    expect(
      mergeAvailability({
        defaultMode: 'default_ng',
        dates: {
          '2024-04-01': 'ok',
        },
        from,
        to,
      }),
    ).toEqual([
      { date: '2024-04-01', status: 'ok' },
      { date: '2024-04-02', status: 'ng' },
    ]);
  });
});
