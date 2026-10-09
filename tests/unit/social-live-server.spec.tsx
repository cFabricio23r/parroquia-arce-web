import { describe, expect, it, vi } from 'vitest'
import { detectFacebook, detectYouTube, resolveProvider } from '@/lib/social-live-server'

const response = (body: unknown) => ({ ok: true, json: async () => body })
describe('detección de directos', () => {
  it('no consulta proveedores sin configuración', async () => {
    const fetcher = vi.fn()
    expect((await detectYouTube('', fetcher)).state).toBe('unconfigured')
    expect((await detectFacebook({}, fetcher)).state).toBe('unconfigured')
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('confirma que YouTube empezó, no terminó y permite incrustar', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [{ id: { videoId: 'abcdefghijk' } }] }))
      .mockResolvedValueOnce(
        response({
          items: [
            {
              id: 'abcdefghijk',
              snippet: { title: 'Misa', liveBroadcastContent: 'live' },
              status: { embeddable: true },
              liveStreamingDetails: { actualStartTime: '2026-09-25T12:00:00Z' },
            },
          ],
        }),
      )
    const result = await detectYouTube('key', fetcher)
    expect(result.state).toBe('live')
    expect(result.stream?.title).toBe('Misa')
    expect(result.stream?.embedUrl).toContain('youtube-nocookie.com')
    expect(fetcher.mock.calls[1][1].cache).toBe('no-store')
    expect(fetcher.mock.calls[0][1].next.revalidate).toBe(1200)
  })
  it.each([
    { actualStartTime: '2026-09-25T12:00:00Z', actualEndTime: '2026-09-25T13:00:00Z' },
    { scheduledStartTime: '2026-09-25T12:00:00Z' },
  ])('no anuncia replays ni emisiones futuras', async (details) => {
    const fetcher = vi
      .fn()
      .mockResolvedValueOnce(response({ items: [{ id: { videoId: 'abcdefghijk' } }] }))
      .mockResolvedValueOnce(
        response({
          items: [
            { id: 'abcdefghijk', status: { embeddable: true }, liveStreamingDetails: details },
          ],
        }),
      )
    expect((await detectYouTube('key', fetcher)).state).toBe('offline')
  })
  it('aísla fallos del proveedor sin devolver el error con secretos', async () => {
    const result = await detectYouTube(
      'secret-key',
      vi.fn().mockRejectedValue(new Error('secret-key')),
    )
    expect(result).toEqual({ state: 'unavailable', stream: null })
  })
  it('acepta solo LIVE de Facebook, construye el embed sin HTML remoto', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        response({
          data: [
            { id: '12345', status: 'LIVE', title: 'Misa', embed_html: '<script>bad</script>' },
          ],
        }),
      )
    const result = await detectFacebook(
      { pageId: '123', token: 'secret', version: 'v99.0' },
      fetcher,
    )
    expect(result.stream?.id).toBe('12345')
    expect(JSON.stringify(result)).not.toContain('script')
    expect(fetcher.mock.calls[0][0].toString()).not.toContain('secret')
    expect(fetcher.mock.calls[0][1].cache).toBe('no-store')
  })
  it('el modo oculto y manual nunca consultan el proveedor', async () => {
    const detector = vi.fn()
    expect((await resolveProvider('youtube', { mode: 'off' }, detector)).state).toBe('disabled')
    expect(
      (
        await resolveProvider(
          'youtube',
          { mode: 'manual', url: 'https://youtu.be/abcdefghijk', endsAt: '2000-01-01' },
          detector,
        )
      ).state,
    ).toBe('offline')
    expect(detector).not.toHaveBeenCalled()
  })
})
