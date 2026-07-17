/**
 * Encabezado de seccion — ds.css:156-162. Titulo con enfasis en azul + bajada.
 * Dos columnas en desktop, una bajo 1040px.
 */
export function SectionHead({
  title,
  emphasis,
  lead,
}: {
  title: string
  emphasis?: string
  lead?: string
}) {
  return (
    <div className="mb-10 grid grid-cols-[1.1fr_.9fr] items-end gap-8 max-[1040px]:grid-cols-1 max-[1040px]:gap-[14px]">
      <h2 className="font-display text-[clamp(32px,4.2vw,52px)] font-medium leading-[1.04] tracking-[-.01em]">
        {title} {emphasis && <em className="italic text-blue">{emphasis}</em>}
      </h2>
      {lead && <p className="max-w-[46ch] text-[18px] text-muted">{lead}</p>}
    </div>
  )
}
