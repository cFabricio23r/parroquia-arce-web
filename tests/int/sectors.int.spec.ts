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

  it('guarda la direccion y el enlace del mapa por separado', async () => {
    const doc = await payload.create({
      collection: 'sectors',
      data: {
        name: 'Sector con mapa',
        slug: uniq('con-mapa'),
        status: 'published',
        location: {
          address: 'Cantón Las Cruces, Ciudad Arce',
          mapUrl: 'https://maps.app.goo.gl/ejemplo',
        },
      },
    })
    created.push(doc.id)
    expect(doc.location?.address).toBe('Cantón Las Cruces, Ciudad Arce')
    expect(doc.location?.mapUrl).toBe('https://maps.app.goo.gl/ejemplo')
  })

  it('rechaza un enlace de mapa que no sea una URL', async () => {
    await expect(
      payload.create({
        collection: 'sectors',
        data: {
          name: 'Mapa malo',
          slug: uniq('mapa-malo'),
          status: 'draft',
          location: { mapUrl: 'Cantón Las Cruces' },
        },
      }),
    ).rejects.toThrow()
  })

  // El campo es OPCIONAL. Una validacion mal escrita que rechace el vacio dejaria
  // al editor sin poder guardar un sector que no tiene enlace de mapa.
  it('acepta un sector sin enlace de mapa', async () => {
    const doc = await payload.create({
      collection: 'sectors',
      data: {
        name: 'Sin mapa',
        slug: uniq('sin-mapa'),
        status: 'draft',
        location: { address: 'Cantón Las Acostas' },
      },
    })
    created.push(doc.id)
    expect(doc.location?.mapUrl ?? null).toBeNull()
  })

  it('enlaza grupos con presencia en el sector', async () => {
    const grupo = await payload.create({
      collection: 'groups',
      data: { name: 'Grupo del sector', slug: uniq('grupo-sector'), status: 'published' },
    })

    // try/finally y no un `delete` al final del test: si la asercion falla, el
    // grupo quedaria publicado para siempre en la base, que es la MISMA que la
    // de produccion.
    try {
      const doc = await payload.create({
        collection: 'sectors',
        data: {
          name: 'Sector con grupos',
          slug: uniq('sector-grupos'),
          status: 'published',
          groups: [grupo.id],
        },
      })
      created.push(doc.id)

      const found = await payload.findByID({ collection: 'sectors', id: doc.id, depth: 1 })
      const first = found.groups?.[0]
      const id = typeof first === 'object' && first ? first.id : first
      expect(id).toBe(grupo.id)
    } finally {
      await payload.delete({ collection: 'groups', id: grupo.id }).catch(() => {})
    }
  })
})
