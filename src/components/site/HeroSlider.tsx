'use client'

import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export type HeroImage = { url: string; alt: string }

/**
 * Fondo del hero: rota entre las fotos cargadas en el CMS (cross-fade + dots).
 * Si no hay fotos, muestra un fondo navy sobrio para que nunca quede en blanco.
 * El contenido (texto, botones, barra de misas) va como `children`, encima.
 */
export function HeroSlider({ images, children }: { images: HeroImage[]; children: ReactNode }) {
  const [active, setActive] = useState(0)
  const has = images.length > 0
  const multi = images.length > 1

  useEffect(() => {
    if (!multi) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), 6000)
    return () => clearInterval(id)
  }, [multi, images.length])

  return (
    <div
      role="region"
      aria-label="Portada de la parroquia"
      className="relative flex min-h-[600px] flex-col justify-end overflow-hidden"
    >
      {has ? (
        images.map((img, i) => (
          <div
            key={i}
            aria-hidden={i !== active}
            role="img"
            aria-label={i === active ? img.alt : undefined}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 motion-reduce:transition-none"
            style={{ backgroundImage: `url(${img.url})`, opacity: i === active ? 1 : 0 }}
          />
        ))
      ) : (
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(120% 90% at 78% 6%, rgba(97,194,230,.22), transparent 55%), radial-gradient(90% 80% at 10% 100%, rgba(232,143,33,.15), transparent 60%), linear-gradient(155deg, #12365f, var(--color-navy) 52%, var(--color-navy-deep))',
          }}
        />
      )}

      {/* Scrim para legibilidad del texto: vertical (para la barra y el texto)
          + lateral izquierdo (para que la columna de texto se lea sobre
          cualquier foto, incluso en las zonas claras de arriba). */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(5,23,51,.9) 0%, rgba(5,23,51,.6) 34%, rgba(5,23,51,.28) 58%, rgba(5,23,51,.12) 78%, transparent 100%), linear-gradient(105deg, rgba(5,23,51,.62) 0%, rgba(5,23,51,.28) 34%, transparent 62%)',
        }}
      />

      {multi && (
        <div className="absolute left-[clamp(24px,5vw,64px)] top-6 z-10 flex gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className={`h-2 rounded-full transition-all ${i === active ? 'w-[22px] bg-amber' : 'w-2 bg-white/40 hover:bg-white/70'}`}
            />
          ))}
        </div>
      )}

      {!has && (
        <span className="absolute right-6 top-[22px] z-10 text-xs text-white/50">
          Agregá fotos desde el panel de administración
        </span>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  )
}
