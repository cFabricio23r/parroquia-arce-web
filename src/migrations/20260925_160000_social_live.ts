import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Columnas y enums comprobados con adapter.init() offline, sin conexión ni push. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TYPE "public"."enum_settings_social_live_youtube_mode" AS ENUM ('auto', 'manual', 'off');
    CREATE TYPE "public"."enum_settings_social_live_facebook_mode" AS ENUM ('auto', 'manual', 'off');
    ALTER TABLE "settings"
      ADD COLUMN "social_live_youtube_mode" "enum_settings_social_live_youtube_mode" DEFAULT 'auto',
      ADD COLUMN "social_live_youtube_url" varchar,
      ADD COLUMN "social_live_youtube_ends_at" timestamp(3) with time zone,
      ADD COLUMN "social_live_facebook_mode" "enum_settings_social_live_facebook_mode" DEFAULT 'auto',
      ADD COLUMN "social_live_facebook_url" varchar,
      ADD COLUMN "social_live_facebook_ends_at" timestamp(3) with time zone;
  `)
}

/** Una reversión elimina únicamente la configuración de anuncios de video. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "settings"
      DROP COLUMN "social_live_youtube_mode",
      DROP COLUMN "social_live_youtube_url",
      DROP COLUMN "social_live_youtube_ends_at",
      DROP COLUMN "social_live_facebook_mode",
      DROP COLUMN "social_live_facebook_url",
      DROP COLUMN "social_live_facebook_ends_at";
    DROP TYPE "public"."enum_settings_social_live_youtube_mode";
    DROP TYPE "public"."enum_settings_social_live_facebook_mode";
  `)
}
