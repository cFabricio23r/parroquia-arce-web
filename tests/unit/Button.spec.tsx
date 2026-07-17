import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renderiza un <button> cuando no recibe href', () => {
    render(<Button>Enviar</Button>)
    const el = screen.getByRole('button', { name: 'Enviar' })
    expect(el.tagName).toBe('BUTTON')
  })

  it('renderiza un <a> cuando recibe href', () => {
    render(<Button href="/horarios">Ver horarios</Button>)
    const el = screen.getByRole('link', { name: 'Ver horarios' })
    expect(el.tagName).toBe('A')
    expect(el.getAttribute('href')).toBe('/horarios')
  })

  it('aplica la variante primary por defecto', () => {
    render(<Button>Enviar</Button>)
    expect(screen.getByRole('button').className).toContain('bg-blue')
  })

  it('aplica la variante pedida', () => {
    render(<Button variant="amber">Escuchar</Button>)
    expect(screen.getByRole('button').className).toContain('bg-amber')
  })

  it('block ocupa todo el ancho', () => {
    render(<Button block>Enviar</Button>)
    expect(screen.getByRole('button').className).toContain('w-full')
  })

  it('pasa el type al <button>', () => {
    render(<Button type="submit">Enviar</Button>)
    expect(screen.getByRole('button').getAttribute('type')).toBe('submit')
  })
})
