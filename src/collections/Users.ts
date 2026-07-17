import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    group: 'Sistema',
  },
  auth: true,
  fields: [
    // Email lo agrega Payload por defecto
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'contenido',
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'Contenido', value: 'contenido' },
        { label: 'Comunicaciones', value: 'comunicaciones' },
      ],
    },
  ],
}
