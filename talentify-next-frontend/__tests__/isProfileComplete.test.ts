import { isProfileComplete } from '../utils/isProfileComplete'

describe('isProfileComplete', () => {
  test('returns true when all MVP conditions are met', () => {
    const profile = {
      stage_name: 'Test',
      genre: 'Rock',
      area: ['Tokyo'],
      rate: 5000,
      profile: 'This is a sufficiently long profile text.',
      avatar_url: 'http://example.com/avatar.png',
    }
    expect(isProfileComplete(profile)).toBe(true)
  })

  test('returns false when required fields are missing', () => {
    const profile = {
      stage_name: 'Test',
      genre: 'Rock',
      area: [],
      rate: 0,
      profile: 'short',
      avatar_url: '',
    }
    expect(isProfileComplete(profile)).toBe(false)
  })

  test('uses bio when profile is short', () => {
    const profile = {
      stage_name: 'Test',
      genre: 'Rock',
      area: ['Tokyo'],
      rate: 5000,
      bio: 'This bio is long enough to satisfy the condition.',
      profile: 'short',
      avatar_url: 'http://example.com/avatar.png',
    }
    expect(isProfileComplete(profile)).toBe(true)
  })
})
