'use client'

import { useEffect, useState } from 'react'
import { parishNow, type Clock } from '@/lib/radio-schedule'

/** Cada cuanto se vuelve a mirar el reloj. Suficiente para cambiar de programa a tiempo. */
const TICK_MS = 30_000

/**
 * El reloj de la parroquia, en el cliente.
 *
 * Devuelve null en el primer render (SSR y primer frame del cliente) a proposito:
 * la pagina tiene `revalidate = 300`, asi que un "ahora" calculado en el servidor
 * quedaria congelado hasta 5 minutos y ademas provocaria desajuste de hidratacion.
 * Con null, la UI muestra el estado en vivo sin nombre de programa y se completa
 * al montar.
 */
export function useParishClock(): Clock | null {
  const [clock, setClock] = useState<Clock | null>(null)

  useEffect(() => {
    const tick = () => setClock(parishNow())
    tick()
    const id = setInterval(tick, TICK_MS)
    return () => clearInterval(id)
  }, [])

  return clock
}
