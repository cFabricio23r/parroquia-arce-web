import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageComms } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'

export const News: CollectionConfig = {
  slug: 'news',
  labels: { singular: 'Noticia', plural: 'Noticias' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'status', 'publishedAt'],
    group: 'Contenido',
  },
  access: {
    read: publishedOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  // NO se activa `versions: { drafts: true }`. Payload's drafts agregan su propio
  // campo `_status` (draft/published), que conviviria con nuestro `status` y le
  // mostraria DOS controles de publicacion distintos al editor parroquial.
  // Nuestro `status` gana porque el DATA_MODEL exige 3 estados (incluye `archived`)
  // y `_status` solo tiene 2. Historial de versiones: reevaluar en Fase 1B.
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Título',
      required: true,
    },
    slugField(),
    {
      name: 'excerpt',
      type: 'textarea',
      label: 'Resumen',
      admin: {
        description: 'Resumen corto para listados y redes.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Cuerpo de la noticia',
    },
    {
      name: 'category',
      type: 'select',
      label: 'Categoría',
      options: [
        { label: 'Aviso', value: 'aviso' },
        { label: 'Comunicado', value: 'comunicado' },
        { label: 'Celebración', value: 'celebracion' },
        { label: 'Pastoral', value: 'pastoral' },
        { label: 'Emergencia', value: 'emergencia' },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Destacada',
      admin: {
        position: 'sidebar',
        description: 'Destacar en la portada del sitio.',
      },
    },
    ...publishingFields(),
  ],
}
