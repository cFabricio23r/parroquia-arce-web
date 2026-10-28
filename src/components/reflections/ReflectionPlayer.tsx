'use client'

import React, { useEffect, useId, useRef, useState } from 'react'
import { useRadio } from '@/components/site/radio/RadioProvider'
import { formatClock, spokenDuration } from '@/lib/format-duration'

const RATES = [1, 1.25, 1.5] as const
const SKIP = 15
const ERROR_MSG = 'No pudimos cargar el audio. Probá de nuevo en un momento.'

const secondary =
  'inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border bg-white px-2 text-xs font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue'

/**
 * Reproductor de la reflexion semanal. Convive con la radio del sitio: al dar
 * play pausa la radio, y si la radio arranca mientras suena, se pausa solo.
 */
export function ReflectionPlayer({ src, title }: { src: string; title: string }) {
  const { playing: radioPlaying, pause: pauseRadio } = useRadio()
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressId = useId()
  const [playing, setPlaying] = useState(false)
  const playingRef = useRef(false)
  playingRef.current = playing
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)
  const [rateIndex, setRateIndex] = useState(0)
  const [failed, setFailed] = useState(false)

  // La radio arranco: ceder el audio.
  useEffect(() => {
    if (radioPlaying && playingRef.current) audioRef.current?.pause()
  }, [radioPlaying])

  const readDuration = () => {
    const d = audioRef.current?.duration
    setDuration(typeof d === 'number' && Number.isFinite(d) ? d : 0)
  }

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return
    if (!audio.paused) {
      audio.pause()
      return
    }
    pauseRadio()
    setFailed(false)
    void Promise.resolve(audio.play()).catch((err: unknown) => {
      // AbortError: play() interrumpido por un pause() rapido. No es un fallo de carga.
      if (err instanceof DOMException && err.name === 'AbortError') return
      if ((err as { name?: string } | null)?.name === 'AbortError') return
      setFailed(true)
    })
  }

  const seekTo = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    const max = duration > 0 ? duration : Number.POSITIVE_INFINITY
    const next = Math.min(Math.max(value, 0), max)
    audio.currentTime = next
    setCurrent(next)
  }

  // load() reinicia playbackRate al defaultPlaybackRate: mantener ambos.
  const applyRate = (value: number) => {
    const audio = audioRef.current
    if (!audio) return
    audio.defaultPlaybackRate = value
    audio.playbackRate = value
  }

  const cycleRate = () => {
    const next = (rateIndex + 1) % RATES.length
    setRateIndex(next)
    applyRate(RATES[next])
  }

  const retry = () => {
    setFailed(false)
    audioRef.current?.load()
    applyRate(RATES[rateIndex])
  }

  const rate = RATES[rateIndex]
  const valueText = `${spokenDuration(current)} de ${spokenDuration(duration)}`

  return (
    <section
      aria-label={`Reproductor: ${title}`}
      className="rounded-[20px] border border-border bg-white p-6 shadow-[0_30px_60px_-28px_rgba(5,23,51,.3)] sm:px-7"
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
        onLoadedMetadata={readDuration}
        onDurationChange={readDuration}
        onError={() => {
          setPlaying(false)
          setFailed(true)
        }}
      />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          aria-label="−15 segundos"
          className={secondary}
          onClick={() => seekTo((audioRef.current?.currentTime ?? current) - SKIP)}
        >
          −15
        </button>
        <button
          type="button"
          aria-label={playing ? 'Pausar la reflexión' : 'Reproducir la reflexión'}
          className="inline-flex size-16 items-center justify-center rounded-full bg-amber text-navy-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          onClick={togglePlay}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
            {playing ? <path d="M6 5h4v14H6zM14 5h4v14h-4z" /> : <path d="M8 5v14l11-7z" />}
          </svg>
        </button>
        <button
          type="button"
          aria-label="+15 segundos"
          className={secondary}
          onClick={() => seekTo((audioRef.current?.currentTime ?? current) + SKIP)}
        >
          +15
        </button>
        <div className="min-w-0 flex-1 basis-64">
          <label htmlFor={progressId} className="mb-1 block text-sm font-semibold text-blue">
            Escuchá la reflexión
          </label>
          <input
            id={progressId}
            type="range"
            min={0}
            max={duration}
            step={1}
            value={Math.min(current, duration)}
            aria-valuetext={valueText}
            onChange={(e) => seekTo(Number(e.target.value))}
            className="block h-11 w-full accent-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          />
          <div className="flex justify-between text-sm text-muted">
            <span>{formatClock(current)}</span>
            <span>{formatClock(duration)}</span>
          </div>
        </div>
        <button
          type="button"
          aria-label={`Velocidad de reproducción: ${rate}×`}
          className="inline-flex h-11 min-w-11 items-center justify-center rounded-full border border-border bg-blue-tint px-4 text-sm font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          onClick={cycleRate}
        >
          {rate}×
        </button>
      </div>
      {failed && (
        <div role="alert" className="mt-4 flex flex-wrap items-center gap-3 text-sm text-text">
          <p>{ERROR_MSG}</p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-11 items-center rounded-full border border-border bg-white px-4 font-semibold text-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue"
          >
            Reintentar
          </button>
        </div>
      )}
      <p className="mt-4 text-sm text-muted">Si la radio está sonando, se pausa al darle play.</p>
    </section>
  )
}
