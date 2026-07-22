import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { RadioHero } from '@/components/site/radio/RadioHero'
import { RadioProvider } from '@/components/site/radio/RadioProvider'
import type { RadioProgramView } from '@/lib/radio-schedule'

// Reloj congelado: martes 06:30 en la parroquia. Todo lo demas del modulo es real.
// Vitest sube el `vi.mock` por encima de los imports, asi que RadioHero ya resuelve
// contra este doble cuando se evalua. Sin esto el test dependeria de la hora real
// de la maquina y fallaria un domingo a las 3 a.m.
vi.mock('@/lib/radio-schedule', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/radio-schedule')>()
  return { ...actual, parishNow: () => ({ day: 'martes' as const, minutes: 390 }) }
})

const programa = (over: Partial<RadioProgramView> = {}): RadioProgramView => ({
  id: '1',
  title: 'Evangelio del día',
  description: null,
  hostName: 'P. José',
  dayOfWeek: 'diario',
  startTime: '06:00',
  endTime: '07:00',
  cover: null,
  ...over,
})

const montar = (available: boolean, programs: RadioProgramView[]) =>
  render(
    <RadioProvider available={available} streamUrl="https://example.test/stream">
      <RadioHero programs={programs} />
    </RadioProvider>,
  )

describe('RadioHero', () => {
  it('anuncia el programa que esta al aire', async () => {
    montar(true, [programa()])
    expect(await screen.findByText('Evangelio del día')).toBeTruthy()
    expect(screen.getByText(/Al aire ahora/i)).toBeTruthy()
  })

  it('en un hueco de la programacion dice musica, no un programa inventado', async () => {
    // Domingo 03:00-03:30 no incluye el martes 06:30 del reloj congelado.
    montar(true, [programa({ dayOfWeek: 'domingo', startTime: '03:00', endTime: '03:30' })])
    expect(await screen.findByText(/Música católica/i)).toBeTruthy()
    expect(screen.queryByText('Evangelio del día')).toBeNull()
  })

  it('con la radio apagada dice fuera del aire y deshabilita el play', () => {
    montar(false, [programa()])
    expect(screen.getByText(/Fuera del aire/i)).toBeTruthy()
    const play = screen.getByRole('button', { name: /reproducir/i }) as HTMLButtonElement
    expect(play.disabled).toBe(true)
  })

  it('sin programacion cargada no inventa nada y sigue al aire', () => {
    montar(true, [])
    expect(screen.getByText(/Al aire ahora/i)).toBeTruthy()
    expect(screen.queryByText('Evangelio del día')).toBeNull()
  })

  it('anuncia lo que viene despues', async () => {
    montar(true, [
      programa(),
      programa({ id: '2', title: 'Una voz desde mi sector', startTime: '07:00', endTime: '08:00' }),
    ])
    expect(await screen.findByText(/Una voz desde mi sector/)).toBeTruthy()
  })
})
