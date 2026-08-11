import { describe, it, expect } from 'vitest'
import { pickGroupBody } from '@/lib/group-body'

// Dos objetos distintos alcanzan: la funcion elige entre referencias, no lee
// adentro del richText.
const DESC = { root: { children: [] } } as never
const HIST = { root: { children: [] } } as never

describe('pickGroupBody', () => {
  it('usa la descripcion como cuerpo cuando estan las dos', () => {
    const r = pickGroupBody(DESC, HIST)
    expect(r.body).toBe(DESC)
    expect(r.showHistorySection).toBe(true)
  })

  it('usa la historia como cuerpo cuando no hay descripcion', () => {
    const r = pickGroupBody(null, HIST)
    expect(r.body).toBe(HIST)
    // No se repite abajo: ya es el cuerpo.
    expect(r.showHistorySection).toBe(false)
  })

  it('usa la descripcion cuando no hay historia', () => {
    const r = pickGroupBody(DESC, null)
    expect(r.body).toBe(DESC)
    expect(r.showHistorySection).toBe(false)
  })

  it('no devuelve cuerpo cuando no hay ninguno de los dos', () => {
    const r = pickGroupBody(null, null)
    expect(r.body).toBeNull()
    expect(r.showHistorySection).toBe(false)
  })

  it('trata undefined igual que null', () => {
    const r = pickGroupBody(undefined, undefined)
    expect(r.body).toBeNull()
    expect(r.showHistorySection).toBe(false)
  })
})
