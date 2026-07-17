import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: string[] = []

describe('News collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of created) {
      await payload.delete({ collection: 'news', id }).catch(() => {})
    }
  })

  it('crea una noticia publicada', async () => {
    const doc = await payload.create({
      collection: 'news',
      data: {
        title: 'Aviso de prueba',
        slug: 'aviso-de-prueba',
        status: 'published',
        category: 'aviso',
      },
    })
    created.push(doc.id as string)
    expect(doc.slug).toBe('aviso-de-prueba')
    expect(doc.status).toBe('published')
  })

  it('rechaza un slug con espacios o mayusculas', async () => {
    await expect(
      payload.create({
        collection: 'news',
        data: { title: 'Malo', slug: 'Slug Invalido', status: 'draft' },
      }),
    ).rejects.toThrow()
  })

  it('rechaza un slug duplicado', async () => {
    const doc = await payload.create({
      collection: 'news',
      data: { title: 'Primera', slug: 'slug-repetido', status: 'draft' },
    })
    created.push(doc.id as string)

    await expect(
      payload.create({
        collection: 'news',
        data: { title: 'Segunda', slug: 'slug-repetido', status: 'draft' },
      }),
    ).rejects.toThrow()
  })

  it('filtra por status published', async () => {
    const doc = await payload.create({
      collection: 'news',
      data: { title: 'Borrador oculto', slug: 'borrador-oculto', status: 'draft' },
    })
    created.push(doc.id as string)

    const res = await payload.find({
      collection: 'news',
      where: { status: { equals: 'published' } },
    })
    expect(res.docs.every((d) => d.status === 'published')).toBe(true)
    expect(res.docs.some((d) => d.slug === 'borrador-oculto')).toBe(false)
  })
})
