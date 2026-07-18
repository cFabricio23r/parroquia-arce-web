import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Mark } from '@/components/site/Mark'

describe('Mark', () => {
  it('sin src renderiza el SVG por defecto y no una imagen', () => {
    const { container } = render(<Mark />)
    expect(container.querySelector('svg')).not.toBeNull()
    expect(container.querySelector('img')).toBeNull()
  })

  it('con src renderiza la imagen del CMS con su alt', () => {
    render(<Mark src="https://cdn.example/iso.png" alt="Logo parroquia" />)
    const img = screen.getByRole('img', { name: 'Logo parroquia' })
    expect(img.getAttribute('src')).toBe('https://cdn.example/iso.png')
  })
})
