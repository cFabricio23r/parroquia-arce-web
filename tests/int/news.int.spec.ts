import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
// En Postgres los ids son numericos, no strings.
const created: (string | number)[] = []

/**
 * Los tests corren contra la MISMA base que el contenido real (no hay base de
 * test aparte). `slug` es unique, asi que un slug fijo choca con el contenido
 * cargado desde el CMS y el test queda roto para siempre. Prefijo unico por
 * corrida: los tests no dependen del estado de la base.
 */
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`

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
    const slug = uniq('aviso-de-prueba')
    const doc = await payload.create({
      collection: 'news',
      data: {
        title: 'Aviso de prueba',
        slug,
        status: 'published',
        category: 'aviso',
      },
    })
    created.push(doc.id)
    expect(doc.slug).toBe(slug)
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
    const slug = uniq('slug-repetido')
    const doc = await payload.create({
      collection: 'news',
      data: { title: 'Primera', slug, status: 'draft' },
    })
    created.push(doc.id)

    await expect(
      payload.create({
        collection: 'news',
        data: { title: 'Segunda', slug, status: 'draft' },
      }),
    ).rejects.toThrow()
  })

  it('filtra por status published', async () => {
    const slug = uniq('borrador-oculto')
    const doc = await payload.create({
      collection: 'news',
      data: { title: 'Borrador oculto', slug, status: 'draft' },
    })
    created.push(doc.id)

    const res = await payload.find({
      collection: 'news',
      where: { status: { equals: 'published' } },
    })
    expect(res.docs.every((d) => d.status === 'published')).toBe(true)
    expect(res.docs.some((d) => d.slug === slug)).toBe(false)
  })
})
