import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { isAuthenticated } from '../access/roles'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Archivo', plural: 'Imágenes y archivos' },
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
      label: 'Texto alternativo',
      required: true,
      admin: {
        description:
          'Describí qué se ve en la imagen. Obligatorio: es lo que escucha quien usa lector de pantalla.',
      },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Pie de foto',
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
