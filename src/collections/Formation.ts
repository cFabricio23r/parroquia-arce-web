import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageComms } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'

export const Formation: CollectionConfig = {
  slug: 'formation',
  labels: { singular: 'Material de formación', plural: 'Formación' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'audience', 'status', 'publishedAt'],
    group: 'Contenido',
  },
  access: {
    read: publishedOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
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
        description: 'Resumen corto para el listado.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Contenido',
    },
    {
      name: 'category',
      type: 'select',
      label: 'Categoría',
      options: [
        { label: 'Serie', value: 'serie' },
        { label: 'Recurso', value: 'recurso' },
        { label: 'Artículo', value: 'articulo' },
        { label: 'Catequesis', value: 'catequesis' },
      ],
    },
    {
      name: 'audience',
      type: 'select',
      label: 'Dirigido a',
      options: [
        { label: 'Jóvenes', value: 'jovenes' },
        { label: 'Familias', value: 'familias' },
        { label: 'Servidores', value: 'servidores' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      label: 'Imagen de portada',
    },
    {
      // Archivo descargable (PDF, guia). Presente en el modelo, pero el listado
      // no lo muestra: es para el detalle (spec futuro).
      name: 'resourceFile',
      type: 'upload',
      relationTo: 'media',
      label: 'Archivo descargable',
      admin: { description: 'PDF o guía que la gente puede descargar.' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      label: 'Destacado',
      admin: {
        position: 'sidebar',
        description: 'Destacar en la portada del sitio.',
      },
    },
    ...publishingFields(),
  ],
}
