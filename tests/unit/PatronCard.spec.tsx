import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PatronCard } from '@/components/community/PatronCard'

describe('PatronCard', () => {
  it('muestra el nombre del patrono', () => {
    render(<PatronCard patron={{ name: 'San Jerónimo' }} feasts={null} />)
    expect(screen.getByText('San Jerónimo')).toBeDefined()
  })

  it('muestra cada fiesta con su nombre y su fecha', () => {
    render(
      <PatronCard
        patron={null}
        feasts={[
          { name: 'Santa Teresita del Niño Jesús', day: 1, month: '10' },
          { name: 'San Francisco Javier', day: 3, month: '12' },
        ]}
      />,
    )
    expect(screen.getByText('Santa Teresita del Niño Jesús')).toBeDefined()
    expect(screen.getByText(/1 de octubre/)).toBeDefined()
    expect(screen.getByText(/3 de diciembre/)).toBeDefined()
  })

  it('muestra la imagen con su texto alternativo', () => {
    // El tipo `Media` generado exige createdAt/updatedAt y media docena mas de
    // campos que el componente no lee. Se fuerza a proposito: lo que se prueba
    // es el render, no el tipo.
    const image = {
      id: 1,
      url: '/inmaculada.jpg',
      alt: 'Imagen de la Inmaculada Concepción',
    } as never
    render(<PatronCard patron={{ name: null, image }} feasts={null} />)
    expect(screen.getByAltText('Imagen de la Inmaculada Concepción')).toBeDefined()
  })

  it('no renderiza nada si el grupo no tiene patrono', () => {
    const { container } = render(<PatronCard patron={null} feasts={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada si el patrono viene vacio y las fiestas tambien', () => {
    const { container } = render(<PatronCard patron={{ name: null }} feasts={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('ignora una fiesta sin nombre', () => {
    // Misma guarda que ChapelCard: una fiesta sin nombre no se muestra. Y si es
    // la unica cosa que tiene el grupo, la tarjeta entera no se dibuja.
    const sinNombre = [{ day: 1, month: '10' }] as never
    const { container } = render(<PatronCard patron={null} feasts={sinNombre} />)
    expect(container.firstChild).toBeNull()
  })
})
