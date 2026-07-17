import { postgresAdapter } from '@payloadcms/db-postgres'
import { s3Storage } from '@payloadcms/storage-s3'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { News } from './collections/News'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, News],
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
    s3Storage({
      enabled: true,
      collections: {
        media: {
          // Sin esto, Payload sirve la media por /api/media/file/... y cada
          // imagen se come una invocacion de funcion en Vercel. El bucket
          // `media` es publico, asi que servimos directo desde Supabase.
          generateFileURL: ({ filename, prefix }) =>
            [process.env.S3_PUBLIC_URL, prefix, filename].filter(Boolean).join('/'),
        },
      },
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
    }),
  ],
})
