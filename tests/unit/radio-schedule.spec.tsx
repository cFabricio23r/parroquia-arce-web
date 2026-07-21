import { describe, it, expect } from 'vitest'
import {
  DAYS,
  dayBefore,
  formatTime12h,
  isValidTime,
  parishNow,
  toMinutes,
} from '@/lib/radio-schedule'

describe('isValidTime', () => {
  it('acepta horas validas en 24 h', () => {
    expect(isValidTime('06:00')).toBe(true)
    expect(isValidTime('00:00')).toBe(true)
    expect(isValidTime('23:59')).toBe(true)
  })

  it('rechaza el formato viejo de texto libre', () => {
    expect(isValidTime('6:00 a.m.')).toBe(false)
    expect(isValidTime('6:00')).toBe(false)
  })

  it('rechaza horas y minutos fuera de rango', () => {
    expect(isValidTime('24:00')).toBe(false)
    expect(isValidTime('12:60')).toBe(false)
  })

  it('rechaza lo que no es string', () => {
    expect(isValidTime(null)).toBe(false)
    expect(isValidTime(600)).toBe(false)
  })
})

describe('toMinutes', () => {
  it('convierte a minutos desde medianoche', () => {
    expect(toMinutes('00:00')).toBe(0)
    expect(toMinutes('06:30')).toBe(390)
    expect(toMinutes('23:59')).toBe(1439)
  })

  it('devuelve null si el dato esta mal', () => {
    expect(toMinutes('6:00 a.m.')).toBeNull()
    expect(toMinutes(undefined)).toBeNull()
  })
})

describe('formatTime12h', () => {
  it('usa la convencion local con a.m. / p.m.', () => {
    expect(formatTime12h('06:00')).toBe('6:00 a.m.')
    expect(formatTime12h('13:30')).toBe('1:30 p.m.')
  })

  it('resuelve los dos bordes del mediodia y la medianoche', () => {
    expect(formatTime12h('00:00')).toBe('12:00 a.m.')
    expect(formatTime12h('12:00')).toBe('12:00 p.m.')
    expect(formatTime12h('00:30')).toBe('12:30 a.m.')
  })

  it('devuelve vacio si el dato esta mal, en vez de romper', () => {
    expect(formatTime12h('6:00 a.m.')).toBe('')
  })
})

describe('parishNow', () => {
  // El Salvador es UTC-6 todo el año (sin horario de verano, verificado).
  it('traduce un instante UTC a dia y minutos de El Salvador', () => {
    expect(parishNow(new Date('2026-07-21T12:00:00Z'))).toEqual({
      day: 'martes',
      minutes: 6 * 60,
    })
  })

  it('cruza al dia siguiente en la medianoche local, no en la UTC', () => {
    expect(parishNow(new Date('2026-07-22T06:00:00Z'))).toEqual({
      day: 'miercoles',
      minutes: 0,
    })
  })

  it('ignora el huso del visitante: el mismo instante da el mismo resultado', () => {
    const instante = new Date('2026-07-22T06:30:00Z')
    expect(parishNow(instante)).toEqual({ day: 'miercoles', minutes: 30 })
  })

  it('mapea el domingo, que es el indice 0', () => {
    expect(parishNow(new Date('2026-07-19T18:00:00Z')).day).toBe('domingo')
  })
})

describe('dayBefore', () => {
  it('retrocede un dia', () => {
    expect(dayBefore('martes')).toBe('lunes')
  })

  it('da la vuelta del domingo al sabado', () => {
    expect(dayBefore('domingo')).toBe('sabado')
  })

  it('cubre los 7 dias sin agujeros', () => {
    expect(DAYS).toHaveLength(7)
    expect(new Set(DAYS.map(dayBefore)).size).toBe(7)
  })
})
