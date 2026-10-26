import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PhoneMockup } from '@/components/site/app/PhoneMockup'

describe('PhoneMockup', () => {
  it('muestra la captura entera con su alt', () => {
    render(<PhoneMockup src="/img/app/radio.jpg" alt="Pantalla de la radio" />)
    const img = screen.getByRole('img', { name: 'Pantalla de la radio' })
    expect(img.getAttribute('src')).toBe('/img/app/radio.jpg')
    expect(img.getAttribute('width')).toBe('1080')
    expect(img.getAttribute('height')).toBe('2189')
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('el marco es decorativo', () => {
    render(<PhoneMockup src="/img/app/radio.jpg" alt="Pantalla de la radio" />)
    expect(screen.getAllByRole('img')).toHaveLength(1)
  })

  it('respeta loading eager', () => {
    render(<PhoneMockup src="/img/app/radio.jpg" alt="Pantalla de la radio" loading="eager" />)
    expect(screen.getByRole('img').getAttribute('loading')).toBe('eager')
  })
})
