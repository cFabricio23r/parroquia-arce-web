import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { SectorGroups } from '@/components/community/SectorGroups'
import type { Group } from '@/payload-types'

const group = (id: number, name: string, slug: string, status: string): Group =>
  ({ id, name, slug, status, updatedAt: '', createdAt: '' }) as Group

describe('SectorGroups', () => {
  it('enlaza cada grupo a su pagina de detalle', () => {
    render(<SectorGroups groups={[group(1, 'Pastoral Juvenil', 'pastoral-juvenil', 'published')]} />)
    const link = screen.getByRole('link', { name: 'Pastoral Juvenil' })
    expect(link.getAttribute('href')).toBe('/grupos/pastoral-juvenil')
  })

  it('DESCARTA los grupos que no estan publicados', () => {
    render(
      <SectorGroups
        groups={[
          group(1, 'Publicado', 'publicado', 'published'),
          group(2, 'Borrador', 'borrador', 'draft'),
          group(3, 'Archivado', 'archivado', 'archived'),
        ]}
      />,
    )
    expect(screen.getByRole('link', { name: 'Publicado' })).toBeDefined()
    expect(screen.queryByText('Borrador')).toBeNull()
    expect(screen.queryByText('Archivado')).toBeNull()
  })

  it('no renderiza nada si todos son borradores', () => {
    const { container } = render(
      <SectorGroups groups={[group(2, 'Borrador', 'borrador', 'draft')]} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('descarta los ids sin poblar', () => {
    const { container } = render(<SectorGroups groups={[7, 8]} />)
    expect(container.firstChild).toBeNull()
  })

  it('no renderiza nada si no hay grupos', () => {
    const { container } = render(<SectorGroups groups={null} />)
    expect(container.firstChild).toBeNull()
  })
})
