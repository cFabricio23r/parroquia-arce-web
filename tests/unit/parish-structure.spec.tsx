import { describe, it, expect } from 'vitest'
import { PARISH_SECTORS, zoneForSector } from '@/lib/parish-structure'

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
