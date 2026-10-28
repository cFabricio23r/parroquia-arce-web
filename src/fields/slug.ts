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
    // En un update sin slug en `data`, Payload pasa el guardado (getFallbackValue). Si no cambió, queda
    // tal cual: un slug viejo que toSlug acomodaría (`misa--gallo`, más de 80) no puede cambiar solo.
    if (operation === 'update' && value === originalDoc?.slug) return value
    // Payload no pasa `id` a los hooks de campo; en un update sale de originalDoc.
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
      description: `Es la dirección de esta página en la web. No hace falta completarlo: se arma solo con el ${word} cuando guardás. Una vez publicada, no lo cambies, porque los enlaces ya compartidos dejarían de funcionar. Si lo dejás vacío y guardás, se genera de nuevo desde el ${word}.`,
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
