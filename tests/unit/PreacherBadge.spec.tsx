import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { PreacherBadge, initials } from '@/components/reflections/PreacherBadge'

describe('initials', () => {
  it('ignores Hno./Hna./Fr.', () => {
    expect(initials('Hno. Nombre Apellido')).toBe('NA')
    expect(initials('Hna. Ana Pérez')).toBe('AP')
    expect(initials('Fr. Luis Gómez')).toBe('LG')
  })
})

describe('PreacherBadge', () => {
  it('shows the photo with its alt and the visible name', () => {
    render(
      <PreacherBadge
        name="Hno. Nombre Apellido"
        photo={{ url: 'https://x.test/p.jpg', alt: 'Retrato del hermano' }}
        tone="dark"
      />,
    )
    expect(screen.getByAltText('Retrato del hermano')).toBeTruthy()
    expect(screen.getByText('Hno. Nombre Apellido')).toBeTruthy()
  })

  it('falls back to aria-hidden initials', () => {
    render(<PreacherBadge name="Hno. Nombre Apellido" photo={null} tone="light" />)
    const el = screen.getByText('NA')
    expect(el.getAttribute('aria-hidden')).toBe('true')
    expect(screen.getByText('Hno. Nombre Apellido')).toBeTruthy()
  })
})
