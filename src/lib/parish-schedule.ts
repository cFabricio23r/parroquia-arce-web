import type { Contact } from '@/payload-types'

export type ScheduleKind = 'misa' | 'devocion' | 'confesion'

export type MassRow = {
  id: string
  label: string
  time: string
  kind: ScheduleKind
  detail: string
}
export type SacramentRow = { title: string; detail: string }

export type ParishSchedule = {
  misas: MassRow[]
  devociones: MassRow[]
  sacramentos: SacramentRow[]
  hasMisas: boolean
  hasDevociones: boolean
  hasSacramentos: boolean
}

/** Lo que `deriveSchedule` necesita del global `contact`. */
export type ScheduleSource = Partial<Pick<Contact, 'massSchedule' | 'sacraments'>>

const clean = (v?: string | null): string => (v ?? '').trim()

/**
 * Las filas cargadas antes de que existiera `kind` lo tienen en NULL: en Payload
 * `defaultValue` aplica a filas nuevas, no retroactivamente. Sin este default las
 * misas que ya estan en produccion desaparecerian del hero. Un valor desconocido
 * cae al mismo lado por la misma razon: ante la duda, no se esconde una misa.
 */
const normalizeKind = (k?: string | null): ScheduleKind =>
  k === 'devocion' || k === 'confesion' ? k : 'misa'

/**
 * Criterio unico de "hay horarios publicables".
 *
 * Una fila cuenta solo si tiene dia Y horario — para misas y para devociones por
 * igual: una fila a medio cargar publicaria "Jueves" sin hora, que es peor que no
 * mostrar nada. Un sacramento cuenta con solo el nombre; el detalle es opcional.
 *
 * `hasMisas` significa misas y solo misas: lo consumen el nav, la barra del hero
 * y el CTA de la portada, que anuncian misa. Contaminarlo con devociones haria
 * que el sitio prometa una misa que no existe.
 *
 * Es pura a proposito: el global `contact` vive en una base compartida con
 * produccion y no se puede tocar desde un test.
 */
export function deriveSchedule(contact: ScheduleSource): ParishSchedule {
  const filas: MassRow[] = (contact.massSchedule ?? [])
    .map((r, i) => ({
      // El `id` de Payload es la key de React. Tres filas dicen "Jueves", asi
      // que el label no sirve como key. El fallback por indice es estable
      // dentro de un render y solo entra si la fila no viene de la base.
      id: clean(r.id) || `horario-${i}`,
      label: clean(r.label),
      time: clean(r.time),
      kind: normalizeKind(r.kind),
      detail: clean(r.detail),
    }))
    .filter((r) => r.label !== '' && r.time !== '')

  const misas = filas.filter((r) => r.kind === 'misa')
  const devociones = filas.filter((r) => r.kind !== 'misa')

  const sacramentos: SacramentRow[] = (contact.sacraments ?? [])
    .map((r) => ({ title: clean(r.title), detail: clean(r.detail) }))
    .filter((r) => r.title !== '')

  return {
    misas,
    devociones,
    sacramentos,
    hasMisas: misas.length > 0,
    hasDevociones: devociones.length > 0,
    hasSacramentos: sacramentos.length > 0,
  }
}
