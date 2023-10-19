import { describe, expect, it } from 'vitest'
import { formatDate } from '../src/utils'

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})

describe('date', () => {
  it('format', () => {
    expect(formatDate(Date.now())).toBe('2023-10-19')
    expect(formatDate(1694217600000)).toBe('2023-09-09')
  })
})
