import { describe, expect, it } from 'vitest'
import { type Key, pathToRegexp } from 'path-to-regexp'
import { formatDate } from '../src/utils'

const keys: Key[] = []
const regexp = pathToRegexp('/foo/:bar', keys)

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})

describe('date', () => {
  it('format', () => {
    expect(formatDate(1694217600000)).toBe('2023-09-09')
  })
})

describe('query', () => {
  it('string', () => {
    expect(keys).toMatchSnapshot()
    expect(regexp).toMatchSnapshot()
  })
})
