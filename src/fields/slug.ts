import type { Field, FieldHook } from 'payload'
import { toSlug, uniqueSlug } from '../lib/slugify'

/**
 * Campo slug reutilizable. El DATA_MODEL exige slug unico en toda
 * entidad publica (web y app dependen de el para las rutas).
 *
 * Si el slug queda vacio, se arma solo a partir de `from` (title o name).
 * Un slug ya cargado nunca cambia solo: cambiarlo rompe enlaces compartidos.
 */
export const slugField = (from: 'title' | 'name'): Field => {
  const word = from === 'title' ? 'título' : 'nombre'

  const generate: FieldHook = async (args) => {
    const { value, data, originalDoc, req, collection, operation } = args
    // Un update parcial (API) que no manda el slug no lo toca: `data` trae solo lo enviado.
    if (operation === 'update' && value === undefined) return undefined
    // `id` llega en runtime pero FieldHookArgs no lo tipa; originalDoc.id es el respaldo.
    const id =
      (args as { id?: number | string }).id ??
      (originalDoc as { id?: number | string } | undefined)?.id
    const typed = toSlug(typeof value === 'string' ? value : '')
    if (typed) return typed

    const collectionSlug = collection?.slug as string
    const source = data?.[from] ?? originalDoc?.[from]
    const base =
      toSlug(typeof source === 'string' ? source : '') ||
      `${collectionSlug}-${Date.now().toString(36).slice(-4)}`

    const isTaken = async (candidate: string): Promise<boolean> => {
      const res = await req.payload.find({
        collection: collectionSlug as never,
        where: {
          slug: { equals: candidate },
          ...(id ? { id: { not_equals: id } } : {}),
        },
        limit: 1,
        depth: 0,
        req,
        overrideAccess: true,
      })
      return res.totalDocs > 0
    }

    return uniqueSlug(base, isTaken)
  }

  return {
    name: 'slug',
    type: 'text',
    label: 'Slug (dirección web)',
    required: true,
    unique: true,
    index: true,
    admin: {
      description: `Se llena solo con el ${word} al guardar. Si ya está publicado, no lo cambies: cambia la dirección y los enlaces compartidos dejan de andar. Para hacer uno nuevo, borralo y guardá.`,
    },
    hooks: { beforeValidate: [generate] },
    // El admin valida sin correr hooks: el vacío tiene que pasar, el hook lo llena después.
    validate: (value: string | null | undefined) => {
      if (!value) return true
      if (!/^[a-z0-9-]+$/.test(value)) {
        return 'Solo minúsculas, números y guiones. Sin espacios ni tildes.'
      }
      return true
    },
  }
}
