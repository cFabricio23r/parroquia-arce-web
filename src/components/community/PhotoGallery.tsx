import type { Media } from '@/payload-types'

/**
 * Grilla de fotos. Sin lightbox a proposito (YAGNI) — se agrega si lo piden.
 *
 * El `alt` y el `caption` salen de la coleccion `media`. No se inventa un alt
 * aca ni se deja vacio, y el alt NO se repite como pie de foto visible: es para
 * quien usa lector de pantalla, mostrarlo dos veces es ruido.
 *
 * Con depth default las imagenes vienen pobladas; si alguna llega como number
 * (id sin poblar) se descarta en vez de romper.
 */
export function PhotoGallery({ images }: { images?: (number | Media)[] | null }) {
  const list = (images ?? []).filter(
    (i): i is Media => typeof i === 'object' && i !== null && !!i.url,
  )
  if (list.length === 0) return null

  return (
    <section className="mt-10">
      <h2 className="mb-4 font-display text-[26px] font-medium">Galería</h2>
      <ul className="grid grid-cols-3 gap-3 max-[700px]:grid-cols-2">
        {list.map((img) => (
          <li key={img.id}>
            <figure>
              <div className="overflow-hidden rounded-xl [aspect-ratio:4/3]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url as string}
                  alt={img.alt}
                  className="h-full w-full object-cover"
                />
              </div>
              {img.caption && (
                <figcaption className="mt-1.5 text-[13px] leading-snug text-muted">
                  {img.caption}
                </figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
