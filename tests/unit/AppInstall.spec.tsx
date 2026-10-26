import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppInstall } from '@/components/site/app/AppInstall'
import type { AppDownload } from '@/lib/app-download'

const url =
  'https://github.com/x/parroquia-arce-releases/releases/latest/download/parroquia-ciudad-arce.apk'
const lista: AppDownload = { ready: true, url, version: '0.1.0', sizeMb: 135, screenshots: [] }

describe('AppInstall', () => {
  it('lista: region con los pasos, el aviso y el enlace final de descarga', () => {
    render(<AppInstall download={lista} />)
    const region = screen.getByRole('region', { name: /Cómo instalarla/ })
    expect(within(region).getAllByRole('listitem').length).toBeGreaterThanOrEqual(4)
    expect(region.textContent).toMatch(/apps desconocidas/)
    const link = within(region).getByRole('link', { name: 'Descargar para Android' })
    expect(link.getAttribute('href')).toBe(url)
  })

  it('apagada: no renderiza nada', () => {
    const { container } = render(<AppInstall download={{ ready: false }} />)
    expect(container.innerHTML).toBe('')
  })
})
