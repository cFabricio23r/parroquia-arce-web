import 'dotenv/config'
import { getPayload } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import config from '../src/payload.config.js'
import { mkdirSync, writeFileSync } from 'node:fs'

const resolved = await config
resolved.db = postgresAdapter({ pool: { connectionString: process.env.DATABASE_URL }, push: false })
const payload = await getPayload({ config: resolved })
const snapshot: Record<string, unknown> = {}
for (const collection of ['sectors', 'groups', 'chapels'] as const) {
  const result = await payload.find({ collection, limit: 500, depth: 1, overrideAccess: true })
  if (result.hasNextPage) throw new Error('Incomplete snapshot')
  snapshot[collection] = result.docs
}
mkdirSync('content-audits/2026-10-06', { recursive: true })
writeFileSync('content-audits/2026-10-06/snapshot.json', JSON.stringify(snapshot, null, 2))
console.log('Read-only snapshot saved; no CMS data changed.')
process.exit(0)
