jest.mock('@/lib/prisma', () => ({
  getPrismaClient: jest.fn(),
}))

const { getPrismaClient } = jest.requireMock('@/lib/prisma') as {
  getPrismaClient: jest.Mock
}

describe('resolveMessageTargetUserId', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns null for non-uuid values', async () => {
    const { resolveMessageTargetUserId } = await import('@/lib/resolve-message-target')
    await expect(resolveMessageTargetUserId('not-a-uuid')).resolves.toBeNull()
    expect(getPrismaClient).not.toHaveBeenCalled()
  })

  it('resolves talents.id to user_id', async () => {
    getPrismaClient.mockReturnValue({
      talents: { findFirst: jest.fn().mockResolvedValue({ user_id: 'user-1' }) },
      stores: { findFirst: jest.fn().mockResolvedValue(null) },
      companies: { findFirst: jest.fn().mockResolvedValue(null) },
    })

    const { resolveMessageTargetUserId } = await import('@/lib/resolve-message-target')
    await expect(resolveMessageTargetUserId('2e3bd187-1c86-4916-b2cf-2f7cb2e583d1')).resolves.toBe('user-1')
  })

  it('falls back to raw uuid when mapping rows are missing', async () => {
    getPrismaClient.mockReturnValue({
      talents: { findFirst: jest.fn().mockResolvedValue(null) },
      stores: { findFirst: jest.fn().mockResolvedValue(null) },
      companies: { findFirst: jest.fn().mockResolvedValue(null) },
    })

    const { resolveMessageTargetUserId } = await import('@/lib/resolve-message-target')
    const raw = '2e3bd187-1c86-4916-b2cf-2f7cb2e583d1'
    await expect(resolveMessageTargetUserId(raw)).resolves.toBe(raw)
  })
})
