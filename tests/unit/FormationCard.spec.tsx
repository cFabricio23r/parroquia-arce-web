import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { FormationCard } from '@/components/news/FormationCard'
import type { Formation } from '@/payload-types'

const base: Formation = {
  id: 1,
  title: 'Vivir la fe en lo cotidiano',
  slug: 'vivir-la-fe',
  excerpt: 'Una serie breve.',
  category: 'serie',
  audience: 'jovenes',
  status: 'published',
  updatedAt: '2026-01-01',
  createdAt: '2026-01-01',
} as Formation

describe('FormationCard', () => {
  it('muestra el titulo, excerpt y la audiencia legible', () => {
    render(<FormationCard item={base} />)
    expect(screen.getByRole('heading', { name: 'Vivir la fe en lo cotidiano' })).toBeDefined()
    expect(screen.getByText('Una serie breve.')).toBeDefined()
    expect(screen.getByText('Para jóvenes')).toBeDefined()
  })

  it('muestra la categoria legible', () => {
    render(<FormationCard item={base} />)
    expect(screen.getByText('Serie')).toBeDefined()
  })

  it('no renderiza un <a> (todavia no hay pagina de detalle)', () => {
    const { container } = render(<FormationCard item={base} />)
    expect(container.querySelector('a')).toBeNull()
  })

  it('no rompe cuando no hay cover', () => {
    render(<FormationCard item={{ ...base, cover: null }} />)
    expect(screen.getByRole('heading', { name: 'Vivir la fe en lo cotidiano' })).toBeDefined()
  })
})
