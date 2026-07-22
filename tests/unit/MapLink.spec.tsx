import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { MapLink, hasLocation } from '@/components/community/MapLink'

describe('hasLocation', () => {
  it('es falso sin ubicacion', () => {
    expect(hasLocation(null)).toBe(false)
    expect(hasLocation({})).toBe(false)
    expect(hasLocation({ address: '', mapUrl: null })).toBe(false)
  })

  it('es verdadero con direccion o con enlace', () => {
    expect(hasLocation({ address: 'Cantón Las Cruces' })).toBe(true)
    expect(hasLocation({ mapUrl: 'https://maps.app.goo.gl/x' })).toBe(true)
  })
})

describe('MapLink', () => {
  it('muestra la direccion escrita', () => {
    render(<MapLink location={{ address: 'Cantón Las Cruces, Ciudad Arce' }} />)
    expect(screen.getByText('Cantón Las Cruces, Ciudad Arce')).toBeDefined()
  })

  it('muestra el boton del mapa apuntando al enlace', () => {
    render(
      <MapLink location={{ address: 'Cantón Las Cruces', mapUrl: 'https://maps.app.goo.gl/x' }} />,
    )
    const link = screen.getByRole('link', { name: /ver en el mapa/i })
    expect(link.getAttribute('href')).toBe('https://maps.app.goo.gl/x')
    expect(link.getAttribute('rel')).toContain('noopener')
  })

  // La red de seguridad de la migracion: si quedo un link viejo dentro de
  // `address`, se trata como enlace y NUNCA se imprime como texto.
  it('no imprime una URL cruda cuando el enlace quedo en la direccion', () => {
    render(<MapLink location={{ address: 'https://maps.app.goo.gl/viejo' }} />)
    expect(screen.queryByText('https://maps.app.goo.gl/viejo')).toBeNull()
    const link = screen.getByRole('link', { name: /ver en el mapa/i })
    expect(link.getAttribute('href')).toBe('https://maps.app.goo.gl/viejo')
  })

  it('prefiere mapUrl cuando la direccion tambien es un enlace', () => {
    render(
      <MapLink
        location={{
          address: 'https://maps.app.goo.gl/viejo',
          mapUrl: 'https://maps.app.goo.gl/nuevo',
        }}
      />,
    )
    expect(screen.getByRole('link').getAttribute('href')).toBe('https://maps.app.goo.gl/nuevo')
  })

  it('no renderiza nada sin ubicacion', () => {
    const { container } = render(<MapLink location={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('muestra solo el boton cuando hay enlace pero no direccion', () => {
    render(<MapLink location={{ mapUrl: 'https://maps.app.goo.gl/x' }} />)
    expect(screen.getByRole('link', { name: /ver en el mapa/i })).toBeDefined()
  })

  // `linkless` existe para la tarjeta del listado, que YA es un <Link>. Una <a>
  // dentro de otra <a> es HTML invalido y el navegador la saca del DOM.
  it('en modo linkless no dibuja ningun enlace', () => {
    render(
      <MapLink location={{ address: 'Cantón Las Cruces', mapUrl: 'https://x.com' }} linkless />,
    )
    expect(screen.getByText('Cantón Las Cruces')).toBeDefined()
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('en modo linkless no imprime la URL cuando no hay direccion escrita', () => {
    const { container } = render(<MapLink location={{ mapUrl: 'https://x.com' }} linkless />)
    expect(container.textContent).not.toContain('https://')
  })
})
