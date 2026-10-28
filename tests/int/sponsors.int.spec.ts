// @vitest-environment node
// Subir el logo necesita node (ver audio.int.spec.ts).
import fs from 'fs'
import path from 'path'
import { getPayload, ValidationError, type Payload } from 'payload'
import config from '@/payload.config'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

let payload: Payload
let logoId: number | string
const sponsors: (number | string)[] = []

/** La base se comparte con el contenido real: nombres unicos por corrida. */
const run = `t${Date.now()}`

describe('Sponsors collection', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const data = fs.readFileSync(path.resolve(process.cwd(), 'tests/fixtures/pixel.png'))
    const logo = await payload.create({
      collection: 'media',
      data: { alt: 'Logo de prueba' },
      file: { data, mimetype: 'image/png', name: `test-sponsor-${run}.png`, size: data.length },
    })
    logoId = logo.id
  })

  afterAll(async () => {
    for (const id of sponsors) {
      await payload.delete({ collection: 'sponsors', id }).catch(() => undefined)
    }
    if (logoId) await payload.delete({ collection: 'media', id: logoId }).catch(() => undefined)
  })

  const crear = async (suffix: string, extra: Record<string, unknown>) => {
    const doc = await payload.create({
      collection: 'sponsors',
      data: { name: `Negocio ${run} ${suffix}`, logo: logoId as number, ...extra },
    })
    sponsors.push(doc.id)
    return doc
  }

  it('rejects a sponsor without links', async () => {
    const err = await crear('sin-enlaces', {}).catch((e) => e)
    expect(err).toBeInstanceOf(ValidationError)
    expect(JSON.stringify(err.data)).toContain('Cargá el enlace de Facebook o de Instagram')
  })

  it('rejects an m.facebook.com link', async () => {
    const err = await crear('movil', { facebookUrl: 'https://m.facebook.com/negocio' }).catch((e) => e)
    expect(err).toBeInstanceOf(ValidationError)
    expect(JSON.stringify(err.data)).toContain('no el de m.facebook.com ni fb.com')
  })

  it('anonymous users only read active sponsors', async () => {
    const activo = await crear('activo', { facebookUrl: 'https://www.facebook.com/activo', active: true })
    const inactivo = await crear('inactivo', {
      instagramUrl: 'https://www.instagram.com/inactivo',
      active: false,
    })

    const res = await payload.find({
      collection: 'sponsors',
      overrideAccess: false,
      where: { name: { like: run } },
      limit: 100,
      depth: 0,
    })
    const ids = res.docs.map((d) => d.id)
    expect(ids).toContain(activo.id)
    expect(ids).not.toContain(inactivo.id)
  })
})
