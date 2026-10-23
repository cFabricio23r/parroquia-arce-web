'use client'

import { useEffect, useRef, useState } from 'react'
import type { FacebookHealthState, StoredFacebookHealth } from '../../lib/facebook-health'

const labels: Record<FacebookHealthState, string> = {
  ok: 'Conexión correcta',
  unconfigured: 'Falta configuración en el servidor',
  'token-invalid': 'Token vencido o inválido: reemplazalo en el servidor',
  permissions: 'Faltan permisos o acceso a la página en Meta',
  unavailable: 'No disponible: revisá la conexión e intentá nuevamente',
}
function date(value?: string | null) {
  return value && Number.isFinite(Date.parse(value))
    ? new Intl.DateTimeFormat('es-SV', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'America/El_Salvador',
      }).format(new Date(value))
    : 'Sin registro'
}

export function FacebookHealth() {
  const [health, setHealth] = useState<StoredFacebookHealth>({})
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')
  const active = useRef<AbortController | null>(null)
  async function check(method: 'GET' | 'POST') {
    active.current?.abort()
    const controller = new AbortController()
    active.current = controller
    const timeout = setTimeout(() => controller.abort(), 20000)
    try {
      const response = await fetch('/api/globals/activity/facebook-health', {
        method,
        credentials: 'same-origin',
        signal: controller.signal,
      })
      if (!response.ok) throw new Error('No disponible')
      const data = await response.json()
      if (!controller.signal.aborted) setHealth(data)
    } catch {
      if (active.current === controller)
        setError('No pudimos cargar el estado. Verificá tu sesión y volvé a intentar.')
    } finally {
      clearTimeout(timeout)
      if (active.current === controller) setBusy(false)
    }
  }
  useEffect(() => {
    const timer = setTimeout(() => void check('GET'), 0)
    return () => {
      clearTimeout(timer)
      active.current?.abort()
      active.current = null
    }
  }, [])
  return (
    <section
      aria-labelledby="facebook-health-title"
      style={{
        border: '1px solid var(--theme-elevation-200)',
        borderRadius: 8,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <h2 id="facebook-health-title">Conexión con Facebook</h2>
      <p>Estado guardado de la última comprobación. Las horas se muestran para El Salvador.</p>
      <div role="status" aria-live="polite">
        <p>
          <strong>Publicaciones:</strong> {health.posts ? labels[health.posts] : 'Sin comprobar'}
        </p>
        <p>
          <strong>Directos:</strong> {health.live ? labels[health.live] : 'Sin comprobar'}
        </p>
        <p>Última comprobación: {date(health.checkedAt)}</p>
        <p>Última conexión exitosa de ambos servicios: {date(health.lastSuccessAt)}</p>
      </div>
      {error && <p role="alert">{error}</p>}
      <button
        type="button"
        disabled={busy}
        onClick={() => {
          setBusy(true)
          setError('')
          void check('POST')
        }}
        style={{ minHeight: 44, padding: '10px 18px', cursor: busy ? 'wait' : 'pointer' }}
      >
        {busy ? 'Comprobando…' : 'Comprobar conexión'}
      </button>
      <p>
        <small>
          Se consulta Facebook al pulsar el botón, como máximo una vez cada 30 segundos. Este
          diagnóstico no publica contenido.
        </small>
      </p>
    </section>
  )
}
