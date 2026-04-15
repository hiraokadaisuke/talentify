jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}))

jest.mock('@/lib/resolve-message-target', () => ({
  resolveMessageTargetUserId: jest.fn(),
}))

const { redirect } = jest.requireMock('next/navigation') as { redirect: jest.Mock }
const { resolveMessageTargetUserId } = jest.requireMock('@/lib/resolve-message-target') as {
  resolveMessageTargetUserId: jest.Mock
}

describe('/store/messages/[id] route', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('redirects to conversation when user id resolves', async () => {
    resolveMessageTargetUserId.mockResolvedValue('2e3bd187-1c86-4916-b2cf-2f7cb2e583d1')
    const mod = await import('@/app/store/messages/[id]/page')

    await mod.default({ params: Promise.resolve({ id: 'talent-id' }) })

    expect(resolveMessageTargetUserId).toHaveBeenCalledWith('talent-id')
    expect(redirect).toHaveBeenCalledWith('/messages/2e3bd187-1c86-4916-b2cf-2f7cb2e583d1')
  })

  it('falls back to direct tab when id cannot be resolved', async () => {
    resolveMessageTargetUserId.mockResolvedValue(null)
    const mod = await import('@/app/store/messages/[id]/page')

    await mod.default({ params: Promise.resolve({ id: 'invalid' }) })

    expect(redirect).toHaveBeenCalledWith('/store/messages?tab=direct')
  })
})
