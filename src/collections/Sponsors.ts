import { ValidationError, type CollectionConfig } from 'payload'
import { activeOnly } from '../access/activeOnly'
import { canManageComms } from '../access/roles'
import { isFacebookUrl, isInstagramUrl } from '../lib/sponsor-links'

const FACEBOOK_MSG =
  'Pegá el enlace como https://www.facebook.com/… (no el de m.facebook.com ni fb.com)'
const INSTAGRAM_MSG = 'Pegá el enlace como https://www.instagram.com/…'
const LINKS_REQUIRED_MSG =
  'Cargá el enlace de Facebook o de Instagram del negocio: es lo que se le ofrece a cambio del aporte.'

export const Sponsors: CollectionConfig = {
  slug: 'sponsors',
  labels: { singular: 'Patrocinador', plural: 'Patrocinadores' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'category', 'active'],
    group: 'Contenido',
    description: 'Negocios que colaboran cada mes con la página. Los montos no se guardan aquí.',
  },
  defaultSort: 'name',
  access: {
    read: activeOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc, operation, collection }) => {
        // En update el `data` puede venir parcial: se completa con lo guardado.
        const pick = (key: 'facebookUrl' | 'instagramUrl') => {
          const v = data && key in data ? data[key] : originalDoc?.[key]
          return typeof v === 'string' ? v.trim() : ''
        }
        if (!pick('facebookUrl') && !pick('instagramUrl')) {
          throw new ValidationError({
            collection: collection.slug,
            errors: [{ message: LINKS_REQUIRED_MSG, path: 'facebookUrl' }],
          })
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Nombre del negocio',
      required: true,
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      label: 'Logo',
      required: true,
      admin: { description: 'Se muestra entero, sin recortar. Recordá completar la descripción (alt).' },
    },
    {
      name: 'category',
      type: 'text',
      label: 'Rubro',
      admin: { description: 'Ej.: Panadería · Ciudad Arce.' },
    },
    {
      name: 'blurb',
      type: 'textarea',
      label: 'Frase corta',
      maxLength: 160,
    },
    {
      name: 'facebookUrl',
      type: 'text',
      label: 'Facebook',
      validate: (value: string | null | undefined) => {
        if (!value) return true
        return isFacebookUrl(value) || FACEBOOK_MSG
      },
      admin: { description: 'Ej.: https://www.facebook.com/minegocio' },
    },
    {
      name: 'instagramUrl',
      type: 'text',
      label: 'Instagram',
      validate: (value: string | null | undefined) => {
        if (!value) return true
        return isInstagramUrl(value) || INSTAGRAM_MSG
      },
      admin: { description: 'Ej.: https://www.instagram.com/minegocio' },
    },
    {
      name: 'active',
      type: 'checkbox',
      label: 'Activo — se muestra en la web y la app',
      defaultValue: true,
    },
  ],
}
