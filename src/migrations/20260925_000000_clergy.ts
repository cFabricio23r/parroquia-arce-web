import { type MigrateDownArgs, type MigrateUpArgs, sql } from '@payloadcms/db-postgres'

/** Delta generado offline entre la config actual sin clergy y con clergy. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    CREATE TABLE "clergy" (
      "id" serial PRIMARY KEY NOT NULL,
      "pastor_published" boolean DEFAULT false,
      "pastor_name" varchar,
      "pastor_role" varchar DEFAULT 'Párroco',
      "pastor_photo_id" integer,
      "pastor_summary" varchar,
      "pastor_biography" jsonb,
      "assistant_published" boolean DEFAULT false,
      "assistant_name" varchar,
      "assistant_role" varchar DEFAULT 'Sacerdote auxiliar',
      "assistant_photo_id" integer,
      "assistant_summary" varchar,
      "assistant_biography" jsonb,
      "updated_at" timestamp(3) with time zone,
      "created_at" timestamp(3) with time zone
    );
    ALTER TABLE "clergy" ADD CONSTRAINT "clergy_pastor_photo_id_media_id_fk"
      FOREIGN KEY ("pastor_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    ALTER TABLE "clergy" ADD CONSTRAINT "clergy_assistant_photo_id_media_id_fk"
      FOREIGN KEY ("assistant_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
    CREATE INDEX "clergy_pastor_pastor_photo_idx" ON "clergy" USING btree ("pastor_photo_id");
    CREATE INDEX "clergy_assistant_assistant_photo_idx" ON "clergy" USING btree ("assistant_photo_id");

    -- Los visitantes pasan por Payload: nunca deben leer la fila completa,
    -- que puede incluir el borrador del otro sacerdote, desde la Data API.
    ALTER TABLE "clergy" ENABLE ROW LEVEL SECURITY;
    REVOKE ALL ON TABLE "clergy" FROM anon, authenticated;
    REVOKE ALL ON SEQUENCE "clergy_id_seq" FROM anon, authenticated;
  `)
}

/** Solo para una reversión deliberada: elimina los perfiles cargados. */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE "clergy";`)
}
