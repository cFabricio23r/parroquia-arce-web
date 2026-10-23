import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { makeStream } from '@/lib/social-live'
import { LiveWidget } from '@/components/site/social/LiveWidget'

const toggle = vi.fn()
vi.mock('@/components/site/radio/RadioProvider', () => ({
  useRadio: () => ({ playing: true, toggle }),
}))
const streams = [
  makeStream('youtube', 'abcdefghijk', 'Misa dominical'),
  makeStream('facebook', '123456', 'Celebración'),
]

describe('ventana flotante de directos', () => {
  beforeEach(() => {
    toggle.mockClear()
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({ streams }) }))
  })
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('abre sin autoplay, expande, cambia de plataforma y cierra deteniendo el video', async () => {
    const { container } = render(<LiveWidget />)
    fireEvent.click(await screen.findByRole('button', { name: /Ver transmisión en vivo/ }))
    expect(toggle).toHaveBeenCalled()
    expect(screen.getByTitle('Misa dominical').getAttribute('src')).toContain('autoplay=0')
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Expandir video' }))
    expect(screen.getByRole('button', { name: 'Reducir video' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Facebook' }))
    expect(screen.getByTitle('Celebración').getAttribute('src')).toContain(
      'facebook.com/plugins/video.php',
    )
    expect(container.querySelectorAll('iframe')).toHaveLength(1)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar video' }))
    expect(container.querySelector('iframe')).toBeNull()
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Ver transmisión en vivo/ })).toBe(
        document.activeElement,
      ),
    )
  })

  it('minimiza con Escape y permite volver a abrir', async () => {
    render(<LiveWidget />)
    fireEvent.click(await screen.findByRole('button', { name: /Ver transmisión en vivo/ }))
    fireEvent.keyDown(screen.getByRole('region', { name: 'Transmisión en vivo' }), {
      key: 'Escape',
    })
    expect(screen.queryByTitle('Misa dominical')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: /Ver transmisión en vivo/ }))
    expect(screen.getByTitle('Misa dominical')).toBeTruthy()
  })

  it('no muestra aviso cuando no hay directo confirmado', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ streams: [] }),
    } as Response)
    const { container } = render(<LiveWidget />)
    await waitFor(() => expect(fetch).toHaveBeenCalled())
    expect(container.textContent).toBe('')
  })

  it('retira el video ante una actualización fallida', async () => {
    const { container } = render(<LiveWidget />)
    fireEvent.click(await screen.findByRole('button', { name: /Ver transmisión en vivo/ }))
    vi.mocked(fetch).mockRejectedValue(new Error('offline'))
    await act(async () => {
      document.dispatchEvent(new Event('visibilitychange'))
    })
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.queryByRole('button', { name: /Ver transmisión en vivo/ })).toBeNull()
  })
})
