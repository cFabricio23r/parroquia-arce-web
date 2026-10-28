import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SponsorStrip } from '@/components/sponsors/SponsorStrip'
import { makeSponsor } from './sponsor-fixtures'

describe('SponsorStrip', () => {
  it('renders nothing without sponsors', () => {
    expect(render(<SponsorStrip sponsors={[]} />).container.innerHTML).toBe('')
  })

  it('heading reads "Gracias a quienes sostienen esta página"', () => {
    render(<SponsorStrip sponsors={[makeSponsor()]} />)
    expect(
      screen.getByRole('heading', { name: 'Gracias a quienes sostienen esta página' }),
    ).toBeTruthy()
    expect(screen.getByText('Con gratitud')).toBeTruthy()
  })

  it('every logo links to /patrocinadores and keeps its alt', () => {
    render(
      <SponsorStrip
        sponsors={[makeSponsor(), makeSponsor({
            id: '2',
            name: 'Ferretería Luz',
            logo: { url: 'https://example.supabase.co/f.png', alt: 'Logo de Ferretería Luz' },
          })]}
      />,
    )
    const tiles = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/patrocinadores')
    // 2 logos + the "Conocé a nuestros patrocinadores →" link
    expect(tiles.length).toBe(3)
    expect(screen.getByRole('link', { name: /Conocé a nuestros patrocinadores/ })).toBeTruthy()
    const img = screen.getByAltText('Logo de Panadería San José')
    expect(img.className).toContain('object-contain')
    expect(img.closest('a')?.getAttribute('href')).toBe('/patrocinadores')
  })
})
