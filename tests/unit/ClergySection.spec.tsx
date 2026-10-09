import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ClergySection } from '@/components/community/ClergySection'
import { assistant, priest } from './clergy-fixtures'
import type { Media } from '@/payload-types'

describe('ClergySection', () => {
  it('no dibuja una sección sin perfiles', () => {
    expect(render(<ClergySection profiles={[]} />).container.innerHTML).toBe('')
  })
  it('presenta al párroco con foto, cargo, resumen y enlace específico', () => {
    render(<ClergySection profiles={[priest]} />)
    expect(screen.getByRole('heading', { name: priest.name, level: 3 })).toBeTruthy()
    expect(screen.getByText(priest.role)).toBeTruthy()
    expect(screen.getByText(priest.summary)).toBeTruthy()
    expect(screen.getByAltText('Retrato de prueba').getAttribute('src')).toBe('/portrait.jpg')
    expect(
      screen
        .getByRole('link', { name: `Conocer la historia de ${priest.name}` })
        .getAttribute('href'),
    ).toBe('/sacerdotes#parroco')
    expect(screen.queryByText('Una historia de vocación y servicio.')).toBeNull()
  })
  it('presenta ambos y enlaza al auxiliar', () => {
    render(<ClergySection profiles={[priest, assistant]} />)
    expect(screen.getAllByRole('article')).toHaveLength(2)
    expect(
      screen
        .getByRole('link', { name: `Conocer la historia de ${assistant.name}` })
        .getAttribute('href'),
    ).toBe('/sacerdotes#auxiliar')
  })
  it.each([null, 10])('no fabrica una imagen cuando la relación no tiene foto: %s', (photo) => {
    render(<ClergySection profiles={[{ ...priest, photo }]} />)
    expect(screen.queryByRole('img')).toBeNull()
    expect(screen.getByText(priest.name)).toBeTruthy()
  })
  it('no muestra PDF o audio como retrato', () => {
    const photo = {
      id: 12,
      url: '/document.pdf',
      alt: 'Documento',
      mimeType: 'application/pdf',
    } as Media
    render(<ClergySection profiles={[{ ...priest, photo }]} />)
    expect(screen.queryByRole('img')).toBeNull()
  })
})
