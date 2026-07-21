import { describe, it, expect } from 'vitest'
import { deriveSchedule } from '@/lib/parish-schedule'

describe('deriveSchedule — misas', () => {
  it('cuenta una fila con dia y horario', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Domingo', time: '10:00 a.m.' }],
      sacraments: [],
    })
    expect(r.misas).toEqual([{ label: 'Domingo', time: '10:00 a.m.' }])
    expect(r.hasMisas).toBe(true)
  })

  it('descarta una fila con dia pero sin horario', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Domingo', time: null }],
      sacraments: [],
    })
    expect(r.misas).toEqual([])
    expect(r.hasMisas).toBe(false)
  })

  it('descarta una fila con horario pero sin dia', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: '', time: '10:00 a.m.' }],
      sacraments: [],
    })
    expect(r.hasMisas).toBe(false)
  })

  it('descarta una fila que solo tiene espacios', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: '   ', time: '  ' }],
      sacraments: [],
    })
    expect(r.hasMisas).toBe(false)
  })

  it('recorta los espacios de los valores que si cuentan', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: '  Domingo  ', time: '  10:00 a.m. ' }],
      sacraments: [],
    })
    expect(r.misas).toEqual([{ label: 'Domingo', time: '10:00 a.m.' }])
  })

  it('conserva solo las filas completas de una lista mixta', () => {
    const r = deriveSchedule({
      massSchedule: [
        { label: 'Domingo', time: '10:00 a.m.' },
        { label: 'Sabado', time: null },
        { label: 'Lunes a viernes', time: '6:00 p.m.' },
      ],
      sacraments: [],
    })
    expect(r.misas).toHaveLength(2)
    expect(r.misas.map((m) => m.label)).toEqual(['Domingo', 'Lunes a viernes'])
  })

  it('trata el array vacio como sin horarios', () => {
    expect(deriveSchedule({ massSchedule: [], sacraments: [] }).hasMisas).toBe(false)
  })

  it('trata null y undefined como sin horarios', () => {
    expect(deriveSchedule({ massSchedule: null, sacraments: null }).hasMisas).toBe(false)
    expect(deriveSchedule({}).hasMisas).toBe(false)
  })
})

describe('deriveSchedule — sacramentos', () => {
  it('cuenta un sacramento con nombre', () => {
    const r = deriveSchedule({
      massSchedule: [],
      sacraments: [{ title: 'Confesiones', detail: 'Sabados' }],
    })
    expect(r.sacramentos).toEqual([{ title: 'Confesiones', detail: 'Sabados' }])
    expect(r.hasSacramentos).toBe(true)
  })

  it('descarta un sacramento sin nombre aunque tenga detalle', () => {
    const r = deriveSchedule({
      massSchedule: [],
      sacraments: [{ title: '  ', detail: 'Sabados de 4 a 5' }],
    })
    expect(r.sacramentos).toEqual([])
    expect(r.hasSacramentos).toBe(false)
  })

  it('acepta un sacramento sin detalle', () => {
    const r = deriveSchedule({
      massSchedule: [],
      sacraments: [{ title: 'Bautizos', detail: null }],
    })
    expect(r.sacramentos).toEqual([{ title: 'Bautizos', detail: '' }])
    expect(r.hasSacramentos).toBe(true)
  })

  it('misas y sacramentos son independientes', () => {
    const r = deriveSchedule({
      massSchedule: [],
      sacraments: [{ title: 'Bautizos', detail: '' }],
    })
    expect(r.hasMisas).toBe(false)
    expect(r.hasSacramentos).toBe(true)
  })
})
