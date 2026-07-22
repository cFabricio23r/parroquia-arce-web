'use client'

import { useState } from 'react'
import { useParishClock } from './useParishClock'
import {
  formatTime12h,
  groupByDay,
  isOnAir,
  type Day,
  type RadioProgramView,
} from '@/lib/radio-schedule'

/**
 * La parrilla semanal. Arranca en el dia de hoy y resalta el programa al aire.
 *
 * Antes de que el reloj del cliente este listo (`clock === null`) se muestra la
 * semana empezando por lunes, sin nada resaltado: contenido real desde el primer
 * frame, sin desajuste de hidratacion.
 */
export function RadioSchedule({ programs }: { programs: RadioProgramView[] }) {
  const clock = useParishClock()
  const [selected, setSelected] = useState<Day | null>(null)

  const groups = groupByDay(programs, clock?.day ?? 'lunes')
  const active = groups.find((group) => group.day === selected) ?? groups[0]

  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2">
        {groups.map((group) => (
          <button
            key={group.day}
            onClick={() => setSelected(group.day)}
            aria-current={group.day === active.day ? 'true' : undefined}
            className={`rounded-pill border px-[14px] py-[6px] text-[12.5px] font-semibold transition-colors ${
              group.day === active.day
                ? 'border-navy bg-navy text-white'
                : 'border-border bg-white text-muted hover:border-sky hover:text-blue'
            }`}
          >
            {group.label}
            {group.isToday && <span className="ml-1 opacity-70">· hoy</span>}
          </button>
        ))}
      </div>

      {active.programs.length === 0 ? (
        <p className="text-muted">No hay programas cargados para {active.label.toLowerCase()}.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {active.programs.map((program) => {
            const onAir = Boolean(clock && active.isToday && isOnAir(program, clock))
            return (
              <div
                key={`${active.day}-${program.id}`}
                // 84px: "12:00 p.m." es la cadena mas larga y a 68px se partia en
                // dos lineas, dejando esa fila mas alta que las demas.
                className={`grid grid-cols-[84px_1fr] items-center gap-[16px] rounded-lg border p-[14px_18px] ${
                  onAir ? 'border-amber bg-[#fffaf3]' : 'border-border bg-white'
                }`}
              >
                <div className="whitespace-nowrap text-center font-display text-[15px] font-bold leading-tight text-blue">
                  {formatTime12h(program.startTime)}
                  {program.endTime && (
                    <div className="text-[11px] font-normal text-muted">
                      {formatTime12h(program.endTime)}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {program.cover && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={program.cover.url}
                      alt={program.cover.alt}
                      className="h-10 w-10 flex-none rounded-[8px] object-cover"
                    />
                  )}
                  <div>
                    {onAir && (
                      <div className="text-[10.5px] font-bold uppercase tracking-[.1em] text-amber">
                        ◉ Sonando ahora
                      </div>
                    )}
                    <h4 className="font-display text-[18px] font-semibold">{program.title}</h4>
                    {(program.hostName || program.description) && (
                      <p className="text-[13px] text-muted">
                        {[program.hostName ? `con ${program.hostName}` : '', program.description]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </>
  )
}
