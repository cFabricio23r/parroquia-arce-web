import { describe, expect, it, vi } from 'vitest'
import type { FieldAccess, GlobalBeforeValidateHook, GroupField, PayloadRequest } from 'payload'
import { Clergy } from '@/globals/Clergy'

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

const req = (role?: string) => ({ user: role ? { role } : null, context: {} }) as PayloadRequest
const group = (position: string) =>
  Clergy.fields.find((f) => 'name' in f && f.name === position) as GroupField
const validate = (data: Record<string, unknown>, originalDoc: Record<string, unknown> = {}) => {
  const hook = Clergy.hooks!.beforeValidate![0] as GlobalBeforeValidateHook
  return hook({ data, originalDoc, req: req('contenido'), global: Clergy } as Parameters<
    typeof hook
  >[0])
}

describe('Clergy', () => {
  it('solo permite editar a contenido y super-admin', async () => {
    for (const role of [undefined, 'comunicaciones', 'contenido', 'super-admin']) {
      expect(await Clergy.access!.update!({ req: req(role) })).toBe(
        ['contenido', 'super-admin'].includes(role ?? ''),
      )
    }
  })
  it.each(['pastor', 'assistant'])('protege el borrador de %s', async (position) => {
    const read = group(position).access!.read as FieldAccess
    for (const role of [undefined, 'comunicaciones', 'contenido', 'super-admin']) {
      const args = { req: req(role), doc: { [position]: { published: false, name: 'Privado' } } }
      expect(await read(args)).toBe(['contenido', 'super-admin'].includes(role ?? ''))
      expect(await read({ ...args, doc: { [position]: { published: true } } })).toBe(true)
    }
    expect(await read({ req: req() })).toBe(false)
  })
  it('permite guardar borradores incompletos', async () => {
    expect(await validate({ pastor: { published: false, name: '' } })).toEqual({
      pastor: { published: false, name: '' },
    })
  })
  it.each(['pastor', 'assistant'])('rechaza publicar %s sin nombre o resumen', async (position) => {
    for (const fields of [
      { name: ' ', summary: 'Historia' },
      { name: 'Nombre', summary: '\n' },
    ]) {
      await expect(async () =>
        validate({ [position]: { ...fields, published: true } }),
      ).rejects.toThrow()
    }
  })
  it('valida la combinación con el documento anterior en updates parciales', async () => {
    const original = { pastor: { published: true, name: 'Nombre', summary: 'Resumen' } }
    await expect(async () => validate({ pastor: { summary: ' ' } }, original)).rejects.toThrow()
    expect(await validate({ pastor: { role: 'Párroco' } }, original)).toEqual({
      pastor: { role: 'Párroco' },
    })
    expect(await validate({ pastor: { published: false, summary: '' } }, original)).toBeTruthy()
    await expect(async () => validate({ assistant: { published: true } }, {})).rejects.toThrow()
  })
  it('el checkbox empieza sin publicar', () => {
    for (const position of ['pastor', 'assistant']) {
      expect(
        group(position).fields.find((f) => 'name' in f && f.name === 'published'),
      ).toMatchObject({ defaultValue: false })
    }
  })
})
