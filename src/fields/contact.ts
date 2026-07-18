import type { Field } from 'payload'

/**
 * Group de contacto reutilizable. Anida los datos como `contact.phone`, etc.
 * Segun el DATA_MODEL los datos de contacto personal son opcionales.
 */
export const contactField = (): Field => ({
  name: 'contact',
  type: 'group',
  admin: {
    description: 'Datos de contacto. Todos opcionales.',
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', label: 'Teléfono' },
        { name: 'whatsapp', type: 'text', label: 'WhatsApp' },
      ],
    },
    { name: 'email', type: 'email' },
    {
      name: 'socialLinks',
      type: 'array',
      label: 'Redes sociales',
      admin: { description: 'Facebook, YouTube, Instagram, etc.' },
      fields: [
        {
          name: 'platform',
          type: 'select',
          options: [
            { label: 'Facebook', value: 'facebook' },
            { label: 'YouTube', value: 'youtube' },
            { label: 'Instagram', value: 'instagram' },
            { label: 'WhatsApp', value: 'whatsapp' },
            { label: 'Otro', value: 'otro' },
          ],
        },
        { name: 'url', type: 'text' },
      ],
    },
  ],
})
