import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Global Settings (radio)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  }, 60000)

  it('expone radio.available (boolean) y radio.streamUrl (string)', async () => {
    const settings = await payload.findGlobal({ slug: 'settings' })
    expect(typeof settings.radio?.available).toBe('boolean')
    expect(typeof settings.radio?.streamUrl).toBe('string')
  })

  it('es legible sin usuario (anonimo)', async () => {
    await expect(
      payload.findGlobal({ slug: 'settings', overrideAccess: false }),
    ).resolves.toBeDefined()
  })

  it('NO es editable sin usuario (anonimo)', async () => {
    await expect(
      payload.updateGlobal({
        slug: 'settings',
        data: { radio: { available: false } },
        overrideAccess: false,
      }),
    ).rejects.toThrow()
  })

  it('expone el grupo marca con isotipo y favicon, vacios por defecto', async () => {
    const settings = await payload.findGlobal({ slug: 'settings' })
    // El grupo debe materializarse aunque no haya nada subido: es lo que
    // habilita el fallback (isotipo/favicon null -> SVG e icon por defecto).
    expect(settings.marca).toBeDefined()
    expect(settings.marca?.isotipo ?? null).toBeNull()
    expect(settings.marca?.favicon ?? null).toBeNull()
  })
})
