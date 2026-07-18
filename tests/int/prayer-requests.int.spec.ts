import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: (string | number)[] = []

describe('PrayerRequests collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const id of created)
      await payload.delete({ collection: 'prayer-requests', id }).catch(() => {})
  })

  it('acepta una peticion con el mensaje requerido', async () => {
    const doc = await payload.create({
      collection: 'prayer-requests',
      data: { message: 'Por la salud de mi familia', intentionType: 'salud' },
    })
    created.push(doc.id)
    expect(doc.message).toBe('Por la salud de mi familia')
    // Arranca pendiente de revision y sin autorizacion de mencion publica.
    expect(doc.status).toBe('pendiente')
    expect(doc.allowPublicMention).toBe(false)
  })

  it('exige el mensaje', async () => {
    await expect(
      payload.create({ collection: 'prayer-requests', data: { intentionType: 'general' } }),
    ).rejects.toThrow()
  })
})
