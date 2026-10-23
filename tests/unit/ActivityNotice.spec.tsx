import { act, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { ActivityNotice } from '@/components/site/activity/ActivityNotice'
afterEach(() => vi.useRealTimers())
it('retira el aviso al vencer en una pestaña abierta', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-28T12:00:00Z'))
  render(
    <ActivityNotice
      notice={{
        title: 'Inscripciones abiertas',
        message: 'Acercate a la oficina.',
        url: null,
        endsAt: '2026-09-28T12:00:02Z',
      }}
    />,
  )
  expect(screen.getByRole('heading', { name: 'Inscripciones abiertas' })).toBeTruthy()
  act(() => vi.advanceTimersByTime(2001))
  expect(screen.queryByRole('heading', { name: 'Inscripciones abiertas' })).toBeNull()
})
