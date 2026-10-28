import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: { collection: 'events' | 'groups' | 'news'; id: string | number }[] = []
const run = `t${Date.now()}`

const event = (title: string) => ({
  title,
  eventType: 'vigilia' as const,
  startsAt: '2026-12-24T22:00:00.000Z',
  locationName: 'Templo parroquial',
  status: 'draft' as const,
})

describe('slug automático', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const { collection, id } of created) {
      await payload.delete({ collection, id }).catch(() => {})
    }
  })

  it('arma el slug desde el título (Events)', async () => {
    const doc = await payload.create({ collection: 'events', data: event(`${run} Misa de Gallo`) as never })
    created.push({ collection: 'events', id: doc.id })
    expect(doc.slug).toBe(`${run}-misa-de-gallo`)
  })

  it('arma el slug desde el nombre (Groups)', async () => {
    const doc = await payload.create({
      collection: 'groups',
      data: { name: `${run} Coro Parroquial`, type: 'pastoral', status: 'draft' } as never,
    })
    created.push({ collection: 'groups', id: doc.id })
    expect(doc.slug).toBe(`${run}-coro-parroquial`)
  })

  it('agrega -2 cuando el título se repite', async () => {
    const doc = await payload.create({ collection: 'events', data: event(`${run} Misa de Gallo`) as never })
    created.push({ collection: 'events', id: doc.id })
    expect(doc.slug).toBe(`${run}-misa-de-gallo-2`)
  })

  it('no cambia el slug al editar el título', async () => {
    const first = created[0]
    const doc = await payload.update({
      collection: 'events',
      id: first.id,
      data: { title: `${run} Otro título` },
    })
    expect(doc.slug).toBe(`${run}-misa-de-gallo`)
  })

  it('regenera desde el título actual al borrar el slug, sin chocar consigo mismo', async () => {
    const first = created[0]
    const doc = await payload.update({
      collection: 'events',
      id: first.id,
      data: { title: `${run} Misa de Gallo`, slug: '' },
    })
    expect(doc.slug).toBe(`${run}-misa-de-gallo`)
  })

  it('normaliza un slug escrito con mayúsculas y espacios (News)', async () => {
    const doc = await payload.create({
      collection: 'news',
      data: { title: 'Aviso', slug: `${run} Slug Con Espacios`, status: 'draft', category: 'aviso' },
    })
    created.push({ collection: 'news', id: doc.id })
    expect(doc.slug).toBe(`${run}-slug-con-espacios`)
  })
})
