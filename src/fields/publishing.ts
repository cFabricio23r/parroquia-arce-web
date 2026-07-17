import type { Field } from 'payload'

/**
 * Estado de publicacion + fecha. Transversal a toda entidad publica
 * segun el principio rector del PLAN_TECNICO_2026.
 */
export const publishingFields = (): Field[] => [
  {
    name: 'status',
    type: 'select',
    required: true,
    defaultValue: 'draft',
    index: true,
    options: [
      { label: 'Borrador', value: 'draft' },
      { label: 'Publicado', value: 'published' },
      { label: 'Archivado', value: 'archived' },
    ],
    admin: {
      position: 'sidebar',
    },
  },
  {
    name: 'publishedAt',
    type: 'date',
    admin: {
      position: 'sidebar',
      description: 'Fecha que se muestra al publico.',
    },
  },
]
