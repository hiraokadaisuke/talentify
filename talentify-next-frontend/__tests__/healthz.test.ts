import { GET } from '../app/api/healthz/route'

describe('healthz endpoint', () => {
  test('returns service status with version', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data).toEqual({ status: 'ok', version: '0.1.0' })
  })
})
