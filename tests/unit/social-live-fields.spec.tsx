import { describe, expect, it } from 'vitest'
import { validateManualEnd } from '@/fields/social-live'
import { Settings } from '@/globals/Settings'

describe('fecha de anuncio manual', () => {
  const control = {
    mode: 'manual' as const,
    url: 'https://youtu.be/abcdefghijk',
    endsAt: '2020-01-01T00:00:00Z',
  }
  it('permite guardar radio y marca aunque el anuncio existente haya vencido', () => {
    expect(validateManualEnd(control.endsAt, control, control)).toBe(true)
  })
  it('rechaza anuncios nuevos o cambiados con fecha vencida', () => {
    expect(validateManualEnd(control.endsAt, control, undefined)).not.toBe(true)
    expect(
      validateManualEnd(
        control.endsAt,
        { ...control, url: 'https://youtu.be/lmnopqrstuv' },
        control,
      ),
    ).not.toBe(true)
  })
  it('el hook real de Settings conserva el anuncio vencido en cambios ajenos', async () => {
    const hook = Settings.hooks?.beforeChange?.[0]
    expect(hook).toBeTypeOf('function')
    const originalDoc = { socialLive: { youtube: control } }
    const data = { radio: { available: false } }
    await expect(
      hook!({ data, originalDoc } as Parameters<NonNullable<typeof hook>>[0]),
    ).resolves.toEqual(data)
    await expect(
      hook!({
        data: { socialLive: { youtube: { ...control, url: 'https://youtu.be/lmnopqrstuv' } } },
        originalDoc,
      } as Parameters<NonNullable<typeof hook>>[0]),
    ).rejects.toThrow()
  })
})
