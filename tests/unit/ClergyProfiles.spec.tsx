import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ClergyProfiles } from '@/components/community/ClergyProfiles'
import { assistant, biography, priest } from './clergy-fixtures'
import type { Media } from '@/payload-types'

describe('ClergyProfiles', () => {
  it('orienta a Contacto cuando no hay información publicada', () => {
    render(<ClergyProfiles profiles={[]} />)
    expect(screen.getByText(/Pronto compartiremos/)).toBeTruthy()
    expect(
      screen.getByRole('link', { name: 'Contactar con la parroquia' }).getAttribute('href'),
    ).toBe('/contacto')
  })
  it('muestra las historias bajo anclas estables y encabezados', () => {
    render(<ClergyProfiles profiles={[priest, assistant]} />)
    expect(
      screen.getByRole('heading', { name: priest.name, level: 2 }).closest('article')?.id,
    ).toBe('parroco')
    expect(
      screen.getByRole('heading', { name: assistant.name, level: 2 }).closest('article')?.id,
    ).toBe('auxiliar')
    expect(screen.getAllByText('Una historia de vocación y servicio.')).toHaveLength(2)
    expect(screen.queryByText(priest.summary)).toBeNull()
  })
  it.each([null, { ...biography, root: { ...biography.root, children: [] } }])(
    'usa el resumen una vez si la historia está vacía',
    (empty) => {
      render(<ClergyProfiles profiles={[{ ...priest, biography: empty }]} />)
      expect(screen.getAllByText(priest.summary)).toHaveLength(1)
    },
  )
  it('mantiene nombres y cargos largos sin truncarlos', () => {
    const name = 'Nombre compuesto de un sacerdote de la comunidad parroquial'
    const role = 'Sacerdote auxiliar al servicio de las comunidades de Ciudad Arce'
    render(<ClergyProfiles profiles={[{ ...priest, name, role, photo: null }]} />)
    expect(screen.getByRole('heading', { name })).toBeTruthy()
    expect(screen.getByText(role)).toBeTruthy()
    expect(screen.queryByRole('img')).toBeNull()
  })
  it('omite un archivo de audio elegido como retrato', () => {
    const photo = { id: 12, url: '/audio.mp3', alt: 'Audio', mimeType: 'audio/mpeg' } as Media
    render(<ClergyProfiles profiles={[{ ...priest, photo }]} />)
    expect(screen.queryByRole('img')).toBeNull()
  })
})
