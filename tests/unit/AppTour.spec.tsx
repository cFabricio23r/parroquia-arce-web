import { render, screen, within } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppTour } from '@/components/site/app/AppTour'

describe('AppTour', () => {
  it('titulo y cuatro bloques en orden', () => {
    render(<AppTour />)
    expect(screen.getByRole('heading', { level: 2, name: 'Qué trae la app' })).toBeTruthy()
    const names = screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
    expect(names).toEqual(['Radio en vivo', 'Rezar', 'Agenda y horarios', 'Comunidad'])
  })

  it.each([
    ['Pantalla Radio de la app: Radio Católica en vivo con el botón de pausa.', '/img/app/radio.jpg'],
    ['Pantalla Rezar de la app: Evangelio y lecturas, Rosario y Liturgia de las Horas.', '/img/app/rezar.jpg'],
    ['Pantalla Agenda de la app: actividades de octubre y el próximo evento.', '/img/app/agenda.jpg'],
    ['Pantalla Sectores y ermitas de la app, con fotos de las comunidades.', '/img/app/sectores.jpg'],
  ])('imagen con alt exacto y lazy: %s', (alt, src) => {
    render(<AppTour />)
    const img = screen.getByRole('img', { name: alt })
    expect(img.getAttribute('src')).toBe(src)
    expect(img.getAttribute('loading')).toBe('lazy')
  })

  it('los detalles de Rezar son items de lista', () => {
    render(<AppTour />)
    const block = screen.getByRole('heading', { level: 3, name: 'Rezar' }).closest('article')!
    const items = within(block).getAllByRole('listitem').map((li) => li.textContent)
    expect(items).toEqual([
      'Evangelio y lecturas del día',
      'Liturgia de las Horas',
      'Santo Rosario, oraciones y pedidos de oración',
    ])
  })
})
