import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageComms } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'

/**
 * Radio Program. Un programa tiene muchos episodios (ver RadioEpisodes).
 * Lo administra Comunicaciones.
 */
export const RadioPrograms: CollectionConfig = {
  slug: 'radio-programs',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'dayOfWeek', 'status'],
    group: 'Radio',
  },
  access: {
    read: publishedOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField(),
    { name: 'description', type: 'textarea' },
    { name: 'hostName', type: 'text', label: 'Conduce' },
    {
      type: 'row',
      fields: [
        {
          name: 'dayOfWeek',
          type: 'select',
          label: 'Día',
          options: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo', 'diario'].map(
            (v) => ({ label: v, value: v }),
          ),
        },
        { name: 'startTime', type: 'text', label: 'Hora inicio' },
        { name: 'endTime', type: 'text', label: 'Hora fin' },
      ],
    },
    { name: 'cover', type: 'upload', relationTo: 'media', admin: { position: 'sidebar' } },
    ...publishingFields(),
  ],
}
