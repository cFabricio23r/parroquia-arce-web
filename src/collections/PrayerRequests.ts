import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/roles'

/**
 * Peticion de oracion. Sensible por diseno (DATA_MODEL): privada por defecto,
 * solo visible para administradores. El publico puede ENVIAR (create), pero
 * NADIE anonimo puede leerlas. Nada se menciona al aire sin revision.
 */
export const PrayerRequests: CollectionConfig = {
  slug: 'prayer-requests',
  labels: { singular: 'Petición de oración', plural: 'Peticiones de oración' },
  admin: {
    useAsTitle: 'intentionType',
    defaultColumns: ['intentionType', 'status', 'allowPublicMention', 'createdAt'],
    group: 'Pastoral',
  },
  access: {
    // Cualquiera puede enviar una peticion desde el sitio.
    create: () => true,
    // Solo el super admin las ve, edita o borra. Son privadas.
    read: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', label: 'Nombre (opcional)' },
    { name: 'contact', type: 'text', label: 'Contacto (opcional)' },
    { name: 'message', type: 'textarea', required: true, label: 'Petición' },
    {
      name: 'intentionType',
      type: 'select',
      label: 'Tipo de intención',
      defaultValue: 'general',
      options: [
        { label: 'General', value: 'general' },
        { label: 'Salud', value: 'salud' },
        { label: 'Difuntos', value: 'difuntos' },
        { label: 'Acción de gracias', value: 'accion-gracias' },
        { label: 'Familia', value: 'familia' },
      ],
    },
    {
      name: 'status',
      type: 'select',
      label: 'Estado',
      defaultValue: 'pendiente',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Pendiente de revisión', value: 'pendiente' },
        { label: 'Revisada', value: 'revisada' },
        { label: 'Orada', value: 'orada' },
      ],
    },
    {
      name: 'allowPublicMention',
      type: 'checkbox',
      defaultValue: false,
      label: 'Autoriza mención pública',
      admin: {
        position: 'sidebar',
        description: 'Solo si la persona autorizó que se lea al aire.',
      },
    },
    // Auditoria de la revision (DATA_MODEL: reviewed_by / reviewed_at).
    {
      name: 'reviewedBy',
      type: 'relationship',
      relationTo: 'users',
      label: 'Revisada por',
      admin: { position: 'sidebar', readOnly: true },
    },
    {
      name: 'reviewedAt',
      type: 'date',
      label: 'Fecha de revisión',
      admin: { position: 'sidebar', readOnly: true },
    },
  ],
}
