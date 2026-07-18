import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageContent } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { locationField } from '../fields/location'

/**
 * Chapel / Ermita. Pertenece a un sector (relationship required). El DATA_MODEL
 * dice que un sector puede tener una o varias ermitas.
 */
export const Chapels: CollectionConfig = {
  slug: 'chapels',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sector', 'status'],
    group: 'Comunidad',
  },
  access: {
    read: publishedOnly,
    create: canManageContent,
    update: canManageContent,
    delete: canManageContent,
  },
  fields: [
    { name: 'name', type: 'text', required: true, label: 'Nombre de la ermita' },
    slugField(),
    {
      name: 'sector',
      type: 'relationship',
      relationTo: 'sectors',
      required: true,
      label: 'Sector',
    },
    { name: 'patronOrDedication', type: 'text', label: 'Patrono / advocación' },
    { name: 'description', type: 'richText', label: 'Descripción' },
    {
      name: 'massSchedule',
      type: 'textarea',
      label: 'Horario de misas',
      admin: { description: 'Una línea por horario.' },
    },
    locationField(),
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    ...publishingFields(),
  ],
}
