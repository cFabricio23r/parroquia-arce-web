import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockPathname = vi.fn(() => '/')
vi.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
}))

import { Header } from '@/components/site/Header'

describe('Header', () => {
  beforeEach(() => {
    mockPathname.mockReturnValue('/')
  })

  it('muestra todos los items de navegacion', () => {
    render(<Header hasSchedule />)
    expect(screen.getAllByRole('link', { name: 'Horarios' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Noticias' }).length).toBeGreaterThan(0)
  })

  it('marca el item activo segun el pathname', () => {
    mockPathname.mockReturnValue('/noticias')
    render(<Header hasSchedule />)
    const activos = screen.getAllByRole('link', { name: 'Noticias' })
    expect(activos.every((el) => el.getAttribute('aria-current') === 'page')).toBe(true)
  })

  it('no marca activo un item que no corresponde', () => {
    mockPathname.mockReturnValue('/noticias')
    render(<Header hasSchedule />)
    const otros = screen.getAllByRole('link', { name: 'Horarios' })
    expect(otros.every((el) => el.getAttribute('aria-current') === null)).toBe(true)
  })

  it('Inicio solo esta activo en la raiz exacta', () => {
    mockPathname.mockReturnValue('/noticias')
    render(<Header hasSchedule />)
    const inicio = screen.getAllByRole('link', { name: 'Inicio' })
    expect(inicio.every((el) => el.getAttribute('aria-current') === null)).toBe(true)
  })

  it('el drawer arranca cerrado y se abre al tocar el boton', () => {
    render(<Header hasSchedule />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('el drawer se cierra con el boton de cerrar', () => {
    render(<Header hasSchedule />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }))
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
  })

  it('con brand.url renderiza el isotipo del CMS en el encabezado', () => {
    render(<Header hasSchedule brand={{ url: 'https://cdn.example/iso.png', alt: 'Logo parroquia' }} />)
    const img = screen.getByRole('img', { name: 'Logo parroquia' })
    expect(img.getAttribute('src')).toBe('https://cdn.example/iso.png')
  })

  // Sin horarios cargados en el CMS el sitio no los ofrece: un enlace que
  // promete horarios y no los tiene es la misma mentira que inventarlos.
  it('oculta Horarios cuando no hay horarios cargados', () => {
    render(<Header hasSchedule={false} />)
    expect(screen.queryByRole('link', { name: 'Horarios' })).toBeNull()
  })

  it('no ofrece los CTA de horarios cuando no hay horarios cargados', () => {
    render(<Header hasSchedule={false} />)
    expect(screen.queryByRole('link', { name: 'Ver horarios' })).toBeNull()
    expect(screen.queryByRole('link', { name: 'Ver horarios de misa' })).toBeNull()
  })

  it('apunta Horarios al ancla de la home cuando si hay horarios', () => {
    render(<Header hasSchedule />)
    const horarios = screen.getAllByRole('link', { name: 'Horarios' })
    expect(horarios.length).toBeGreaterThan(0)
    expect(horarios.every((el) => el.getAttribute('href') === '/#misas')).toBe(true)
  })

  it('conserva el resto de la navegacion sin horarios', () => {
    render(<Header hasSchedule={false} />)
    expect(screen.getAllByRole('link', { name: 'Inicio' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Sectores' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Contacto' }).length).toBeGreaterThan(0)
  })
})
