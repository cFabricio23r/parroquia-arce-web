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
})
