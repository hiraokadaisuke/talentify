import { getRedirectUrl } from '../lib/getRedirectUrl'

describe('getRedirectUrl', () => {
  const originalEnv = process.env
  beforeEach(() => {
    process.env = { ...originalEnv }
  })
  afterEach(() => {
    process.env = originalEnv
  })

  test('returns localhost callback path in development', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'development'
    process.env = env
    expect(getRedirectUrl('store')).toBe(
      'http://localhost:3000/auth/callback?role=store'
    )
  })

  test('returns NEXT_PUBLIC_SITE_URL callback in production', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'production'
    env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    process.env = env
    expect(getRedirectUrl('talent')).toBe(
      'https://example.com/auth/callback?role=talent'
    )
  })

  test('falls back to default domain when NEXT_PUBLIC_SITE_URL is not set in production', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'production'
    delete env.NEXT_PUBLIC_SITE_URL
    process.env = env
    expect(getRedirectUrl('store')).toBe(
      'https://talentify-xi.vercel.app/auth/callback?role=store'
    )
  })

  test('still returns callback for unknown role', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'production'
    env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    process.env = env
    expect(getRedirectUrl('unknown')).toBe(
      'https://example.com/auth/callback?role=unknown'
    )
  })
})
