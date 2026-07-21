import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `t${Date.now()}`
const uniq = (s: string) => `${run}-${s}`
const cleanup: { collection: string; id: string | number }[] = []

describe('Chapels — fiestas y contacto', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })
  afterAll(async () => {
    // Borrar en orden inverso para no violar la relacion sector -> ermita.
    // NO se silencian los fallos: la base de tests es la MISMA que la de
    // produccion, y un borrado que falla en silencio deja basura para siempre.
    for (const { collection, id } of cleanup.reverse()) {
      try {
        await payload.delete({ collection: collection as never, id })
      } catch (e) {
        console.error(`[cleanup] no se pudo borrar ${collection}/${id}:`, (e as Error).message)
      }
    }
  })

  it('guarda fiestas patronales y contacto', async () => {
    const sector = await payload.create({
      collection: 'sectors',
      data: { name: 'Sector fiestas', slug: uniq('sector-fiestas'), status: 'published' },
    })
    cleanup.push({ collection: 'sectors', id: sector.id })

    const chapel = await payload.create({
      collection: 'chapels',
      data: {
        name: 'Ermita Concepción',
        slug: uniq('ermita-concepcion'),
        sector: sector.id,
        status: 'published',
        patronOrDedication: 'Inmaculada Concepción',
        patronalFeasts: [
          { name: 'Novena', day: 29, month: '11' },
          { name: 'Fiesta principal', day: 8, month: '12' },
        ],
        contact: { whatsapp: '7777-7777', email: 'ermita@ejemplo.sv' },
      },
    })
    cleanup.push({ collection: 'chapels', id: chapel.id })

    expect(chapel.patronalFeasts).toHaveLength(2)
    expect(chapel.patronalFeasts?.[1]?.name).toBe('Fiesta principal')
    expect(chapel.patronalFeasts?.[1]?.day).toBe(8)
    expect(chapel.patronalFeasts?.[1]?.month).toBe('12')
    expect(chapel.contact?.whatsapp).toBe('7777-7777')
  })

  it('rechaza una fiesta con dia fuera de rango', async () => {
    const sector = await payload.create({
      collection: 'sectors',
      data: { name: 'Sector malo', slug: uniq('sector-malo'), status: 'draft' },
    })
    cleanup.push({ collection: 'sectors', id: sector.id })

    // No se usa `rejects.toThrow()` a proposito: si Payload NO rechaza, ese
    // helper falla la asercion y el documento recien creado queda huerfano en la
    // base de produccion (paso de verdad en la corrida en rojo de este test).
    // Aca se captura el id primero y se registra para borrado, y recien despues
    // se asierta.
    let createdId: string | number | undefined
    try {
      const bad = await payload.create({
        collection: 'chapels',
        data: {
          name: 'Ermita mala',
          slug: uniq('ermita-mala'),
          sector: sector.id,
          status: 'draft',
          patronalFeasts: [{ name: 'Imposible', day: 45, month: '12' }],
        },
      })
      createdId = bad.id
      cleanup.push({ collection: 'chapels', id: bad.id })
    } catch {
      // Esperado: el dia esta fuera de rango.
    }

    expect(createdId, 'Payload aceptó un día fuera de rango').toBeUndefined()
  })
})
