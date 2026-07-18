import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: (string | number)[] = []

// User simulado (no se crea en DB: crear un user con auth hashea la password y
// es lento/inestable en CI). Alcanza para ejercer las funciones de `access`,
// que solo miran `req.user.role`.
const editor = { id: 999999, role: 'comunicaciones', collection: 'users' } as never

describe('Access control por rol', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  }, 60000)
  afterAll(async () => {
    for (const id of created)
      await payload.delete({ collection: 'prayer-requests', id, overrideAccess: true }).catch(() => {})
  })

  it('las peticiones de oracion NO son legibles para un no-admin', async () => {
    const pr = await payload.create({
      collection: 'prayer-requests',
      data: { message: 'Privada', intentionType: 'general' },
      overrideAccess: true,
    })
    created.push(pr.id)

    // Un editor de comunicaciones (no super-admin): Payload rechaza la operacion
    // de plano (Forbidden), no solo filtra. Verificacion mas fuerte del hueco.
    await expect(
      payload.find({ collection: 'prayer-requests', overrideAccess: false, user: editor }),
    ).rejects.toThrow()
  })

  it('las peticiones NO son legibles sin usuario (anonimo)', async () => {
    await expect(
      payload.find({ collection: 'prayer-requests', overrideAccess: false }),
    ).rejects.toThrow()
  })
})
