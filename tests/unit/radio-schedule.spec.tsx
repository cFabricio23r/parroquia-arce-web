import { describe, it, expect } from 'vitest'
import {
  DAYS,
  dayBefore,
  findCurrentProgram,
  findNextProgram,
  formatTime12h,
  groupByDay,
  isOnAir,
  isValidTime,
  parishNow,
  toMinutes,
  toRadioProgramView,
} from '@/lib/radio-schedule'

// `endTime` es opcional a proposito: en el CMS real ningun programa lo tiene.
const prog = (
  dayOfWeek: string,
  startTime: string,
  endTime: string | null = null,
  title = 'X',
) => ({ title, dayOfWeek, startTime, endTime })

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

describe('isOnAir', () => {
  it('esta al aire dentro de su ventana, en su dia', () => {
    expect(isOnAir(prog('martes', '06:00', '07:00'), { day: 'martes', minutes: 390 })).toBe(true)
  })

  it('no esta al aire el dia equivocado', () => {
    expect(isOnAir(prog('martes', '06:00', '07:00'), { day: 'lunes', minutes: 390 })).toBe(false)
  })

  it('justo en la hora de inicio YA cuenta', () => {
    expect(isOnAir(prog('martes', '06:00', '07:00'), { day: 'martes', minutes: 360 })).toBe(true)
  })

  it('justo en la hora de fin YA NO cuenta', () => {
    expect(isOnAir(prog('martes', '06:00', '07:00'), { day: 'martes', minutes: 420 })).toBe(false)
  })

  it('un programa "diario" suena cualquier dia', () => {
    expect(isOnAir(prog('diario', '06:00', '07:00'), { day: 'domingo', minutes: 390 })).toBe(true)
  })

  it('un programa que cruza medianoche sigue al aire en la madrugada siguiente', () => {
    const nocturno = prog('sabado', '23:00', '01:00')
    expect(isOnAir(nocturno, { day: 'sabado', minutes: 23 * 60 + 30 })).toBe(true)
    expect(isOnAir(nocturno, { day: 'domingo', minutes: 30 })).toBe(true)
    expect(isOnAir(nocturno, { day: 'domingo', minutes: 90 })).toBe(false)
  })

  it('descarta un programa sin hora de inicio utilizable', () => {
    expect(isOnAir(prog('martes', '6:00 a.m.', '07:00'), { day: 'martes', minutes: 390 })).toBe(false)
  })
})

describe('isOnAir — duracion por defecto', () => {
  // Ninguno de los 6 programas del CMS tiene hora de fin (verificado 2026-07-21).
  it('sin hora de fin, el programa dura una hora', () => {
    const sinFin = prog('diario', '06:00')
    expect(isOnAir(sinFin, { day: 'martes', minutes: 6 * 60 })).toBe(true)
    expect(isOnAir(sinFin, { day: 'martes', minutes: 6 * 60 + 59 })).toBe(true)
    expect(isOnAir(sinFin, { day: 'martes', minutes: 7 * 60 })).toBe(false)
  })

  it('trata un fin igual al inicio como si faltara', () => {
    expect(isOnAir(prog('martes', '06:00', '06:00'), { day: 'martes', minutes: 390 })).toBe(true)
  })

  it('trata un fin mal escrito como si faltara', () => {
    expect(isOnAir(prog('martes', '06:00', '7 en punto'), { day: 'martes', minutes: 390 })).toBe(true)
  })

  it('da la vuelta a medianoche cuando el inicio es tarde', () => {
    const tardio = prog('sabado', '23:30')
    expect(isOnAir(tardio, { day: 'sabado', minutes: 23 * 60 + 45 })).toBe(true)
    expect(isOnAir(tardio, { day: 'domingo', minutes: 15 })).toBe(true)
    expect(isOnAir(tardio, { day: 'domingo', minutes: 45 })).toBe(false)
  })
})

describe('findCurrentProgram', () => {
  it('devuelve el programa que corresponde a ese momento', () => {
    const programas = [
      prog('martes', '06:00', '07:00', 'Evangelio'),
      prog('martes', '07:00', '08:00', 'Sector'),
    ]
    expect(findCurrentProgram(programas, { day: 'martes', minutes: 420 })?.title).toBe('Sector')
  })

  it('devuelve null en el hueco entre programas — ahi suena musica', () => {
    const programas = [prog('martes', '06:00', '07:00', 'Evangelio')]
    expect(findCurrentProgram(programas, { day: 'martes', minutes: 600 })).toBeNull()
  })

  it('devuelve null si no hay programacion cargada', () => {
    expect(findCurrentProgram([], { day: 'martes', minutes: 600 })).toBeNull()
  })
})

describe('findNextProgram', () => {
  it('devuelve el proximo programa del mismo dia', () => {
    const programas = [
      prog('martes', '06:00', '07:00', 'Evangelio'),
      prog('martes', '07:00', '08:00', 'Sector'),
    ]
    const next = findNextProgram(programas, { day: 'martes', minutes: 390 })
    expect(next?.program.title).toBe('Sector')
    expect(next?.day).toBe('martes')
    expect(next?.startsToday).toBe(true)
  })

  it('no propone un programa que ya empezo', () => {
    const programas = [prog('martes', '06:00', '07:00', 'Evangelio')]
    expect(findNextProgram(programas, { day: 'martes', minutes: 390 })).toBeNull()
  })

  it('rueda al dia siguiente cuando ya no queda nada hoy', () => {
    const programas = [
      prog('martes', '06:00', '07:00', 'Evangelio'),
      prog('miercoles', '05:00', '06:00', 'Laudes'),
    ]
    const next = findNextProgram(programas, { day: 'martes', minutes: 23 * 60 })
    expect(next?.program.title).toBe('Laudes')
    expect(next?.day).toBe('miercoles')
    expect(next?.startsToday).toBe(false)
  })

  it('rueda a traves de la semana hasta encontrar el proximo', () => {
    const programas = [prog('domingo', '08:00', '10:00', 'Misa')]
    const next = findNextProgram(programas, { day: 'lunes', minutes: 600 })
    expect(next?.program.title).toBe('Misa')
    expect(next?.day).toBe('domingo')
  })

  it('un "diario" que ya paso hoy reaparece manana', () => {
    const programas = [prog('diario', '06:00', '07:00', 'Evangelio')]
    const next = findNextProgram(programas, { day: 'martes', minutes: 600 })
    expect(next?.program.title).toBe('Evangelio')
    expect(next?.day).toBe('miercoles')
  })

  it('elige el mas temprano cuando hay varios candidatos', () => {
    const programas = [
      prog('martes', '20:00', '21:00', 'Tarde'),
      prog('martes', '18:00', '19:00', 'Temprano'),
    ]
    expect(findNextProgram(programas, { day: 'martes', minutes: 600 })?.program.title).toBe(
      'Temprano',
    )
  })

  it('devuelve null si no hay programacion en toda la semana', () => {
    expect(findNextProgram([], { day: 'martes', minutes: 600 })).toBeNull()
  })
})

describe('groupByDay', () => {
  it('devuelve los 7 dias empezando por hoy', () => {
    const grupos = groupByDay([], 'martes')
    expect(grupos).toHaveLength(7)
    expect(grupos.map((g) => g.day)).toEqual([
      'martes',
      'miercoles',
      'jueves',
      'viernes',
      'sabado',
      'domingo',
      'lunes',
    ])
    expect(grupos[0].isToday).toBe(true)
    expect(grupos[1].isToday).toBe(false)
  })

  it('pone la etiqueta con tilde para mostrar', () => {
    expect(groupByDay([], 'miercoles')[0].label).toBe('Miércoles')
    expect(groupByDay([], 'sabado')[0].label).toBe('Sábado')
  })

  it('ordena los programas de cada dia por hora, no por orden de carga', () => {
    const programas = [
      prog('martes', '20:00', '21:00', 'Tarde'),
      prog('martes', '06:00', '07:00', 'Temprano'),
    ]
    expect(groupByDay(programas, 'martes')[0].programs.map((p) => p.title)).toEqual([
      'Temprano',
      'Tarde',
    ])
  })

  it('repite los "diario" en todos los dias', () => {
    const grupos = groupByDay([prog('diario', '06:00', '07:00', 'Evangelio')], 'martes')
    expect(grupos.every((g) => g.programs.length === 1)).toBe(true)
  })

  it('descarta los programas sin hora valida', () => {
    const grupos = groupByDay([prog('martes', '6:00 a.m.', '07:00', 'Roto')], 'martes')
    expect(grupos[0].programs).toEqual([])
  })
})

describe('toRadioProgramView', () => {
  it('normaliza un documento del CMS', () => {
    expect(
      toRadioProgramView({
        id: 7,
        title: 'Evangelio',
        description: 'Reflexion',
        hostName: 'P. José',
        dayOfWeek: 'diario',
        startTime: '06:00',
        endTime: '07:00',
        cover: { url: '/media/a.jpg', alt: 'Estudio' },
      }),
    ).toEqual({
      id: '7',
      title: 'Evangelio',
      description: 'Reflexion',
      hostName: 'P. José',
      dayOfWeek: 'diario',
      startTime: '06:00',
      endTime: '07:00',
      cover: { url: '/media/a.jpg', alt: 'Estudio' },
    })
  })

  it('deja la portada en null si vino como id sin poblar', () => {
    expect(toRadioProgramView({ id: 1, title: 'X', cover: 42 }).cover).toBeNull()
  })

  it('deja los opcionales en null en vez de undefined', () => {
    const view = toRadioProgramView({ id: 1, title: 'X' })
    expect(view.description).toBeNull()
    expect(view.hostName).toBeNull()
    expect(view.startTime).toBeNull()
  })
})
