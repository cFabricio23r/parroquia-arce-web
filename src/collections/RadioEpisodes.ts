import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageComms } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'

/**
 * Radio Episode. Pertenece a un programa (relationship). Guarda la URL del audio
 * (grabacion). Lo administra Comunicaciones.
 */
export const RadioEpisodes: CollectionConfig = {
  slug: 'radio-episodes',
  labels: { singular: 'Episodio de radio', plural: 'Episodios de radio' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'program', 'status', 'publishedAt'],
    group: 'Radio',
  },
  access: {
    read: publishedOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  fields: [
    { name: 'title', type: 'text', required: true, label: 'Título' },
    slugField(),
    {
      name: 'program',
      type: 'relationship',
      relationTo: 'radio-programs',
      required: true,
      label: 'Programa',
    },
    { name: 'description', type: 'textarea', label: 'Descripción' },
    { name: 'audioUrl', type: 'text', label: 'URL del audio' },
    ...publishingFields(),
  ],
}
