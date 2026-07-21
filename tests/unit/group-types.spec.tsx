import { describe, it, expect } from 'vitest'
import { groupTypeMeta } from '@/lib/group-types'

describe('groupTypeMeta', () => {
  it('devuelve etiqueta y variante de cada tipo', () => {
    expect(groupTypeMeta('formacion')).toEqual({ label: 'Formación', variant: 'blue' })
    expect(groupTypeMeta('servicio')).toEqual({ label: 'Servicio', variant: 'amber' })
    expect(groupTypeMeta('ministerio')).toEqual({ label: 'Ministerio', variant: 'sky' })
  })

  it('devuelve null cuando el grupo no tiene tipo', () => {
    expect(groupTypeMeta(null)).toBeNull()
    expect(groupTypeMeta(undefined)).toBeNull()
    expect(groupTypeMeta('')).toBeNull()
  })

  it('devuelve null ante un tipo desconocido en vez de romper', () => {
    expect(groupTypeMeta('inventado')).toBeNull()
  })
})
