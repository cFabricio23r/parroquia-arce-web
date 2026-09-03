import { describe, expect, it } from 'vitest'
import {
  buildEventSlug,
  septiembreDiciembre2026Rows,
  toUtc,
} from '@/lib/calendarization-2026-events'

describe('calendarization 2026 events', () => {
  it('keeps the new import scoped to September through December', () => {
    const months = new Set(septiembreDiciembre2026Rows.map((row) => row.m))

    expect([...months].sort((a, b) => a - b)).toEqual([9, 10, 11, 12])
    expect(septiembreDiciembre2026Rows).toHaveLength(197)
  })

  it('generates unique deterministic slugs for the import window', () => {
    const slugs = septiembreDiciembre2026Rows.map(buildEventSlug)

    expect(new Set(slugs).size).toBe(septiembreDiciembre2026Rows.length)
    expect(slugs).toContain('inauguracion-del-mes-de-la-biblia-2026-09-05')
    expect(slugs).toContain('misa-patronal-de-la-solemnidad-de-la-inmaculada-concepcion-d-2026-12-08')
  })

  it('converts El Salvador local time to UTC without daylight-saving drift', () => {
    expect(toUtc(9, 5, '19:00').toISOString()).toBe('2026-09-06T01:00:00.000Z')
    expect(toUtc(12, 24, '20:00').toISOString()).toBe('2026-12-25T02:00:00.000Z')
  })

  it('preserves representative rows from the PDF source', () => {
    expect(septiembreDiciembre2026Rows).toContainEqual(
      expect.objectContaining({
        d: 5,
        m: 9,
        title: 'Inauguración del Mes de la Biblia',
        location: 'Templo parroquial y ermitas',
        start: '19:00',
      }),
    )
    expect(septiembreDiciembre2026Rows).toContainEqual(
      expect.objectContaining({
        d: 29,
        m: 11,
        title: 'Primer Día Novena a la Inmaculada Concepción de María',
        type: 'novena',
      }),
    )
    expect(septiembreDiciembre2026Rows).toContainEqual(
      expect.objectContaining({
        d: 31,
        m: 12,
        title: 'Misa de fin de año',
        start: '20:00',
        type: 'misa',
      }),
    )
  })
})
