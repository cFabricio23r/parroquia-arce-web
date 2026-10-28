import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReflectionFeature } from '@/components/reflections/ReflectionFeature'
import type { ReflectionView } from '@/lib/reflections'

const r = (over: Partial<ReflectionView> = {}): ReflectionView => ({
  slug: 'tema',
  title: 'Las Bienaventuranzas',
  quote: null,
  quoteRef: null,
  preacherName: 'Hno. Nombre Apellido',
  preacherPhoto: null,
  weekOf: '2026-10-25',
  publishedAt: null,
  createdAt: null,
  audioUrl: 'https://x.test/a.mp3',
  durationMinutes: 12,
  body: null,
  ...over,
})

describe('ReflectionFeature', () => {
  it('renders nothing without a reflection', () => {
    const { container } = render(<ReflectionFeature reflection={null} />)
    expect(container.innerHTML).toBe('')
  })

  it('links the whole card to /reflexiones/{slug}', () => {
    render(<ReflectionFeature reflection={r()} />)
    const link = screen.getByRole('link', { name: /Escuchar la reflexión/ })
    expect(link.getAttribute('href')).toBe('/reflexiones/tema')
    expect(link.textContent).toContain('Hno. Nombre Apellido')
    expect(link.textContent).toContain('Escuela de predicadores')
    expect(link.textContent).toContain('Audio · 12 min')
    expect(link.textContent).toContain('Semana del 25 al 31 de octubre')
  })

  it('has a section heading and a link to previous reflections', () => {
    render(<ReflectionFeature reflection={r()} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Una palabra para tu semana' })).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Ver reflexiones anteriores →' }).getAttribute('href'),
    ).toBe('/reflexiones')
  })

  it('shows the topic as the big text when there is no quote', () => {
    render(<ReflectionFeature reflection={r()} />)
    expect(screen.getByText('Las Bienaventuranzas').className).not.toContain('italic')
    expect(screen.queryByText(/Tema:/)).toBeNull()
  })

  it('shows the quote in italic with the topic line when present', () => {
    render(<ReflectionFeature reflection={r({ quote: 'Dichosos los pobres', quoteRef: 'Mt 5,3' })} />)
    expect(screen.getByText(/Dichosos los pobres/).className).toContain('italic')
    expect(screen.getByText('Las Bienaventuranzas').parentElement?.textContent).toBe(
      'Tema: Las Bienaventuranzas',
    )
    expect(screen.queryByText(/Sobre el tema/)).toBeNull()
  })

  it('omits the duration when missing', () => {
    render(<ReflectionFeature reflection={r({ durationMinutes: null })} />)
    expect(screen.getByText('Audio')).toBeTruthy()
  })
})
