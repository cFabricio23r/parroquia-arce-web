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

  it('large tiles: 2/3/4 per row and the name wraps instead of being cut to one line', () => {
    const { container } = render(<SponsorStrip sponsors={[makeSponsor()]} />)
    const list = container.querySelector('ul')
    expect(list?.className).toContain('grid-cols-2')
    expect(list?.className).toContain('md:grid-cols-3')
    expect(list?.className).toContain('lg:grid-cols-4')
    // Cuadrado en la imagen misma: una caja grid con h-full recortaba el logo.
    const img = container.querySelector('img')
    expect(img?.className).toContain('aspect-square')
    expect(img?.parentElement?.className).not.toContain('overflow-hidden')
    const name = screen.getByText('Panadería San José')
    expect(name.className).not.toContain('line-clamp-1')
  })

  it('every logo links to /patrocinadores, named once by the business', () => {
    const { container } = render(
      <SponsorStrip
        sponsors={[
          makeSponsor(),
          makeSponsor({
            id: '2',
            name: 'Ferretería Luz',
            logo: { url: 'https://example.supabase.co/f.png', alt: 'Logo de Ferretería Luz' },
          }),
        ]}
      />,
    )
    const tiles = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/patrocinadores')
    // 2 logos + the "Conocé a nuestros patrocinadores →" link
    expect(tiles.length).toBe(3)
    expect(screen.getByRole('link', { name: /Conocé a nuestros patrocinadores/ })).toBeTruthy()
    // The visible name labels the tile; the logo is decorative here so the name is not read twice.
    const tile = screen.getByRole('link', { name: 'Ferretería Luz' })
    expect(tile.getAttribute('href')).toBe('/patrocinadores')
    const img = tile.querySelector('img')
    expect(img?.getAttribute('alt')).toBe('')
    expect(img?.className).toContain('object-contain')
    expect(container.querySelectorAll('img').length).toBe(2)
  })
})
