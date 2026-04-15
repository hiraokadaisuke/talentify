import { mapNotificationQueryRowToRow } from '@/lib/notifications/notification-row-mapper'

describe('mapNotificationQueryRowToRow', () => {
  it('keeps notification visible even when created_at / updated_at are null', () => {
    const row = {
      id: 'n1',
      user_id: 'u1',
      type: 'offer_created',
      data: { actor_name: '店舗A' },
      title: 'title',
      body: 'body',
      is_read: false,
      created_at: null,
      updated_at: null,
      read_at: new Date('2026-01-02T03:04:05.000Z'),
      priority: 'medium',
      action_url: null,
      action_label: null,
      entity_type: null,
      entity_id: null,
      actor_name: null,
      expires_at: null,
      group_key: null,
    }

    const mapped = mapNotificationQueryRowToRow(row)
    expect(mapped.created_at).toBe('2026-01-02T03:04:05.000Z')
    expect(mapped.updated_at).toBe('2026-01-02T03:04:05.000Z')
    expect(mapped.actor_name).toBe('店舗A')
  })
})
