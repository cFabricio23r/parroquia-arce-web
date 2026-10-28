import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Descarga de la app en `settings.app`. DDL tomado del schema que arma el
 * adaptador offline (sin conexion ni push), filtrado a lo que agrega este grupo:
 * el snapshot previo no refleja cambios aplicados historicamente con push.
 * `settings_rels` aparece por `screenshots` (upload hasMany); hoy no existia.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "app_available" boolean DEFAULT false;
    ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "app_android_url" varchar;
    ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "app_version" varchar;
    ALTER TABLE "settings" ADD COLUMN IF NOT EXISTS "app_size_mb" numeric;
    CREATE TABLE IF NOT EXISTS "settings_rels" (
      "id" serial PRIMARY KEY NOT NULL,
      "order" integer,
      "parent_id" integer NOT NULL,
      "path" varchar NOT NULL,
      "media_id" integer
    );
    DO $$ BEGIN
      ALTER TABLE "settings_rels" ADD CONSTRAINT "settings_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."settings"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    DO $$ BEGIN
      ALTER TABLE "settings_rels" ADD CONSTRAINT "settings_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS "settings_rels_order_idx" ON "settings_rels" USING btree ("order");
    CREATE INDEX IF NOT EXISTS "settings_rels_parent_idx" ON "settings_rels" USING btree ("parent_id");
    CREATE INDEX IF NOT EXISTS "settings_rels_path_idx" ON "settings_rels" USING btree ("path");
    CREATE INDEX IF NOT EXISTS "settings_rels_media_id_idx" ON "settings_rels" USING btree ("media_id");
    ALTER TABLE "settings_rels" ENABLE ROW LEVEL SECURITY;
  `)
}

/** La reversion borra solo lo que agrego `up`: el grupo app y su tabla de relaciones. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "settings_rels" CASCADE;
    ALTER TABLE "settings"
      DROP COLUMN IF EXISTS "app_available",
      DROP COLUMN IF EXISTS "app_android_url",
      DROP COLUMN IF EXISTS "app_version",
      DROP COLUMN IF EXISTS "app_size_mb";
  `)
}
