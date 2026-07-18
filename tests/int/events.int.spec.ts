import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: (string | number)[] = []
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`

describe('Events collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'events', id }).catch(() => {})
  })

  it('crea un evento publicado con fecha y lugar', async () => {
    const doc = await payload.create({
      collection: 'events',
      data: {
        title: 'Vigilia de Pentecostés',
        slug: uniq('vigilia'),
        eventType: 'vigilia',
        startsAt: '2026-05-24T18:00:00.000Z',
        locationName: 'Ermita Las Cruces',
        status: 'published',
      },
    })
    created.push(doc.id)
    expect(doc.slug).toBe(uniq('vigilia'))
    expect(doc.eventType).toBe('vigilia')
    expect(doc.locationName).toBe('Ermita Las Cruces')
  })

  it('exige startsAt y locationName', async () => {
    await expect(
      payload.create({
        collection: 'events',
        // Data incompleta a proposito: faltan startsAt/locationName (required).
        data: { title: 'Sin fecha', slug: uniq('sin-fecha'), status: 'draft' } as never,
      }),
    ).rejects.toThrow()
  })

  it('filtra por status published', async () => {
    const doc = await payload.create({
      collection: 'events',
      data: {
        title: 'Borrador',
        slug: uniq('borrador'),
        startsAt: '2026-06-01T12:00:00.000Z',
        locationName: 'Templo',
        status: 'draft',
      },
    })
    created.push(doc.id)
    const res = await payload.find({
      collection: 'events',
      where: { status: { equals: 'published' } },
    })
    expect(res.docs.some((d) => d.slug === uniq('borrador'))).toBe(false)
  })
})
