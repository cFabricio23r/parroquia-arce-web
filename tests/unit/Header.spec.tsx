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
    render(<Header />)
    expect(screen.getAllByRole('link', { name: 'Horarios' }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('link', { name: 'Noticias' }).length).toBeGreaterThan(0)
  })

  it('marca el item activo segun el pathname', () => {
    mockPathname.mockReturnValue('/noticias')
    render(<Header />)
    const activos = screen.getAllByRole('link', { name: 'Noticias' })
    expect(activos.every((el) => el.getAttribute('aria-current') === 'page')).toBe(true)
  })

  it('no marca activo un item que no corresponde', () => {
    mockPathname.mockReturnValue('/noticias')
    render(<Header />)
    const otros = screen.getAllByRole('link', { name: 'Horarios' })
    expect(otros.every((el) => el.getAttribute('aria-current') === null)).toBe(true)
  })

  it('Inicio solo esta activo en la raiz exacta', () => {
    mockPathname.mockReturnValue('/noticias')
    render(<Header />)
    const inicio = screen.getAllByRole('link', { name: 'Inicio' })
    expect(inicio.every((el) => el.getAttribute('aria-current') === null)).toBe(true)
  })

  it('el drawer arranca cerrado y se abre al tocar el boton', () => {
    render(<Header />)
    const toggle = screen.getByRole('button', { name: 'Abrir menú' })
    expect(toggle.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(toggle)
    expect(toggle.getAttribute('aria-expanded')).toBe('true')
  })

  it('el drawer se cierra con el boton de cerrar', () => {
    render(<Header />)
    fireEvent.click(screen.getByRole('button', { name: 'Abrir menú' }))
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }))
    expect(screen.getByRole('button', { name: 'Abrir menú' }).getAttribute('aria-expanded')).toBe(
      'false',
    )
  })
})
