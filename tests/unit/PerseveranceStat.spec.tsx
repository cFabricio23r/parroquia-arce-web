import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PerseveranceStat } from '@/components/community/PerseveranceStat'

describe('PerseveranceStat', () => {
  it('muestra el numero y la etiqueta', () => {
    render(<PerseveranceStat count={45} label="familias activas" />)
    expect(screen.getByText('45')).toBeDefined()
    expect(screen.getByText('familias activas')).toBeDefined()
  })

  it('cae a la etiqueta por defecto si viene vacia', () => {
    render(<PerseveranceStat count={12} label={null} />)
    expect(screen.getByText('miembros que perseveran')).toBeDefined()
  })

  it('no renderiza nada si no hay numero', () => {
    const { container } = render(<PerseveranceStat count={null} label="lo que sea" />)
    expect(container.firstChild).toBeNull()
  })

  it('renderiza el cero como dato valido', () => {
    render(<PerseveranceStat count={0} label="miembros" />)
    expect(screen.getByText('0')).toBeDefined()
  })
})
