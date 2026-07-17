'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Reveal-on-scroll con progressive enhancement.
 *
 * Arranca VISIBLE en el SSR: si el JS no llega a correr (chunk que no carga,
 * error de hidratacion), el contenido igual se ve — nunca pagina en blanco.
 * Solo si el JS esta vivo y no hay reduced-motion, oculta y anima al entrar en
 * viewport. Red de seguridad de 1400ms (como el demo) por si el observer no
 * dispara.
 */
export function Reveal({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  // 'visible' es el estado de SSR y el fallback sin JS.
  const [state, setState] = useState<'visible' | 'hidden'>('visible')

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return // queda visible, sin animar
    const el = ref.current
    if (!el) return

    // El JS esta vivo: recien ahora es seguro ocultar para animar la entrada.
    setState('hidden')

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setState('visible')
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )
    io.observe(el)

    // Red de seguridad: si el observer no dispara, visible igual.
    const safety = window.setTimeout(() => setState('visible'), 1400)

    return () => {
      io.disconnect()
      window.clearTimeout(safety)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`transition-[opacity,transform] duration-700 ease-[cubic-bezier(.2,.7,.3,1)] ${
        state === 'visible' ? 'translate-y-0 opacity-100' : 'translate-y-[22px] opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}
