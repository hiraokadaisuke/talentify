import { getRedirectUrl } from '../lib/getRedirectUrl'

describe('getRedirectUrl', () => {
  const originalEnv = process.env
  beforeEach(() => {
    process.env = { ...originalEnv }
  })
  afterEach(() => {
    process.env = originalEnv
  })

  test('returns localhost path for store in development', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'development'
    process.env = env
    expect(getRedirectUrl('store')).toBe('http://localhost:3000/store/edit')
  })

  test('returns NEXT_PUBLIC_SITE_URL for talent in production', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'production'
    env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    process.env = env
    expect(getRedirectUrl('talent')).toBe('https://example.com/talent/edit')
  })

  test('defaults to root for unknown role', () => {
    const env = { ...process.env } as NodeJS.ProcessEnv
    env.NODE_ENV = 'production'
    env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    process.env = env
    expect(getRedirectUrl('unknown')).toBe('https://example.com/')
  })
})
