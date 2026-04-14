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
