import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import PatrocinadoresPage from '@/app/(frontend)/patrocinadores/page'

const { getActiveSponsors } = vi.hoisted(() => ({ getActiveSponsors: vi.fn() }))
vi.mock('@/lib/sponsors', () => ({ getActiveSponsors }))

describe('pagina de patrocinadores', () => {
  it('muestra el estado vacio y la invitacion cuando no hay patrocinadores', async () => {
    getActiveSponsors.mockResolvedValue([])
    render(await PatrocinadoresPage())
    expect(screen.getByText(/Pronto vas a encontrar aquí/)).toBeTruthy()
    expect(screen.getByText('Contactar a la parroquia')).toBeTruthy()
  })
  it('muestra lo mismo si la lectura falla', async () => {
    getActiveSponsors.mockRejectedValue(new Error('db down'))
    render(await PatrocinadoresPage())
    expect(screen.getByText(/Pronto vas a encontrar aquí/)).toBeTruthy()
    expect(screen.getByText('Contactar a la parroquia')).toBeTruthy()
  })
})
