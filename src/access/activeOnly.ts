import type { Access } from 'payload'

/**
 * El publico solo ve documentos con `active: true`.
 * Un usuario logueado (equipo parroquial) ve todo, incluidos los apagados.
 */
export const activeOnly: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    active: {
      equals: true,
    },
  }
}
