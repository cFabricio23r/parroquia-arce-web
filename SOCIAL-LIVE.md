# Actividad y transmisiones de video

`/actividad` presenta tarjetas editoriales propias y permite cargar publicaciones anteriores. Facebook se consulta desde el servidor, sin Page Plugin ni SDK ni iframe en el feed. No guarda publicaciones en el CMS. El widget global de directos sigue siendo independiente: consulta `/api/social-live` cada minuto y solo muestra directos confirmados o anunciados manualmente.

## Publicaciones e historial

- `src/lib/activity-server.ts` adapta Graph API al modelo neutral `ActivityPost`; los componentes no dependen del formato de Meta. Cambiar el proveedor requiere conservar ese contrato.
- Primera página renderizada desde servidor, siguientes páginas mediante `/api/activity?cursor=…`, 9 entradas por petición y caché de 15 minutos. El botón Cargar publicaciones anteriores agrega entradas sin duplicados; ante error conserva lo cargado y permite reintentar.
- Cursores firmados con HMAC del servidor. Nunca se envía el token, ni `paging.next`, al navegador. El servidor solo consulta el host y página configurados.
- Historial significa publicaciones anteriores accesibles por la API, no copia permanente de Facebook. Publicaciones borradas, restricciones y cambios de permisos pueden reducir lo disponible.
- Sin configuración o datos disponibles se ofrece un enlace a Facebook. La caché de Next puede conservar datos anteriores durante una revalidación fallida; si no existe caché, se muestra ese estado vacío útil. No hay noticias de muestra en producción.
- Imágenes remotas de CDN de Meta: proporciones fijas, carga diferida salvo destacada y alternativa visual si fallan. Sin descripciones visuales verificadas se usa alt vacío dentro de un enlace cuyo título identifica la publicación. Las tarjetas secundarias omiten resumen, como en el layout del brief.

## Configuración antes de desplegar

1. Base verificada el 26/9/2026: los seis campos de `social_live` ya existían en `parroquia-arce` (`wdpzcgpkuefpcdxgihmn`). Se comprobaron tipos, defaults, precisión de fechas y ambos enums (`auto`, `manual`, `off`); se registró `20260925_160000_social_live` en `payload_migrations`, batch 1, sin recrear columnas ni modificar contenido. Registro confirmado mediante una consulta posterior. No se ejecutaron otras migraciones ni dev/push. El historial anterior contiene una entrada `dev`: esto no implica que las demás migraciones de la rama estén conciliadas.
2. Configurar `YOUTUBE_API_KEY` en el servidor con acceso a YouTube Data API. El canal está fijado al proporcionado por la parroquia: `UCf6Q3zqeGMyj4pz5fusbyQg`.
3. Para Facebook automático (publicaciones y directos), configurar `FACEBOOK_PAGE_ID` numérico, `FACEBOOK_PAGE_ACCESS_TOKEN` y `FACEBOOK_GRAPH_VERSION` explícita de la app Meta. Obtener y verificar los permisos de lectura de publicaciones y directos con la cuenta administradora. No pegar secretos en globals ni variables `NEXT_PUBLIC_`.
4. En Ajustes → Transmisiones de video, cada plataforma permite automático, manual u oculto. Manual requiere URL del video y fin previsto. Para Facebook, usar URL `/<página>/videos/<id>` o `/watch/?v=<id>`; los enlaces `/share/` no identifican directamente el video.
5. Validar con un directo real: aparición, reproducción incrustada, cambio de plataforma y desaparición al terminar. En Actividad, validar imágenes, enlaces, fechas y al menos dos páginas del historial con publicaciones reales.

## Límites y estados

- YouTube: la búsqueda de nuevos directos usa caché de 20 minutos. La detección inicial puede tardar aproximadamente ese tiempo; manual permite anunciar inmediatamente. La documentación consultada el 25/9/2026 indica 100 búsquedas diarias; 72 al día es el cálculo para una caché continua y única, no una garantía entre deploys/regiones. Supervisar la cuota real.
- Se comprueba el estado actual del video sin caché stale; un replay, evento futuro o video sin permiso de incrustación no genera anuncio. Facebook también consulta estado sin caché stale. Cada visitante activo consulta cada minuto: dimensionar cuotas antes de escalar tráfico.
- `providers` informa `live`, `offline`, `unconfigured`, `unavailable` o `disabled`. No se devuelven tokens ni mensajes de error externos. Ante fallo del CMS el endpoint devuelve 503 con lista vacía.
- La ventana empieza compacta, sin reproducir. Al abrir pausa la radio; cerrar/minimizar retira el iframe. Puede reabrirse desde el aviso. No reinicia la radio automáticamente. La expansión ocurre dentro del sitio, sin exigir soporte nativo de Picture-in-Picture.
- Las publicaciones y controles de Facebook están implementados sobre Graph, pero **no verificados con esta página ni con credenciales reales**. La documentación de Meta bloqueó las consultas; los campos de Post se contrastaron con su SDK oficial. No presentar Facebook automático como conectado hasta probarlo.

Fuentes: [YouTube search.list](https://developers.google.com/youtube/v3/docs/search/list), [videos.list](https://developers.google.com/youtube/v3/docs/videos/list), [Post en SDK oficial de Meta](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/objects/post.js), [paginación en SDK oficial](https://github.com/facebook/facebook-nodejs-business-sdk/blob/main/src/cursor.js), [Meta live_videos](https://developers.facebook.com/docs/graph-api/reference/page/live_videos/).

## Pruebas locales sin DB

`node node_modules/vitest/vitest.mjs run tests/unit` y `node node_modules/typescript/bin/tsc --noEmit`. Se usaron los ejecutables locales porque el wrapper npm del equipo apunta a un npm-cli.js inexistente. No se alteró esa configuración del equipo.
