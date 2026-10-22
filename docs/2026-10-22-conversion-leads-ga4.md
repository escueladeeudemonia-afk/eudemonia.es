# Conversión de leads para GA4 / Ad Grants — 22 de octubre de 2026

**Los cuatro puntos de captación están publicados y comprobados en producción.** `generate_lead` está marcado como evento clave y se emite tras el éxito de MailerLite en libro, estoicismo y epístolas, o tras el envío confirmado del Eude-Score incrustado en `/test/`. Ampliación publicada mediante [PR #63](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/63), commit `09e2a22`, merge `492235f`. Chromium observa las peticiones `/g/collect` ejecutando el HTML público. Las altas y los eventos de prueba se interceptan: no se han enviado suscriptores falsos, correos ni conversiones ficticias.

Quedan la vinculación/importación en Google Ads y observar en Data API el siguiente lead genuino. Admin API confirma que no existe ningún vínculo Google Ads en esta propiedad. La última consulta de tiempo real no contiene `generate_lead`.

## Configuración comprobada por API

| Campo | Valor |
|---|---|
| Cuenta | `accounts/403773264` |
| Propiedad | `properties/548845029`, `eudemonia.es` |
| Flujo web | `properties/548845029/dataStreams/15391081617` |
| Dominio | `https://eudemonia.es` |
| Medición | `G-6H8PEESGGG` |
| Evento | `generate_lead` |
| Evento clave | `properties/548845029/keyEvents/16180682117` |
| Creación del evento clave | 22-oct-2026, 12:24:44 Europe/Madrid |
| Conteo | `ONCE_PER_EVENT` |

Se consultó la lista antes de crear el evento para no duplicarlo; después se volvió a listar y se confirmó su presencia. No se alteraron `purchase`, `qualify_lead` ni `close_convert_lead`. [Evidencia de Admin API y Data API](evidencias/ga4-2026-10-22/activacion-api.json).

El diagnóstico inicial era correcto: el HTML contenía la etiqueta pero no `generate_lead`, y solo había los tres eventos clave anteriores. El primer OAuth localizado en Negocio carecía de scopes de Analytics. Se conservan las evidencias iniciales: [curl](evidencias/ga4-2026-10-22/produccion.json), [errores de scopes](evidencias/ga4-2026-10-22/api.json).

## Disparadores y parámetros

| Página | form_id | lead_magnet | Éxito confirmado por | Estado |
|---|---|---|---|---|
| `/libro/` | `6132167` | `libro` | Callback de MailerLite | Publicado (PR #62) |
| `/estoicismo/` | `6132169` | `estoicismo` | Callback de MailerLite | Publicado (PR #62) |
| `/epistolas/` | `6138835` | `epistolas` | Callback de MailerLite | Publicado (PR #63) |
| `/test/` | `A7veYN` | `test_eudescore` | `postMessage` de Tally | Publicado (PR #63) |

`MailerLiteForm.astro` emite el evento en el callback de éxito del proveedor, antes de redirigir a `/gracias/`. Parámetros: `lead_magnet`, `form_id`. No se envían nombre, email, respuestas ni valor monetario inventado. El evento mide el envío aceptado, anterior a la confirmación del doble opt-in por correo. Se utiliza el `gtag` existente y se conserva Consent Mode v2 avanzado.

Una bandera impide repetir la conversión ante callbacks duplicados en la misma página. Otra impide repetir la navegación. `event_callback` permite terminar el envío antes de navegar; un temporizador independiente de 1500 ms cubre el bloqueo de Google. Sin `gtag`, la navegación es inmediata.

No se genera conversión al pulsar enviar, por validación fallida o rechazo de MailerLite, ni al entrar o recargar gracias. No se deduplican personas entre dispositivos o visitas distintas. La prop `leadMagnet` se activa en libro, estoicismo y epístolas (newsletter, configuración pública en `src/data/suscripcion.mjs`).

En `/test/`, el listener acepta exclusivamente `Tally.FormSubmitted` con `event.origin === "https://tally.so"`, `event.source` igual a la ventana del iframe `eude-score-form` y `payload.formId === "A7veYN"`. Admite objeto o JSON; ignora mensajes malformados, otros formularios y eventos de carga, paso o rechazo. La [documentación oficial de eventos de Tally](https://developers.tally.so/widgets/events) describe este transporte y el payload, que puede incluir todas las respuestas: el código extrae únicamente el ID público y nunca reenvía el payload a Analytics.

El éxito aceptado activa una bandera en memoria antes de llamar al `gtag` existente. Emite una sola vez `generate_lead` con los dos parámetros públicos y espera al `event_callback` o a un temporizador independiente de **1500 ms**, con `event_timeout: 1500`, antes de navegar a `/gracias-test/`. Una segunda bandera evita redirecciones repetidas. Si `gtag` falta o lanza una excepción, navega inmediatamente. No instala etiquetas, cambia consentimiento ni guarda respuestas, identificadores de persona/envío o marcadores de conversión en URL/storage.

`/gracias/` y `/gracias-test/` no emiten conversiones, tampoco al recargarse. Recargar `/test/` no reproduce el éxito anterior. El alcance de Tally es el test **incrustado en `/test/`**; el enlace alternativo a la pestaña externa conserva su comportamiento y no se considera una conversión por una visita posterior a gracias.

## Verificación del build de la ampliación (anterior a publicar)

`scripts/comprobar-leads-navegador.mjs` pasa de ocho a **16 escenarios**: libro, estoicismo, epístolas y Eude-Score × consentimiento concedido, denegado, Google bloqueado y `gtag` ausente. Sigue ejecutándose sobre `dist/` por defecto; `LEAD_TEST_ORIGIN=https://eudemonia.es` comprueba producción; ejecutado después de publicar la ampliación (ver la verificación siguiente).

El navegador ejecuta los scripts públicos reales de MailerLite, Google y el widget Tally. Sustituye el iframe de Tally por un formulario simulado servido bajo `https://tally.so`; sus mensajes positivos cruzan realmente el límite de origen/ventana. Intercepta su POST simulado y responde con rechazo o éxito; nunca carga ni envía el cuestionario real. Bloquea los demás accesos externos salvo los GET estáticos admitidos. También intercepta todos los envíos MailerLite (incluido JSONP) y todos los `/g/collect`.

Comprueba validación, rechazo, callback/postMessage duplicado, ID/recurso, un único intento de `gtag` por éxito, temporizador sin Google, navegación sin `gtag`, entrada directa y recarga de gracias. Para Tally prueba JSON y objetos, mensajes malformados, formulario incorrecto, evento distinto, origen incorrecto (incluido un dominio que comienza por `tally.so`) y ventana incorrecta. El collect conserva `gcs=G111` al aceptar y `gcs=G100` al rechazar; se limpian las cookies entre escenarios y se comprueba que al rechazar no se crean cookies `_ga`. Los parámetros del evento se limitan a los dos públicos y los controles de navegación; ni email ni identificadores/respuestas simuladas aparecen en los collect.

Comandos de reproducción:

```bash
npm run check
npm test
npm run build
npm run smoke
CHROME_PATH=/home/fran/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome node scripts/comprobar-formulario-navegador.mjs
CHROME_PATH=/home/fran/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome node scripts/comprobar-leads-navegador.mjs
```

Resultados: check con 0 errores y 0 warnings (5 hints previos), 19/19 pruebas, build de 113 páginas, smoke con 66 episodios/reproductores y suscripción correcta. La prueba de formulario independiente también pasa. Chromium: 16/16 escenarios de leads y formulario independiente aprobados. [Registro del build local en Chromium](evidencias/ga4-2026-10-22/navegador-ampliacion.log).

Esta comprobación acredita el build local con éxitos simulados; no acredita publicación de los dos disparadores nuevos ni recepción en GA4. No se crean suscriptores ni envíos reales, ni se modifica la configuración de GA4/Ads.

## Verificación anterior en producción (libro y estoicismo)

Curl confirma `G-6H8PEESGGG` en home y ambas landings, con `generate_lead` presente en libro y estoicismo: [comprobación actual](evidencias/ga4-2026-10-22/produccion-actual.json).

Antes de ampliar el script a los 16 escenarios, se ejecutó:

```bash
LEAD_TEST_ORIGIN=https://eudemonia.es \
CHROME_PATH=/home/fran/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome \
node scripts/comprobar-leads-navegador.mjs
```

El script carga el HTML publicado y los scripts reales de MailerLite y Google en Chromium. Intercepta todas las altas —incluido JSONP— y `/g/collect`; permite solo descargas GET de los recursos admitidos. Se usa `test+ga4@example.invalid` exclusivamente en envíos interceptados. No llega a MailerLite, a ninguna lista ni a Google Analytics.

Los ocho escenarios pasan: dos formularios por consentimiento concedido, denegado, Google bloqueado o `gtag` ausente. En los cuatro escenarios con Google cargado se observa exactamente un `/g/collect` con `en=generate_lead`, `tid=G-6H8PEESGGG`, recurso e ID correctos, incluso simulando dos callbacks de éxito. También se comprueban email inválido, privacidad requerida, rechazo del proveedor, navegación sin Analytics, entrada directa a gracias y recarga. [Registro de producción](evidencias/ga4-2026-10-22/navegador-produccion.log).

**Esta evidencia acredita la ejecución y la petición generada por el código publicado, con éxito de formulario simulado. No acredita una conversión de una persona real recibida en GA4.** Data API `runRealtimeReport` filtrada por `eventName=generate_lead` devuelve cero filas; queda observar el siguiente lead genuino.

La preparación original pasó `npm run check` (0 errores/warnings, 5 hints anteriores), `npm test` (19/19), `npm run build` (113 páginas), `npm run smoke` (66 episodios y reproductores) y la prueba de epístolas con envío interceptado. [Registro original del build en Chromium](evidencias/ga4-2026-10-22/navegador.log). La adaptación de la prueba se comprueba también contra el build local, sin `LEAD_TEST_ORIGIN`.

## Acceso OAuth resuelto

OAuth de Analytics guardado y comprobado en **1Password/EDE**, elemento `em6dgxea3mv53p5ercow5l7jjy`, título «GA4 eudemonia.es — OAuth Analytics». Campos: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`, `GOOGLE_OAUTH_REFRESH_TOKEN`. Se manejan únicamente en memoria/stdin. Nunca se imprimen ni se guardan en archivos, logs o argumentos del shell.

Scopes concedidos:

```
https://www.googleapis.com/auth/analytics.edit
https://www.googleapis.com/auth/analytics.readonly
```

No hace falta repetir el consentimiento ni mantener el túnel SSH abierto. El mensaje `channel 2: open failed: connect failed: Connection refused` del túnel indica que el listener loopback ya no acepta conexiones; no invalida un OAuth ya guardado. El OAuth de correo de Negocio sigue intacto.

Para renovar solo si se revoca o caduca el acceso: `scripts/autorizar-analytics.py` usa el cliente de escritorio del documento EDE `a72qwnjsuag3mpj3ub4hqztr6q`, PKCE, `state`, consentimiento y `access_type=offline`. Valida la plantilla «API Credential» antes de iniciar la autorización. Listener local en `127.0.0.1:8765`, límite de 30 minutos. Desde el ordenador con Tailscale: `ssh -N -L 8765:127.0.0.1:8765 fran@100.103.185.86`; abrir la URL generada con `contacto@eudemonia.es`. No copiar códigos al chat.

## Publicación y pendientes

Al retomar la continuación anterior, el árbol estaba limpio en `feat/ga4-generate-lead`, HEAD `1429ee3`, con los doce archivos de la preparación ya incorporados. La publicación se acredita por el HTML público y la prueba de producción, no por ese commit local. En aquella continuación no se ejecutaron commit, push, merge ni despliegue.

El despliegue documentado es rama → PR → revisión → merge a `main` → build/deploy automáticos en Coolify. No se necesita volver a desplegar para activar un evento clave: ese cambio ya se ha aplicado mediante Admin API. La continuación anterior añadió prueba y documentación de producción. La ampliación añade dos disparadores y se publicó en la PR #63 desde `feat/ga4-generate-lead-epistolas-test`, basada en `main` tras la PR #62. Fran autorizó después la publicación y verificación; el estado vigente y las evidencias figuran al final de este documento.

Pendientes:

1. Vincular esta propiedad con la cuenta correcta de Ad Grants: `googleAdsLinks` devuelve `{}`, sin enlaces. No se ha inferido un ID ni creado un vínculo sin identificar la cuenta.
2. Importar/utilizar `generate_lead` en Google Ads; marcarlo en GA4 no configura por sí solo una conversión de Ads.
3. Observar el siguiente lead real con Data API: POST a `https://analyticsdata.googleapis.com/v1beta/properties/548845029:runRealtimeReport`, dimensión `eventName`, métrica `eventCount`, filtro exacto `generate_lead`. No se crean altas ficticias para forzar una fila.

No se han enviado mensajes a terceros ni tocado facturación o campañas.

## Archivos de la continuación anterior

Todos bajo `repo/`, sin commit/push:

```
AGENTS.md
ESTADO.md
docs/2026-10-22-conversion-leads-ga4.md
docs/evidencias/ga4-2026-10-22/activacion-api.json
docs/evidencias/ga4-2026-10-22/navegador-produccion.log
docs/evidencias/ga4-2026-10-22/produccion-actual.json
scripts/comprobar-leads-navegador.mjs
```

Commit propuesto: `test(analitica): verificar producción y documentar activación de generate_lead`.

La preparación original está en `1429ee3`, mensaje `feat(analitica): medir leads confirmados de libro y estoicismo en GA4`; incluía además `src/components/MailerLiteForm.astro`, `src/pages/libro.astro`, `src/pages/estoicismo.astro`, `scripts/autorizar-analytics.py`, el workflow de validación y las evidencias iniciales.

Referencias oficiales: [generate_lead](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead), [event_callback y event_timeout](https://developers.google.com/tag-platform/gtagjs/reference/parameters), [keyEvents.create](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties.keyEvents/create), [OAuth de escritorio](https://developers.google.com/identity/protocols/oauth2/native-app).


## Archivos de la ampliación a epístolas y Eude-Score

- `src/components/MailerLiteForm.astro`: admite `leadMagnet="epistolas"`.
- `src/pages/epistolas/index.astro`: activa la medición del formulario `6138835`.
- `src/pages/test.astro`: mide el éxito del iframe Tally `A7veYN`, deduplica y limita la espera antes de gracias.
- `scripts/comprobar-leads-navegador.mjs`: 16 escenarios y comprobaciones de origen, consentimiento, privacidad y recargas.
- `AGENTS.md`, `ESTADO.md` y esta documentación: alcance, garantías y publicación verificada.
- `docs/evidencias/ga4-2026-10-22/navegador-ampliacion.log`: evidencia del build local.

Los cambios previos en el árbol de trabajo se conservan. Commit propuesto para esta ampliación: `feat(analitica): medir leads de epístolas y Eude-Score en GA4`.


## Autorización anterior de commit y push (antes de publicar)

Fran indica «haz commit y push que está todo OK» el 22-oct-2026. Se incluyen tanto las evidencias y documentación de la activación en GA4 como la ampliación local a epístolas y Eude-Score. La rama es `feat/ga4-generate-lead`; antes de guardar, el remoto coincide con su HEAD `1429ee3`.

Se repiten check (0 errores/warnings, 5 hints previos), las **3 pruebas vigentes** del árbol actual, build de 113 páginas, smoke (66 episodios/reproductores), la prueba independiente de MailerLite y los 16 escenarios de Chromium. Se interceptan altas y Analytics en todas las pruebas. El número de pruebas de este cierre corresponde al árbol actual; las referencias a 19 pruebas de las sesiones anteriores se conservan como evidencia histórica.

Aquella instrucción autorizó commit/push de la rama de trabajo. La publicación se completó después mediante la PR #63, con la autorización posterior de Fran «publica los cambios con commits y push, y luego verifica».


## Publicación y verificación de los cuatro disparadores — 22-oct, 12:48 de Madrid

- Commit de implementación: `09e2a2283dcb7e2e7f914dd20d13af91f7c60d31`, rama `feat/ga4-generate-lead-epistolas-test`, subido a origin.
- [PR #63](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/63), fusionada a las **12:47:10 Europe/Madrid**; merge `492235f9d99adc3a21f1e3113a80c2f744263f97`.
- [CI aprobada](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/39765423979): check, test, build, smoke, formulario MailerLite y 16 escenarios de leads en Chromium.
- A las **12:48:39 Europe/Madrid**, GET público confirma HTTP 200, los cuatro pares `lead_magnet`/`form_id` correctos y una única carga del tag GA4 en cada página. `/gracias/` y `/gracias-test/` responden 200 sin `generate_lead`. [Evidencia de HTML publicado](evidencias/ga4-2026-10-22/produccion-ampliacion.json), con fecha UTC y hash de cada HTML.
- **16/16 escenarios pasan sobre producción**, ejecutando el script ampliado con `LEAD_TEST_ORIGIN=https://eudemonia.es`. [Registro completo](evidencias/ga4-2026-10-22/navegador-produccion-ampliacion.log).

La prueba observa exactamente un `/g/collect` por éxito simulado con Google disponible, recurso e ID correctos, `gcs=G111` al aceptar y `G100` al rechazar. También acredita deduplicación, ausencia de cookies GA al rechazar, validación del origen/ventana/formulario Tally, rechazo del proveedor, privacidad, temporizador de 1500 ms sin Google y navegación sin gtag. Entrar o recargar gracias y recargar el test no reproduce conversiones.

Todos los envíos y collect están interceptados: **sin suscriptores, correos ni conversiones sintéticas recibidas por servicios reales**. El iframe Tally es simulado; no se envía el test real. Se acredita el código publicado y su petición de medición ante un éxito simulado; queda observar el siguiente lead genuino recibido en GA4. También siguen pendientes el vínculo y la importación en Ads; no se han cambiado campañas ni configuración de Analytics durante esta publicación.

El cierre actualiza `AGENTS.md`, `ESTADO.md` y esta documentación, y añade las dos evidencias anteriores en una rama de documentación desde `origin/main`. La tarea EUW-024 conserva su estado en curso por las comprobaciones reales y Ads pendientes.
