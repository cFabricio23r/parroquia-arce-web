import { cleanup, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getClergyProfiles } from '@/lib/get-clergy'
import SacerdotesPage from '@/app/(frontend)/sacerdotes/page'
import HomePage from '@/app/(frontend)/page'
import { Footer } from '@/components/site/Footer'

const { findGlobal, find } = vi.hoisted(() => ({ findGlobal: vi.fn(), find: vi.fn() }))
vi.mock('payload', () => ({ getPayload: async () => ({ findGlobal, find }) }))
vi.mock('@/payload.config', () => ({ default: Promise.resolve({}) }))
vi.mock('@/components/site/radio/RadioLiveBar', () => ({ RadioLiveBar: () => null }))

let published = true
beforeEach(() => {
  published = true
  vi.clearAllMocks()
  find.mockResolvedValue({ docs: [] })
  findGlobal.mockImplementation(async ({ slug }) => slug === 'clergy'
    ? { pastor: { published, name: 'Nombre publicado', summary: 'Resumen publicado' },
        assistant: { published: false, name: 'Nombre privado', summary: 'Resumen privado' } }
    : {})
})

describe('lectura y consumidores de sacerdotes', () => {
  it('solicita controles de acceso y vuelve a filtrar antes de mostrar', async () => {
    const profiles = await getClergyProfiles()
    expect(findGlobal).toHaveBeenCalledWith({ slug: 'clergy', depth: 1, overrideAccess: false })
    expect(profiles.map((p) => p.name)).toEqual(['Nombre publicado'])
  })
  it('la página muestra el perfil publicado y el estado vacío al retirarlo', async () => {
    render(await SacerdotesPage())
    expect(screen.getByRole('heading', { level: 1, name: 'Nuestros sacerdotes' })).toBeTruthy()
    expect(screen.getByText('Nombre publicado')).toBeTruthy()
    expect(screen.queryByText('Nombre privado')).toBeNull()
    cleanup()
    published = false
    render(await SacerdotesPage())
    expect(screen.queryByText('Nombre publicado')).toBeNull()
    expect(screen.getByText(/Pronto compartiremos/)).toBeTruthy()
  })
  it('Inicio muestra sacerdotes aun cuando no hay misas cargadas', async () => {
    render(await HomePage())
    expect(screen.getByText('Nombre publicado')).toBeTruthy()
    expect(screen.queryByText('Nombre privado')).toBeNull()
    expect(screen.getByRole('link', { name: /Conocer la historia/ }).getAttribute('href')).toBe('/sacerdotes#parroco')
  })
  it('el pie retira el enlace al despublicar el último perfil', async () => {
    render(await Footer())
    expect(screen.getByRole('link', { name: 'Nuestros sacerdotes' }).getAttribute('href')).toBe('/sacerdotes')
    cleanup()
    published = false
    render(await Footer())
    expect(screen.queryByRole('link', { name: 'Nuestros sacerdotes' })).toBeNull()
  })
})
