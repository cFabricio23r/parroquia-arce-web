import { describe, it, expect } from 'vitest'
import { formatClock, spokenDuration } from '@/lib/format-duration'

describe('format-duration', () => {
  it('formats a clock', () => {
    expect(formatClock(214)).toBe('3:34')
    expect(formatClock(3725)).toBe('1:02:05')
    expect(formatClock(NaN)).toBe('0:00')
    expect(formatClock(-5)).toBe('0:00')
  })

  it('speaks a duration in Spanish', () => {
    expect(spokenDuration(60)).toBe('1 minuto')
    expect(spokenDuration(214)).toBe('3 minutos 34 segundos')
    expect(spokenDuration(872)).toBe('14 minutos 32 segundos')
    expect(spokenDuration(3725)).toBe('1 hora 2 minutos 5 segundos')
    expect(spokenDuration(1)).toBe('1 segundo')
    expect(spokenDuration(0)).toBe('0 segundos')
  })
})
