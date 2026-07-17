import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'

export const Formation: CollectionConfig = {
  slug: 'formation',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'audience', 'status', 'publishedAt'],
    group: 'Contenido',
  },
  access: {
    read: publishedOnly,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Resumen corto para el listado.',
      },
    },
    {
      name: 'body',
      type: 'richText',
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Serie', value: 'serie' },
        { label: 'Recurso', value: 'recurso' },
        { label: 'Articulo', value: 'articulo' },
        { label: 'Catequesis', value: 'catequesis' },
      ],
    },
    {
      name: 'audience',
      type: 'select',
      options: [
        { label: 'Para jovenes', value: 'jovenes' },
        { label: 'Familias', value: 'familias' },
        { label: 'Servidores', value: 'servidores' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
    },
    {
      // Archivo descargable (PDF, guia). Presente en el modelo, pero el listado
      // no lo muestra: es para el detalle (spec futuro).
      name: 'resourceFile',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        position: 'sidebar',
      },
    },
    ...publishingFields(),
  ],
}
