import { describe, expect, it, vi } from 'vitest'
import { slugField } from '@/fields/slug'

type Hook = (args: any) => Promise<string> | string
const field = slugField('title') as any
const hook = field.hooks.beforeValidate[0] as Hook

const run = (over: Record<string, unknown>, collectionSlug = 'news') => {
  const find = vi.fn().mockResolvedValue({ totalDocs: 0 })
  const args = {
    value: '',
    data: {},
    originalDoc: undefined,
    operation: 'create',
    id: undefined,
    collection: { slug: collectionSlug },
    req: { payload: { find } },
    ...over,
  }
  return { find, result: hook(args) }
}

describe('slugField hook', () => {
  it('normaliza un slug escrito sin consultar la base', async () => {
    const { find, result } = run({ value: 'Misa de Gallo' })
    expect(await result).toBe('misa-de-gallo')
    expect(find).not.toHaveBeenCalled()
  })

  it('en un update no toca un slug guardado aunque toSlug lo cambiaría', async () => {
    // Payload pasa el slug guardado como `value` cuando no viene en `data`.
    const { find, result } = run({
      value: 'misa--gallo',
      data: { status: 'published' },
      originalDoc: { id: 7, title: 'Título nuevo', slug: 'misa--gallo' },
      operation: 'update',
    })
    expect(await result).toBe('misa--gallo')
    expect(find).not.toHaveBeenCalled()
  })

  it('arma el slug desde el título cuando está vacío', async () => {
    const { result } = run({ data: { title: 'Vía Crucis' } })
    expect(await result).toBe('via-crucis')
  })

  it('en update toma el título de originalDoc y excluye el id propio', async () => {
    const { find, result } = run({
      data: {},
      originalDoc: { title: 'Vía Crucis' },
      operation: 'update',
      id: 7,
    })
    expect(await result).toBe('via-crucis')
    expect(find.mock.calls[0][0].where).toMatchObject({ id: { not_equals: 7 } })
  })

  it('toma el id de originalDoc cuando Payload no lo pasa al hook', async () => {
    const { find, result } = run({
      originalDoc: { id: 9, title: 'Vía Crucis' },
      operation: 'update',
    })
    await result
    expect(find.mock.calls[0][0].where).toMatchObject({ id: { not_equals: 9 } })
  })

  it('usa el respaldo con el nombre de la colección si el título no tiene letras', async () => {
    const { result } = run({ data: { title: '¡¡!!' } }, 'events')
    expect(await result).toMatch(/^events-[a-z0-9]{1,4}$/)
  })

  it('usa el campo name cuando from es name', async () => {
    const h = (slugField('name') as any).hooks.beforeValidate[0] as Hook
    const find = vi.fn().mockResolvedValue({ totalDocs: 0 })
    const r = await h({
      value: '',
      data: { name: 'Coro Parroquial' },
      collection: { slug: 'groups' },
      req: { payload: { find } },
    })
    expect(r).toBe('coro-parroquial')
  })
})

describe('slugField validate', () => {
  it('acepta vacío', () => {
    expect(field.validate('')).toBe(true)
    expect(field.validate(undefined)).toBe(true)
  })
  it('rechaza un slug inválido con el mensaje de siempre', () => {
    expect(field.validate('Slug Malo')).toBe(
      'Solo minúsculas, números y guiones. Sin espacios ni tildes.',
    )
  })
  it('acepta uno válido', () => {
    expect(field.validate('slug-ok')).toBe(true)
  })
})

describe('slugField admin', () => {
  it('dice título o nombre según from', () => {
    expect(field.admin.description).toContain('título')
    expect((slugField('name') as any).admin.description).toContain('nombre')
  })
})
