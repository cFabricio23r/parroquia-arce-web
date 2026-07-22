'use client'

import Link from 'next/link'
import { useRadio } from './RadioProvider'
import { useParishClock } from './useParishClock'
import {
  findCurrentProgram,
  findNextProgram,
  formatTime12h,
  groupByDay,
  type RadioProgramView,
} from '@/lib/radio-schedule'

/**
 * La radio en la portada: una barra en vivo con play propio.
 *
 * Comparte el <audio> del layout con el heroe de /radio, asi que si le das play
 * aca y navegas a la programacion, la musica sigue sonando.
 *
 * Sin programacion cargada no inventa shows: muestra el estado en vivo y el enlace.
 */
export function RadioLiveBar({ programs }: { programs: RadioProgramView[] }) {
  const { available, playing, error, toggle } = useRadio()
  const clock = useParishClock()

  const current = clock ? findCurrentProgram(programs, clock) : null
  const next = clock ? findNextProgram(programs, clock) : null
  const today = clock ? groupByDay(programs, clock.day)[0].programs : []

  const franja = current
    ? [formatTime12h(current.startTime), formatTime12h(current.endTime)].filter(Boolean).join(' – ')
    : ''

  return (
    <div className="rounded-xl border border-white/[.14] bg-white/[.06] p-7">
      <div className="flex flex-wrap items-center gap-5">
        <button
          onClick={toggle}
          disabled={!available}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          className="grid h-12 w-12 flex-none place-items-center rounded-full bg-amber text-white shadow-[0_10px_22px_-8px_rgba(232,143,33,.6)] transition-transform duration-150 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[19px] w-[19px]">
            {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>

        <div className="min-w-[200px] flex-1">
          <span className="text-[12px] font-bold uppercase tracking-[.13em] text-sky-light">
            {available ? '● Al aire ahora' : '○ Fuera del aire'}
          </span>
          <h3 className="mt-1 font-display text-[23px] font-medium">
            {!available ? 'La radio no está transmitiendo' : (current?.title ?? 'Música católica')}
          </h3>
          <p className="text-[12.5px] text-[#9DB0CC]">
            {!available
              ? 'Volvemos pronto.'
              : current
                ? [current.hostName ? `con ${current.hostName}` : '', franja]
                    .filter(Boolean)
                    .join(' · ')
                : 'Continuidad entre programas.'}
          </p>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-[13px] text-amber">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {today.slice(0, 3).map((program) => (
          <span
            key={program.id}
            className="rounded-pill border border-white/[.14] bg-white/[.07] px-[13px] py-[5px] text-[12px] text-[#CFE0F2]"
          >
            {formatTime12h(program.startTime)} {program.title}
          </span>
        ))}
        {available && next && today.length === 0 && (
          <span className="rounded-pill border border-white/[.14] bg-white/[.07] px-[13px] py-[5px] text-[12px] text-[#CFE0F2]">
            A continuación · {formatTime12h(next.program.startTime)} {next.program.title}
          </span>
        )}
        <Link href="/radio" className="text-[12.5px] font-semibold text-sky-light hover:text-white">
          Ver programación completa →
        </Link>
      </div>
    </div>
  )
}
