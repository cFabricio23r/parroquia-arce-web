'use client'

import { useEffect, useRef, useState } from 'react'
import { makeStream, parseVideoUrl, type LiveStream } from '@/lib/social-live'
import { useRadio } from '@/components/site/radio/RadioProvider'

const controlClass =
  'min-h-11 rounded-lg px-3 text-sm font-semibold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white'

// Reconstruir los embeds también en el cliente: jamás aceptar un iframe arbitrario.
function readStreams(value: unknown): LiveStream[] {
  if (!Array.isArray(value)) return []
  return value
    .flatMap((item) => {
      if (!item || !['youtube', 'facebook'].includes(item.platform) || typeof item.url !== 'string')
        return []
      const id = parseVideoUrl(item.platform, item.url)
      return id
        ? [makeStream(item.platform, id, typeof item.title === 'string' ? item.title : undefined)]
        : []
    })
    .filter(
      (item, index, items) =>
        items.findIndex((other) => other.platform === item.platform) === index,
    )
}

export function LiveWidget() {
  const [streams, setStreams] = useState<LiveStream[]>([])
  const [selected, setSelected] = useState('')
  const [view, setView] = useState<'pill' | 'player' | 'expanded'>('pill')
  const launcher = useRef<HTMLButtonElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const { playing, toggle } = useRadio()
  const current =
    streams.find((stream) => `${stream.platform}:${stream.id}` === selected) ?? streams[0]

  useEffect(() => {
    let stopped = false
    let timer: ReturnType<typeof setTimeout>
    let controller: AbortController | undefined
    async function refresh() {
      clearTimeout(timer)
      controller?.abort()
      const request = new AbortController()
      controller = request
      const timeout = setTimeout(() => request.abort(), 10000)
      try {
        const res = await fetch('/api/social-live', { signal: request.signal, cache: 'no-store' })
        if (!res.ok) throw new Error('Estado no disponible')
        const data = await res.json()
        if (!stopped && controller === request) {
          const next = readStreams(data.streams)
          setStreams(next)
          if (!next.length) setView('pill')
        }
      } catch {
        if (!stopped && controller === request) {
          setStreams([])
          setView('pill')
        }
      } finally {
        clearTimeout(timeout)
        if (!stopped && controller === request) timer = setTimeout(() => void refresh(), 60000)
      }
    }
    const visible = () => {
      if (document.visibilityState === 'visible') void refresh()
    }
    void refresh()
    document.addEventListener('visibilitychange', visible)
    return () => {
      stopped = true
      clearTimeout(timer)
      controller?.abort()
      document.removeEventListener('visibilitychange', visible)
    }
  }, [])

  useEffect(() => {
    if (view !== 'pill' && playing) toggle()
  }, [view, playing, toggle])

  function open() {
    setView('player')
    requestAnimationFrame(() => closeButton.current?.focus())
  }
  function minimize() {
    setView('pill')
    requestAnimationFrame(() => launcher.current?.focus())
  }

  if (!current) return null

  if (view === 'pill')
    return (
      <div className="fixed bottom-5 right-4 z-[70] max-w-[calc(100vw-2rem)] sm:right-6">
        <button
          ref={launcher}
          onClick={open}
          aria-label="Ver transmisión en vivo"
          className="flex min-h-14 items-center gap-3 rounded-2xl bg-navy-deep px-5 py-3 text-left text-white shadow-xl outline-offset-4 focus-visible:outline-2 focus-visible:outline-blue"
        >
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-amber" />
          <span>
            <span className="block text-sm font-bold">Estamos en vivo</span>
            <span className="block text-xs text-white/80">Ver transmisión ↗</span>
          </span>
        </button>
      </div>
    )

  return (
    <section
      aria-label="Transmisión en vivo"
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation()
          minimize()
        }
      }}
      className={`fixed bottom-4 right-4 z-[70] max-h-[calc(100dvh-6rem)] overflow-y-auto rounded-2xl bg-navy-deep text-white shadow-2xl ${view === 'expanded' ? 'w-[min(900px,calc(100vw-2rem))]' : 'w-[min(380px,calc(100vw-2rem))]'}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-x-2 px-3 py-2">
        <span className="px-1 text-xs font-bold uppercase tracking-wider">● En vivo</span>
        <div className="flex items-center">
          <button
            className={controlClass}
            aria-label={view === 'expanded' ? 'Reducir video' : 'Expandir video'}
            onClick={() => setView(view === 'expanded' ? 'player' : 'expanded')}
          >
            {view === 'expanded' ? '↙' : '↗'}
          </button>
          <button className={controlClass} aria-label="Minimizar video" onClick={minimize}>
            −
          </button>
          <button
            ref={closeButton}
            className={controlClass}
            aria-label="Cerrar video"
            onClick={minimize}
          >
            ×
          </button>
        </div>
      </div>
      {streams.length > 1 && (
        <div className="flex gap-2 px-3 pb-2" role="group" aria-label="Elegir plataforma">
          {streams.map((stream) => (
            <button
              key={stream.platform}
              aria-pressed={stream.platform === current.platform}
              className={`${controlClass} ${stream.platform === current.platform ? 'bg-white/15' : ''}`}
              onClick={() => setSelected(`${stream.platform}:${stream.id}`)}
            >
              {stream.platform === 'youtube' ? 'YouTube' : 'Facebook'}
            </button>
          ))}
        </div>
      )}
      <iframe
        key={`${current.platform}:${current.id}`}
        title={current.title}
        src={current.embedUrl}
        className="aspect-video w-full border-0 bg-black"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
      />
      <div className="px-4 py-3">
        <p className="truncate text-sm font-semibold">{current.title}</p>
        <a
          href={current.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-block py-2 text-sm text-white underline underline-offset-4"
        >
          Abrir en {current.platform === 'youtube' ? 'YouTube' : 'Facebook'} ↗
        </a>
      </div>
    </section>
  )
}
