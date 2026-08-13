import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageContent } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { contactField } from '../fields/contact'
import { teamField } from '../fields/team'
import { perseveranceField } from '../fields/perseverance'
import { galleryField } from '../fields/gallery'
import { patronField } from '../fields/patron'
import { patronalFeastsField } from '../fields/patronalFeasts'

/**
 * Group / Ministry. Organizado en tabs: la info del grupo, los datos de reunion
 * (dia/hora/lugar) y el contacto del coordinador.
 */
export const Groups: CollectionConfig = {
  slug: 'groups',
  labels: { singular: 'Grupo o ministerio', plural: 'Grupos y ministerios' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'publishedAt'],
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
            { name: 'name', type: 'text', required: true, label: 'Nombre del grupo' },
            slugField(),
            {
              name: 'type',
              type: 'select',
              label: 'Tipo',
              options: [
                { label: 'Pastoral', value: 'pastoral' },
                { label: 'Ministerio', value: 'ministerio' },
                { label: 'Comunidad', value: 'comunidad' },
                { label: 'Servicio', value: 'servicio' },
                { label: 'Formación', value: 'formacion' },
              ],
            },
            {
              name: 'summary',
              type: 'textarea',
              label: 'Resumen',
              admin: { description: 'Texto corto para las tarjetas del listado.' },
            },
            // Los dos richText se usan de verdad y dicen cosas distintas, asi que
            // el admin tiene que explicar cual gana. Sin esto, el voluntario no
            // tiene forma de saber que llenar solo "Historia" la convierte en el
            // texto principal de la pagina. Ver src/lib/group-body.ts.
            {
              name: 'description',
              type: 'richText',
              label: 'Descripción',
              admin: {
                description:
                  'Qué es y qué hace el grupo hoy. Es lo primero que se lee en la página. Si lo dejás vacío, se muestra la Historia en su lugar.',
              },
            },
            {
              name: 'history',
              type: 'richText',
              label: 'Historia',
              admin: {
                description:
                  'Cómo y cuándo se fundó. Si no hay Descripción, esta historia es el texto principal; si están las dos, aparece aparte, más abajo.',
              },
            },
            perseveranceField(),
            patronField(),
            patronalFeastsField({
              nameHint: 'El nombre del santo o la advocación. Ej.: San Francisco Javier.',
              description:
                'Si el grupo tiene más de un patrono, cargá uno por fila con su fecha y dejá vacío el Nombre de arriba. Sin año: se repiten todos los años.',
            }),
          ],
        },
        {
          label: 'Reuniones',
          fields: [
            {
              name: 'meeting',
              type: 'group',
              label: 'Reunión',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'day', type: 'text', label: 'Día' },
                    { name: 'time', type: 'text', label: 'Hora' },
                  ],
                },
                { name: 'place', type: 'text', label: 'Lugar' },
              ],
            },
            {
              name: 'howToJoin',
              type: 'textarea',
              label: 'Cómo sumarse',
              admin: { description: 'Qué hacer para integrarse al grupo.' },
            },
          ],
        },
        {
          label: 'Equipo y contacto',
          fields: [
            teamField(),
            contactField(),
            {
              name: 'coordinatorName',
              type: 'text',
              label: 'Coordinador/a (campo viejo)',
              admin: {
                hidden: true,
                description: 'Reemplazado por Equipo. Se borra en una obra aparte.',
              },
            },
          ],
        },
        {
          label: 'Fotos',
          fields: [
            {
              name: 'logo',
              type: 'upload',
              relationTo: 'media',
              label: 'Logo del grupo',
              admin: { description: 'El isotipo del grupo. Se muestra junto al título.' },
            },
            {
              name: 'cover',
              type: 'upload',
              relationTo: 'media',
              label: 'Imagen de portada',
              admin: {
                description: 'La imagen ancha de arriba y la de la tarjeta del listado.',
              },
            },
            {
              name: 'groupPhoto',
              type: 'upload',
              relationTo: 'media',
              label: 'Foto del grupo',
              admin: { description: 'La foto con los miembros.' },
            },
            galleryField(),
          ],
        },
      ],
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
