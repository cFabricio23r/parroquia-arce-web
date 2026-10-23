# Correcciones de sectores y grupos — 6 de octubre de 2026

## Aplicado en el CMS

Se revisaron los 22 sectores, 24 grupos y 3 ermitas. Se conservaron sus estados de publicación y el número de documentos. Hay respaldos previos en `corrections/`.

- Tildes, espacios y roles; contactos de El Salvador normalizados al código +503. Se retiró el nombre guardado como teléfono en Predicadores, conservando el equipo.
- Resúmenes de los nueve grupos con contenido. Presentación e historia separadas cuando la información disponible lo permite. Lista de comunidades de Renovación y lista de secretarios de MEC convertidas en listas semánticas.
- Sectores 1, 10 y 13: resúmenes cortos y presentación con fiesta, actividades y medios de crecimiento. Sector 13: historia en dos párrafos. Sector 22: historia en cuatro párrafos, sin alterar los datos recibidos.
- Patronos completados en sectores 8, 15 y 22 desde su propio contenido. No se sustituyeron patronos según una localidad distinta del mismo sector.
- 25 medios con texto alternativo corregido después de inspeccionar las imágenes.
- 14 imágenes de referencia de patronos obtenidas de Wikimedia Commons, con identidad y licencia revisadas, texto alternativo, fuente y crédito guardados. Se reutilizaron dos imágenes existentes y se compartieron las representaciones correspondientes entre sectores. Se agregaron 19 vínculos: 21 de los 22 sectores tienen imagen de patrono.

Las imágenes de internet representan al patrono; no se presentan como fotografías de las ermitas locales. Las fuentes y licencias individuales están en `patron-images.json` y en cada registro de media.

## Cambios del sitio preparados y verificados

- Mostrar patrono e imagen en el detalle de sector, con fuente y licencia cuando corresponda.
- Mostrar Presentación y luego Historia, evitando repetir el mismo cuerpo. Presentación vuelve a ser editable en el admin mediante la columna existente.
- Usar «Lugar de reunión» para el lugar del sector cuando no tiene una ermita relacionada.
- Usar «Horarios y celebraciones» para el texto que reúne misa, Hora Santa y Celebración de la Palabra.
- Mostrar «Imagen de referencia» en un grupo que tiene imagen pero no patrono asignado, como la Escuela Básica en la Fe.

**Publicación pendiente:** el conector de Vercel respondió 403 por falta de acceso al proyecto y la CLI no tenía credenciales. Se solicitó al usuario completar la autenticación. Los datos y las imágenes sí están guardados en el CMS; estos ajustes del frontend permanecen en el código local hasta publicar.

## Comprobaciones

- 300 tests unitarios aprobados; tres regresiones observadas fallando antes de corregir los componentes.
- TypeScript sin errores y compilación de producción exitosa: 374 páginas generadas.
- 46 páginas de detalle públicas respondieron HTTP 200 y las 14 nuevas imágenes son accesibles públicamente.
- 46 páginas del frontend corregido respondieron HTTP 200 en la compilación local. Se comprobó la presencia de todas las imágenes de patrono vinculadas y de las actividades del sector 10.
- La lista de MEC y los cuatro párrafos del sector 22 se verificaron mediante lectura posterior y comparación del texto: no se cambió su contenido histórico.

No se realizaron pruebas de integración que creen datos en la base compartida. Las comprobaciones de render fueron de HTML; no constituyen una auditoría visual completa.

## Pendientes que requieren información de la parroquia

- Sector 14: la fuente indica Divina Providencia, sin identificar la representación concreta. No se asignó una advocación mariana por suposición.
- Sectores 12 y 22: confirmar La Reforma/La Joyita y el número 24 en la historia del sector 22.
- MEC: confirmar dependencia hasta 2021 frente a independencia en 2002.
- Sectores 8/23 y 15/16: aclarar cobertura y distintas ermitas o patronos locales.
- 15 sectores conservan información básica, ahora con imagen del patrono cuando fue identificable: 2, 3, 4, 5, 6, 7, 9, 11, 14, 16, 17, 19, 20, 21 y 23. Faltan equipo, fotos locales, contacto, ubicación precisa y actividad actual.
- 15 grupos siguen sin descripción documentada: Medio Ambiente, Pastoral Social, Apóstoles, Vocacional, Juvenil, Familiar, Veteranos de P.J., Tercera Orden Franciscana, Pequeños Hermanos de María, Pequeñas Comunidades, Evangelización, Ministerios de Alabanza, Comunicación Social, Adoradores del Santísimo y Hermandad del Santo Entierro. Se necesitan función actual, cómo integrarse, responsable, contacto y reuniones si corresponden.
- Contactos, cargos, horarios antiguos y cifras de perseverancia necesitan confirmación; no se inventaron ni se actualizaron como si hubieran sido verificados.

## Propuesta para el vault — pendiente de aprobación

Registrar en la nota de carga de grupos/sectores: correcciones editoriales aplicadas, imágenes con atribución, presentación separada de historia y lista de contradicciones pendientes. Actualizar Home solo cuando se confirme la publicación del frontend. No se modificaron notas del vault.
