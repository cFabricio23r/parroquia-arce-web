import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppPageBody } from '@/components/site/app/AppPageBody'
import type { AppDownload } from '@/lib/app-download'

const url =
  'https://github.com/x/parroquia-arce-releases/releases/latest/download/parroquia-ciudad-arce.apk'
const lista: AppDownload = { ready: true, url, version: '0.1.0', sizeMb: 135 }
const TOUR = ['Radio en vivo', 'Rezar', 'Agenda y horarios', 'Comunidad']

describe('AppPageBody — descarga apagada', () => {
  it('sin APK, sin QR, sin instalacion, pero con el recorrido', () => {
    render(<AppPageBody download={{ ready: false }} />)
    const apks = screen.queryAllByRole('link').filter((a) => a.getAttribute('href')?.endsWith('.apk'))
    expect(apks).toEqual([])
    expect(screen.queryByRole('img', { name: /código QR/i })).toBeNull()
    expect(screen.queryByRole('region', { name: /Cómo instalarla/ })).toBeNull()
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names).toEqual(TOUR)
  })
})

describe('AppPageBody — descarga lista', () => {
  it('tiene exactamente un h1', () => {
    render(<AppPageBody download={lista} />)
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
  })

  it('las tiendas figuran como proximamente, sin enlace', () => {
    render(<AppPageBody download={lista} />)
    expect(screen.getByText(/Próximamente en Google Play y App Store/)).toBeTruthy()
    const links = screen.getAllByRole('link')
    expect(links.every((a) => !/google play|app store/i.test(a.textContent ?? ''))).toBe(true)
  })

  it('incluye hero, recorrido e instalacion', () => {
    render(<AppPageBody download={lista} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Qué trae la app' })).toBeTruthy()
    expect(screen.getByRole('region', { name: /Cómo instalarla/ })).toBeTruthy()
  })
})
