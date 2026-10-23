import { describe, expect, it, vi } from 'vitest'
import { checkFacebookHealth } from '@/lib/facebook-health'
import { activeNotice, validateNotice } from '@/lib/activity-notice'

const config = { pageId: '123', token: 'secret-token', version: 'v26.0' }
const reply = (status: number, data: unknown) =>
  ({ ok: status === 200, status, json: async () => data }) as Response
describe('diagnóstico de Facebook', () => {
  it.each([
    [190, 'token-invalid'],
    [10, 'permissions'],
    [100, 'permissions'],
    [2, 'unavailable'],
  ])('clasifica error %s sin filtrar secretos', async (code, state) => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        reply(400, { error: { code, message: 'missing permission secret-token' } }),
      )
    const result = await checkFacebookHealth(config, fetcher)
    expect(result.posts).toBe(state)
    expect(result.live).toBe(state)
    expect(JSON.stringify(result)).not.toContain('secret-token')
  })
  it('distingue éxito vacío, fallos parciales y configuración ausente', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(reply(200, { data: [] }))
      .mockResolvedValueOnce(reply(400, { error: { code: 10 } }))
    expect(await checkFacebookHealth(config, fetcher)).toEqual({ posts: 'ok', live: 'permissions' })
    expect(await checkFacebookHealth({}, fetcher)).toEqual({
      posts: 'unconfigured',
      live: 'unconfigured',
    })
  })
})
describe('aviso destacado', () => {
  const notice = {
    enabled: true,
    title: 'Fiesta patronal',
    message: 'Te esperamos.',
    endsAt: '2026-12-09T00:00:00Z',
    url: 'https://example.com/fiesta',
  }
  it('solo publica avisos activos y vigentes', () => {
    expect(activeNotice(notice, Date.parse('2026-12-08T00:00:00Z'))?.title).toBe('Fiesta patronal')
    expect(activeNotice(notice, Date.parse(notice.endsAt))).toBeNull()
    expect(activeNotice({ ...notice, enabled: false }, 0)).toBeNull()
    expect(activeNotice({ ...notice, endsAt: 'invalid' }, 0)).toBeNull()
  })
  it('exige título, mensaje, vencimiento futuro y enlace seguro al activar', () => {
    expect(validateNotice(notice, undefined, 0)).toBe(true)
    expect(validateNotice({ ...notice, title: ' ' }, undefined, 0)).not.toBe(true)
    expect(validateNotice({ ...notice, url: 'javascript:alert(1)' }, undefined, 0)).not.toBe(true)
    expect(activeNotice({ ...notice, url: 'javascript:alert(1)' }, 0)).toBeNull()
    expect(validateNotice(notice, undefined, Date.parse(notice.endsAt))).not.toBe(true)
    expect(validateNotice(notice, notice, Date.parse(notice.endsAt))).toBe(true)
  })
})
