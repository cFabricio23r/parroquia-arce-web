import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SponsorCard } from '@/components/sponsors/SponsorCard'
import { makeSponsor } from './sponsor-fixtures'

describe('SponsorCard', () => {
  it('renders only the network buttons that are loaded', () => {
    render(<SponsorCard sponsor={makeSponsor({ facebookUrl: null })} />)
    expect(
      screen.getByRole('link', {
        name: 'Panadería San José en Instagram (se abre en otra pestaña)',
      }),
    ).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Facebook/ })).toBeNull()
  })

  it('opens external links in a new tab safely', () => {
    render(<SponsorCard sponsor={makeSponsor()} />)
    const fb = screen.getByRole('link', {
      name: 'Panadería San José en Facebook (se abre en otra pestaña)',
    })
    const ig = screen.getByRole('link', {
      name: 'Panadería San José en Instagram (se abre en otra pestaña)',
    })
    for (const a of [fb, ig]) {
      expect(a.getAttribute('target')).toBe('_blank')
      expect(a.getAttribute('rel')).toBe('noopener noreferrer')
    }
    expect(fb.getAttribute('href')).toBe('https://www.facebook.com/panaderia')
  })

  it('logo keeps its alt and uses object-contain', () => {
    render(<SponsorCard sponsor={makeSponsor()} />)
    const img = screen.getByAltText('Logo de Panadería San José')
    expect(img.getAttribute('src')).toBe('https://example.supabase.co/logo.png')
    expect(img.className).toContain('object-contain')
  })

  it('shows name, category and blurb, and hides the empty ones', () => {
    const { rerender } = render(<SponsorCard sponsor={makeSponsor()} />)
    expect(screen.getByRole('heading', { name: 'Panadería San José' })).toBeTruthy()
    expect(screen.getByText('Panadería')).toBeTruthy()
    expect(screen.getByText('Pan de cada día.')).toBeTruthy()
    rerender(<SponsorCard sponsor={makeSponsor({ category: null, blurb: null })} />)
    expect(screen.queryByText('Panadería')).toBeNull()
    expect(screen.queryByText('Pan de cada día.')).toBeNull()
  })
})
