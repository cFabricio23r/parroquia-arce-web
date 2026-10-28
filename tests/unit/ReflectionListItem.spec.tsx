import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ReflectionListItem } from '@/components/reflections/ReflectionListItem'
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

describe('ReflectionListItem', () => {
  it('shows week range, duration, topic and preacher, linking to the detail', () => {
    render(<ReflectionListItem reflection={r()} />)
    expect(screen.getByText('25 al 31 de octubre · 12 min')).toBeTruthy()
    expect(screen.getByText('Las Bienaventuranzas')).toBeTruthy()
    expect(screen.getByText('Hno. Nombre Apellido')).toBeTruthy()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/reflexiones/tema')
  })

  it('omits the duration when missing', () => {
    render(<ReflectionListItem reflection={r({ durationMinutes: null })} />)
    expect(screen.getByText('25 al 31 de octubre')).toBeTruthy()
    expect(screen.queryByText(/min/)).toBeNull()
  })
})
