// Marco de celular en CSS puro. Muestra la captura ENTERA, en su proporcion
// exacta (sin object-fit: cover), con una franja arriba y otra abajo que
// continuan el color de borde de la propia captura. El radio de la pantalla
// es igual al alto de la franja: las esquinas redondeadas solo recortan
// franja, nunca contenido de la app.
//
// El ancho lo da `className` (p. ej. `w-[260px]`). Todo lo demas se mide en
// `cqw` (1% del ancho del contenedor), asi escala solo con el ancho.

type PhoneMockupProps = {
  src: string
  alt: string
  /** Color del borde superior de la captura (franja de estado). */
  edgeTop?: string
  /** Color del borde inferior de la captura (franja de gestos). */
  edgeBottom?: string
  loading?: 'lazy' | 'eager'
  className?: string
}

export function PhoneMockup({
  src,
  alt,
  edgeTop = '#f3fbff',
  edgeBottom = '#ffffff',
  loading = 'lazy',
  className = '',
}: PhoneMockupProps) {
  return (
    <div className={`@container ${className}`.trim()}>
      {/* Marco: bisel navy con borde interior sutil. */}
      <div className="rounded-[8.7cqw] bg-[#0B1220] p-[2.2cqw] shadow-[0_8cqw_14cqw_-5cqw_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.14)]">
        {/* Pantalla: radio = alto de franja. */}
        <div className="overflow-hidden rounded-[6.5cqw]">
          <div aria-hidden="true" className="h-[6.5cqw]" style={{ background: edgeTop }} />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            width={1080}
            height={2189}
            loading={loading}
            decoding="async"
            className="block h-auto w-full"
          />
          <div
            aria-hidden="true"
            className="flex h-[6.5cqw] items-center justify-center"
            style={{ background: edgeBottom }}
          >
            <div className="h-[0.9cqw] w-[30cqw] rounded-full bg-[#0f1726]/35" />
          </div>
        </div>
      </div>
    </div>
  )
}
