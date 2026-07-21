import type { CollectionConfig } from 'payload'
import { isAdmin } from '../access/roles'

/**
 * Usuarios del equipo parroquial. El access es CRITICO: sin esto, el default de
 * Payload deja que cualquier usuario logueado edite cualquier user — incluido su
 * propio `role` —, con lo que un editor podria auto-promoverse a super-admin y
 * anular todo el control por rol (y leer las peticiones privadas).
 *
 * - Crear/borrar usuarios: solo super-admin.
 * - Leer/editar: uno mismo o super-admin.
 * - El campo `role`: solo super-admin puede cambiarlo (field-level access).
 */
const selfOrAdmin: CollectionConfig['access'] = {
  create: isAdmin,
  delete: isAdmin,
  read: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'super-admin') return true
    // Cada quien solo se ve a si mismo.
    return { id: { equals: user.id } }
  },
  update: ({ req: { user } }) => {
    if (!user) return false
    if (user.role === 'super-admin') return true
    return { id: { equals: user.id } }
  },
}

export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: 'Usuario', plural: 'Usuarios' },
  admin: {
    useAsTitle: 'email',
    group: 'Sistema',
  },
  auth: true,
  access: selfOrAdmin,
  fields: [
    // Email lo agrega Payload por defecto
    {
      name: 'name',
      type: 'text',
      label: 'Nombre',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Rol',
      required: true,
      defaultValue: 'contenido',
      // Field-level access: aunque un editor pueda editar SU usuario (nombre),
      // solo el super-admin puede cambiar el rol. Cierra la auto-promocion.
      access: {
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
      options: [
        { label: 'Super admin', value: 'super-admin' },
        { label: 'Contenido', value: 'contenido' },
        { label: 'Comunicaciones', value: 'comunicaciones' },
      ],
    },
  ],
}
