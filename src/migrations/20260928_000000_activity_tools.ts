import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Esquema contrastado con adapter.init() offline, sin conexión a la base. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "activity" (
      "id" serial PRIMARY KEY NOT NULL,
      "connection" jsonb,
      "notice_enabled" boolean DEFAULT false,
      "notice_title" varchar,
      "notice_message" varchar,
      "notice_url" varchar,
      "notice_ends_at" timestamp(3) with time zone,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
    -- Los diagnósticos se leen mediante Payload con control de acceso.
    ALTER TABLE "activity" ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE "activity" FROM anon, authenticated;
    REVOKE ALL ON SEQUENCE "activity_id_seq" FROM anon, authenticated;
  `)
}

/** Reversión deliberada: elimina aviso y diagnóstico guardados. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "activity";`)
}
