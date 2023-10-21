import { describe, expect, it } from 'vitest'
import { type Key, pathToRegexp } from 'path-to-regexp'

const keys: Key[] = []
const regexp = pathToRegexp('/foo/:bar', keys)

describe('should', () => {
  it('exported', () => {
    expect(1).toEqual(1)
  })
})

describe('query', () => {
  it('string', () => {
    expect(keys).toMatchSnapshot()
    expect(regexp).toMatchSnapshot()
  })
})
