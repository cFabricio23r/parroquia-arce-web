import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const created: (string | number)[] = []

// Los tests comparten base con el contenido real. Slug es unique: un slug fijo
// choca con lo cargado desde el CMS y el test queda roto para siempre. Prefijo
// unico por corrida, igual que news.int.spec.ts.
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`

describe('Formation collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of created) {
      await payload.delete({ collection: 'formation', id }).catch(() => {})
    }
  })

  it('crea material de formacion publicado', async () => {
    const doc = await payload.create({
      collection: 'formation',
      data: {
        title: 'Vivir la fe en lo cotidiano',
        slug: uniq('vivir-la-fe'),
        status: 'published',
        category: 'serie',
        audience: 'jovenes',
      },
    })
    created.push(doc.id)
    expect(doc.slug).toBe(uniq('vivir-la-fe'))
    expect(doc.audience).toBe('jovenes')
  })

  it('rechaza un slug con mayusculas o espacios', async () => {
    await expect(
      payload.create({
        collection: 'formation',
        data: {
          title: 'Malo',
          slug: 'Slug Malo',
          status: 'draft',
          category: 'recurso',
          audience: 'general',
        },
      }),
    ).rejects.toThrow()
  })

  it('filtra por status published', async () => {
    const doc = await payload.create({
      collection: 'formation',
      data: {
        title: 'Borrador',
        slug: uniq('borrador'),
        status: 'draft',
        category: 'articulo',
        audience: 'familias',
      },
    })
    created.push(doc.id)

    const res = await payload.find({
      collection: 'formation',
      where: { status: { equals: 'published' } },
    })
    expect(res.docs.every((d) => d.status === 'published')).toBe(true)
    expect(res.docs.some((d) => d.slug === uniq('borrador'))).toBe(false)
  })
})
