import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ChapelCard } from '@/components/community/ChapelCard'
import type { Chapel } from '@/payload-types'

const base = {
  id: 1,
  name: 'Ermita Concepción',
  slug: 'ermita-concepcion',
  sector: 1,
  status: 'published',
  updatedAt: '',
  createdAt: '',
} as Chapel

describe('ChapelCard', () => {
  it('muestra el nombre y el patrono', () => {
    render(<ChapelCard chapel={{ ...base, patronOrDedication: 'Inmaculada Concepción' }} />)
    expect(screen.getByRole('heading', { name: 'Ermita Concepción' })).toBeDefined()
    expect(screen.getByText('Inmaculada Concepción')).toBeDefined()
  })

  it('formatea las fiestas patronales sin año', () => {
    render(
      <ChapelCard
        chapel={{
          ...base,
          patronalFeasts: [
            { name: 'Novena', day: 29, month: '11' },
            { name: 'Fiesta principal', day: 8, month: '12' },
          ],
        }}
      />,
    )
    expect(screen.getByText(/29 de noviembre/)).toBeDefined()
    expect(screen.getByText(/8 de diciembre/)).toBeDefined()
    expect(screen.getByText('Fiesta principal')).toBeDefined()
  })

  it('muestra una linea por horario de misa', () => {
    render(
      <ChapelCard chapel={{ ...base, massSchedule: 'Domingo 8:00 a.m.\nMiércoles 6:00 p.m.' }} />,
    )
    expect(screen.getByText('Domingo 8:00 a.m.')).toBeDefined()
    expect(screen.getByText('Miércoles 6:00 p.m.')).toBeDefined()
  })

  it('muestra el contacto de la ermita', () => {
    render(<ChapelCard chapel={{ ...base, contact: { whatsapp: '7777-7777' } }} />)
    expect(screen.getByRole('link', { name: /7777-7777/ })).toBeDefined()
  })

  it('sin fiestas no muestra el encabezado de fiestas', () => {
    render(<ChapelCard chapel={base} />)
    expect(screen.queryByText('Fiestas patronales')).toBeNull()
  })

  it('sin nada opcional sigue mostrando el nombre', () => {
    render(<ChapelCard chapel={base} />)
    expect(screen.getByRole('heading', { name: 'Ermita Concepción' })).toBeDefined()
  })
})
