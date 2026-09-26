import { describe, expect, it, vi } from 'vitest'
import { normalizeActivityPost } from '@/lib/activity'
import { getActivityPage } from '@/lib/activity-server'

const post = {
  id: '123_456',
  message: 'Celebración parroquial\nCompartimos este encuentro.',
  created_time: '2026-09-25T12:00:00+0000',
  permalink_url: 'https://www.facebook.com/123/posts/456',
  full_picture: 'https://scontent.example.fbcdn.net/photo.jpg',
}
const config = { pageId: '123', token: 'test-secret', version: 'v99.0' }
const response = (data: unknown) => ({ ok: true, json: async () => data }) as Response

describe('origen de Actividad', () => {
  it('extrae contenido real y normaliza fecha', () => {
    expect(normalizeActivityPost(post)).toMatchObject({
      id: '123_456',
      title: 'Celebración parroquial',
      excerpt: 'Compartimos este encuentro.',
      date: '2026-09-25T12:00:00.000Z',
    })
  })
  it('tolera falta de foto o mensaje sin inventar contenido', () => {
    expect(
      normalizeActivityPost({ ...post, message: undefined, full_picture: undefined }),
    ).toMatchObject({ title: 'Publicación de la parroquia', image: null, excerpt: '' })
  })
  it('rechaza fechas y enlaces inválidos y fotos ajenas', () => {
    expect(
      normalizeActivityPost({ ...post, permalink_url: 'https://facebook.com.evil.test/post' }),
    ).toBeNull()
    expect(normalizeActivityPost({ ...post, created_time: 'bad' })).toBeNull()
    expect(
      normalizeActivityPost({ ...post, full_picture: 'https://evil.test/pixel' })?.image,
    ).toBeNull()
  })
  it('no consulta sin credenciales y distingue error de lista vacía', async () => {
    const fetcher = vi.fn()
    expect((await getActivityPage(null, {}, fetcher)).state).toBe('unconfigured')
    expect(fetcher).not.toHaveBeenCalled()
    expect(
      (await getActivityPage(null, config, vi.fn().mockResolvedValue(response({ data: [] }))))
        .state,
    ).toBe('ready')
    expect(
      (await getActivityPage(null, config, vi.fn().mockRejectedValue(new Error('test-secret'))))
        .state,
    ).toBe('unavailable')
  })
  it('firma cursor, nunca devuelve paging.next ni tokens y consulta origen fijo', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        response({
          data: [post],
          paging: {
            next: 'https://graph.facebook.com/?access_token=test-secret',
            cursors: { after: 'abc123' },
          },
        }),
      )
    const first = await getActivityPage(null, config, fetcher)
    expect(first.nextCursor).toBeTruthy()
    expect(JSON.stringify(first)).not.toContain('test-secret')
    expect(JSON.stringify(first)).not.toContain('graph.facebook.com')
    await getActivityPage(first.nextCursor, config, fetcher)
    expect(new URL(fetcher.mock.calls[1][0]).searchParams.get('after')).toBe('abc123')
    expect(fetcher.mock.calls[0][1].next.revalidate).toBe(900)
    const count = fetcher.mock.calls.length
    expect((await getActivityPage(first.nextCursor + 'x', config, fetcher)).state).toBe(
      'invalid-cursor',
    )
    expect(fetcher.mock.calls.length).toBe(count)
  })
})
