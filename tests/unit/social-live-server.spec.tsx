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
    const fetcher = vi.fn().mockResolvedValue(
      response({
        data: [
          {
            id: '12345',
            status: 'LIVE',
            title: 'Misa',
            video: { id: '67890' },
            embed_html: '<script>bad</script>',
          },
        ],
      }),
    )
    const result = await detectFacebook(
      { pageId: '123', token: 'secret', version: 'v99.0' },
      fetcher,
    )
    expect(result.stream?.id).toBe('67890')
    expect(JSON.stringify(result)).not.toContain('script')
    expect(fetcher.mock.calls[0][0].toString()).not.toContain('secret')
    expect(fetcher.mock.calls[0][1].cache).toBe('no-store')
  })
  it('enlaza el video de la emisión de Facebook, no el ID del LiveVideo', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        data: [{ id: '1588262840008875', status: 'LIVE', video: { id: '1586475646091024' } }],
      }),
    )
    const result = await detectFacebook(
      { pageId: '123', token: 'secret', version: 'v99.0' },
      fetcher,
    )
    expect(new URL(fetcher.mock.calls[0][0]).searchParams.get('fields')).toContain('video{id}')
    expect(result.stream?.url).toBe('https://www.facebook.com/watch/?v=1586475646091024')
    expect(result.stream?.embedUrl).toContain('1586475646091024')
    expect(JSON.stringify(result)).not.toContain('1588262840008875')
  })
  it('no anuncia una emisión de Facebook sin video enlazable', async () => {
    const fetcher = vi.fn().mockResolvedValue(
      response({
        data: [
          { id: '12345', status: 'LIVE' },
          { id: '23456', status: 'LIVE', video: { id: 'x' } },
        ],
      }),
    )
    const result = await detectFacebook(
      { pageId: '123', token: 'secret', version: 'v99.0' },
      fetcher,
    )
    expect(result).toEqual({ state: 'offline', stream: null })
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
