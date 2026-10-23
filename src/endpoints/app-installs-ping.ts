import { sql } from '@payloadcms/db-postgres'
import type { PayloadRequest } from 'payload'
import { parsePing } from '../lib/app-installs'

const json = (data: unknown, status = 200) =>
  Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } })

/** Registro seudónimo. Una sentencia atómica evita duplicados y perfiles fuera de orden. */
export async function appInstallsPingEndpoint(req: PayloadRequest): Promise<Response> {
  let body: unknown
  try { body = typeof req.json === 'function' ? await req.json() : undefined }
  catch { return json({ error: 'Solicitud inválida' }, 400) }
  const ping = parsePing(body)
  if (!ping) return json({ error: 'Solicitud inválida' }, 400)
  const now = new Date().toISOString()
  const revision = ping.profile ? (ping.profileRevision ?? 0) : -1
  try {
    // Payload update(where) primero selecciona IDs y no impone el orden de forma
    // atómica. Esta colección no tiene hooks/versiones. Solo esta escritura
    // validada usa SQL, con todos los valores como parámetros vinculados.
    await req.payload.db.drizzle.execute(sql`
      INSERT INTO "app_installs" (
        "device_hash", "platform", "app_version", "first_seen_at", "last_seen_at",
        "first_name", "last_name", "profile_revision", "created_at", "updated_at"
      ) VALUES (
        ${ping.deviceHash}, ${ping.platform}, ${ping.appVersion}, ${now}, ${now},
        ${ping.profile?.firstName ?? ''}, ${ping.profile?.lastName ?? ''}, ${revision}, ${now}, ${now}
      )
      ON CONFLICT ("device_hash") DO UPDATE SET
        "first_name" = CASE WHEN EXCLUDED."profile_revision" > "app_installs"."profile_revision" THEN EXCLUDED."first_name" ELSE "app_installs"."first_name" END,
        "last_name" = CASE WHEN EXCLUDED."profile_revision" > "app_installs"."profile_revision" THEN EXCLUDED."last_name" ELSE "app_installs"."last_name" END,
        "profile_revision" = GREATEST(EXCLUDED."profile_revision", "app_installs"."profile_revision"),
        "last_seen_at" = GREATEST(EXCLUDED."last_seen_at", "app_installs"."last_seen_at"),
        "app_version" = CASE WHEN EXCLUDED."last_seen_at" >= "app_installs"."last_seen_at" THEN EXCLUDED."app_version" ELSE "app_installs"."app_version" END,
        "updated_at" = GREATEST(EXCLUDED."updated_at", "app_installs"."updated_at")
      WHERE EXCLUDED."profile_revision" > "app_installs"."profile_revision"
         OR ("app_installs"."last_seen_at" AT TIME ZONE 'America/El_Salvador')::date < (EXCLUDED."last_seen_at" AT TIME ZONE 'America/El_Salvador')::date
    `)
    return json({ ok: true })
  } catch { return json({ error: 'No disponible' }, 503) }
}
