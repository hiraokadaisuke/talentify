import { cn } from '../lib/utils'

describe('cn', () => {
  test('merges and deduplicates class names', () => {
    expect(cn('p-4', 'text-lg', 'p-4')).toBe('text-lg p-4')
  })
})
