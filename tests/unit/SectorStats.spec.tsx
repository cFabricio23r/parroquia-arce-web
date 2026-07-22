import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectorStats } from '@/components/community/SectorStats'

describe('SectorStats', () => {
  it('muestra la perseverancia con su etiqueta', () => {
    render(<SectorStats perseverance={{ count: 40, label: 'miembros que perseveran' }} />)
    expect(screen.getByText('40')).toBeDefined()
    expect(screen.getByText('miembros que perseveran')).toBeDefined()
  })

  it('cae a la etiqueta por defecto', () => {
    render(<SectorStats perseverance={{ count: 40, label: null }} />)
    expect(screen.getByText('miembros que perseveran')).toBeDefined()
  })

  // Asimetria deliberada: la perseverancia en 0 SE MUESTRA (alguien la cargo,
  // cero es una respuesta), pero un equipo de 0 no (nadie cargo nada, no es un
  // dato sino una ausencia).
  it('renderiza la perseverancia en cero como dato valido', () => {
    render(<SectorStats perseverance={{ count: 0, label: 'miembros' }} />)
    expect(screen.getByText('0')).toBeDefined()
  })

  it('pluraliza equipo, ermitas y grupos', () => {
    render(<SectorStats teamCount={13} chapelCount={2} groupCount={3} />)
    expect(screen.getByText('personas en el equipo')).toBeDefined()
    expect(screen.getByText('ermitas')).toBeDefined()
    expect(screen.getByText('grupos')).toBeDefined()
  })

  it('usa el singular cuando corresponde', () => {
    render(<SectorStats teamCount={1} chapelCount={1} groupCount={1} />)
    expect(screen.getByText('persona en el equipo')).toBeDefined()
    expect(screen.getByText('ermita')).toBeDefined()
    expect(screen.getByText('grupo')).toBeDefined()
  })

  it('omite los conteos en cero', () => {
    render(<SectorStats teamCount={0} chapelCount={0} groupCount={5} />)
    expect(screen.queryByText(/equipo/)).toBeNull()
    expect(screen.queryByText(/ermita/)).toBeNull()
    expect(screen.getByText('grupos')).toBeDefined()
  })

  it('no renderiza nada cuando no hay ningun dato', () => {
    const { container } = render(<SectorStats />)
    expect(container.firstChild).toBeNull()
  })

  // Tailwind escanea el fuente como texto plano: una clase construida en runtime
  // (`grid-cols-${n}`) no se genera nunca. Las clases van literales.
  it('ajusta las columnas a la cantidad de estadisticas', () => {
    const { container } = render(<SectorStats perseverance={{ count: 40 }} teamCount={13} />)
    expect(container.querySelector('.grid-cols-2')).not.toBeNull()
  })
})
