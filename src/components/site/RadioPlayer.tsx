'use client'

import { useState } from 'react'

const BARS = [40, 72, 95, 55, 82, 38, 64, 48, 76, 60]

/**
 * Tarjeta del reproductor de radio — ds.css:9-20 (.now-card).
 * TODO: el stream real (YouTube/FB Live embed -> Icecast/HLS, ver
 * PLAN_TECNICO_2026) es pendiente. Por ahora el boton togglea solo la animacion
 * del equalizer, sin audio — replica el demo.
 */
export function RadioPlayer() {
  const [playing, setPlaying] = useState(true)

  return (
    <div className="rounded-xl border border-white/[.14] bg-white/[.06] p-[30px]">
      <span className="inline-flex items-center gap-[9px] text-[13.5px] font-bold text-white">
        <span className="h-2 w-2 rounded-full bg-amber [animation:pulse-live_2s_infinite]" />
        TRANSMITIENDO EN VIVO
      </span>
      <h3 className="my-[12px_0_6px] font-display text-[30px] font-medium">Evangelio del día</h3>
      <div className="text-[14.5px] text-[#9DB0CC]">Reflexión y música católica · con el P. José</div>

      <div className="my-[22px] flex h-[50px] items-end gap-[5px]" aria-hidden="true">
        {BARS.map((h, i) => (
          <i
            key={i}
            className={`w-[7px] rounded-[4px] ${i % 3 === 2 ? 'bg-amber' : 'bg-sky-light'}`}
            style={{
              height: `${h}%`,
              animation: 'eq-bar 1.1s ease-in-out infinite',
              animationPlayState: playing ? 'running' : 'paused',
            }}
          />
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Pausar' : 'Reproducir'}
          className="grid h-16 w-16 flex-none place-items-center rounded-full bg-amber text-white shadow-[0_12px_26px_-8px_rgba(232,143,33,.6)] transition-transform duration-150 hover:scale-105"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-[26px] w-[26px]">
            {playing ? <path d="M7 5h4v14H7zM13 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
        <div className="relative h-[6px] flex-1 rounded-[3px] bg-white/[.18]">
          <span className="absolute inset-y-0 left-0 w-[62%] rounded-[3px] bg-sky-light" />
        </div>
      </div>
    </div>
  )
}
