import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { TeamList } from '@/components/community/TeamList'
import type { Media } from '@/payload-types'

describe('TeamList', () => {
  it('muestra nombre y rol de cada integrante', () => {
    render(
      <TeamList
        members={[
          { name: 'Ana Morales', role: 'Coordinadora' },
          { name: 'Luis Peña', role: 'Asistente' },
        ]}
      />,
    )
    expect(screen.getByText('Ana Morales')).toBeDefined()
    expect(screen.getByText('Coordinadora')).toBeDefined()
    expect(screen.getByText('Luis Peña')).toBeDefined()
  })

  it('no rompe cuando un integrante no tiene rol', () => {
    render(<TeamList members={[{ name: 'Rosa Díaz' }]} />)
    expect(screen.getByText('Rosa Díaz')).toBeDefined()
  })

  it('usa el alt de la media en la foto', () => {
    const photo = {
      id: 1,
      alt: 'Ana sonriendo',
      url: '/ana.jpg',
      updatedAt: '',
      createdAt: '',
    } as Media
    render(<TeamList members={[{ name: 'Ana Morales', role: 'Coordinadora', photo }]} />)
    expect(screen.getByAltText('Ana sonriendo')).toBeDefined()
  })

  it('no renderiza nada si no hay integrantes', () => {
    const { container } = render(<TeamList members={[]} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada si members es null', () => {
    const { container } = render(<TeamList members={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('usa la lista angosta por defecto, con su encabezado', () => {
    const { container } = render(<TeamList members={[{ name: 'Ana' }]} />)
    expect(screen.getByText('Equipo')).toBeDefined()
    expect(container.querySelector('ul')).not.toBeNull()
  })

  // En `grid` el encabezado lo pone la pagina: la seccion necesita su propio h2
  // con el mismo tratamiento que Historia y Galeria. Dibujar uno aca daria dos
  // "Equipo" anidados.
  it('en variante grid no dibuja su propio encabezado', () => {
    render(<TeamList members={[{ name: 'Ana' }]} variant="grid" />)
    expect(screen.queryByText('Equipo')).toBeNull()
    expect(screen.getByText('Ana')).toBeDefined()
  })

  it('muestra a todos los integrantes en variante grid', () => {
    const members = Array.from({ length: 13 }, (_, i) => ({ name: `Persona ${i + 1}` }))
    render(<TeamList members={members} variant="grid" />)
    expect(screen.getAllByText(/^Persona /)).toHaveLength(13)
  })
})
