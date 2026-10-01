import { buildNotificationPayload } from '@/lib/notifications/payload'

jest.mock('@/lib/prisma', () => ({
  getPrismaClient: jest.fn(),
}))

const { getPrismaClient } = jest.requireMock('@/lib/prisma') as {
  getPrismaClient: jest.Mock
}

describe('offer notification config integration', () => {
  it('builds offer created payload with role-aware action url', () => {
    const payload = buildNotificationPayload(
      {
        kind: 'offer_created',
        offerId: 'offer-1',
        actorName: 'Store A',
      },
      'talent',
    )

    expect(payload.type).toBe('offer_created')
    expect(payload.action_url).toBe('/talent/offers/offer-1')
    expect(payload.entity_type).toBe('offer')
    expect(payload.data).toMatchObject({ recipient_role: 'talent', is_actionable: true, offer_id: 'offer-1' })
  })

  it('builds offer updated payload with status information', () => {
    const payload = buildNotificationPayload(
      {
        kind: 'offer_updated',
        offerId: 'offer-2',
        actorName: 'Talent B',
        status: 'rejected',
      },
      'store',
    )

    expect(payload.type).toBe('offer_updated')
    expect(payload.action_url).toBe('/store/offers/offer-2')
    expect(payload.data).toMatchObject({ status: 'rejected', offer_id: 'offer-2', recipient_role: 'store' })
  })

  it('keeps schedule changes actionable but treats cancellation and no-show as informational', () => {
    const schedule = buildNotificationPayload(
      {
        kind: 'offer_updated',
        offerId: 'offer-schedule',
        change: 'schedule',
        date: '2026-10-10',
        timeRange: '10:00-12:00',
      },
      'talent',
    )
    const cancellation = buildNotificationPayload(
      {
        kind: 'offer_updated',
        offerId: 'offer-cancel',
        change: 'cancellation',
        cancellationStage: 'post_contract',
        cancelReason: '予定変更',
      },
      'talent',
    )
    const noShow = buildNotificationPayload(
      {
        kind: 'offer_updated',
        offerId: 'offer-no-show',
        change: 'no_show',
        status: 'no_show',
        noShowReason: '来店確認できず',
      },
      'talent',
    )

    expect(schedule.data).toMatchObject({
      is_actionable: true,
      change: 'schedule',
    })
    expect(cancellation.data).toMatchObject({
      is_actionable: false,
      change: 'cancellation',
    })
    expect(noShow.data).toMatchObject({
      is_actionable: false,
      change: 'no_show',
    })
  })

  it('links a contract notification directly to the issued invoice', () => {
    const payload = buildNotificationPayload(
      {
        kind: 'offer_accepted',
        offerId: 'offer-3',
        invoiceId: 'invoice-3',
        actorName: 'Store C',
      },
      'talent',
    )

    expect(payload.type).toBe('offer_accepted')
    expect(payload.action_url).toBe('/talent/invoices/invoice-3')
    expect(payload.action_label).toBe('締結書兼請求書を見る')
    expect(payload.entity_type).toBe('invoice')
    expect(payload.entity_id).toBe('invoice-3')
    expect(payload.data).toMatchObject({
      offer_id: 'offer-3',
      invoice_id: 'invoice-3',
      recipient_role: 'talent',
    })
  })

  it('keeps the offer detail fallback for legacy contract events without an invoice id', () => {
    const payload = buildNotificationPayload(
      {
        kind: 'offer_accepted',
        offerId: 'offer-legacy',
        actorName: 'Store Legacy',
      },
      'talent',
    )

    expect(payload.action_url).toBe('/talent/offers/offer-legacy')
    expect(payload.entity_type).toBe('offer')
    expect(payload.entity_id).toBe('offer-legacy')
  })

  it('resolveRecipientRole resolves offer recipient from actor side', async () => {
    const queryRaw = jest.fn().mockResolvedValue([
      {
        store_user_id: 'store-user',
        talent_user_id: 'talent-user',
      },
    ])

    const talentsFindFirst = jest.fn().mockImplementation(async ({ where }: { where: { user_id: string } }) => {
      if (where.user_id === 'talent-user') return { id: 'talent-id' }
      return null
    })

    getPrismaClient.mockReturnValue({
      $queryRaw: queryRaw,
      talents: { findFirst: talentsFindFirst },
      stores: { findFirst: jest.fn().mockResolvedValue(null) },
      companies: { findFirst: jest.fn().mockResolvedValue(null) },
    })

    const { resolveRecipientRole } = await import('@/lib/notifications/resolve-recipient-role')
    const role = await resolveRecipientRole({
      entityType: 'offer',
      entityId: 'offer-1',
      actorId: 'store-user',
    })

    expect(role).toBe('talent')
  })
})
