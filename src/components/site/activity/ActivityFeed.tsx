'use client'

import { useEffect, useRef, useState } from 'react'
import { FACEBOOK_PAGE } from '@/lib/social-live'
import type { ActivityPageData } from '@/lib/activity'
import { ActivityCard } from './ActivityCard'

export function ActivityFeed({ initial }: { initial: ActivityPageData }) {
  const [posts, setPosts] = useState(initial.posts)
  const [cursor, setCursor] = useState(initial.nextCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const container = useRef<HTMLElement>(null)
  const status = useRef<HTMLParagraphElement>(null)
  const request = useRef<AbortController | null>(null)
  const seenCursors = useRef(new Set<string>())
  useEffect(() => () => request.current?.abort(), [])

  async function loadOlder() {
    if (!cursor || request.current) return
    const controller = new AbortController()
    request.current = controller
    setLoading(true)
    setError(false)
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const response = await fetch(`/api/activity?cursor=${encodeURIComponent(cursor)}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('No disponible')
      const page = (await response.json()) as ActivityPageData
      if (page.state !== 'ready' || !Array.isArray(page.posts)) throw new Error('No disponible')
      if (controller.signal.aborted) return
      const added = page.posts
        .filter((post) => !posts.some((existing) => existing.id === post.id))
        .filter((post, index, items) => items.findIndex((other) => other.id === post.id) === index)
      seenCursors.current.add(cursor)
      setPosts((previous) => [...previous, ...added])
      setCursor(
        page.nextCursor && !seenCursors.current.has(page.nextCursor) ? page.nextCursor : null,
      )
      setAnnouncement(
        added.length
          ? `Se agregaron ${added.length} publicaciones anteriores.`
          : 'No se agregaron publicaciones en esta página.',
      )
      requestAnimationFrame(() => {
        const firstAdded =
          added[0] &&
          Array.from(
            container.current?.querySelectorAll<HTMLAnchorElement>('[data-activity-id]') ?? [],
          ).find((link) => link.dataset.activityId === added[0].id)
        if (firstAdded) firstAdded.focus()
        else status.current?.focus()
      })
    } catch {
      setError(true)
    } finally {
      clearTimeout(timeout)
      request.current = null
      setLoading(false)
    }
  }

  return (
    <section ref={container} aria-labelledby="activity-heading" className="min-w-0">
      <div className="mb-6 flex items-center gap-4">
        <h2 id="activity-heading" className="shrink-0 text-sm font-semibold text-navy-deep">
          Últimas publicaciones
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      {posts.length ? (
        <>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr]">
            {posts.slice(0, 3).map((post, index) => (
              <ActivityCard
                key={post.id}
                post={post}
                featured={index === 0}
                secondary={index > 0}
              />
            ))}
          </div>
          {posts.length > 3 && (
            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {posts.slice(3).map((post) => (
                <ActivityCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl border border-border bg-bg-soft px-6 py-10">
          <h3 className="font-display text-2xl text-navy-deep">Encontrémonos en Facebook</h3>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Las publicaciones no están disponibles aquí por el momento. Podés consultar la actividad
            y los avisos en nuestra página de Facebook.
          </p>
        </div>
      )}
      <div className="mt-8 flex flex-col items-center text-center">
        <p ref={status} role="status" tabIndex={-1} className="sr-only">
          {announcement}
        </p>
        {error && (
          <p role="alert" className="mb-3 text-sm text-text">
            No pudimos cargar las publicaciones anteriores. Lo que ya cargaste sigue disponible.
          </p>
        )}
        {cursor && (
          <button
            type="button"
            onClick={() => void loadOlder()}
            disabled={loading}
            className="min-h-12 rounded-full border border-blue px-6 py-3 text-sm font-semibold text-blue transition-colors duration-150 hover:bg-blue-tint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue disabled:cursor-wait disabled:opacity-60"
          >
            {loading
              ? 'Cargando publicaciones…'
              : error
                ? 'Reintentar'
                : 'Cargar publicaciones anteriores'}
          </button>
        )}
        {!cursor && posts.length > 0 && (
          <p className="text-sm text-muted">
            Llegaste al final de las publicaciones disponibles aquí.
          </p>
        )}
        <a
          href={FACEBOOK_PAGE}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block py-2 text-sm font-semibold text-blue underline underline-offset-4"
        >
          Ver toda la actividad en Facebook <span aria-hidden="true">→</span>
          <span className="sr-only"> (abre en otra pestaña)</span>
        </a>
      </div>
    </section>
  )
}
