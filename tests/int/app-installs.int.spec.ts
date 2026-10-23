import { randomBytes } from 'node:crypto'
import { getPayload, type Payload, type PayloadRequest } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { appInstallsPingEndpoint } from '@/endpoints/app-installs-ping'

let payload: Payload
const hashes: string[] = []
const newHash = () => {
  const h = randomBytes(32).toString('hex')
  hashes.push(h)
  return h
}

const reqWith = (json: (() => Promise<unknown>) | undefined) =>
  ({ payload, user: null, json, headers: new Headers() }) as unknown as PayloadRequest
const ping = (body: unknown) => appInstallsPingEndpoint(reqWith(async () => body))

const findByHash = async (deviceHash: string) =>
  (
    await payload.find({
      collection: 'app-installs',
      where: { deviceHash: { equals: deviceHash } },
      overrideAccess: true,
      limit: 5,
    })
  ).docs

describe('app-installs ping', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    for (const h of hashes)
      await payload
        .delete({
          collection: 'app-installs',
          where: { deviceHash: { equals: h } },
          overrideAccess: true,
        })
        .catch(() => {})
  })

  it('primer ping crea la ficha con firstSeenAt === lastSeenAt', async () => {
    const h = newHash()
    const res = await ping({ deviceHash: h, platform: 'android', appVersion: '1.0.0' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(res.headers.get('Cache-Control')).toBe('private, no-store')
    const docs = await findByHash(h)
    expect(docs).toHaveLength(1)
    expect(docs[0].firstSeenAt).toBe(docs[0].lastSeenAt)
    expect(docs[0].platform).toBe('android')
  })

  it('segundo ping el mismo dia no escribe', async () => {
    const h = newHash()
    await ping({ deviceHash: h, platform: 'ios', appVersion: '1.0.0' })
    const before = (await findByHash(h))[0]
    const res = await ping({ deviceHash: h, platform: 'ios', appVersion: '1.0.1' })
    expect(res.status).toBe(200)
    const after = (await findByHash(h))[0]
    expect(after.updatedAt).toBe(before.updatedAt)
    expect(after.appVersion).toBe('1.0.0')
  })

  it('ficha de ayer: actualiza lastSeenAt y appVersion, firstSeenAt intacto', async () => {
    const h = newHash()
    await ping({ deviceHash: h, platform: 'android', appVersion: '1.0.0' })
    const doc = (await findByHash(h))[0]
    const yesterday = new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    await payload.update({
      collection: 'app-installs',
      id: doc.id,
      data: { lastSeenAt: yesterday },
      overrideAccess: true,
    })
    const res = await ping({ deviceHash: h, platform: 'android', appVersion: '1.1.0' })
    expect(res.status).toBe(200)
    const after = (await findByHash(h))[0]
    expect(after.appVersion).toBe('1.1.0')
    expect(Date.parse(after.lastSeenAt)).toBeGreaterThan(Date.parse(yesterday))
    expect(after.firstSeenAt).toBe(doc.firstSeenAt)
  })

  it('cuerpo invalido y no JSON -> 400 sin fichas', async () => {
    const h = newHash()
    for (const body of [{ deviceHash: h, platform: 'windows', appVersion: '1.0.0' }, null, [], 'x', 5]) {
      expect((await ping(body)).status).toBe(400)
    }
    const throwing = await appInstallsPingEndpoint(
      reqWith(async () => {
        throw new SyntaxError('Unexpected token')
      }),
    )
    expect(throwing.status).toBe(400)
    expect((await appInstallsPingEndpoint(reqWith(undefined))).status).toBe(400)
    expect(await findByHash(h)).toHaveLength(0)
  })

  it('dos pings simultaneos con hash nuevo -> ambos 200 y una ficha', async () => {
    const h = newHash()
    const body = { deviceHash: h, platform: 'ios', appVersion: '2.0.0' }
    const [a, b] = await Promise.all([ping(body), ping(body)])
    expect(a.status).toBe(200)
    expect(b.status).toBe(200)
    expect(await findByHash(h)).toHaveLength(1)
  })

  it('sin usuario no puede leer ni crear con acceso real', async () => {
    const h = newHash()
    await ping({ deviceHash: h, platform: 'android', appVersion: '1.0.0' })
    const read = await payload
      .find({ collection: 'app-installs', overrideAccess: false, user: null })
      .then((r) => r.docs.length)
      .catch(() => 0)
    expect(read).toBe(0)
    await expect(
      payload.create({
        collection: 'app-installs',
        data: {
          deviceHash: newHash(),
          platform: 'ios',
          appVersion: '1.0.0',
          profileRevision: -1,
          firstSeenAt: new Date().toISOString(),
          lastSeenAt: new Date().toISOString(),
        },
        overrideAccess: false,
        user: null,
      }),
    ).rejects.toThrow()
  })
})
