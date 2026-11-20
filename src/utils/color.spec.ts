import { describe, it, expect } from 'vitest'
import { getNumberColor } from './color'

describe('getNumberColor', () => {
  it('returns a valid CSS color for each number 1-8', () => {
    for (let n = 1; n <= 8; n++) {
      const color = getNumberColor(n)
      expect(color).toMatch(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/)
      expect(typeof color).toBe('string')
    }
  })

  it('1 is blue-ish, 3 is red-ish (distinct hues)', () => {
    expect(getNumberColor(1)).toBe('#2196f3')
    expect(getNumberColor(3)).toBe('#e53935')
    expect(getNumberColor(1)).not.toBe(getNumberColor(3))
  })

  it('unknown/0 numbers fall back to gray', () => {
    expect(getNumberColor(0)).toBe('#757575')
    expect(getNumberColor(9)).toBe('#757575')
    expect(getNumberColor(-1)).toBe('#757575')
  })

  it('returns different colors for different numbers', () => {
    const colors = [1, 2, 3, 4, 5, 6, 7, 8].map(getNumberColor)
    const unique = new Set(colors)
    expect(unique.size).toBe(colors.length)
  })
})
