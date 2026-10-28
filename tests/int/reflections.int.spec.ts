// @vitest-environment node
// Subir el audio de apoyo necesita node (ver audio.int.spec.ts).
import fs from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getReflectionBySlug, getReflections } from '@/lib/reflections'

let payload: Payload
let audioId: number | string
const reflexiones: (number | string)[] = []

/** La base se comparte con el contenido real: slugs unicos por corrida. */
const run = `t${Date.now()}`

describe('Reflections collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const data = fs.readFileSync(path.resolve(process.cwd(), 'tests/fixtures/silence.mp3'))
    const audio = await payload.create({
      collection: 'audio',
      data: { description: 'Audio de prueba: un segundo de silencio.' },
      file: { data, mimetype: 'audio/mpeg', name: `test-refl-${run}.mp3`, size: data.length },
    })
    audioId = audio.id
  })

  afterAll(async () => {
    for (const id of reflexiones) {
      await payload.delete({ collection: 'reflections', id }).catch(() => undefined)
    }
    if (audioId) await payload.delete({ collection: 'audio', id: audioId }).catch(() => undefined)
  })

  const crear = async (suffix: string, status: 'draft' | 'published') => {
    const doc = await payload.create({
      collection: 'reflections',
      data: {
        title: `Tema ${suffix}`,
        slug: `${run}-${suffix}`,
        preacherName: 'Hno. Prueba',
        weekOf: '2026-10-25T12:00:00.000Z',
        audio: audioId as number,
        status,
        publishedAt: new Date().toISOString(),
      },
    })
    reflexiones.push(doc.id)
    return doc
  }

  it('anonymous users only read published reflections', async () => {
    const draft = await crear('borrador', 'draft')
    const published = await crear('publicada', 'published')

    const res = await payload.find({
      collection: 'reflections',
      overrideAccess: false,
      where: { slug: { like: run } },
      limit: 100,
      depth: 0,
    })
    const ids = res.docs.map((d) => d.id)
    expect(ids).toContain(published.id)
    expect(ids).not.toContain(draft.id)
  })

  it('getReflections returns published reflections with an https audio url', async () => {
    const draft = await crear('borrador2', 'draft')
    const published = await crear('publicada2', 'published')
    const found = await getReflectionBySlug(published.slug)
    expect(found).not.toBeNull()
    expect(found?.audioUrl).toMatch(/^https:\/\//)
    expect(await getReflectionBySlug(draft.slug)).toBeNull()
    // Lista: sin traer 100 docs de la base compartida, solo las de esta corrida.
    const { docs } = await getReflections({ limit: 100 })
    const mine = docs.filter((d) => d.slug.startsWith(`${run}-`))
    expect(mine.map((d) => d.slug)).toContain(published.slug)
    expect(mine.map((d) => d.slug)).not.toContain(draft.slug)
  })
})
