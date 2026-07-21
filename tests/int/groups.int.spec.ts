import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: (string | number)[] = []
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`

describe('Groups collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'groups', id }).catch(() => {})
  })

  it('crea un grupo publicado', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: {
        name: 'Pastoral Juvenil',
        slug: uniq('pastoral-juvenil'),
        type: 'pastoral',
        status: 'published',
        meeting: { day: 'Sábado', time: '4:00 p.m.', place: 'Salón juvenil' },
      },
    })
    created.push(doc.id)
    expect(doc.slug).toBe(uniq('pastoral-juvenil'))
    expect(doc.type).toBe('pastoral')
    expect(doc.meeting?.day).toBe('Sábado')
  })

  it('rechaza un slug invalido', async () => {
    await expect(
      payload.create({
        collection: 'groups',
        data: { name: 'Malo', slug: 'Slug Malo', status: 'draft' },
      }),
    ).rejects.toThrow()
  })

  it('filtra por status published', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: { name: 'Borrador', slug: uniq('borrador'), status: 'draft' },
    })
    created.push(doc.id)
    const res = await payload.find({
      collection: 'groups',
      where: { status: { equals: 'published' } },
    })
    expect(res.docs.some((d) => d.slug === uniq('borrador'))).toBe(false)
  })

  it('guarda un equipo con varios integrantes y respeta el orden', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: {
        name: 'Coro Parroquial',
        slug: uniq('coro'),
        status: 'published',
        team: [
          { name: 'Ana Morales', role: 'Coordinadora' },
          { name: 'Luis Peña', role: 'Asistente' },
          { name: 'Rosa Díaz' },
        ],
      },
    })
    created.push(doc.id)
    expect(doc.team).toHaveLength(3)
    expect(doc.team?.[0]?.name).toBe('Ana Morales')
    expect(doc.team?.[0]?.role).toBe('Coordinadora')
    expect(doc.team?.[2]?.role).toBeFalsy()
  })

  it('rechaza un integrante sin nombre', async () => {
    await expect(
      payload.create({
        collection: 'groups',
        data: {
          name: 'Sin nombre',
          slug: uniq('sin-nombre'),
          status: 'draft',
          team: [{ role: 'Coordinadora' }],
        },
      }),
    ).rejects.toThrow()
  })
})
