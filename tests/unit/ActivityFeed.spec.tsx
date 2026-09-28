import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ActivityFeed } from '@/components/site/activity/ActivityFeed'
import type { ActivityPost } from '@/lib/activity'

const post = (id: string): ActivityPost => ({
  id,
  title: `Encuentro ${id}`,
  excerpt: 'Vida de nuestra comunidad.',
  date: '2026-09-25T12:00:00Z',
  image: null,
  url: `https://www.facebook.com/123/posts/${id}`,
})
afterEach(() => vi.unstubAllGlobals())

describe('Actividad editorial', () => {
  it('ignora una respuesta anterior cuando se aplica otro filtro durante la carga', async () => {
    let finishOld!: (value: unknown) => void
    const fetcher = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishOld = resolve
          }),
      )
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'ready', posts: [post('3')], nextCursor: null }),
      })
    vi.stubGlobal('fetch', fetcher)
    render(<ActivityFeed initial={{ state: 'ready', posts: [post('1')], nextCursor: null }} />)
    fireEvent.change(screen.getByLabelText('Tipo de publicación'), { target: { value: 'photo' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    fireEvent.change(screen.getByLabelText('Tipo de publicación'), { target: { value: 'video' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await screen.findByRole('heading', { name: 'Encuentro 3' })
    finishOld({
      ok: true,
      json: async () => ({ state: 'ready', posts: [post('2')], nextCursor: 'old' }),
    })
    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Encuentro 2' })).toBeNull())
    expect(screen.getByRole('heading', { name: 'Encuentro 3' })).toBeTruthy()
  })
  it('conserva resultados al fallar un cambio de filtro y reintenta ese filtro', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'ready', posts: [post('4')], nextCursor: null }),
      })
    vi.stubGlobal('fetch', fetcher)
    render(<ActivityFeed initial={{ state: 'ready', posts: [post('1')], nextCursor: null }} />)
    fireEvent.change(screen.getByLabelText('Tipo de publicación'), { target: { value: 'video' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await screen.findByRole('alert')
    expect(screen.getByRole('heading', { name: 'Encuentro 1' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await screen.findByRole('heading', { name: 'Encuentro 4' })
    expect(String(fetcher.mock.calls[1][0])).toContain('kind=video')
  })
  it('consulta filtros en servidor y reemplaza resultados, sin filtrar solo lo cargado', async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue({
        ok: true,
        json: async () => ({ state: 'ready', posts: [post('8')], nextCursor: 'filtered' }),
      })
    vi.stubGlobal('fetch', fetcher)
    render(<ActivityFeed initial={{ state: 'ready', posts: [post('1')], nextCursor: 'old' }} />)
    fireEvent.change(screen.getByLabelText('Desde'), { target: { value: '2026-08-01' } })
    fireEvent.change(screen.getByLabelText('Tipo de publicación'), { target: { value: 'video' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await screen.findByRole('heading', { name: 'Encuentro 8' })
    expect(screen.queryByRole('heading', { name: 'Encuentro 1' })).toBeNull()
    const url = new URL(String(fetcher.mock.calls[0][0]), 'https://local.test')
    expect(url.searchParams.get('from')).toBe('2026-08-01')
    expect(url.searchParams.get('kind')).toBe('video')
    expect(url.searchParams.has('cursor')).toBe(false)
  })
  it('ofrece seguir buscando cuando una página filtrada está vacía y queda historial', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          json: async () => ({ state: 'ready', posts: [], nextCursor: 'more' }),
        }),
    )
    render(<ActivityFeed initial={{ state: 'ready', posts: [post('1')], nextCursor: null }} />)
    fireEvent.change(screen.getByLabelText('Tipo de publicación'), { target: { value: 'video' } })
    fireEvent.click(screen.getByRole('button', { name: 'Aplicar filtros' }))
    await screen.findByText(/Todavía quedan publicaciones por revisar/)
    expect(screen.getByRole('button', { name: 'Seguir buscando publicaciones' })).toBeTruthy()
    expect(screen.queryByText(/Llegaste al final/)).toBeNull()
  })
  it('muestra tarjetas propias y enlaces accesibles sin iframe', () => {
    const { container } = render(
      <ActivityFeed
        initial={{ state: 'ready', posts: [post('1'), post('2'), post('3')], nextCursor: null }}
      />,
    )
    expect(screen.getByRole('heading', { name: 'Encuentro 1' })).toBeTruthy()
    expect(container.querySelector('iframe')).toBeNull()
    const link = screen.getByRole('link', { name: /Encuentro 1/ })
    expect(link.getAttribute('rel')).toBe('noopener noreferrer')
    expect(screen.queryByRole('button', { name: 'Cargar publicaciones anteriores' })).toBeNull()
  })
  it('agrega historial sin duplicados y anuncia el fin', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ state: 'ready', posts: [post('1'), post('2')], nextCursor: null }),
      }),
    )
    render(<ActivityFeed initial={{ state: 'ready', posts: [post('1')], nextCursor: 'cursor' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cargar publicaciones anteriores' }))
    await screen.findByRole('heading', { name: 'Encuentro 2' })
    expect(screen.getAllByRole('heading', { name: 'Encuentro 1' })).toHaveLength(1)
    expect(screen.getByText(/Llegaste al final/)).toBeTruthy()
    expect(vi.mocked(fetch).mock.calls[0][0]).toBe('/api/activity?cursor=cursor')
  })
  it('conserva publicaciones y permite reintentar si falla el historial', async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ state: 'ready', posts: [post('2')], nextCursor: null }),
      })
    vi.stubGlobal('fetch', fetcher)
    render(<ActivityFeed initial={{ state: 'ready', posts: [post('1')], nextCursor: 'cursor' }} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cargar publicaciones anteriores' }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Encuentro 1' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reintentar' }))
    await screen.findByRole('heading', { name: 'Encuentro 2' })
    await waitFor(() => expect(screen.queryByRole('alert')).toBeNull())
  })
  it('ofrece Facebook cuando todavía no hay datos, sin publicaciones ficticias', () => {
    render(<ActivityFeed initial={{ state: 'unconfigured', posts: [], nextCursor: null }} />)
    expect(screen.getByRole('link', { name: /Ver toda la actividad en Facebook/ })).toBeTruthy()
    expect(screen.queryByRole('article')).toBeNull()
  })
})
