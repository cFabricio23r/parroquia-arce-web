// @vitest-environment node
// jsdom aporta su propio Uint8Array y file-type (que Payload usa para detectar el
// mime real del archivo) lo rechaza: la subida solo se puede probar en node.
import fs from 'fs'
import path from 'path'
import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
const creados: (number | string)[] = []
const mediaCreados: (number | string)[] = []

/** Nombre de archivo unico: la base se comparte con el contenido real. */
const unico = (ext: string) =>
  `test-audio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`

const fixture = (name: string) => fs.readFileSync(path.resolve(process.cwd(), 'tests/fixtures', name))

describe('Audio — coleccion de subida de audios', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  afterAll(async () => {
    for (const id of creados) {
      await payload.delete({ collection: 'audio', id }).catch(() => undefined)
    }
    for (const id of mediaCreados) {
      await payload.delete({ collection: 'media', id }).catch(() => undefined)
    }
  })

  it('creates an audio doc with description and serves a public https url', async () => {
    const data = fixture('silence.mp3')
    const doc = await payload.create({
      collection: 'audio',
      data: { description: 'Audio de prueba: un segundo de silencio.' },
      file: { data, mimetype: 'audio/mpeg', name: unico('mp3'), size: data.length },
    })
    creados.push(doc.id)
    expect(doc.description).toBe('Audio de prueba: un segundo de silencio.')
    expect(doc.mimeType).toBe('audio/mpeg')
    expect(doc.url).toMatch(/^https:\/\//)
  })

  it('rejects a non-audio mime type', async () => {
    const data = fixture('pixel.png')
    await expect(
      payload.create({
        collection: 'audio',
        data: { description: 'Esto no es un audio.' },
        file: { data, mimetype: 'image/png', name: unico('png'), size: data.length },
      }),
    ).rejects.toThrow(/field is invalid: file/i)
  })

  // Guarda de regresion: audio usa una segunda instancia de s3Storage con
  // clientUploads; media tiene que seguir subiendo por el servidor a Supabase.
  it('keeps media uploading through the server with a public https url', async () => {
    const data = fixture('pixel.png')
    const doc = await payload.create({
      collection: 'media',
      data: { alt: 'Imagen de prueba' },
      file: { data, mimetype: 'image/png', name: unico('png'), size: data.length },
    })
    mediaCreados.push(doc.id)
    expect(doc.url).toMatch(/^https:\/\//)
  })
})
