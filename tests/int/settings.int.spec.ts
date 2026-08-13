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

  it('expone el grupo marca; isotipo y favicon son opcionales', async () => {
    const settings = await payload.findGlobal({ slug: 'settings' })
    // El grupo debe materializarse aunque no haya nada subido: es lo que
    // habilita el fallback (isotipo/favicon ausentes -> SVG e icon por defecto).
    expect(settings.marca).toBeDefined()

    // Lo que NO se puede afirmar es que esten vacios. Esta base es la de
    // produccion y la parroquia subio su logo el 2026-07-18: un test que exige
    // vacuidad contra contenido real vence el dia que alguien carga algo, que
    // es exactamente lo que se espera que pase. Se verifica la forma: ausente
    // (y entonces manda el fallback), o un media resuelto y usable.
    for (const campo of [settings.marca?.isotipo, settings.marca?.favicon]) {
      if (campo === null || campo === undefined) continue
      if (typeof campo === 'object') {
        expect(campo.url).toBeTruthy()
      } else {
        expect(campo).toBeGreaterThan(0)
      }
    }
  })
})
