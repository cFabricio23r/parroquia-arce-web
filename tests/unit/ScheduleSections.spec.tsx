import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ScheduleSections } from '@/components/site/ScheduleSections'
import type { ParishSchedule } from '@/lib/parish-schedule'

const vacio: ParishSchedule = {
  misas: [],
  devociones: [],
  sacramentos: [],
  hasMisas: false,
  hasDevociones: false,
  hasSacramentos: false,
}

const conTodo: ParishSchedule = {
  misas: [{ id: 'm1', label: 'Domingo', time: '6:00 a.m.', kind: 'misa', detail: '' }],
  devociones: [
    { id: 'd1', label: 'Jueves', time: '7:15 p.m.', kind: 'devocion', detail: 'Hora Santa' },
    { id: 'd2', label: 'Jueves', time: '2:00 - 4:00 p.m.', kind: 'confesion', detail: '' },
  ],
  sacramentos: [{ title: 'Bautizo', detail: 'Charla mensual' }],
  hasMisas: true,
  hasDevociones: true,
  hasSacramentos: true,
}

describe('ScheduleSections', () => {
  it('muestra las misas cargadas', () => {
    render(<ScheduleSections schedule={conTodo} officeHours={[]} mapUrl={null} />)
    expect(screen.getByRole('heading', { name: /Misas de la/ })).toBeTruthy()
    expect(screen.getByText('Domingo')).toBeTruthy()
    expect(screen.getByText('6:00 a.m.')).toBeTruthy()
  })

  // El corazon de la obra: una devocion NO puede aparecer bajo el rotulo de misas.
  it('muestra las devociones en una seccion aparte de las misas', () => {
    render(<ScheduleSections schedule={conTodo} officeHours={[]} mapUrl={null} />)
    const misas = screen.getByRole('region', { name: /Misas de la/ })
    const semana = screen.getByRole('region', { name: /Durante la/ })
    expect(misas.textContent).not.toContain('Hora Santa')
    expect(semana.textContent).toContain('Hora Santa')
    expect(semana.textContent).toContain('7:15 p.m.')
  })

  it('rotula una fila de confesiones como confesiones', () => {
    render(<ScheduleSections schedule={conTodo} officeHours={[]} mapUrl={null} />)
    const semana = screen.getByRole('region', { name: /Durante la/ })
    expect(semana.textContent).toContain('Confesiones')
    expect(semana.textContent).toContain('2:00 - 4:00 p.m.')
  })

  it('no dibuja la seccion de misas cuando no hay misas', () => {
    render(
      <ScheduleSections
        schedule={{ ...vacio, devociones: conTodo.devociones, hasDevociones: true }}
        officeHours={[]}
        mapUrl={null}
      />,
    )
    expect(screen.queryByRole('region', { name: /Misas de la/ })).toBeNull()
    expect(screen.getByRole('region', { name: /Durante la/ })).toBeTruthy()
  })

  // Es el estado REAL de produccion hoy: `sacraments` esta vacio.
  it('no dibuja la seccion de sacramentos cuando no hay sacramentos', () => {
    render(
      <ScheduleSections
        schedule={{ ...vacio, misas: conTodo.misas, hasMisas: true }}
        officeHours={[]}
        mapUrl={null}
      />,
    )
    expect(screen.queryByRole('region', { name: /sacramentos/i })).toBeNull()
  })

  it('muestra el horario de oficina y el enlace al mapa', () => {
    render(
      <ScheduleSections
        schedule={vacio}
        officeHours={[['Lunes', '6 AM-6 PM'] as const]}
        mapUrl="https://maps.example/parroquia"
      />,
    )
    expect(screen.getByText('Lunes')).toBeTruthy()
    expect(screen.getByRole('link', { name: /Cómo llegar/ }).getAttribute('href')).toBe(
      'https://maps.example/parroquia',
    )
  })

  it('sin mapUrl no ofrece el enlace de cómo llegar', () => {
    render(
      <ScheduleSections
        schedule={vacio}
        officeHours={[['Lunes', '6 AM-6 PM'] as const]}
        mapUrl={null}
      />,
    )
    expect(screen.queryByRole('link', { name: /Cómo llegar/ })).toBeNull()
  })

  it('con la base vacía no dibuja ninguna sección de horarios', () => {
    render(<ScheduleSections schedule={vacio} officeHours={[]} mapUrl={null} />)
    expect(screen.queryByRole('region', { name: /Misas de la/ })).toBeNull()
    expect(screen.queryByRole('region', { name: /Durante la/ })).toBeNull()
    expect(screen.queryByRole('region', { name: /Oficina/ })).toBeNull()
  })
})
