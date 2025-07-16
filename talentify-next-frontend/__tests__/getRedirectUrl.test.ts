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
    process.env.NODE_ENV = 'development'
    expect(getRedirectUrl('store')).toBe('http://localhost:3000/store/edit')
  })

  test('returns NEXT_PUBLIC_SITE_URL for talent in production', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    expect(getRedirectUrl('talent')).toBe('https://example.com/talent/edit')
  })

  test('defaults to root for unknown role', () => {
    process.env.NODE_ENV = 'production'
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com'
    expect(getRedirectUrl('unknown')).toBe('https://example.com/')
  })
})
