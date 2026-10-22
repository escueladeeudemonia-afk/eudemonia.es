# Conversión de leads para GA4 / Ad Grants — 22 de octubre de 2026

Trabajo solicitado por Fran. Preparado y probado en el árbol canónico `repo/`, rama `codex/curacion-vps-20261021`, HEAD inicial `98aa582`. Árbol limpio al comenzar. **Sin commit, push ni despliegue**, por instrucción expresa. Esta preparación todavía no corrige la ausencia de conversiones en producción.

## Diagnóstico y configuración

- La documentación operativa identifica la cuenta `accounts/403773264`, propiedad `properties/548845029`, flujo de `https://eudemonia.es`, medición `G-6H8PEESGGG`. No se ha creado otra propiedad.
- Curl a `/`, `/libro/`, `/estoicismo/`, `/test/` y `/gracias/`: todas contienen `G-6H8PEESGGG`, ninguna contiene `generate_lead` ni un contenedor GTM. La etiqueta se carga desde `CookieConsent.astro`, con Consent Mode v2 avanzado. [Evidencia pública](evidencias/ga4-2026-10-22/produccion.json).
- OAuth obtenido en memoria desde 1Password/Negocio, elementos «MCP OAuth Eudemonia» y «MCP OAuth Eudemonia Refresh»: el refresh funciona, pero **Admin API y Data API responden 403 `PERMISSION_DENIED`, `Request had insufficient authentication scopes.`** Comprobadas propiedad, streams, keyEvents, googleAdsLinks y runRealtimeReport. [Respuestas sin secretos](evidencias/ga4-2026-10-22/api.json).
- La propiedad y los eventos clave actuales **no se han podido revalidar por API**. No se ha marcado `generate_lead` como evento clave. La existencia de `qualify_lead` / `close_convert_lead` inactivos es el diagnóstico aportado por Fran; no demuestra emisión de conversiones reales.
- No existe `INTEGRACIONES.md` en este proyecto. Accesos y despliegue se consultaron en `AGENTS.md`, `ESTADO.md` y la guía `docs/analitica.md` del proyecto operativo Escuela de Eudemonía.

## Cambio preparado

`generate_lead` se emite al recibir el callback de éxito de MailerLite, antes de navegar a `/gracias/`:

| Página | Formulario | lead_magnet |
|---|---|---|
| `/libro/` | `6132167` | `libro` |
| `/estoicismo/` | `6132169` | `estoicismo` |

Parámetros: `lead_magnet`, `form_id`. Sin nombre, email, respuestas ni valor monetario inventado. Se utiliza el `gtag` ya configurado por la web; no se instala una segunda etiqueta ni se cambia el consentimiento. El evento mide el envío aceptado, anterior a la confirmación del doble opt-in por correo.

Una bandera en memoria impide repetir la conversión si el proveedor llama varias veces al callback en la misma página. Una segunda bandera impide navegar más de una vez. `event_callback` permite terminar el envío antes de navegar; un temporizador independiente de 1500 ms evita que un bloqueador de Google impida llegar a gracias. Sin `gtag`, la navegación es inmediata.

No se genera conversión al pulsar enviar, ante validación fallida o rechazo del proveedor, ni al visitar o recargar gracias. No se deduplican personas entre dispositivos ni visitas distintas: no se recopilan identificadores personales para ello.

La prop `leadMagnet` solo está activada en libro y estoicismo. El formulario de epístolas conserva su redirección sin emitir este evento. El cuestionario Tally `/test/` queda fuera de este cambio.

## Verificación del build, sin servicios de envío reales

Todos completados:

- `npm run check`: 0 errores y 0 warnings; 5 hints ya existentes.
- `npm test`: 19/19.
- `npm run build`: 113 páginas.
- `npm run smoke`: 66 episodios y reproductores; formularios y recursos correctos.
- `CHROME_PATH=/home/fran/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome node scripts/comprobar-formulario-navegador.mjs`: epístolas sigue validando y redirigiendo con alta interceptada.
- `CHROME_PATH=/home/fran/.cache/ms-playwright/chromium-1243/chrome-linux64/chrome node scripts/comprobar-leads-navegador.mjs`: ocho combinaciones (dos formularios × consentimiento concedido, denegado, Google bloqueado o gtag ausente).

La última prueba carga los scripts públicos reales de MailerLite y Google sobre el HTML construido. Intercepta tanto los envíos de formularios (incluido JSONP) como `/g/collect`. Observa exactamente una petición `generate_lead` por éxito con `tid=G-6H8PEESGGG`, el recurso y el ID de formulario correctos. Comprueba rechazo del proveedor, privacidad requerida, email inválido, callback duplicado, navegación sin Analytics, entrada directa a gracias y recarga.

[Registro de Chromium](evidencias/ga4-2026-10-22/navegador.log). Se usó **`test+ga4@example.invalid`**, exclusivamente en peticiones interceptadas: no llegó a ninguna lista ni generó correos. Los eventos de prueba tampoco llegaron a Google. **Esto acredita el build local, no recepción en GA4 ni funcionamiento tras desplegar.**

## Recuperar el acceso de Analytics

El cliente de escritorio de Google está en 1Password/EDE, documento `a72qwnjsuag3mpj3ub4hqztr6q`. No se ha localizado su refresh token de Analytics. El OAuth de correo de Negocio carece de los scopes necesarios y no se ha modificado.

`scripts/autorizar-analytics.py` realiza el flujo oficial loopback con PKCE, `state`, `access_type=offline`, consentimiento y los scopes:

```
https://www.googleapis.com/auth/analytics.edit
https://www.googleapis.com/auth/analytics.readonly
```

1. Ejecutar en el VPS: `python3 scripts/autorizar-analytics.py` (cerrar antes una instancia anterior que siga escuchando en 8765).
2. En el ordenador de Fran con Tailscale y acceso SSH al VPS, abrir y mantener: `ssh -N -L 8765:127.0.0.1:8765 fran@100.103.185.86`.
3. Abrir la URL pública que muestra el script, con `contacto@eudemonia.es`, y conceder ambos permisos. El listener caduca a los 30 minutos. No copiar códigos de autorización al chat.
4. El proceso intercambia el código y guarda las credenciales en un elemento **nuevo** de 1Password/EDE: «GA4 eudemonia.es — OAuth Analytics». Imprime únicamente el ID del elemento creado. Los secretos se manejan en memoria y stdin; no se escriben en archivos, logs ni argumentos del shell.

El acceso SSH requiere que ese ordenador pueda entrar como `fran`; el túnel no establece ni sustituye las claves de acceso. El script no cambia el OAuth usado para correo.

Después de autorizar: consultar `properties/548845029` y `dataStreams`; confirmar medición y dominio; listar `keyEvents`; si falta `generate_lead`, crear por POST a `https://analyticsadmin.googleapis.com/v1beta/properties/548845029/keyEvents` con:

```json
{"eventName":"generate_lead","countingMethod":"ONCE_PER_EVENT"}
```

Volver a listar y guardar nombre de recurso y fecha. No crear reglas que conviertan cualquier `page_view` de gracias o `form_submit` automático en leads. Consultar también `googleAdsLinks`: su estado actual no se ha podido verificar. Marcar el evento en GA4 no demuestra que se haya importado como conversión en Google Ads.

## Publicación y comprobación pendiente

El procedimiento documentado del cliente es **rama → PR → revisión → merge a `main` → build y despliegue automáticos en Coolify**. No se ha encontrado un procedimiento de despliegue sin git autorizado por el proyecto; no se ha intentado publicar una imagen o modificar el contenedor de producción por otra vía. Fran prohíbe commit/push en esta tarea.

Tras publicar:

1. Curl a `/libro/` y `/estoicismo/`: confirmar `generate_lead`, recurso y ID. Confirmar la etiqueta única de medición.
2. Ejecutar Chromium sobre producción interceptando las altas de MailerLite para probar la ruta publicada sin crear suscriptores. Interceptar también collect para evitar conversiones sintéticas; identificar claramente esta comprobación como envío simulado.
3. Con un alta real autorizada o el siguiente lead genuino, consultar Data API `POST https://analyticsdata.googleapis.com/v1beta/properties/548845029:runRealtimeReport` con dimensiones `eventName`, métrica `eventCount` y filtro exacto `generate_lead`. La observación de `/g/collect` en un navegador sin interceptar Analytics también sirve como evidencia de envío, distinguiéndola de un informe recibido por Data API.
4. Confirmar que `generate_lead` está marcado como evento clave y su importación/uso en Ad Grants. No se han tocado campañas, facturación ni comunicado nada a terceros.

## Archivos y commit propuesto

Archivos modificados o nuevos, todos bajo `repo/`:

```
.github/workflows/validar-pr.yml
AGENTS.md
ESTADO.md
docs/2026-10-22-conversion-leads-ga4.md
docs/evidencias/ga4-2026-10-22/api.json
docs/evidencias/ga4-2026-10-22/navegador.log
docs/evidencias/ga4-2026-10-22/produccion.json
scripts/autorizar-analytics.py
scripts/comprobar-leads-navegador.mjs
src/components/MailerLiteForm.astro
src/pages/estoicismo.astro
src/pages/libro.astro
```

Mensaje propuesto: `feat(analitica): medir leads confirmados de libro y estoicismo en GA4`.

Referencias oficiales: [generate_lead](https://developers.google.com/analytics/devguides/collection/ga4/reference/events#generate_lead), [event_callback y event_timeout](https://developers.google.com/tag-platform/gtagjs/reference/parameters), [keyEvents.create](https://developers.google.com/analytics/devguides/config/admin/v1/rest/v1beta/properties.keyEvents/create), [OAuth de escritorio](https://developers.google.com/identity/protocols/oauth2/native-app).
