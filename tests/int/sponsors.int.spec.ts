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

  it('returns the logo populated at depth 1', async () => {
    const doc = await crear('depth1', { facebookUrl: 'https://www.facebook.com/depth1', active: true })
    const res = await payload.find({
      collection: 'sponsors',
      overrideAccess: false,
      where: { id: { equals: doc.id } },
      depth: 1,
    })
    const logo = res.docs[0]?.logo
    expect(typeof logo).toBe('object')
    expect(typeof (logo as { url?: unknown }).url).toBe('string')
    expect((logo as { alt?: unknown }).alt).toBeTruthy()
  })

  it('partial update { active: false } succeeds and hides the sponsor from anonymous reads', async () => {
    const doc = await crear('parcial', { facebookUrl: 'https://www.facebook.com/parcial', active: true })
    const updated = await payload.update({ collection: 'sponsors', id: doc.id, data: { active: false } })
    expect(updated.active).toBe(false)
    const res = await payload.find({
      collection: 'sponsors',
      overrideAccess: false,
      where: { name: { like: run } },
      limit: 100,
      depth: 0,
    })
    expect(res.docs.map((d) => d.id)).not.toContain(doc.id)
  })

  it('rejects an update that clears both links', async () => {
    const doc = await crear('sin-enlaces-update', { facebookUrl: 'https://www.facebook.com/borrar' })
    const err = await payload
      .update({
        collection: 'sponsors',
        id: doc.id,
        data: { facebookUrl: null, instagramUrl: null },
      })
      .catch((e) => e)
    expect(err).toBeInstanceOf(ValidationError)
    expect(JSON.stringify(err.data.errors)).toContain('Cargá el enlace de Facebook o de Instagram')
  })
})
