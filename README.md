# Payload Blank Template

This template comes configured with the bare minimum to get started on anything you need.

## Quick start

This template can be deployed directly from our Cloud hosting and it will setup MongoDB and cloud S3 object storage for media.

## Quick Start - local setup

To spin up this template locally, follow these steps:

### Clone

After you click the `Deploy` button above, you'll want to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

### Development

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables. You'll need to add the `MONGODB_URL` from your Cloud project to your `.env` if you want to use S3 storage and the MongoDB database that was created for you.

3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. open `http://localhost:3000` to open the app in your browser

That's it! Changes made in `./src` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

#### Docker (Optional)

If you prefer to use Docker for local development instead of a local MongoDB instance, the provided docker-compose.yml file can be used.

To do so, follow these steps:

- Modify the `MONGODB_URL` in your `.env` file to `mongodb://127.0.0.1/<dbname>`
- Modify the `docker-compose.yml` file's `MONGODB_URL` to match the above `<dbname>`
- Run `docker-compose up` to start the database, optionally pass `-d` to run in the background.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/3.x/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Media

  This is the uploads enabled collection. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).

## Instalaciones y perfiles de la app

En el admin, **Estadísticas → Instalaciones de la app** muestra una ficha por dispositivo, nombres opcionales, plataforma, versión y primera/última actividad. Incluye total y activos en ventanas móviles de 7/30 días. Solo `super-admin` puede leer las fichas o el resumen; los nombres no son cuentas ni identidades verificadas. El conteo mide dispositivos que abrieron la app, no descargas, desinstalaciones ni personas únicas.

`POST /api/app-installs/ping` acepta `{ deviceHash, platform, appVersion, profile?, profileRevision? }`. El hash SHA-256 nunca es el ID crudo. Perfil: `{ firstName, lastName }`, ambos opcionales como contenido pero requeridos como cadenas si se envía el objeto; máximo 80 caracteres, sin controles. Un perfil vacío borra los nombres. Omitir el objeto conserva los datos existentes. La respuesta pública solo es `{ ok: true }`. `GET /api/app-installs/summary` requiere super-admin y no usa caché.

Cada edición local lleva una revisión numérica persistida; la escritura SQL parametrizada usa `ON CONFLICT` y aplica nombres solo si la revisión es mayor. Así un envío abandonado por timeout no puede restaurar un nombre que se borró después. Los pings diarios sin cambios no reescriben la ficha. El hash es privado: quien lo conozca podría simular actividad. No hay autenticación del teléfono ni garantía contra conteos inventados.

### Puesta en marcha

1. Revisar el historial con `npm run payload -- migrate:status` usando la conexión de migración directa desde local/CI. **No ejecutar todas las migraciones si `initial` aparece pendiente en una base que ya tiene contenido.** El historial antiguo tiene un snapshot inicial incompleto frente a los cambios aplicados históricamente con push.
2. Revisar `src/migrations/20261023_211157_app_installs.ts`: solo crea/amplía `app_installs`, índices y relación de bloqueo interno. Es reaplicable para recuperar el avance previo sin nombres. Activa RLS y revoca acceso de `anon` y `authenticated`; Payload usa su conexión privilegiada. `down` elimina esta colección y sus datos: no usar para una reversión rutinaria.
3. Con el historial reconciliado, aplicar la migración desde local/CI y desplegar el CMS. Runtime vuelve al pooler `6543`. No arrancar desarrollo ni tests con push contra producción.
4. Generar un nuevo binario de la app con expo-application/expo-crypto. Probar primera apertura, omitir, completar perfil, borrarlo y recuperación sin red en un teléfono. Un ping inválido debe responder 400; fichas y resumen sin sesión deben estar denegados.

### Verificación aislada

`npm run test:int -- tests/unit` incluye pruebas con PostgreSQL en memoria mediante PGlite (dependencia de desarrollo), sin leer ni modificar Supabase. Ejecutan el SQL real del endpoint y de la migración, duplicados, borrados que llegan fuera de orden y acceso con roles públicos. La integración completa Payload↔Supabase y la revisión visual de `/admin` requieren una base aislada con esquema completo; no se ejecutan contra la base compartida.
