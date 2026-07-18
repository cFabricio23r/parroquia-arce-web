import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAuthenticated } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Contenido',
  },
  access: {
    read: anyone,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
      admin: {
        description: 'Texto alternativo. Obligatorio por accesibilidad.',
      },
    },
    {
      name: 'caption',
      type: 'text',
    },
    {
      name: 'credit',
      type: 'text',
      label: 'Crédito / autor',
      admin: { description: 'Fotógrafo o fuente, si corresponde.' },
    },
  ],
  upload: true,
}
