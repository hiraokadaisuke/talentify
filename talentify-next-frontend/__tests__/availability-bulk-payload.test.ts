import { buildMonthlyBulkPayload } from '../app/talent/schedule/utils';

describe('buildMonthlyBulkPayload', () => {
  it('creates a complete month payload for desktop calendar views (31 days)', () => {
    const reference = new Date('2024-03-15T00:00:00+09:00');

    const payload = buildMonthlyBulkPayload(reference, 'ok');

    expect(payload).toHaveLength(31);
    expect(payload.at(0)).toEqual({ date: '2024-03-01', status: 'ok' });
    expect(payload.at(-1)).toEqual({ date: '2024-03-31', status: 'ok' });
    expect(new Set(payload.map((item) => item.status))).toEqual(new Set(['ok']));
  });

  it('creates a compact month payload for mobile calendar views (30 days)', () => {
    const reference = new Date('2024-04-01T12:00:00+09:00');

    const payload = buildMonthlyBulkPayload(reference, 'ng');

    expect(payload).toHaveLength(30);
    expect(payload.at(0)).toEqual({ date: '2024-04-01', status: 'ng' });
    expect(payload.at(-1)).toEqual({ date: '2024-04-30', status: 'ng' });
    expect(new Set(payload.map((item) => item.status))).toEqual(new Set(['ng']));
  });
});
