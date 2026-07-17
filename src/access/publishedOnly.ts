import type { Access } from 'payload'

/**
 * El publico solo ve documentos `published`.
 * Un usuario logueado (equipo parroquial) ve todo, incluidos borradores.
 */
export const publishedOnly: Access = ({ req: { user } }) => {
  if (user) return true

  return {
    status: {
      equals: 'published',
    },
  }
}
