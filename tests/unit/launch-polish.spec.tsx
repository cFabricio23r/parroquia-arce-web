import { render, screen, fireEvent, within, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
const route = vi.hoisted(() => ({ path: '/' }))
vi.mock('next/navigation', () => ({ usePathname: () => route.path }))
import { Header } from '@/components/site/Header'
import { ContactForm } from '@/components/site/ContactForm'
import { ScheduleTimes } from '@/components/site/ScheduleTimes'
import { channelDescription } from '@/lib/contact-channels'
import { HeroSlider } from '@/components/site/HeroSlider'

describe('Launch polish', () => {
  beforeEach(() => {
    route.path = '/'
  })

  it('pauses the rotating photos and resumes only when requested', () => {
    const original = window.matchMedia
    const media = vi.spyOn(window, 'matchMedia').mockImplementation(query => ({ ...original(query), matches: false }))
    vi.useFakeTimers()
    try {
      render(<HeroSlider images={[{ url: '/one.jpg', alt: 'Capilla uno' }, { url: '/two.jpg', alt: 'Capilla dos' }]}>Portada</HeroSlider>)
      fireEvent.click(screen.getByRole('button', { name: 'Pausar fotos' }))
      act(() => vi.advanceTimersByTime(6500))
      expect(screen.getByRole('img', { name: 'Capilla uno' })).toBeTruthy()
      fireEvent.click(screen.getByRole('button', { name: 'Reanudar fotos' }))
      act(() => vi.advanceTimersByTime(6000))
      expect(screen.getByRole('img', { name: 'Capilla dos' })).toBeTruthy()
    } finally {
      vi.useRealTimers()
      media.mockRestore()
    }
  })

  it('keeps photo controls available without autoplay with reduced motion', () => {
    render(<HeroSlider images={[{ url: '/one.jpg', alt: 'Capilla uno' }, { url: '/two.jpg', alt: 'Capilla dos' }]}>Portada</HeroSlider>)
    expect(screen.queryByRole('button', { name: 'Pausar fotos' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Ver foto 2' }))
    expect(screen.getByRole('img', { name: 'Capilla dos' })).toBeTruthy()
  })
  it('preserves a parish-specific channel description and corrects copied platform labels', () => {
    expect(channelDescription('Youtube', 'Fotografías')).toBe('Fotografías')
    expect(channelDescription('Avisos de catequesis los sábados', 'Comunidad')).toBe(
      'Avisos de catequesis los sábados',
    )
  })
  it('moves focus into the mobile dialog, traps Tab and closes with Escape', () => {
    render(<Header hasSchedule />)
    const trigger = screen.getByRole('button', { name: 'Abrir menú' })
    fireEvent.click(trigger)
    const dialog = screen.getByRole('dialog', { name: 'Menú móvil' })
    const close = within(dialog).getByRole('button', { name: 'Cerrar menú' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(
      within(dialog).getByRole('link', { name: 'Ver horarios de misa' }),
    )
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(close)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(trigger.getAttribute('aria-expanded')).toBe('false')
    expect(document.activeElement).toBe(trigger)
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('restores background state on route change and unmount', () => {
    const background = document.createElement('main')
    document.body.append(background)
    const { rerender, unmount } = render(<Header hasSchedule />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    expect(background.hasAttribute('inert')).toBe(true)
    route.path = '/contacto'
    rerender(<Header hasSchedule />)
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
    expect(background.hasAttribute('inert')).toBe(false)
    route.path = '/'
    rerender(<Header hasSchedule />)
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    unmount()
    expect(background.hasAttribute('inert')).toBe(false)
    expect(document.body.style.overflow).not.toBe('hidden')
    background.remove()
  })

  it('offers a real existing channel instead of a form with fake success', () => {
    render(
      <ContactForm channels={[{ platform: 'facebook', url: 'https://www.facebook.com/parish' }]} />,
    )
    expect(screen.queryByRole('button', { name: /Enviar mensaje/ })).toBeNull()
    expect(screen.getByRole('link', { name: /Facebook/ }).getAttribute('href')).toBe(
      'https://www.facebook.com/parish',
    )
    expect(screen.queryByText(/Mensaje enviado/)).toBeNull()
  })

  it('closes the menu when its schedule link points to the current page', () => {
    route.path = '/horarios'
    render(<Header hasSchedule />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('link', { name: 'Ver horarios de misa' }),
    )
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
  })

  it('does not invent a contact destination when channels are missing', () => {
    render(<ContactForm channels={[]} />)
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText(/oficina parroquial/)).toBeTruthy()
  })

  it('keeps each time and its unit together without losing the original text', () => {
    const { container } = render(<ScheduleTimes value="6:00 AM | 9:00 AM | 12:00 MD | 05:00 PM" />)
    expect(screen.getByText('05:00 PM').className).toContain('whitespace-nowrap')
    expect(container.textContent).toBe('6:00 AM | 9:00 AM | 12:00 MD | 05:00 PM')
  })
})
