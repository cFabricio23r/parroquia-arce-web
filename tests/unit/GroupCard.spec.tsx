import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { GroupCard } from '@/components/community/GroupCard'
import type { Group } from '@/payload-types'

const group = (over: Partial<Group> = {}): Group =>
  ({
    id: 1,
    name: 'Comisión de Formación',
    slug: 'comision-de-formacion',
    updatedAt: '',
    createdAt: '',
    ...over,
  }) as Group

describe('GroupCard', () => {
  it('muestra el nombre y enlaza al detalle', () => {
    render(<GroupCard group={group()} />)
    expect(screen.getByText('Comisión de Formación')).toBeDefined()
    expect(screen.getByRole('link').getAttribute('href')).toBe('/grupos/comision-de-formacion')
  })

  it('muestra el badge del tipo', () => {
    render(<GroupCard group={group({ type: 'formacion' })} />)
    expect(screen.getByText('Formación')).toBeDefined()
  })

  it('no muestra badge cuando el grupo no tiene tipo', () => {
    render(<GroupCard group={group({ type: null })} />)
    expect(screen.queryByText('Formación')).toBeNull()
    expect(screen.queryByText('Servicio')).toBeNull()
  })

  it('muestra la perseverancia con la etiqueta cargada', () => {
    render(<GroupCard group={group({ perseverance: { count: 12, label: 'familias activas' } })} />)
    expect(screen.getByText('12 familias activas')).toBeDefined()
  })

  it('cae a la etiqueta por defecto si viene vacia', () => {
    render(<GroupCard group={group({ perseverance: { count: 220, label: null } })} />)
    expect(screen.getByText('220 miembros que perseveran')).toBeDefined()
  })

  it('renderiza el cero como dato valido', () => {
    render(<GroupCard group={group({ perseverance: { count: 0, label: 'miembros' } })} />)
    expect(screen.getByText('0 miembros')).toBeDefined()
  })

  it('no muestra el renglon de perseverancia si no hay numero', () => {
    render(<GroupCard group={group({ perseverance: { count: null, label: 'miembros' } })} />)
    expect(screen.queryByText(/miembros/)).toBeNull()
  })

  it('muestra el resumen cuando existe y lo omite cuando no', () => {
    const { unmount } = render(<GroupCard group={group({ summary: 'Un resumen corto.' })} />)
    expect(screen.getByText('Un resumen corto.')).toBeDefined()
    unmount()
    render(<GroupCard group={group({ summary: null })} />)
    expect(screen.queryByText('Un resumen corto.')).toBeNull()
  })

  it('muestra dia, hora y lugar cuando estan cargados', () => {
    render(
      <GroupCard group={group({ meeting: { day: 'Sábado', time: '9:00 a.m.', place: 'Aulas' } })} />,
    )
    expect(screen.getByText('Sábado · 9:00 a.m.')).toBeDefined()
    expect(screen.getByText('Aulas')).toBeDefined()
  })

  it('usa h3 por defecto y h4 cuando se lo piden', () => {
    const { unmount } = render(<GroupCard group={group()} />)
    expect(screen.getByRole('heading', { level: 3 })).toBeDefined()
    unmount()
    render(<GroupCard group={group()} as="h4" />)
    expect(screen.getByRole('heading', { level: 4 })).toBeDefined()
  })

  it('siempre ofrece el CTA', () => {
    render(<GroupCard group={group()} />)
    expect(screen.getByText('Conocer más')).toBeDefined()
  })
})
