type Stat = { value: number; label: string }

/**
 * La fila de numeros grandes bajo el hero del sector.
 *
 * Dos reglas distintas, a proposito:
 * - La PERSEVERANCIA se muestra aunque sea 0 — alguien la cargo, y cero es una
 *   respuesta. Misma leccion que `PerseveranceStat`.
 * - Los CONTEOS (equipo, ermitas, grupos) en 0 se omiten — no son un dato, son la
 *   ausencia de uno. Un "0 ermitas" gigante no le sirve a nadie.
 *
 * Si no queda ni una estadistica, no se dibuja la fila: un sector recien creado
 * no tiene que ver un renglon vacio. Hoy 2 de los 3 sectores estan en ese caso.
 */
export function SectorStats({
  perseverance,
  teamCount = 0,
  chapelCount = 0,
  groupCount = 0,
}: {
  perseverance?: { count?: number | null; label?: string | null } | null
  teamCount?: number
  chapelCount?: number
  groupCount?: number
}) {
  const stats: Stat[] = []

  if (perseverance?.count != null) {
    stats.push({
      value: perseverance.count,
      label: perseverance.label || 'miembros que perseveran',
    })
  }
  if (teamCount > 0) {
    stats.push({
      value: teamCount,
      label: teamCount === 1 ? 'persona en el equipo' : 'personas en el equipo',
    })
  }
  if (chapelCount > 0) {
    stats.push({ value: chapelCount, label: chapelCount === 1 ? 'ermita' : 'ermitas' })
  }
  if (groupCount > 0) {
    stats.push({ value: groupCount, label: groupCount === 1 ? 'grupo' : 'grupos' })
  }

  if (stats.length === 0) return null

  // Clases literales y completas, nunca `grid-cols-${n}`: Tailwind escanea el
  // fuente como texto plano y una clase armada en runtime no se genera nunca.
  const cols = ['', 'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4'][stats.length]

  return (
    <dl
      className={`grid ${cols} gap-px overflow-hidden rounded-xl border border-border bg-border max-[760px]:grid-cols-2`}
    >
      {stats.map((s) => (
        <div key={s.label} className="bg-white px-6 py-5">
          <dd className="font-display text-[34px] font-medium leading-none">{s.value}</dd>
          <dt className="mt-2 text-[12px] font-bold uppercase tracking-[.1em] text-muted">
            {s.label}
          </dt>
        </div>
      ))}
    </dl>
  )
}
