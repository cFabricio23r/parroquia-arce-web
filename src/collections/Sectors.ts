import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageContent } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { contactField } from '../fields/contact'
import { locationField } from '../fields/location'
import { teamField } from '../fields/team'

/**
 * Sector: la unidad territorial de la parroquia. Es la coleccion mas rica del
 * DATA_MODEL (~17 campos), asi que se organiza en tabs para que el editor
 * parroquial no vea una lista plana e inusable.
 */
export const Sectors: CollectionConfig = {
  slug: 'sectors',
  labels: { singular: 'Sector', plural: 'Sectores' },
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
          label: 'Equipo y contacto',
          fields: [
            teamField(),
            contactField(),
            {
              name: 'responsibleName',
              type: 'text',
              label: 'Responsable (campo viejo)',
              admin: {
                hidden: true,
                description: 'Reemplazado por Equipo. Se borra en una obra aparte.',
              },
            },
            {
              name: 'assistants',
              type: 'array',
              label: 'Colaboradores (campo viejo)',
              labels: { singular: 'Colaborador/a', plural: 'Colaboradores' },
              admin: {
                hidden: true,
                description: 'Reemplazado por Equipo. Se borra en una obra aparte.',
              },
              fields: [{ name: 'name', type: 'text', label: 'Nombre' }],
            },
          ],
        },
      ],
    },
    // Sidebar
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
