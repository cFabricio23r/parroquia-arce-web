import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { CardMark } from '@/components/community/CardMark'
import type { Media } from '@/payload-types'

const media = (alt: string): Media =>
  ({ id: 1, alt, url: '/logo.png', updatedAt: '', createdAt: '' }) as Media

describe('CardMark', () => {
  it('muestra el logo con el alt de la media', () => {
    render(<CardMark logo={media('Logo de JUMI')} name="JUMI" />)
    expect(screen.getByAltText('Logo de JUMI')).toBeDefined()
  })

  it('cae al monograma con la inicial cuando no hay logo', () => {
    render(<CardMark logo={null} name="Consejo Económico" />)
    expect(screen.getByText('C')).toBeDefined()
  })

  it('cae al monograma cuando el logo llega sin poblar', () => {
    render(<CardMark logo={7} name="Consejo Económico" />)
    expect(screen.getByText('C')).toBeDefined()
    expect(screen.queryByRole('img')).toBeNull()
  })

  it('pone el monograma en mayuscula', () => {
    render(<CardMark logo={null} name="jumi" />)
    expect(screen.getByText('J')).toBeDefined()
  })

  it('esconde el monograma de los lectores de pantalla', () => {
    const { container } = render(<CardMark logo={null} name="Consejo Económico" />)
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull()
  })

  it('no rompe con un nombre vacio', () => {
    const { container } = render(<CardMark logo={null} name="" />)
    expect(container.firstChild).not.toBeNull()
  })
})
