import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { SponsorInvite } from '@/components/sponsors/SponsorInvite'

describe('SponsorInvite', () => {
  it('links to /contacto with the approved copy', () => {
    render(<SponsorInvite />)
    expect(
      screen.getByRole('heading', { name: '¿Tenés un negocio y querés colaborar?' }),
    ).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Contactar a la parroquia' }).getAttribute('href'),
    ).toBe('/contacto')
  })
})
