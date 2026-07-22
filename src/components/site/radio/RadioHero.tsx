'use client'

import { useRadio } from './RadioProvider'
import { useParishClock } from './useParishClock'
import {
  DAY_LABELS,
  findCurrentProgram,
  findNextProgram,
  formatTime12h,
  type RadioProgramView,
} from '@/lib/radio-schedule'

const BARS = [40, 72, 95, 55, 82, 38, 64, 48, 76, 60, 88, 44]

/**
 * El heroe de /radio: el player ES la pagina.
 *
 * Nunca inventa que esta sonando. Tres estados:
 *  - programa al aire       -> su titulo, conductor y franja
 *  - hueco de programacion  -> "Música católica" (el stream es 24/7)
 *  - `available === false`  -> "Fuera del aire", play deshabilitado (manda sobre todo)
 */
export function RadioHero({ programs }: { programs: RadioProgramView[] }) {
  const { available, playing, volume, error, toggle, setVolume } = useRadio()
  const clock = useParishClock()

  const current = clock ? findCurrentProgram(programs, clock) : null
  const next = clock ? findNextProgram(programs, clock) : null

  const franja = current
    ? [formatTime12h(current.startTime), formatTime12h(current.endTime)].filter(Boolean).join(' – ')
    : ''
  const subtitulo = [current?.hostName ? `con ${current.hostName}` : '', franja]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="relative mx-auto max-w-[640px] text-center">
      {available ? (
        <span className="inline-flex items-center gap-[9px] text-[12.5px] font-bold uppercase tracking-[.13em] text-sky-light">
          <span className="h-2 w-2 rounded-full bg-amber [animation:pulse-live_2s_infinite]" />
          Al aire ahora
        </span>
      ) : (
        <span className="inline-flex items-center gap-[9px] text-[12.5px] font-bold uppercase tracking-[.13em] text-[#9DB0CC]">
          <span className="h-2 w-2 rounded-full bg-[#9DB0CC]" />
          Fuera del aire
        </span>
      )}

      <h1 className="mt-3 font-display text-[clamp(34px,4.6vw,52px)] font-medium leading-[1.05]">
        {!available ? 'La radio no está transmitiendo' : (current?.title ?? 'Música católica')}
      </h1>

      <p className="mt-1.5 text-[14.5px] text-[#B6C6DD]">
        {!available
          ? 'Volvemos pronto.'
          : current
            ? subtitulo
            : 'Continuidad entre programas.'}
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-6">
        <button
          onClick={toggle}
          disabled={!available}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          className="grid h-16 w-16 flex-none place-items-center rounded-full bg-amber text-white shadow-[0_12px_26px_-8px_rgba(232,143,33,.6)] transition-transform duration-150 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[26px] w-[26px]">
            {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>

        <div className="flex h-[46px] items-end gap-[5px]" aria-hidden="true">
          {BARS.map((height, index) => (
            <i
              key={index}
              className={`w-[6px] rounded-[4px] ${index % 3 === 2 ? 'bg-amber' : 'bg-sky-light'}`}
              style={{
                height: available ? `${height}%` : '20%',
                animation: 'eq-bar 1.1s ease-in-out infinite',
                animationDelay: `${(index % 5) * 0.08}s`,
                animationPlayState: playing ? 'running' : 'paused',
              }}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 text-[12px] text-[#9DB0CC]">
          <span aria-hidden="true">🔊</span>
          <span className="sr-only">Volumen</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="h-[5px] w-[74px] accent-sky-light"
          />
        </label>
      </div>

      {error && (
        <p role="alert" className="mt-5 text-[13.5px] text-amber">
          {error}
        </p>
      )}

      {available && next && (
        <p className="mt-5 inline-block rounded-pill border border-white/[.14] bg-white/[.07] px-[18px] py-[7px] text-[12.5px] text-[#CFE0F2]">
          A continuación · <b>{formatTime12h(next.program.startTime)}</b> {next.program.title}
          {!next.startsToday && <> · {DAY_LABELS[next.day]}</>}
        </p>
      )}
    </div>
  )
}
