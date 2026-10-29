# Epístola #23 — Dale oxígeno a tu mente

Fran solicita publicar en la web la epístola enviada el 29 de octubre de 2026.
Autor: **Guillermo Simó**. Fecha de publicación: **29 de octubre de 2026**.

## Fuente y contenido

- Correo recibido con asunto «[Epístola #23] Dale oxígeno a tu mente».
- Campaña original **64125675**, estado `sent`, recuperada en solo lectura desde MailerLite Classic EDE. El conector de MailerLite de otra cuenta no se utiliza para recuperar la campaña.
- Se conservan los 15 párrafos de la carta, el patrocinador y todas las novedades de la comunidad. Comparación automática de los **59 bloques** con el original, ignorando espacios de maquetación.
- Única corrección de texto: errata evidente «Medita Medita» → «Medita».
- Se reutiliza la plantilla de epístolas existente: lema AC/DC, autoría, fecha, caja del patrocinador y secciones de comunidad.
- Los tres enlaces de ubicación de los encuentros y el del patrocinador proceden directamente del HTML original, sin enlaces de seguimiento personalizados. Los enlaces de suscripción, Fundación y CreaTuVida apuntan a las rutas vigentes del `.es`.

## URL y compatibilidad

- Canónica: <https://eudemonia.es/epistolas/23-dale-oxigeno-a-tu-mente/>.
- El correo enviado enlaza a `https://www.eudemonia.es/epistolas/23_dale-oxigeno-a-tu-mente/`.
- Se conserva la ruta con guion bajo mediante redirección HTTP 301 en nginx, con y sin barra final, hacia la canónica con guiones. Astro incluye la redirección equivalente para desarrollo y previsualización.
- El índice incorpora automáticamente la #23 al principio. Se mantiene la política existente de `noindex` para el detalle de las epístolas y su exclusión del sitemap.
- La plantilla emite la canónica y la URL del artículo en JSON-LD con barra final, de acuerdo con `trailingSlash: "always"`; la revisión en navegador detectó que antes las omitía.

## Validación previa

- `npm run check`: sin errores ni advertencias; cinco sugerencias previas.
- `npm test`: tres archivos de pruebas aprobados.
- `npm run build`: 114 páginas, sin aviso de identificadores duplicados tras regenerar la caché local del worktree.
- `npm run smoke`: correctos el RSS de 66 episodios, sus 66 reproductores y los formularios existentes.
- `nginx -t` con la imagen local `nginx:alpine`, contenedor temporal sin red y configuración montada en solo lectura: correcto.
- Chromium a 320, 390, 768 y 1280 px: sin desbordamiento horizontal; título, autoría, fecha, canónica con barra final, 56 párrafos, patrocinador e inclusión en el índice correctos. Capturas inspeccionadas de móvil y escritorio. Todas las conexiones externas bloqueadas; no se envían suscripciones ni eventos de Analytics.
- Fuente y cambios anteriores del canónico conservados fuera del repositorio en `evidencias/epistola-23-20261029/preexistente/`. La publicación se prepara en un worktree desde el `main` local revisado (`422debb`); no incorpora el commit de documentación de Analytics ni altera los cambios locales del PM.

El cierre debe añadir la PR y la comprobación de la página pública, del índice y del enlace enviado por email.

## Compatibilidad de la comprobación de Analytics

La validación de la PR detectó un fallo anterior a cualquier envío simulado: la prueba de libro esperaba `page_view`, pero la etiqueta real de Google lo emitía hacia `region1.analytics.google.com/g/collect`. La prueba solo interceptaba `google-analytics.com`, por lo que bloqueaba ese evento sin registrarlo. El mismo fallo se reprodujo en el VPS.

Se amplía únicamente la intercepción de la prueba a `analytics.google.com` y sus subdominios, manteniendo la respuesta local 204 y todas las comprobaciones de consentimiento, duplicados, parámetros y redirección. Los dos dominios están documentados en la [guía oficial de Google](https://developers.google.com/tag-platform/security/guides/csp?hl=es). La configuración de Analytics del sitio no requiere cambios para esta corrección.

La prueba corregida pasa en el VPS los 16 escenarios: tres formularios MailerLite y Tally, con Analytics aceptado, rechazado, bloqueado y ausente. Sin altas, correos ni conversiones enviados a los servicios reales.
