import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ContactLinks, hasContact } from '@/components/community/ContactLinks'

describe('hasContact', () => {
  it('es false con nada cargado', () => {
    expect(hasContact(null)).toBe(false)
    expect(hasContact(undefined)).toBe(false)
    expect(hasContact({})).toBe(false)
    expect(hasContact({ socialLinks: [] })).toBe(false)
  })

  it('es true con cualquier dato', () => {
    expect(hasContact({ phone: '2222-2222' })).toBe(true)
    expect(hasContact({ socialLinks: [{ platform: 'facebook', url: 'https://f.com/x' }] })).toBe(
      true,
    )
  })
})

describe('ContactLinks', () => {
  it('arma el enlace de WhatsApp con solo digitos', () => {
    render(<ContactLinks contact={{ whatsapp: '7777-7777' }} />)
    const link = screen.getByRole('link', { name: /7777-7777/ })
    expect(link.getAttribute('href')).toBe('https://wa.me/77777777')
  })

  it('arma mailto para el correo y tel para el telefono', () => {
    render(<ContactLinks contact={{ email: 'a@b.sv', phone: '2222-2222' }} />)
    expect(screen.getByRole('link', { name: 'a@b.sv' }).getAttribute('href')).toBe('mailto:a@b.sv')
    expect(screen.getByRole('link', { name: '2222-2222' }).getAttribute('href')).toBe(
      'tel:2222-2222',
    )
  })

  it('muestra las redes con su nombre legible', () => {
    render(
      <ContactLinks
        contact={{ socialLinks: [{ platform: 'facebook', url: 'https://facebook.com/parroquia' }] }}
      />,
    )
    const link = screen.getByRole('link', { name: 'Facebook' })
    expect(link.getAttribute('href')).toBe('https://facebook.com/parroquia')
  })

  it('descarta una red sin url', () => {
    const { container } = render(
      <ContactLinks contact={{ socialLinks: [{ platform: 'facebook', url: null }] }} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada sin datos', () => {
    const { container } = render(<ContactLinks contact={null} />)
    expect(container.firstChild).toBeNull()
  })
})
