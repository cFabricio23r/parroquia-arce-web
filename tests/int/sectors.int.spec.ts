import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: (string | number)[] = []
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`

describe('Sectors collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of created) {
      await payload.delete({ collection: 'sectors', id }).catch(() => {})
    }
  })

  it('crea un sector publicado con datos anidados', async () => {
    const doc = await payload.create({
      collection: 'sectors',
      data: {
        name: 'Ermita Las Cruces',
        slug: uniq('las-cruces'),
        number: 8,
        status: 'published',
        location: { address: 'Cantón Las Cruces' },
        contact: { whatsapp: '0000-0000' },
      },
    })
    created.push(doc.id)
    expect(doc.slug).toBe(uniq('las-cruces'))
    expect(doc.number).toBe(8)
    expect(doc.location?.address).toBe('Cantón Las Cruces')
    expect(doc.contact?.whatsapp).toBe('0000-0000')
  })

  it('rechaza un slug con mayusculas o espacios', async () => {
    await expect(
      payload.create({
        collection: 'sectors',
        data: { name: 'Malo', slug: 'Slug Malo', status: 'draft' },
      }),
    ).rejects.toThrow()
  })

  it('filtra por status published', async () => {
    const doc = await payload.create({
      collection: 'sectors',
      data: { name: 'Borrador', slug: uniq('borrador'), status: 'draft' },
    })
    created.push(doc.id)

    const res = await payload.find({
      collection: 'sectors',
      where: { status: { equals: 'published' } },
    })
    expect(res.docs.every((d) => d.status === 'published')).toBe(true)
    expect(res.docs.some((d) => d.slug === uniq('borrador'))).toBe(false)
  })

  it('guarda un equipo con varios integrantes', async () => {
    const doc = await payload.create({
      collection: 'sectors',
      data: {
        name: 'Ermita San José',
        slug: uniq('san-jose'),
        status: 'published',
        team: [
          { name: 'Carlos Rivas', role: 'Responsable' },
          { name: 'Marta Flores', role: 'Colaboradora' },
        ],
      },
    })
    created.push(doc.id)
    expect(doc.team).toHaveLength(2)
    expect(doc.team?.[0]?.name).toBe('Carlos Rivas')
  })
})
