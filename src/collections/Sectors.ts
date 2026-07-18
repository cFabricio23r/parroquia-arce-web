import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageContent } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { contactField } from '../fields/contact'
import { locationField } from '../fields/location'

/**
 * Sector: la unidad territorial de la parroquia. Es la coleccion mas rica del
 * DATA_MODEL (~17 campos), asi que se organiza en tabs para que el editor
 * parroquial no vea una lista plana e inusable.
 */
export const Sectors: CollectionConfig = {
  slug: 'sectors',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'number', 'status', 'publishedAt'],
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
            { name: 'name', type: 'text', required: true, label: 'Nombre del sector / ermita' },
            slugField(),
            {
              type: 'row',
              fields: [
                { name: 'number', type: 'number', label: 'Número de sector' },
                { name: 'chapelName', type: 'text', label: 'Nombre de la ermita' },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Resumen',
              admin: { description: 'Texto corto para las tarjetas del listado.' },
            },
            { name: 'description', type: 'richText', label: 'Descripción' },
            { name: 'history', type: 'richText', label: 'Historia' },
          ],
        },
        {
          label: 'Ubicación',
          fields: [locationField()],
        },
        {
          label: 'Responsables y contacto',
          fields: [
            { name: 'responsibleName', type: 'text', label: 'Responsable' },
            {
              name: 'assistants',
              type: 'array',
              label: 'Colaboradores',
              fields: [{ name: 'name', type: 'text' }],
            },
            contactField(),
          ],
        },
      ],
    },
    // Sidebar
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      admin: { position: 'sidebar' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Destacar en la home.' },
    },
    ...publishingFields(),
  ],
}
