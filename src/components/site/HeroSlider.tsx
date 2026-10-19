'use client'
import { useEffect, useState, type ReactNode } from 'react'
export type HeroImage = { url: string; alt: string }
export function HeroSlider({ images, children }: { images: HeroImage[]; children: ReactNode }) {
  const [active, setActive] = useState(0)
  const [paused, setPaused] = useState(false)
  const [reduce, setReduce] = useState(true)
  const multi = images.length > 1
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setReduce(media.matches)
    sync()
    media.addEventListener('change', sync)
    return () => media.removeEventListener('change', sync)
  }, [])
  useEffect(() => {
    if (!multi || paused || reduce) return
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), 6000)
    return () => clearInterval(id)
  }, [multi, paused, reduce, images.length])
  return (
    <div
      role="region"
      aria-label="Portada de la parroquia"
      className="relative flex min-h-[440px] flex-col justify-end overflow-hidden sm:min-h-[520px]"
    >
      {images.length ? (
        images.map((img, i) => (
          <div
            key={img.url + i}
            aria-hidden={i !== active}
            role="img"
            aria-label={i === active ? img.alt : undefined}
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-700 motion-reduce:transition-none"
            style={{ backgroundImage: `url(${img.url})`, opacity: i === active ? 1 : 0 }}
          />
        ))
      ) : (
        <div className="absolute inset-0 bg-navy" />
      )}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(0deg, rgba(5,23,51,.94), rgba(5,23,51,.6) 40%, rgba(5,23,51,.2)), linear-gradient(105deg, rgba(5,23,51,.5), transparent 80%)',
        }}
      />
      {multi && (
        <div className="absolute right-4 top-2 z-20 flex items-center gap-1 rounded-pill bg-navy-deep/75 px-2 text-white">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setActive(i)
                setPaused(true)
              }}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === active}
              className="grid h-11 w-11 place-items-center rounded-full focus-visible:outline-white"
            >
              <span
                className={`h-2 w-2 rounded-full ${i === active ? 'bg-amber' : 'bg-white/60'}`}
              />
            </button>
          ))}
          {!reduce && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="min-h-11 rounded-pill px-3 text-sm font-semibold focus-visible:outline-white"
            >
              {paused ? 'Reanudar fotos' : 'Pausar fotos'}
            </button>
          )}
        </div>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
