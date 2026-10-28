import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppHero } from '@/components/site/app/AppHero'
import type { AppDownload } from '@/lib/app-download'

const ready: AppDownload = {
  ready: true,
  url: 'https://example.com/app.apk',
  version: '0.1.0',
  sizeMb: 135,
}
const off: AppDownload = { ready: false }

describe('AppHero', () => {
  it('lista: titulo, boton de descarga y textos de apoyo', () => {
    render(<AppHero download={ready} />)
    expect(screen.getByRole('heading', { level: 1, name: /La parroquia, en tu celular/ })).toBeTruthy()
    const link = screen.getByRole('link', { name: /Descargar para Android/ })
    expect(link.getAttribute('href')).toBe('https://example.com/app.apk')
    expect(screen.getByText('Versión 0.1.0 · 135 MB')).toBeTruthy()
    expect(screen.getByText(/Wi-Fi/)).toBeTruthy()
    expect(screen.getByText(/Próximamente en Google Play y App Store/)).toBeTruthy()
  })

  it('lista: el QR solo se ve en escritorio', () => {
    render(<AppHero download={ready} />)
    const qr = screen.getByRole('img', { name: /código QR/i })
    const box = qr.closest('.hidden')!
    expect(box.className).toContain('hidden')
    expect(box.className).toContain('lg:block')
  })

  it('lista: la captura de inicio carga eager', () => {
    render(<AppHero download={ready} />)
    const img = screen.getByRole('img', { name: /Pantalla de inicio/ })
    expect(img.getAttribute('loading')).toBe('eager')
  })

  it('lista sin version ni peso: no deja restos', () => {
    const { container } = render(
      <AppHero download={{ ready: true, url: 'https://example.com/a.apk', version: null, sizeMb: null }} />,
    )
    expect(container.textContent).not.toMatch(/Versión\s*·|undefined|null/)
  })

  it('apagada: mensaje y salidas utiles, sin descarga ni QR', () => {
    render(<AppHero download={off} />)
    expect(screen.getByRole('heading', { level: 1, name: /disponible muy pronto/ })).toBeTruthy()
    expect(
      screen.getByText('Mientras tanto, podés escuchar la radio y consultar los horarios aquí en la web.'),
    ).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Escuchá la radio' }).getAttribute('href')).toBe('/radio')
    expect(screen.getByRole('link', { name: 'Ver los horarios' }).getAttribute('href')).toBe('/horarios')
    expect(screen.queryByRole('link', { name: /Descargar/ })).toBeNull()
    expect(screen.queryByRole('img', { name: /código QR/i })).toBeNull()
  })

  it.each([
    ['lista', ready],
    ['apagada', off],
  ])('%s: migas con Inicio', (_n, download) => {
    render(<AppHero download={download} />)
    expect(screen.getByText('App de la parroquia')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Inicio' }).getAttribute('href')).toBe('/')
  })
})
