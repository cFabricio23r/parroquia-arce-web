import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Migración acotada: el snapshot previo no reflejaba los cambios de contenido
// aplicados históricamente con push. No recrear ni eliminar esas tablas.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DO $$ BEGIN
      CREATE TYPE "public"."enum_app_installs_platform" AS ENUM('android', 'ios');
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE TABLE IF NOT EXISTS "app_installs" (
      "id" serial PRIMARY KEY NOT NULL,
      "device_hash" varchar NOT NULL,
      "first_name" varchar,
      "last_name" varchar,
      "platform" "enum_app_installs_platform" NOT NULL,
      "app_version" varchar NOT NULL,
      "first_seen_at" timestamp(3) with time zone NOT NULL,
      "last_seen_at" timestamp(3) with time zone NOT NULL,
      "updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
      "created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
    );
    ALTER TABLE "app_installs" ADD COLUMN IF NOT EXISTS "first_name" varchar;
    ALTER TABLE "app_installs" ADD COLUMN IF NOT EXISTS "last_name" varchar;
    ALTER TABLE "app_installs" ADD COLUMN IF NOT EXISTS "profile_revision" numeric DEFAULT -1 NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "app_installs_device_hash_idx" ON "app_installs" USING btree ("device_hash");
    CREATE INDEX IF NOT EXISTS "app_installs_last_seen_at_idx" ON "app_installs" USING btree ("last_seen_at");
    CREATE INDEX IF NOT EXISTS "app_installs_updated_at_idx" ON "app_installs" USING btree ("updated_at");
    CREATE INDEX IF NOT EXISTS "app_installs_created_at_idx" ON "app_installs" USING btree ("created_at");
    ALTER TABLE "app_installs" ENABLE ROW LEVEL SECURITY;
    DO $$ BEGIN
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
        REVOKE ALL ON TABLE "app_installs" FROM anon;
      END IF;
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
        REVOKE ALL ON TABLE "app_installs" FROM authenticated;
      END IF;
    END $$;
    ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "app_installs_id" integer;
    DO $$ BEGIN
      ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_app_installs_fk"
        FOREIGN KEY ("app_installs_id") REFERENCES "public"."app_installs"("id") ON DELETE cascade ON UPDATE no action;
    EXCEPTION WHEN duplicate_object THEN NULL; END $$;
    CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_app_installs_id_idx" ON "payload_locked_documents_rels" USING btree ("app_installs_id");
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_app_installs_fk";
    DROP INDEX IF EXISTS "payload_locked_documents_rels_app_installs_id_idx";
    ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "app_installs_id";
    DROP TABLE IF EXISTS "app_installs";
    DROP TYPE IF EXISTS "public"."enum_app_installs_platform";
  `)
}
