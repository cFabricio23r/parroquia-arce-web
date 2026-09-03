import { getPayload } from 'payload'
import config from '../src/payload.config.js'

/**
 * Publica los 4 grupos cargados por scripts/seed-groups-2026-08.ts.
 * Paso separado a proposito: el seed los deja en borrador para que la parroquia
 * los revise, y esto es lo que los saca al sitio publico.
 *
 * Idempotente: saltea el que ya este publicado.
 *
 * Uso: npx payload run scripts/publish-groups-2026-08.ts
 */
const SLUGS = ['comision-de-liturgia', 'mec', 'iam', 'escuela-basica-en-la-fe']

const payload = await getPayload({ config })

for (const slug of SLUGS) {
  const res = await payload.find({
    collection: 'groups',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  const doc = res.docs[0]
  if (!doc) {
    console.error(`  ✗ no existe: ${slug}`)
    continue
  }
  if (doc.status === 'published') {
    console.log(`  · ya estaba publicado: ${slug}`)
    continue
  }
  const out = await payload.update({
    collection: 'groups',
    id: doc.id,
    data: { status: 'published' },
    overrideAccess: true,
  })
  console.log(`  ✓ ${out.slug}: ${doc.status} -> ${out.status}`)
}
process.exit(0)
