import { describe, it, expect } from 'vitest'
import { MONTHS, formatFeastDate } from '@/lib/months'

describe('months', () => {
  it('tiene los 12 meses, con valor numerico en string', () => {
    expect(MONTHS).toHaveLength(12)
    expect(MONTHS[0]).toEqual({ label: 'enero', value: '1' })
    expect(MONTHS[11]).toEqual({ label: 'diciembre', value: '12' })
  })

  it('formatea dia y mes en espanol', () => {
    expect(formatFeastDate(8, '12')).toBe('8 de diciembre')
    expect(formatFeastDate(1, '1')).toBe('1 de enero')
  })

  it('devuelve null si falta el dia o el mes', () => {
    expect(formatFeastDate(null, '12')).toBeNull()
    expect(formatFeastDate(8, null)).toBeNull()
    expect(formatFeastDate(undefined, undefined)).toBeNull()
  })

  it('devuelve null si el mes no existe', () => {
    expect(formatFeastDate(8, '13')).toBeNull()
  })
})
