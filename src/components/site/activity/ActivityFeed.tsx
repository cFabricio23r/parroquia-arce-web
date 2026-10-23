'use client'

import { useEffect, useRef, useState } from 'react'
import { FACEBOOK_PAGE } from '@/lib/social-live'
import { parseActivityFilters, type ActivityFilters, type ActivityPageData } from '@/lib/activity'
import { ActivityCard } from './ActivityCard'

export function ActivityFeed({
  initial,
  showFilters = true,
}: {
  initial: ActivityPageData
  showFilters?: boolean
}) {
  const [posts, setPosts] = useState(initial.posts)
  const [cursor, setCursor] = useState(initial.nextCursor)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const [draft, setDraft] = useState<ActivityFilters>({})
  const [applied, setApplied] = useState<ActivityFilters>({})
  const [validation, setValidation] = useState('')
  const [state, setState] = useState(initial.state)
  const container = useRef<HTMLElement>(null)
  const status = useRef<HTMLParagraphElement>(null)
  const request = useRef<AbortController | null>(null)
  const seenCursors = useRef(new Set<string>())
  const retry = useRef<{ reset: boolean; filters: ActivityFilters }>({ reset: false, filters: {} })
  useEffect(() => () => request.current?.abort(), [])

  async function loadOlder(reset = false, filters = applied) {
    if (!parseActivityFilters(filters)) {
      setValidation('Revisá las fechas: Desde debe ser anterior o igual a Hasta.')
      return
    }
    setValidation('')
    if (!reset && (!cursor || request.current)) return
    if (reset) request.current?.abort()
    const controller = new AbortController()
    request.current = controller
    retry.current = { reset, filters }
    setLoading(true)
    setError(false)
    const timeout = setTimeout(() => controller.abort(), 10000)
    try {
      const params = new URLSearchParams()
      if (!reset && cursor) params.set('cursor', cursor)
      for (const [key, value] of Object.entries(filters))
        if (value && value !== 'all') params.set(key, value)
      const response = await fetch(`/api/activity?${params}`, {
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('No disponible')
      const page = (await response.json()) as ActivityPageData
      if (page.state !== 'ready' || !Array.isArray(page.posts)) throw new Error('No disponible')
      if (controller.signal.aborted) return
      const added = page.posts
        .filter((post) => reset || !posts.some((existing) => existing.id === post.id))
        .filter((post, index, items) => items.findIndex((other) => other.id === post.id) === index)
      if (reset) seenCursors.current.clear()
      else if (cursor) seenCursors.current.add(cursor)
      setPosts((previous) => (reset ? added : [...previous, ...added]))
      setApplied(filters)
      setState(page.state)
      setCursor(
        page.nextCursor && !seenCursors.current.has(page.nextCursor) ? page.nextCursor : null,
      )
      setAnnouncement(
        added.length
          ? `${reset ? 'Se encontraron' : 'Se agregaron'} ${added.length} publicaciones.`
          : 'No se agregaron publicaciones en esta página.',
      )
      requestAnimationFrame(() => {
        if (controller.signal.aborted) return
        const firstAdded =
          added[0] &&
          Array.from(
            container.current?.querySelectorAll<HTMLAnchorElement>('[data-activity-id]') ?? [],
          ).find((link) => link.dataset.activityId === added[0].id)
        if (firstAdded) firstAdded.focus()
        else status.current?.focus()
      })
    } catch {
      if (request.current === controller) setError(true)
    } finally {
      clearTimeout(timeout)
      if (request.current === controller) {
        request.current = null
        setLoading(false)
      }
    }
  }

  return (
    <section ref={container} aria-labelledby="activity-heading" className="min-w-0">
      <div className="mb-6 flex items-center gap-4">
        <h2 id="activity-heading" className="shrink-0 text-sm font-semibold text-navy-deep">
          Publicaciones de la comunidad
        </h2>
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>
      {showFilters && (
        <form
          onSubmit={(event) => {
            event.preventDefault()
            void loadOlder(true, draft)
          }}
          className="mb-8 rounded-2xl border border-border bg-bg-soft p-4 md:p-5"
          aria-label="Filtrar publicaciones"
        >
          <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="min-w-0 text-sm font-semibold text-navy-deep">
              Desde
              <input
                type="date"
                value={draft.from || ''}
                onChange={(event) => setDraft({ ...draft, from: event.target.value })}
                className="mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue"
              />
            </label>
            <label className="min-w-0 text-sm font-semibold text-navy-deep">
              Hasta
              <input
                type="date"
                value={draft.to || ''}
                onChange={(event) => setDraft({ ...draft, to: event.target.value })}
                className="mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue"
              />
            </label>
            <label className="min-w-0 text-sm font-semibold text-navy-deep">
              Tipo de publicación
              <select
                value={draft.kind || 'all'}
                onChange={(event) => setDraft({ ...draft, kind: event.target.value })}
                className="mt-2 block min-h-12 w-full min-w-0 rounded-lg border border-border bg-white px-3 font-normal focus-visible:outline-2 focus-visible:outline-blue"
              >
                <option value="all">Todas</option>
                <option value="photo">Fotos</option>
                <option value="video">Videos</option>
                <option value="text">Texto</option>
              </select>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="submit"
              className="min-h-12 rounded-full bg-blue px-5 py-3 text-sm font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue"
            >
              Aplicar filtros
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft({})
                void loadOlder(true, {})
              }}
              className="min-h-12 rounded-full px-4 py-3 text-sm font-semibold text-blue underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-blue"
            >
              Limpiar filtros
            </button>
            {loading && (
              <span role="status" className="text-sm text-muted">
                Buscando publicaciones…
              </span>
            )}
          </div>
          {validation && (
            <p role="alert" className="mt-3 text-sm text-text">
              {validation}
            </p>
          )}
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Las fechas corresponden a El Salvador. Podés seguir cargando páginas para recorrer el
            historial disponible.
          </p>
        </form>
      )}
      <div aria-busy={loading}>
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
            <h3 className="font-display text-2xl text-navy-deep">
              {state === 'ready' ? 'Sin publicaciones en esta página' : 'Encontrémonos en Facebook'}
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
              {state === 'ready'
                ? cursor
                  ? 'Todavía quedan publicaciones por revisar. Continuá buscando con los mismos filtros.'
                  : 'No encontramos publicaciones con estos filtros en el historial disponible. Probá otro período o tipo de publicación.'
                : 'Las publicaciones no están disponibles aquí por el momento. Podés consultar la actividad y los avisos en nuestra página de Facebook.'}
            </p>
          </div>
        )}
      </div>
      <div className="mt-8 flex flex-col items-center text-center">
        <p ref={status} role="status" tabIndex={-1} className="sr-only">
          {announcement}
        </p>
        {error && (
          <p role="alert" className="mb-3 text-sm text-text">
            No pudimos completar la consulta. Se mantienen los resultados anteriores.
          </p>
        )}
        {(cursor || error) && (
          <button
            type="button"
            onClick={() =>
              error ? void loadOlder(retry.current.reset, retry.current.filters) : void loadOlder()
            }
            disabled={loading}
            className="min-h-12 rounded-full border border-blue px-6 py-3 text-sm font-semibold text-blue transition-colors duration-150 hover:bg-blue-tint focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue disabled:cursor-wait disabled:opacity-60"
          >
            {loading
              ? 'Cargando publicaciones…'
              : error
                ? 'Reintentar'
                : !posts.length
                  ? 'Seguir buscando publicaciones'
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
