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
    const link = screen.getByRole('link', { name: /Las Bienaventuranzas/ })
    expect(link.getAttribute('href')).toBe('/reflexiones/tema')
    expect(screen.getByText('Hno. Nombre Apellido')).toBeTruthy()
    expect(screen.getByText(/25 al 31 de octubre/)).toBeTruthy()
  })

  it('shows the topic as the big text when there is no quote', () => {
    render(<ReflectionFeature reflection={r()} />)
    expect(screen.getByRole('heading', { name: 'Las Bienaventuranzas' })).toBeTruthy()
  })

  it('shows the quote as the big text when present, topic stays visible', () => {
    render(<ReflectionFeature reflection={r({ quote: 'Dichosos los pobres', quoteRef: 'Mt 5,3' })} />)
    expect(screen.getByRole('heading', { name: /Dichosos los pobres/ })).toBeTruthy()
    expect(screen.getByText(/Las Bienaventuranzas/)).toBeTruthy()
    expect(screen.getByText('Mt 5,3')).toBeTruthy()
  })
})
