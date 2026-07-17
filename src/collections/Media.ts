import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    group: 'Contenido',
  },
  access: {
    read: anyone,
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
  ],
  upload: true,
}
