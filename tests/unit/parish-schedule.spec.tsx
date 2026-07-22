import { describe, it, expect } from 'vitest'
import { deriveSchedule } from '@/lib/parish-schedule'

describe('deriveSchedule — misas', () => {
  it('cuenta una fila con dia y horario', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Domingo', time: '10:00 a.m.' }],
      sacraments: [],
    })
    expect(r.misas).toEqual([
      { id: 'horario-0', label: 'Domingo', time: '10:00 a.m.', kind: 'misa', detail: '' },
    ])
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
    expect(r.misas).toEqual([
      { id: 'horario-0', label: 'Domingo', time: '10:00 a.m.', kind: 'misa', detail: '' },
    ])
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

describe('deriveSchedule — tipos de horario', () => {
  // El caso mas importante de toda la obra: las filas que ya viven en produccion
  // se cargaron antes de que existiera `kind`, asi que lo tienen en NULL. Si no
  // cuentan como misa, las misas desaparecen del hero del sitio.
  it('cuenta como misa una fila sin tipo', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Martes a Viernes', time: '6:30 PM' }],
      sacraments: [],
    })
    expect(r.misas.map((m) => m.label)).toEqual(['Martes a Viernes'])
    expect(r.hasMisas).toBe(true)
    expect(r.hasDevociones).toBe(false)
  })

  it('cuenta como misa una fila con tipo desconocido', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Domingo', time: '6:00 a.m.', kind: 'vigilia' as never }],
      sacraments: [],
    })
    expect(r.misas).toHaveLength(1)
  })

  it('manda las devociones a su propia lista', () => {
    const r = deriveSchedule({
      massSchedule: [
        { label: 'Domingo', time: '6:00 a.m.', kind: 'misa' },
        { label: 'Jueves', time: '7:15 p.m.', kind: 'devocion', detail: 'Hora Santa' },
      ],
      sacraments: [],
    })
    expect(r.misas.map((m) => m.label)).toEqual(['Domingo'])
    expect(r.devociones.map((d) => d.detail)).toEqual(['Hora Santa'])
    expect(r.hasMisas).toBe(true)
    expect(r.hasDevociones).toBe(true)
  })

  it('manda las confesiones a la lista de devociones', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Jueves', time: '2:00 - 4:00 p.m.', kind: 'confesion' }],
      sacraments: [],
    })
    expect(r.devociones).toHaveLength(1)
    expect(r.devociones[0].kind).toBe('confesion')
    expect(r.misas).toEqual([])
  })

  // El criterio de vacio no se afloja por tipo: una devocion a medio cargar
  // publicaria "Jueves" sin hora, igual de inutil que una misa a medio cargar.
  it('descarta una devocion sin horario', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Jueves', time: '  ', kind: 'devocion', detail: 'Hora Santa' }],
      sacraments: [],
    })
    expect(r.devociones).toEqual([])
    expect(r.hasDevociones).toBe(false)
  })

  // Si `hasMisas` se contaminara con devociones, el nav ofreceria "Horarios" y
  // el hero anunciaria una barra de misas que no existe.
  it('con solo devociones no hay misas', () => {
    const r = deriveSchedule({
      massSchedule: [{ label: 'Jueves', time: '7:15 p.m.', kind: 'devocion' }],
      sacraments: [],
    })
    expect(r.hasMisas).toBe(false)
    expect(r.hasDevociones).toBe(true)
  })

  it('conserva el id de la fila para usarlo como key de React', () => {
    const r = deriveSchedule({
      massSchedule: [{ id: 'abc123', label: 'Domingo', time: '6:00 a.m.' }],
      sacraments: [],
    })
    expect(r.misas[0].id).toBe('abc123')
  })

  // Dos filas del mismo dia (el jueves tiene tres) no pueden compartir key.
  it('inventa un id estable cuando la fila no lo trae', () => {
    const r = deriveSchedule({
      massSchedule: [
        { label: 'Jueves', time: '2:00 p.m.', kind: 'devocion' },
        { label: 'Jueves', time: '7:15 p.m.', kind: 'devocion' },
      ],
      sacraments: [],
    })
    expect(r.devociones.map((d) => d.id)).toEqual(['horario-0', 'horario-1'])
  })
})
