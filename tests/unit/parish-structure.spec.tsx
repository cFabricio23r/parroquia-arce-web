import { describe, it, expect } from 'vitest'
import {
  PARISH_SECTORS,
  zoneForSector,
  PARISH_GROUPS,
  ACTION_LINES,
  actionLineForGroup,
} from '@/lib/parish-structure'

describe('PARISH_SECTORS', () => {
  it('tiene los 22 sectores del Anexo 1', () => {
    expect(PARISH_SECTORS).toHaveLength(22)
  })

  // El Anexo 1 salta del 17 al 19, y el organigrama de zonas tampoco lo lista.
  // Se fija como ausencia deliberada: si manana aparece, tiene que romper aca
  // y no colarse como un descuido.
  it('no tiene sector 18', () => {
    expect(PARISH_SECTORS.find((s) => s.number === 18)).toBeUndefined()
  })

  it('no repite numeros de sector', () => {
    const numbers = PARISH_SECTORS.map((s) => s.number)
    expect(new Set(numbers).size).toBe(numbers.length)
  })

  it('le da ubicacion y patrono a todos', () => {
    for (const s of PARISH_SECTORS) {
      expect(s.location.trim()).not.toBe('')
      expect(s.patron.trim()).not.toBe('')
    }
  })

  it('reparte los sectores en las 5 zonas del organigrama', () => {
    const byZone = new Map<number, number[]>()
    for (const s of PARISH_SECTORS) {
      byZone.set(s.zone, [...(byZone.get(s.zone) ?? []), s.number].sort((a, b) => a - b))
    }
    expect(byZone.get(1)).toEqual([1, 5, 6, 8, 23])
    expect(byZone.get(2)).toEqual([2, 3, 4, 19])
    expect(byZone.get(3)).toEqual([7, 13, 17, 21])
    expect(byZone.get(4)).toEqual([9, 10, 11, 12, 20, 22])
    expect(byZone.get(5)).toEqual([14, 15, 16])
    // Las 5 zonas particionan el conjunto: nada fuera, nada repetido.
    expect([...byZone.values()].flat()).toHaveLength(22)
  })
})

describe('zoneForSector', () => {
  it('encuentra la zona de un sector conocido', () => {
    expect(zoneForSector(22)).toBe(4)
  })

  it('devuelve null para un sector que no existe', () => {
    expect(zoneForSector(18)).toBeNull()
  })
})

describe('PARISH_GROUPS', () => {
  it('tiene los 23 grupos del organigrama de lineas de accion', () => {
    expect(PARISH_GROUPS).toHaveLength(23)
  })

  it('no repite slugs', () => {
    const slugs = PARISH_GROUPS.map((g) => g.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('le da a cada grupo una de las 4 lineas', () => {
    const valid = new Set<string>(ACTION_LINES.map((l) => l.value))
    for (const g of PARISH_GROUPS) {
      expect(valid.has(g.actionLine)).toBe(true)
    }
  })

  it('reparte los grupos como el organigrama', () => {
    const count = (line: string) => PARISH_GROUPS.filter((g) => g.actionLine === line).length
    expect(count('evangelizacion')).toBe(11) // bloque "A" (5) + bloque "B" (6)
    expect(count('familia')).toBe(2)
    expect(count('ninez-juventud-vocacion')).toBe(5)
    expect(count('formacion-agentes')).toBe(5)
  })

  // Los 7 que ya viven en la base. El slug es lo unico autoritativo aca: el
  // backfill busca por slug y NO renombra nada.
  it('marca como existentes los 7 grupos ya cargados, con su slug real', () => {
    const existing = PARISH_GROUPS.filter((g) => g.exists)
      .map((g) => g.slug)
      .sort()
    expect(existing).toEqual([
      'comision-de-formacion',
      'comision-de-liturgia',
      'escuela-basica-en-la-fe',
      'iam',
      'jumi',
      'mec',
      'rcc',
    ])
  })

  it('deja 16 grupos por crear', () => {
    expect(PARISH_GROUPS.filter((g) => !g.exists)).toHaveLength(16)
  })
})

describe('actionLineForGroup', () => {
  it('encuentra la linea de un grupo ya cargado', () => {
    expect(actionLineForGroup('jumi')).toBe('ninez-juventud-vocacion')
  })

  // El Consejo Economico esta en la base pero cuelga del Consejo Parroquial,
  // no de una linea de accion. No entra en la tabla.
  it('devuelve null para un slug fuera del organigrama', () => {
    expect(actionLineForGroup('consejo-economico')).toBeNull()
  })
})
