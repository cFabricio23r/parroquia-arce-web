import type { Contact } from '@/payload-types'

export type MassRow = { label: string; time: string }
export type SacramentRow = { title: string; detail: string }

export type ParishSchedule = {
  misas: MassRow[]
  sacramentos: SacramentRow[]
  hasMisas: boolean
  hasSacramentos: boolean
}

/** Lo que `deriveSchedule` necesita del global `contact`. */
export type ScheduleSource = Partial<Pick<Contact, 'massSchedule' | 'sacraments'>>

const clean = (v?: string | null): string => (v ?? '').trim()

/**
 * Criterio unico de "hay horarios publicables".
 *
 * Una fila de misa cuenta solo si tiene dia Y horario: una fila a medio cargar
 * publicaria "Domingo" sin hora, que es peor que no mostrar nada. Un sacramento
 * cuenta con solo el nombre; el detalle es opcional.
 *
 * Es pura a proposito: el global `contact` vive en una base compartida con
 * produccion y no se puede tocar desde un test.
 */
export function deriveSchedule(contact: ScheduleSource): ParishSchedule {
  const misas: MassRow[] = (contact.massSchedule ?? [])
    .map((r) => ({ label: clean(r.label), time: clean(r.time) }))
    .filter((r) => r.label !== '' && r.time !== '')

  const sacramentos: SacramentRow[] = (contact.sacraments ?? [])
    .map((r) => ({ title: clean(r.title), detail: clean(r.detail) }))
    .filter((r) => r.title !== '')

  return {
    misas,
    sacramentos,
    hasMisas: misas.length > 0,
    hasSacramentos: sacramentos.length > 0,
  }
}
