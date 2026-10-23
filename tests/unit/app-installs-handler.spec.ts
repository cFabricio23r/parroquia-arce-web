// @vitest-environment node
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { PGlite } from '@electric-sql/pglite'
import { PgDialect } from 'drizzle-orm/pg-core'
import type { SQL } from 'drizzle-orm'
import type { PayloadRequest } from 'payload'
import type { MigrateUpArgs } from '@payloadcms/db-postgres'
import { appInstallsPingEndpoint } from '@/endpoints/app-installs-ping'
import { appInstallsSummaryEndpoint } from '@/endpoints/app-installs-summary'
import { AppInstalls } from '@/collections/AppInstalls'
import { up } from '@/migrations/20261023_211157_app_installs'

const body = { deviceHash: 'a'.repeat(64), platform: 'android', appVersion: '1.0.0' }
const dialect = new PgDialect()
let database: PGlite
let sequence = 0
const uniqueBody = () => ({ ...body, deviceHash: (++sequence).toString(16).padStart(64, '0') })
function request(payload: object, input: unknown = body, role?: string) {
  return { payload, json: async () => input, user: role ? { id: 1, role } : null } as unknown as PayloadRequest
}
const execute = async (statement: SQL) => {
  const query = dialect.sqlToQuery(statement)
  return query.params.length ? database.query(query.sql, query.params) : database.exec(query.sql)
}
const sqlPayload = { db: { drizzle: { execute } } }
const ping = (input: unknown) => appInstallsPingEndpoint(request(sqlPayload, input))
const row = async (hash: string) => (await database.query<Record<string, unknown>>('SELECT * FROM app_installs WHERE device_hash = $1', [hash])).rows[0]

describe('install endpoints with isolated Postgres (PGlite)', () => {
  beforeAll(async () => {
    database = new PGlite()
    await database.exec('CREATE TABLE payload_locked_documents_rels (id serial PRIMARY KEY); CREATE ROLE anon; CREATE ROLE authenticated;')
    await up({ db: { execute } } as unknown as MigrateUpArgs)
  }, 30000)
  afterAll(async () => { await database?.close() })
  it('applies the profile when another first ping competes for the same device', async () => {
    const input = uniqueBody()
    const responses = await Promise.all([ping(input), ping({ ...input, profile: { firstName: 'Ana', lastName: 'Pérez' }, profileRevision: 1 })])
    expect(responses.map(r => r.status)).toEqual([200, 200])
    expect(await row(input.deviceHash)).toMatchObject({ first_name: 'Ana', last_name: 'Pérez' })
    expect((await database.query('SELECT id FROM app_installs WHERE device_hash = $1', [input.deviceHash])).rows).toHaveLength(1)
  })
  it('does not restore deleted names when an abandoned older request arrives late', async () => {
    const input = uniqueBody()
    await ping({ ...input, profile: { firstName: 'Ana', lastName: 'Pérez' }, profileRevision: 10 })
    await ping({ ...input, profile: { firstName: '', lastName: '' }, profileRevision: 20 })
    await ping({ ...input, profile: { firstName: 'Ana', lastName: 'Pérez' }, profileRevision: 10 })
    expect(await row(input.deviceHash)).toMatchObject({ first_name: '', last_name: '', profile_revision: '20' })
  })
  it('preserves profile when absent and does not rewrite the same daily ping', async () => {
    const input = uniqueBody()
    await ping({ ...input, profile: { firstName: 'Ana', lastName: 'Pérez' }, profileRevision: 1 })
    const before = await row(input.deviceHash)
    await ping({ ...input, appVersion: '1.0.1' })
    const after = await row(input.deviceHash)
    expect(after.first_name).toBe('Ana')
    expect(after.app_version).toBe('1.0.0')
    expect(after.updated_at).toEqual(before.updated_at)
    await database.query("UPDATE app_installs SET last_seen_at = NOW() - INTERVAL '2 days' WHERE device_hash = $1", [input.deviceHash])
    await ping({ ...input, appVersion: '1.0.1' })
    expect(await row(input.deviceHash)).toMatchObject({ app_version: '1.0.1', first_seen_at: before.first_seen_at })
  })
  it('rejects invalid bodies before writing and does not expose stored names', async () => {
    expect((await ping(null)).status).toBe(400)
    const response = await ping({ ...uniqueBody(), profile: { firstName: 'Ana', lastName: 'Pérez' }, profileRevision: 3 })
    expect(await response.json()).toEqual({ ok: true })
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
    const invalidJson = request(sqlPayload)
    invalidJson.json = async () => { throw new SyntaxError('bad') }
    expect((await appInstallsPingEndpoint(invalidJson)).status).toBe(400)
  })
  it('returns unavailable on database failure without exposing data', async () => {
    const response = await appInstallsPingEndpoint(request({ db: { drizzle: { execute: async () => { throw Error('private') } } } }))
    expect(response.status).toBe(503)
    expect(await response.text()).not.toContain('private')
  })
  it('can reapply the migration and blocks Supabase public roles', async () => {
    await up({ db: { execute } } as unknown as MigrateUpArgs)
    expect((await database.query<{ relrowsecurity: boolean }>("SELECT relrowsecurity FROM pg_class WHERE relname = 'app_installs'")).rows[0].relrowsecurity).toBe(true)
    for (const role of ['anon', 'authenticated']) {
      await database.exec(`SET ROLE ${role}`)
      try { await expect(database.query('SELECT * FROM app_installs')).rejects.toThrow(/permission denied/) }
      finally { await database.exec('RESET ROLE') }
    }
  })
  it('denies summary to anonymous and editor roles before any query', async () => {
    const count = vi.fn()
    for (const role of [undefined, 'contenido', 'comunicaciones']) {
      expect((await appInstallsSummaryEndpoint(request({ count }, body, role))).status).toBe(403)
    }
    expect(count).not.toHaveBeenCalled()
  })
  it('keeps all collection data private and forbids ordinary REST creation', async () => {
    for (const role of [undefined, 'contenido', 'comunicaciones', 'super-admin']) {
      for (const operation of ['create', 'read', 'update', 'delete'] as const) {
        const access = AppInstalls.access![operation]!
        expect(await access({ req: request({}, body, role) })).toBe(role === 'super-admin' && operation !== 'create')
      }
    }
  })
  it('returns only aggregate counts for super admin', async () => {
    const count = vi.fn().mockResolvedValueOnce({ totalDocs: 10 }).mockResolvedValueOnce({ totalDocs: 5 }).mockResolvedValueOnce({ totalDocs: 8 })
    const response = await appInstallsSummaryEndpoint(request({ count }, body, 'super-admin'))
    expect(await response.json()).toEqual({ total: 10, active7: 5, active30: 8 })
    expect(count.mock.calls[1][0].where.lastSeenAt.greater_than_equal).toMatch(/^\d{4}-/)
    const cutoff7 = Date.parse(count.mock.calls[1][0].where.lastSeenAt.greater_than_equal)
    const cutoff30 = Date.parse(count.mock.calls[2][0].where.lastSeenAt.greater_than_equal)
    expect(cutoff7 - cutoff30).toBe(23 * 86400000)
    expect(response.headers.get('Cache-Control')).toBe('private, no-store')
  })
})
