import { getPayload, type Payload } from 'payload'
import config from '@/payload.config'
import { beforeAll, describe, expect, it } from 'vitest'

let payload: Payload

/**
 * Slugs unicos por corrida: `slug` es `unique` y esta base se comparte con el
 * contenido real de la parroquia. Un slug literal dejaria el test roto para
 * siempre en cuanto quedara un registro huerfano.
 */
const unico = () => `test-radio-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

describe('RadioPrograms — validacion de horarios', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('acepta una hora en formato 24 h', async () => {
    const creado = await payload.create({
      collection: 'radio-programs',
      data: {
        title: 'Programa de prueba',
        slug: unico(),
        status: 'draft',
        startTime: '06:00',
        endTime: '07:00',
      },
    })
    expect(creado.startTime).toBe('06:00')
    expect(creado.endTime).toBe('07:00')
    await payload.delete({ collection: 'radio-programs', id: creado.id })
  })

  it('rechaza el formato viejo de texto libre', async () => {
    await expect(
      payload.create({
        collection: 'radio-programs',
        data: { title: 'Programa invalido', slug: unico(), status: 'draft', startTime: '6:00 a.m.' },
      }),
    ).rejects.toThrow()
  })

  it('rechaza una hora fuera de rango', async () => {
    await expect(
      payload.create({
        collection: 'radio-programs',
        data: { title: 'Programa invalido', slug: unico(), status: 'draft', endTime: '25:00' },
      }),
    ).rejects.toThrow()
  })

  it('deja guardar sin horario: el campo es opcional', async () => {
    const creado = await payload.create({
      collection: 'radio-programs',
      data: { title: 'Sin horario', slug: unico(), status: 'draft' },
    })
    expect(creado.id).toBeDefined()
    await payload.delete({ collection: 'radio-programs', id: creado.id })
  })
})
