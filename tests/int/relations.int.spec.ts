import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`
const cleanup: { collection: string; id: string | number }[] = []

describe('Chapels + Radio relations', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    // Borrar en orden inverso para no violar relaciones.
    for (const { collection, id } of cleanup.reverse()) {
      await payload.delete({ collection: collection as never, id }).catch(() => {})
    }
  })

  it('una ermita se relaciona con su sector', async () => {
    const sector = await payload.create({
      collection: 'sectors',
      data: { name: 'Sector rel', slug: uniq('sector-rel'), status: 'published' },
    })
    cleanup.push({ collection: 'sectors', id: sector.id })

    const chapel = await payload.create({
      collection: 'chapels',
      data: {
        name: 'Ermita rel',
        slug: uniq('ermita-rel'),
        sector: sector.id,
        status: 'published',
      },
    })
    cleanup.push({ collection: 'chapels', id: chapel.id })

    const found = await payload.findByID({ collection: 'chapels', id: chapel.id, depth: 1 })
    const rel = found.sector
    const relId = typeof rel === 'object' && rel ? rel.id : rel
    expect(relId).toBe(sector.id)
  })

  it('un episodio se relaciona con su programa', async () => {
    const program = await payload.create({
      collection: 'radio-programs',
      data: { title: 'Programa rel', slug: uniq('prog-rel'), status: 'published' },
    })
    cleanup.push({ collection: 'radio-programs', id: program.id })

    const episode = await payload.create({
      collection: 'radio-episodes',
      data: {
        title: 'Episodio rel',
        slug: uniq('ep-rel'),
        program: program.id,
        status: 'published',
      },
    })
    cleanup.push({ collection: 'radio-episodes', id: episode.id })

    const found = await payload.findByID({ collection: 'radio-episodes', id: episode.id, depth: 1 })
    const rel = found.program
    const relId = typeof rel === 'object' && rel ? rel.id : rel
    expect(relId).toBe(program.id)
  })
})
