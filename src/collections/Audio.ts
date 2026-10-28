import type { CollectionConfig } from 'payload'
import { anyone } from '../access/anyone'
import { canManageComms } from '../access/roles'

export const Audio: CollectionConfig = {
  slug: 'audio',
  labels: { singular: 'Audio', plural: 'Audios' },
  admin: {
    group: 'Contenido',
    useAsTitle: 'description',
  },
  access: {
    read: anyone,
    create: canManageComms,
    update: canManageComms,
    delete: canManageComms,
  },
  fields: [
    {
      name: 'description',
      type: 'text',
      label: 'Descripción',
      required: true,
      admin: {
        description:
          'Contá qué es el audio. Ej.: Reflexión del Hno. … sobre las Bienaventuranzas.',
      },
    },
  ],
  upload: {
    mimeTypes: ['audio/mpeg', 'audio/mp4', 'audio/x-m4a', 'audio/aac'],
  },
}
