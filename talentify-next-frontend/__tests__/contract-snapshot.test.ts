import {
  getPerformanceSnapshot,
  readContractSnapshot,
} from '@/lib/invoices/contractSnapshot'

const base = {
  captured_at: '2026-10-01T00:00:00.000Z',
  store_name: 'テスト店舗',
  store_address: '兵庫県神戸市',
  store_contact_name: '担当者',
  talent_name: 'テスト演者',
  billing: null,
  invoice: {
    invoice_number: 'INV-001',
    amount: 65000,
    transport_fee: 10000,
    extra_fee: 5000,
    due_date: '2026-10-31',
    notes: '当日は開始30分前に集合',
  },
  payout: null,
}

describe('contract snapshot parser', () => {
  it('keeps legacy version 1 snapshots readable', () => {
    const snapshot = readContractSnapshot({
      version: 1,
      ...base,
    })

    expect(snapshot?.version).toBe(1)
    expect(getPerformanceSnapshot(snapshot)).toBeNull()
  })

  it('reads version 2 performance terms', () => {
    const snapshot = readContractSnapshot({
      version: 2,
      ...base,
      performance: {
        offer_id: 'offer-1',
        date: '2026-10-14',
        start_time: '13:00',
        end_time: '15:00',
        time_range: '13:00〜15:00',
        event_name: '周年来店',
        offer_message: '店内実戦とSNS告知をお願いします。',
      },
    })

    expect(snapshot?.version).toBe(2)
    expect(getPerformanceSnapshot(snapshot)).toMatchObject({
      date: '2026-10-14',
      time_range: '13:00〜15:00',
      event_name: '周年来店',
    })
  })

  it('rejects malformed version 2 performance terms', () => {
    const snapshot = readContractSnapshot({
      version: 2,
      ...base,
      performance: {
        offer_id: 'offer-1',
        date: '2026-10-14',
        start_time: 1300,
        end_time: '15:00',
        time_range: '13:00〜15:00',
        event_name: null,
        offer_message: null,
      },
    })

    expect(snapshot).toBeNull()
  })
})
