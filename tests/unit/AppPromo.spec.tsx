import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppPromo } from '@/components/site/AppPromo'

const url =
  'https://github.com/x/parroquia-arce-releases/releases/latest/download/parroquia-ciudad-arce.apk'

describe('AppPromo', () => {
  it('no dibuja nada si la descarga no esta lista', () => {
    const { container } = render(<AppPromo download={{ ready: false }} />)
    expect(container.innerHTML).toBe('')
  })

  // Lleva a /app y no al APK: la persona lee primero como instalarla.
  it('lista: enlaza a /app, nunca al APK', () => {
    render(
      <AppPromo download={{ ready: true, url, version: '0.1.0', sizeMb: 135, screenshots: [] }} />,
    )
    const link = screen.getByRole('link', { name: /Descargá la app/ })
    expect(link.getAttribute('href')).toBe('/app')
    expect(screen.getByText(/Próximamente en Google Play y App Store/)).toBeTruthy()
  })
})
