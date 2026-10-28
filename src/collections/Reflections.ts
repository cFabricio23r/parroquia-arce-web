import type { CollectionConfig } from 'payload'
import { publishedOnly } from '../access/publishedOnly'
import { canManageComms } from '../access/roles'
import { slugField } from '../fields/slug'
import { publishingFields } from '../fields/publishing'
import { validateDurationMinutes } from '../lib/duration-minutes'

export const Reflections: CollectionConfig = {
  slug: 'reflections',
  labels: { singular: 'Reflexión', plural: 'Reflexiones' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'preacherName', 'weekOf', 'status'],
    group: 'Contenido',
  },
  defaultSort: '-weekOf',
  access: {
    read: publishedOnly,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  // Sin `versions.drafts`, igual que News: `status` es el unico control de publicacion.
  fields: [
    {
      name: 'title',
      type: 'text',
      label: 'Tema',
      required: true,
      admin: { description: 'Ej.: "La santidad en lo de todos los días".' },
    },
    slugField('title'),
    {
      name: 'quote',
      type: 'textarea',
      label: 'Frase',
      maxLength: 200,
      admin: {
        description: 'La frase de la tarjeta. Sin frase, la tarjeta muestra el tema.',
      },
    },
    {
      name: 'quoteRef',
      type: 'text',
      label: 'Cita bíblica',
      admin: { description: 'Ej.: Mt 5, 3.' },
    },
    {
      name: 'preacherName',
      type: 'text',
      label: 'Predicador',
      required: true,
      admin: { description: 'Ej.: Hno. Nombre Apellido.' },
    },
    {
      name: 'preacherPhoto',
      type: 'upload',
      relationTo: 'media',
      label: 'Foto del predicador',
      admin: { description: 'Opcional. Sin foto se muestran las iniciales.' },
    },
    {
      name: 'weekOf',
      type: 'date',
      label: 'Semana del',
      required: true,
      admin: {
        date: { pickerAppearance: 'dayOnly' },
        description:
          'Elegí el domingo con que empieza la semana de la reflexión. Se ve en el sitio y la app desde ese día; si la cargás antes, queda guardada y aparece sola.',
      },
    },
    {
      name: 'audio',
      type: 'upload',
      relationTo: 'audio',
      label: 'Audio',
      required: true,
      admin: {
        description: 'El audio grabado, en MP3 o M4A. Podés subirlo acá mismo o elegir uno de Audios.',
      },
    },
    {
      name: 'durationMinutes',
      type: 'number',
      label: 'Duración (minutos)',
      min: 1,
      max: 120,
      validate: validateDurationMinutes,
      admin: {
        step: 1,
        description: 'Cuántos minutos dura, más o menos. Si lo dejás vacío, no se muestra.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      label: 'Sobre el tema',
    },
    ...publishingFields(),
  ],
}
