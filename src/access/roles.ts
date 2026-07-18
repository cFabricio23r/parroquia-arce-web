import type { Access } from 'payload'

/**
 * Control de acceso por rol. Los roles viven en Users (`super-admin`,
 * `contenido`, `comunicaciones`). El equipo parroquial no toca codigo, asi que
 * el admin refleja quien puede editar que.
 */

type Role = 'super-admin' | 'contenido' | 'comunicaciones'

const hasRole =
  (...roles: Role[]): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    return roles.includes(user.role as Role)
  }

/** Solo super admin. Para lo sensible (peticiones de oracion, usuarios). */
export const isAdmin = hasRole('super-admin')

/** Contenido pastoral: sectores, ermitas, grupos, eventos. */
export const canManageContent = hasRole('super-admin', 'contenido')

/** Comunicaciones: noticias, formacion, radio. */
export const canManageComms = hasRole('super-admin', 'comunicaciones')

/** Cualquiera del equipo logueado. Para media. */
export const isAuthenticated: Access = ({ req: { user } }) => Boolean(user)
