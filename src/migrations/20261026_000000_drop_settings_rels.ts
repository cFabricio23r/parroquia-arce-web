import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/**
 * Quita `settings_rels`: existia solo por `settings.app.screenshots` (upload
 * hasMany), campo que se elimino. `down` la recrea tal cual la dejo
 * `20261025_000000_app_download`.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DROP TABLE IF EXISTS "settings_rels" CASCADE;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
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
