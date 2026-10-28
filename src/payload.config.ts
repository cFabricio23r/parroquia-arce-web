import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { es } from '@payloadcms/translations/languages/es'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { canManageComms } from './access/roles'
import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Audio } from './collections/Audio'
import { News } from './collections/News'
import { Reflections } from './collections/Reflections'
import { Formation } from './collections/Formation'
import { Sectors } from './collections/Sectors'
import { Groups } from './collections/Groups'
import { Events } from './collections/Events'
import { Chapels } from './collections/Chapels'
import { RadioPrograms } from './collections/RadioPrograms'
import { RadioEpisodes } from './collections/RadioEpisodes'
import { PrayerRequests } from './collections/PrayerRequests'
import { AppInstalls } from './collections/AppInstalls'
import { Home } from './globals/Home'
import { Contact } from './globals/Contact'
import { Settings } from './globals/Settings'
import { Clergy } from './globals/Clergy'
import { Activity } from './globals/Activity'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const publicFileURL = ({ filename, prefix }: { filename: string; prefix?: string }) =>
  [process.env.S3_PUBLIC_URL, prefix, filename].filter(Boolean).join('/')

const s3Shared = {
  enabled: true,
  bucket: process.env.S3_BUCKET || '',
  config: {
    // Supabase exige path-style; sin esto los uploads fallan con 404.
    forcePathStyle: true,
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || '',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  },
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Users,
    Media,
    Audio,
    News,
    Reflections,
    Formation,
    Sectors,
    Chapels,
    Groups,
    Events,
    RadioPrograms,
    RadioEpisodes,
    PrayerRequests,
    AppInstalls,
  ],
  globals: [Home, Contact, Settings, Clergy, Activity],
  // El panel lo usan voluntarios de la parroquia: la UI de Payload (botones,
  // columnas, filtros, mensajes de error, login) va toda en espanol. Se declara
  // `es` como unico idioma soportado para que no aparezca el selector.
  i18n: {
    fallbackLanguage: 'es',
    supportedLanguages: { es },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    // Media: subida por el servidor (sin clientUploads), como siempre.
    s3Storage({
      ...s3Shared,
      collections: {
        media: {
          // Sin esto, Payload sirve la media por /api/media/file/... y cada
          // imagen se come una invocacion de funcion en Vercel. El bucket
          // `media` es publico, asi que servimos directo desde Supabase.
          generateFileURL: publicFileURL,
        },
      },
    }),
    // Audio: subida directa del navegador al bucket. `clientUploads` es una
    // opcion del plugin (no de cada coleccion), por eso va en una segunda
    // instancia: asi media no cambia. Vercel limita el body de una funcion a
    // 4.5 MB y un audio de reflexion lo supera. Requiere CORS con PUT para el
    // dominio del sitio en el bucket de Supabase.
    s3Storage({
      ...s3Shared,
      clientCacheKey: 's3:audio',
      // Solo comunicaciones/super-admin piden URLs firmadas (mismo permiso que crear audios).
      clientUploads: {
        access: ({ req }) => Boolean(canManageComms({ req } as Parameters<typeof canManageComms>[0])),
      },
      collections: {
        audio: { generateFileURL: publicFileURL },
      },
    }),
  ],
})
