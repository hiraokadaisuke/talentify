import { NextRequest } from 'next/server'
import { POST } from '@/app/api/auth/resend-confirmation/route'

jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(),
}))

jest.mock('@/lib/supabase/service', () => ({
  createServiceClient: jest.fn(),
}))

const { createClient } = jest.requireMock('@/lib/supabase/server') as {
  createClient: jest.Mock
}

const { createServiceClient } = jest.requireMock('@/lib/supabase/service') as {
  createServiceClient: jest.Mock
}

describe('POST /api/auth/resend-confirmation', () => {
  const resend = jest.fn()
  const maybeSingle = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()

    createClient.mockReturnValue({
      auth: {
        resend,
      },
    })

    createServiceClient.mockReturnValue({
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            maybeSingle,
          }),
        }),
      }),
    })

    maybeSingle.mockResolvedValue({ data: null, error: null })
    resend.mockResolvedValue({ error: null })
  })

  it('returns INVALID_INPUT when email is missing', async () => {
    const req = new NextRequest('http://localhost/api/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({}),
    })

    const res = await POST(req)

    expect(res.status).toBe(400)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'INVALID_INPUT',
    })
  })

  it('returns RATE_LIMITED when Supabase hits sending limit', async () => {
    resend.mockResolvedValue({
      error: { code: 'over_email_send_rate_limit', message: 'rate limit' },
    })

    const req = new NextRequest('http://localhost/api/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email: 'pending@example.com' }),
    })

    const res = await POST(req)

    expect(res.status).toBe(429)
    await expect(res.json()).resolves.toMatchObject({
      ok: false,
      code: 'RATE_LIMITED',
    })
  })

  it('returns NOT_FOUND_OR_ALREADY_VERIFIED when status is active', async () => {
    maybeSingle.mockResolvedValue({ data: { status: 'active', role: 'talent' }, error: null })

    const req = new NextRequest('http://localhost/api/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email: 'active@example.com' }),
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      code: 'NOT_FOUND_OR_ALREADY_VERIFIED',
    })
    expect(resend).not.toHaveBeenCalled()
  })

  it('returns OK for pending users', async () => {
    maybeSingle.mockResolvedValue({
      data: { status: 'pending_email_verification', role: 'company' },
      error: null,
    })

    const req = new NextRequest('http://localhost/api/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email: 'pending@example.com' }),
    })

    const res = await POST(req)

    expect(res.status).toBe(200)
    await expect(res.json()).resolves.toMatchObject({
      ok: true,
      code: 'OK',
    })
    expect(resend).toHaveBeenCalled()
  })
})
