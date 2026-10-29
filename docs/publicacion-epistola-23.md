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

## URL vigente tras la indicación de Fran

- Fran precisa después de la publicación inicial que la URL principal debe ser exactamente la del enlace «Leer en web» del correo: <https://www.eudemonia.es/epistolas/23_dale-oxigeno-a-tu-mente/>.
- El artículo se genera directamente en la ruta con guion bajo. El archivo Markdown conserva su nombre; el frontmatter `slug` fija la ruta y `canonicalUrl` conserva la dirección completa, incluido `www`.
- Índice, canonical, `og:url`, Article y BreadcrumbList apuntan a esa dirección exacta. `Base.astro` admite canónicas absolutas; las otras 117 canónicas comprobadas permanecen iguales.
- La variante con guiones, difundida en la respuesta inicial del agente, redirige por HTTP 301 a la URL exacta del correo, con y sin barra final. Astro incluye la redirección equivalente.
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

## Publicación y verificación iniciales — antes del ajuste de URL

- Publicación mediante [PR #65](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/65), fusionada el 29-oct-2026 a las **09:01:57 de Madrid**. Merge `09848190a8c107fd6632d5006b0457a5c4a5626e`; contenido revisado `3bb3c05eaab8de4886252c390356c8dfcb87c64c`.
- [CI aprobado](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/40839048632): check, test, build, smoke, formulario en Chromium y 16 escenarios de conversión con envíos interceptados.
- Verificación pública completada a las **09:03:07 de Madrid**: detalle HTTP 200, los **59 bloques** y los ocho enlaces coinciden con el build revisado; título, autoría de Guillermo Simó y fecha del 29 de octubre correctos.
- Índice HTTP 200 y #23 en primer lugar. Canónica con barra final; se conservan `noindex,nofollow` y la exclusión del detalle en el sitemap, con el índice presente.
- Ruta con guion bajo, con y sin barra final: **301 → canónica → 200**. El enlace exacto del correo, con `www`, devuelve igualmente **301 → detalle con guiones → 200**; la página declara la canónica sin `www`.
- No se han enviado mensajes, suscripciones de prueba ni eventos de Analytics reales.

Evidencias versionadas: [contenido](evidencias/epistola-23-20261029/contenido.json), [navegador](evidencias/epistola-23-20261029/navegador.json) y [producción](evidencias/epistola-23-20261029/produccion.json). Capturas, campaña original sin seguimiento personalizado y logs locales en `evidencias/epistola-23-20261029/`, fuera del repositorio. EUW-025 cerrada.

## Compatibilidad de la comprobación de Analytics

La validación de la PR detectó un fallo anterior a cualquier envío simulado: la prueba de libro esperaba `page_view`, pero la etiqueta real de Google lo emitía hacia `region1.analytics.google.com/g/collect`. La prueba solo interceptaba `google-analytics.com`, por lo que bloqueaba ese evento sin registrarlo. El mismo fallo se reprodujo en el VPS.

Se amplía únicamente la intercepción de la prueba a `analytics.google.com` y sus subdominios, manteniendo la respuesta local 204 y todas las comprobaciones de consentimiento, duplicados, parámetros y redirección. Los dos dominios están documentados en la [guía oficial de Google](https://developers.google.com/tag-platform/security/guides/csp?hl=es). La configuración de Analytics del sitio no requiere cambios para esta corrección.

La prueba corregida pasa en el VPS los 16 escenarios: tres formularios MailerLite y Tally, con Analytics aceptado, rechazado, bloqueado y ausente. Sin altas, correos ni conversiones enviados a los servicios reales.

## Validación del ajuste de URL

Check, test, build, smoke y `nginx -t` aprobados. El build contiene el artículo directamente en `epistolas/23_dale-oxigeno-a-tu-mente/index.html`; el índice y los metadatos usan exactamente la URL del correo. El cuerpo de la epístola no cambia. Se comparan todas las canónicas previas: las otras 117 permanecen iguales. Evidencia: [URL del correo en el build](evidencias/epistola-23-20261029/url-correo-local.json).

La corrección se publicó mediante [PR #67](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/67), fusionada el 29-oct-2026 a las **09:16:27 de Madrid**, merge `cf196d0dbd7c8f6edf08e0f5db6fca1cd94750a0`. Commit revisado `464e8486566674d1a952f1d6db34b14b9946cb94`; [CI completo aprobado](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/40840710060).

La verificación pública terminó a las **09:16:55 de Madrid**:

- La URL exacta del correo responde **200 directamente, sin redirección**: <https://www.eudemonia.es/epistolas/23_dale-oxigeno-a-tu-mente/>.
- Los **59 bloques y ocho enlaces** coinciden con el build revisado. Autoría de Guillermo Simó y fecha del 29 de octubre correctas.
- El índice responde 200, muestra la #23 en primer lugar y enlaza a la misma dirección. La canónica mantiene `www`, guion bajo y barra final.
- Las variantes con guiones, con y sin barra final y con o sin `www`, devuelven **301 hacia la dirección exacta del correo** y terminan en 200.
- Se conserva `noindex,nofollow`; el detalle permanece fuera del sitemap y el índice dentro.

Evidencias finales versionadas: [producción con la URL del correo](evidencias/epistola-23-20261029/produccion-url-correo.json) y [respuestas HTTP en nginx local sin red](evidencias/epistola-23-20261029/nginx-url-correo.json). Los registros anteriores de `produccion.json` y `navegador.json` documentan la primera publicación y deben interpretarse con su fecha, anterior al ajuste de URL.

## Cierre de sesión — 29 de octubre de 2026

EUW-025 está completada. La publicación inicial corresponde a la PR #65, su primer registro de cierre a la #66 y la URL definitiva solicitada por Fran a la #67. La documentación final se guarda en `codex/cierre-sesion-epistola-23-20261029`; este cierre solo modifica documentación y evidencias.

Para retomar el trabajo, el worktree de esta sesión es `/home/fran/projects/eudemonia.es/worktrees/epistola-23-20261029`. El canónico `/home/fran/projects/eudemonia.es/repo` conserva su rama previa `docs/ga4-dimensiones-evento-20261022`, su commit local de Analytics y los cambios sin commit de `ESTADO.md` del PM. Se han mantenido intactos; la copia previa está en `/home/fran/projects/eudemonia.es/evidencias/epistola-23-20261029/preexistente/`. No confundir ese HEAD anterior con el código publicado mediante la PR #67 ni sobrescribir el trabajo conservado al continuar.

No queda trabajo pendiente de esta publicación. Los demás pendientes de la web y los campos reservados al PM se conservan. No se han enviado correos ni creado suscriptores o conversiones de prueba reales.
