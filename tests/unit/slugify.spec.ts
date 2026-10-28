import { describe, expect, it } from 'vitest'
import { toSlug, uniqueSlug } from '@/lib/slugify'

describe('toSlug', () => {
  it('pasa a minusculas y une con guiones', () => {
    expect(toSlug('Misa de Gallo')).toBe('misa-de-gallo')
  })
  it('quita tildes y enie', () => {
    expect(toSlug('Misión Año Jubilar')).toBe('mision-ano-jubilar')
  })
  it('ignora signos y espacios dobles', () => {
    expect(toSlug('  ¡Fiesta   Patronal!  ')).toBe('fiesta-patronal')
  })
  it('reemplaza separadores raros', () => {
    expect(toSlug('Lectio_Divina / 2026')).toBe('lectio-divina-2026')
  })
  it('es idempotente', () => {
    expect(toSlug('ya-valido-123')).toBe('ya-valido-123')
  })
  it('devuelve vacio si no queda nada', () => {
    expect(toSlug('¡¡!!')).toBe('')
    expect(toSlug('')).toBe('')
    expect(toSlug(null)).toBe('')
    expect(toSlug(undefined)).toBe('')
  })
  it('corta a 80 en un guion sin partir palabras', () => {
    const s = toSlug('palabra '.repeat(30))
    expect(s.length).toBeLessThanOrEqual(80)
    expect(s.endsWith('-')).toBe(false)
    expect(s.split('-').every((w) => w === 'palabra')).toBe(true)
  })
})

describe('uniqueSlug', () => {
  it('devuelve la base si esta libre', async () => {
    expect(await uniqueSlug('misa', async () => false)).toBe('misa')
  })
  it('suma -3 si misa y misa-2 estan tomados', async () => {
    const taken = new Set(['misa', 'misa-2'])
    expect(await uniqueSlug('misa', async (c) => taken.has(c))).toBe('misa-3')
  })
  it('mantiene 80 o menos con el sufijo', async () => {
    const base = 'a'.repeat(80)
    const r = await uniqueSlug(base, async (c) => c === base)
    expect(r.length).toBeLessThanOrEqual(80)
    expect(r.endsWith('-2')).toBe(true)
  })
  it('lanza si los 50 estan ocupados', async () => {
    await expect(uniqueSlug('misa', async () => true)).rejects.toThrow()
  })
})
