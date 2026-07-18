# Deploy — Repo A (`parroquia-arce-web`)

Proyecto Supabase: `parroquia-arce` — ref `wdpzcgpkuefpcdxgihmn` (org Flaretek, us-east-1).

## Variables de entorno en Vercel (Settings → Environment Variables)

| Variable | Valor | Notas |
|---|---|---|
| `DATABASE_URL` | connection string del **pooler, puerto 6543** | Modo transaccion. Obligatorio en serverless. |
| `PAYLOAD_SECRET` | string aleatorio de 32 bytes | `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `S3_BUCKET` | `media` | |
| `S3_REGION` | `us-east-1` | |
| `S3_ENDPOINT` | `https://wdpzcgpkuefpcdxgihmn.storage.supabase.co/storage/v1/s3` | Lleva el subdominio `.storage.` |
| `S3_ACCESS_KEY_ID` | de Supabase → Storage → S3 Connection | |
| `S3_SECRET_ACCESS_KEY` | idem | |
| `S3_PUBLIC_URL` | `https://wdpzcgpkuefpcdxgihmn.supabase.co/storage/v1/object/public/media` | Base publica del bucket. No es secreto. |

**NO cargar `DATABASE_URL_DIRECT` en Vercel.** La conexion directa (5432) es IPv6-only
y las funciones de Vercel no la alcanzan. Solo se usa localmente para migraciones.

## Pasos

1. Importar `cFabricio23r/parroquia-arce-web` en Vercel. Framework: Next.js.
2. Cargar las variables de arriba (Production + Preview).
3. Deploy.
4. Verificar `/admin` y `/api/news`.

## Migraciones

Se corren **desde una maquina local o CI**, nunca desde Vercel:

```bash
npm run migrate
```

## Notas operativas

- El filesystem de Vercel es efimero: la media va a Supabase Storage (ya configurado).
- **Free tier de Supabase:** el proyecto se pausa tras ~7 dias sin trafico y despierta
  (lento) al primer request. Esperable en desarrollo. Supabase Pro ($25/mes) lo elimina.
- **Nunca** apuntar el dev local a la DB de produccion: `push` reescribe el esquema.

## Hechos verificados en la ejecucion de Fase 1A (2026-07-16)

Cosas que se comprobaron ejecutando, y que contradicen lo que asumia el plan:

- **El host del pooler es `aws-0-us-east-1.pooler.supabase.com`.** Verificado conectando:
  `aws-1-...` existe pero responde `tenant or user not found`. No reconstruir el hostname
  a mano — copiarlo de Connect.
- **La conexion directa `db.<REF>.supabase.co` no resuelve por IPv4** (`ENOTFOUND`), asi
  que `DATABASE_URL_DIRECT` no sirve desde una maquina sin IPv6. `migrate:create` funciona
  igual por el pooler. Si `npm run migrate` falla en el deploy real, es por aca.
- **El endpoint S3 lleva `.storage.`**: `https://<REF>.storage.supabase.co/...`, no
  `https://<REF>.supabase.co/...` como decia el plan.
- **La media se sirve directo del bucket** via `S3_PUBLIC_URL` + `generateFileURL`. Sin eso,
  Payload la sirve por `/api/media/file/...` y cada imagen gasta una invocacion en Vercel.
- **`create-payload-app --secret` se ignora**: el scaffold genera su propio secreto (24
  chars). Hay que sobreescribir `PAYLOAD_SECRET` a mano.
- **Los tests de integracion corren en serie** (`fileParallelism: false`): comparten una
  sola base y en paralelo chocan creando los mismos enums (Postgres 42710).
- **Despues de agregar cualquier plugin con componentes de admin hay que correr
  `npm run generate:importmap`, con el dev server APAGADO.** El plugin `s3Storage`
  registra `S3ClientUploadHandler`; sin regenerar el importMap, `/admin` revienta en
  `(payload)/layout.tsx`. Peor: si el dev server esta corriendo, el comando **no hace
  nada y sale con exito** — no imprime `Generating import map` y deja el archivo igual.
  Si el comando no imprime esa linea, no corrio: apaga el dev server y repetilo.

## Hechos verificados en el primer deploy real (2026-07-17)

El primer deploy a produccion choco con tres trampas en secuencia. Todas reproducibles;
resueltas, el sitio quedo vivo en <https://parroquia-arce-web.vercel.app>.

- **El build ve git, NO tu disco.** `Events.ts` estaba en local pero sin commitear.
  Vercel clona de GitHub y fallo con `Module not found: Can't resolve './collections/Events'`
  (lo importa `payload.config.ts`). Local compilaba porque el archivo estaba en disco.
  Antes de deployar: `git status` limpio y `git ls-files` que confirme que todo esta trackeado.

- **Bloqueo por autor del commit (plan Hobby).** Vercel bloquea los deploys disparados por
  push cuyo email del **autor del commit** no este vinculado a la cuenta. La cuenta de Vercel
  usa **`fabricio.23@live.com`**. Todo commit que se deploye debe ir firmado con ese email
  (`git config user.email "fabricio.23@live.com"`). Sintoma exacto: *"The deployment was
  blocked because the commit author did not have contributing access to the project"*.
  Workaround puntual: `vercel --prod` por CLI (se atribuye al dueño autenticado, saltea el
  control) — pero no arregla los push futuros; la firma correcta si.

- **Las paginas del frontend prerenderean contra la DB en tiempo de build.** `/eventos`,
  `/noticias`, etc. inicializan Payload y consultan la base durante `next build`. Por eso el
  build necesita `PAYLOAD_SECRET` y `DATABASE_URL` cargadas en Vercel, y la base de prod debe
  estar **migrada y sembrada ANTES** de cada deploy. Sin `PAYLOAD_SECRET`, el prerender falla
  con *"missing secret key. A secret key is needed to secure Payload"*.
