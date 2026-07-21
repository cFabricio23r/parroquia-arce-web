import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhotoGallery } from '@/components/community/PhotoGallery'
import type { Media } from '@/payload-types'

const media = (id: number, alt: string, caption?: string): Media =>
  ({ id, alt, caption, url: `/foto-${id}.jpg`, updatedAt: '', createdAt: '' }) as Media

describe('PhotoGallery', () => {
  it('renderiza una imagen por foto, con su alt', () => {
    render(<PhotoGallery images={[media(1, 'Retiro de jóvenes'), media(2, 'Patronales')]} />)
    expect(screen.getByAltText('Retiro de jóvenes')).toBeDefined()
    expect(screen.getByAltText('Patronales')).toBeDefined()
  })

  it('muestra el caption de la media cuando existe', () => {
    render(<PhotoGallery images={[media(1, 'Gente cantando', 'Retiro de Semana Santa')]} />)
    expect(screen.getByText('Retiro de Semana Santa')).toBeDefined()
  })

  it('no repite el alt como pie de foto cuando no hay caption', () => {
    render(<PhotoGallery images={[media(1, 'Gente cantando')]} />)
    expect(screen.queryByText('Gente cantando')).toBeNull()
  })

  it('muestra el encabezado Galeria', () => {
    render(<PhotoGallery images={[media(1, 'Una foto')]} />)
    expect(screen.getByRole('heading', { name: 'Galería' })).toBeDefined()
  })

  it('descarta las imagenes sin poblar (ids sueltos)', () => {
    const { container } = render(<PhotoGallery images={[3, 4]} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada si no hay imagenes', () => {
    const { container } = render(<PhotoGallery images={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada si images es null', () => {
    const { container } = render(<PhotoGallery images={null} />)
    expect(container.firstChild).toBeNull()
  })
})
