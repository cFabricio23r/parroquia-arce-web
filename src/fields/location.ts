import type { Field } from 'payload'

/**
 * Group de ubicacion reutilizable, compartido por `sectors` y `chapels`.
 *
 * Los tres campos responden a tres preguntas distintas, y por eso son tres
 * campos: `address` se LEE ("Canton Las Cruces"), `mapUrl` se TOCA (abre Google
 * Maps), y `coordinates` alimentaria un mapa embebido el dia que exista.
 *
 * `mapUrl` nace de un bug real: sin un lugar para el enlace, el editor pego un
 * link de Google Maps dentro de `address`, y la web lo imprimio crudo en la
 * tarjeta del listado, en el detalle y en el badge de la home.
 */
export const locationField = (): Field => ({
  name: 'location',
  type: 'group',
  label: 'Ubicación',
  admin: {
    description: 'Dónde queda y cómo llegar.',
  },
  fields: [
    {
      name: 'address',
      type: 'text',
      label: 'Dirección',
      admin: {
        description:
          'La dirección en palabras, como se la dirías a alguien: "Cantón Las Cruces, Ciudad Arce". El enlace del mapa NO va acá.',
      },
    },
    {
      name: 'mapUrl',
      type: 'text',
      label: 'Enlace del mapa',
      admin: {
        description:
          'El enlace de Google Maps o Waze. En el sitio se muestra como un botón "Ver en el mapa".',
      },
      // El campo es opcional: el vacio es valido y tiene que pasar, o el editor no
      // puede guardar un sector sin mapa.
      validate: (value: string | null | undefined) => {
        if (!value) return true
        return /^https?:\/\//i.test(value.trim())
          ? true
          : 'Pegá el enlace completo, empezando con https://'
      },
    },
    {
      name: 'coordinates',
      type: 'point',
      label: 'Coordenadas (mapa)',
      admin: {
        description:
          'Primero la LONGITUD, después la latitud. Para Ciudad Arce son aproximadamente -89.44, 13.86. Invertirlas manda el punto al otro lado del mundo.',
      },
    },
  ],
})
