import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageContent } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { eventTypeOptions } from '../lib/event-types'

/**
 * Event. El ADMIN_PANEL_PLAN exige fecha, hora y lugar. `startsAt` y
 * `locationName` son required. Se relaciona (opcionalmente) con el sector y el
 * grupo que lo organizan — relationship real, no texto suelto.
 */
export const Events: CollectionConfig = {
  slug: 'events',
  labels: { singular: 'Evento', plural: 'Eventos' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'eventType', 'startsAt', 'status'],
    group: 'Comunidad',
  },
  access: {
    read: publishedOnly,
    create: canManageContent,
    update: canManageContent,
    delete: canManageContent,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Información',
          fields: [
            { name: 'title', type: 'text', required: true, label: 'Título' },
            slugField(),
            {
              name: 'eventType',
              type: 'select',
              label: 'Tipo de evento',
              options: eventTypeOptions,
            },
            { name: 'description', type: 'richText', label: 'Descripción' },
          ],
        },
        {
          label: 'Cuándo y dónde',
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'startsAt',
                  type: 'date',
                  required: true,
                  label: 'Inicio',
                  admin: { date: { pickerAppearance: 'dayAndTime' } },
                },
                {
                  name: 'endsAt',
                  type: 'date',
                  label: 'Fin',
                  admin: { date: { pickerAppearance: 'dayAndTime' } },
                },
              ],
            },
            { name: 'locationName', type: 'text', required: true, label: 'Lugar' },
          ],
        },
        {
          label: 'Relaciones',
          fields: [
            {
              name: 'sector',
              type: 'relationship',
              relationTo: 'sectors',
              label: 'Sector que lo organiza',
            },
            {
              name: 'group',
              type: 'relationship',
              relationTo: 'groups',
              label: 'Grupo que lo organiza',
            },
          ],
        },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Destacado',
      admin: { position: 'sidebar', description: 'Destacar en la portada del sitio.' },
    },
    ...publishingFields(),
  ],
}
