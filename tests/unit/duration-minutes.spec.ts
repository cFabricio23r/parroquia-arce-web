import { describe, it, expect } from 'vitest'
import { validateDurationMinutes } from '@/lib/duration-minutes'

describe('validateDurationMinutes', () => {
  it('accepts an empty value', () => {
    expect(validateDurationMinutes(null)).toBe(true)
    expect(validateDurationMinutes(undefined)).toBe(true)
  })

  it('accepts whole minutes from 1 to 120', () => {
    expect(validateDurationMinutes(1)).toBe(true)
    expect(validateDurationMinutes(12)).toBe(true)
    expect(validateDurationMinutes(120)).toBe(true)
  })

  it('rejects fractions', () => {
    expect(validateDurationMinutes(12.5)).toBe('Poné los minutos enteros, por ejemplo 12.')
  })

  it('rejects values out of range', () => {
    expect(validateDurationMinutes(0)).toBe('Poné entre 1 y 120 minutos.')
    expect(validateDurationMinutes(-5)).toBe('Poné entre 1 y 120 minutos.')
    expect(validateDurationMinutes(200)).toBe('Poné entre 1 y 120 minutos.')
  })
})
