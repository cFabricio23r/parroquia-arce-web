/**
 * "45 · miembros que perseveran". Se renderiza solo si hay un numero cargado.
 * La guarda es `== null` y no `!count` a proposito: cero es un dato valido.
 */
export function PerseveranceStat({
  count,
  label,
}: {
  count?: number | null
  label?: string | null
}) {
  if (count == null) return null

  return (
    <div className="mt-6 rounded-xl border border-border bg-bg-soft p-6">
      <p className="font-display text-[40px] font-medium leading-none">{count}</p>
      <p className="mt-2 text-[12px] font-bold uppercase tracking-[.1em] text-muted">
        {label || 'miembros que perseveran'}
      </p>
    </div>
  )
}
