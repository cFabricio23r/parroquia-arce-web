import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppDownloadSections } from '@/components/site/AppDownloadSections'
import type { AppDownload } from '@/lib/app-download'

const url =
  'https://github.com/x/parroquia-arce-releases/releases/latest/download/parroquia-ciudad-arce.apk'
const lista: AppDownload = { ready: true, url, version: '0.1.0', sizeMb: 135, screenshots: [] }

describe('AppDownloadSections — descarga lista', () => {
  it('el boton descarga el APK directo', () => {
    render(<AppDownloadSections download={lista} />)
    const boton = screen.getByRole('link', { name: /Descargar para Android/ })
    expect(boton.getAttribute('href')).toBe(url)
    expect(screen.getByText('Versión 0.1.0 · 135 MB')).toBeTruthy()
    expect(screen.getByText(/Wi-Fi/)).toBeTruthy()
  })

  it('explica la instalacion en pasos numerados', () => {
    render(<AppDownloadSections download={lista} />)
    const pasos = screen.getByRole('region', { name: /Cómo instalarla/ })
    expect(within(pasos).getAllByRole('listitem').length).toBeGreaterThanOrEqual(4)
    expect(pasos.textContent).toMatch(/apps desconocidas/)
  })

  it('las tiendas figuran como proximamente, sin enlace', () => {
    render(<AppDownloadSections download={lista} />)
    expect(screen.getByText(/Próximamente en Google Play y App Store/)).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links.every((a) => !/google play|app store/i.test(a.textContent ?? ''))).toBe(true)
  })

  it('sin version ni peso no deja separadores sueltos', () => {
    const { container } = render(
      <AppDownloadSections download={{ ...lista, version: null, sizeMb: null }} />,
    )
    expect(container.textContent).not.toMatch(/Versión\s*·|undefined|null/)
  })

  it('dibuja las capturas con su alt, en una franja enfocable por teclado', () => {
    render(
      <AppDownloadSections
        download={{ ...lista, screenshots: [{ url: '/a.png', alt: 'Inicio de la app' }] }}
      />,
    )
    expect(screen.getByAltText('Inicio de la app')).toBeTruthy()
    const franja = screen.getByRole('region', { name: 'Capturas de la app' })
    expect(franja.getAttribute('tabindex')).toBe('0')
  })

  // Quien escanea el QR desde el celular tiene que ver el boton sin bajar cuatro tarjetas.
  it('el boton de descarga va antes que la lista de lo que trae', () => {
    render(<AppDownloadSections download={lista} />)
    const boton = screen.getByRole('link', { name: /Descargar para Android/ })
    const lista_ = screen.getByRole('list', { name: /Qué trae/ })
    expect(boton.compareDocumentPosition(lista_) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('no promete avisos que nadie va a mandar', () => {
    const { container } = render(<AppDownloadSections download={lista} />)
    expect(container.textContent).not.toMatch(/avisaremos/i)
  })
})

describe('AppDownloadSections — descarga no lista', () => {
  it('dice muy pronto, sin boton de descarga, con radio y horarios', () => {
    render(<AppDownloadSections download={{ ready: false }} />)
    expect(screen.getByRole('heading', { name: /disponible muy pronto/ })).toBeTruthy()
    expect(screen.queryByRole('link', { name: /Descargar/ })).toBeNull()
    expect(screen.getByRole('link', { name: /radio/i }).getAttribute('href')).toBe('/radio')
    expect(screen.getByRole('link', { name: /horarios/i }).getAttribute('href')).toBe('/horarios')
  })
})
