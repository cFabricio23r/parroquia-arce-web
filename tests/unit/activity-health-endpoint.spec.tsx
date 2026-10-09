import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PayloadRequest } from 'payload'
import { activityHealthEndpoint } from '@/endpoints/activity-health'
import { Activity } from '@/globals/Activity'

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

const req = (role?: string, origin = 'https://parish.test', method = 'POST') => ({
  method,
  url: 'https://parish.test/api/globals/activity/facebook-health',
  headers: new Headers({ origin }),
  user: role ? { role } : null,
  payload: {
    findGlobal: vi
      .fn()
      .mockResolvedValue({ connection: { lastSuccessAt: '2026-01-01T00:00:00Z' } }),
    updateGlobal: vi.fn().mockResolvedValue({}),
  },
})

describe('diagnóstico privado', () => {
  it('impide leer conexión anónimamente y falsificarla desde la edición normal del global', async () => {
    const field = Activity.fields.find((field) => 'name' in field && field.name === 'connection')!
    if (!('access' in field) || !field.access) throw new Error('Falta control de acceso')
    const anonymous = { req: req() as unknown as PayloadRequest }
    const editor = { req: req('contenido') as unknown as PayloadRequest }
    expect(await field.access.read!(anonymous)).toBe(false)
    expect(await field.access.read!(editor)).toBe(true)
    expect(await field.access.create!(editor)).toBe(false)
    expect(await field.access.update!(editor)).toBe(false)
  })
  it('actualiza último éxito únicamente cuando ambas consultas funcionan', async () => {
    vi.stubEnv('FACEBOOK_PAGE_ID', '123')
    vi.stubEnv('FACEBOOK_GRAPH_VERSION', 'v26.0')
    vi.stubEnv('FACEBOOK_PAGE_ACCESS_TOKEN', 'test-secret')
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: [] }) }),
    )
    const request = req('super-admin')
    const result = await activityHealthEndpoint(request as unknown as PayloadRequest)
    const data = await result.json()
    expect(data.posts).toBe('ok')
    expect(data.lastSuccessAt).toBe(data.checkedAt)
    expect(JSON.stringify(data)).not.toContain('test-secret')
  })
  it('rechaza anónimos, roles ajenos y POST de otro origen antes de consultar datos', async () => {
    for (const request of [req(), req('other'), req('contenido', 'https://evil.test')]) {
      const result = await activityHealthEndpoint(request as unknown as PayloadRequest)
      expect([401, 403]).toContain(result.status)
      expect(request.payload.findGlobal).not.toHaveBeenCalled()
      expect(request.payload.updateGlobal).not.toHaveBeenCalled()
    }
  })
  it('permite leer estado a comunicaciones y no escribe en GET', async () => {
    const request = req('comunicaciones', '', 'GET')
    const result = await activityHealthEndpoint(request as unknown as PayloadRequest)
    expect(result.status).toBe(200)
    expect(await result.json()).toMatchObject({ lastSuccessAt: '2026-01-01T00:00:00Z' })
    expect(request.payload.updateGlobal).not.toHaveBeenCalled()
  })
  it('guarda fallo sin borrar el último éxito ni confiar en datos del cliente', async () => {
    vi.stubEnv('FACEBOOK_PAGE_ID', '')
    const request = req('contenido')
    const result = await activityHealthEndpoint(request as unknown as PayloadRequest)
    expect(result.status).toBe(200)
    const saved = request.payload.updateGlobal.mock.calls[0][0].data.connection
    expect(saved.posts).toBe('unconfigured')
    expect(saved.lastSuccessAt).toBe('2026-01-01T00:00:00Z')
    expect(Number.isFinite(Date.parse(saved.checkedAt))).toBe(true)
    vi.unstubAllEnvs()
  })
})
