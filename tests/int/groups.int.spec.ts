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

  it('guarda perseverancia con etiqueta por defecto', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: {
        name: 'Legión de María',
        slug: uniq('legion'),
        status: 'published',
        perseverance: { count: 45 },
      },
    })
    created.push(doc.id)
    expect(doc.perseverance?.count).toBe(45)
    expect(doc.perseverance?.label).toBe('miembros que perseveran')
  })

  it('permite sobrescribir la etiqueta de perseverancia', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: {
        name: 'Pastoral Familiar',
        slug: uniq('familiar'),
        status: 'published',
        perseverance: { count: 12, label: 'familias activas' },
      },
    })
    created.push(doc.id)
    expect(doc.perseverance?.label).toBe('familias activas')
  })

  it('declara la galeria como upload hasMany', () => {
    const field = payload.collections.groups.config.flattenedFields.find(
      (f) => f.name === 'gallery',
    )
    expect(field?.type).toBe('upload')
    expect((field as { hasMany?: boolean } | undefined)?.hasMany).toBe(true)
  })

  it('declara logo, cover y groupPhoto como uploads simples', () => {
    const fields = payload.collections.groups.config.flattenedFields
    for (const name of ['logo', 'cover', 'groupPhoto']) {
      const field = fields.find((f) => f.name === name)
      expect(field?.type, `falta el campo ${name}`).toBe('upload')
      expect((field as { hasMany?: boolean } | undefined)?.hasMany).toBeFalsy()
    }
  })

  it('guarda el patrono con nombre e imagen', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: {
        name: 'Comisión de Prueba',
        slug: uniq('patrono'),
        status: 'draft',
        patron: { name: 'San Jerónimo' },
      },
    })
    created.push(doc.id)
    expect(doc.patron?.name).toBe('San Jerónimo')
  })

  it('guarda varias fiestas patronales y respeta el orden', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: {
        name: 'Pastoral de Prueba',
        slug: uniq('fiestas'),
        status: 'draft',
        patronalFeasts: [
          { name: 'Santa Teresita del Niño Jesús', day: 1, month: '10' },
          { name: 'San Francisco Javier', day: 3, month: '12' },
        ],
      },
    })
    created.push(doc.id)
    expect(doc.patronalFeasts).toHaveLength(2)
    expect(doc.patronalFeasts?.[0]?.name).toBe('Santa Teresita del Niño Jesús')
    expect(doc.patronalFeasts?.[0]?.month).toBe('10')
    expect(doc.patronalFeasts?.[1]?.day).toBe(3)
  })

  it('declara el patrono como grupo', () => {
    const field = payload.collections.groups.config.flattenedFields.find(
      (f) => f.name === 'patron',
    )
    expect(field?.type).toBe('group')
  })

  it('rechaza un integrante sin nombre', async () => {
    await expect(
      payload.create({
        collection: 'groups',
        data: {
          name: 'Sin nombre',
          slug: uniq('sin-nombre'),
          status: 'draft',
          // El tipo generado exige `name`. Lo forzamos a proposito: lo que se
          // esta probando es que Payload lo rechaza en runtime, no en tiempo
          // de compilacion.
          team: [{ role: 'Coordinadora' } as { name: string; role: string }],
        },
      }),
    ).rejects.toThrow()
  })
})
