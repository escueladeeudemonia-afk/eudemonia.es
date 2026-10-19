# Suscripción de epístolas — PR #54

Actualizado el 19-oct-2026. Fran sustituye la integración anterior por un formulario propio de MailerLite Classic para Newsletter Eudemonía. La configuración vigente es `6138835` / `c2f9e8`; se retira el proxy WordPress y se prepara un CTA destacado en portada. El historial siguiente documenta la implementación anterior y sus incidencias.


## Petición y formulario existente

Pablo pide el 17-oct un cajetín cerca del inicio de `/epistolas/`, con la frase exacta «Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras.» y ancla `/epistolas/#suscribirse`. Al final de la home aparece el enlace sobrio «Recibe la epístola mensual» a esa ancla. Plazo: antes del episodio 66 del 1-nov.

Fran cambia la instrucción inicial: reutilizar el formulario de `https://escueladeeudemonia.com/sobre-ti/#newsletter`, sin crear un embed nuevo. Se verificó en lectura del bloque de WordPress: Kadence 2860, formulario `2860_e87fbc-60`, acción única `mailerlite`, grupo Newsletter Eudemonía (112697386). Los embeds antiguos Home/Blog no sirven; libro/audio disparan regalos. El MCP MailerLite disponible corresponde a otra cuenta: no usarlo para EDE.

## Implementación

- `src/data/suscripcion.mjs` centraliza los identificadores públicos y rutas. `MailerLiteForm.astro` conserva libro/audio y admite el transporte WordPress con consentimiento, antispam y estilos de marca.
- Antes del POST, GET `/api/newsletter/contexto/` obtiene el token público del formulario original como texto inerte; no se ejecuta ni inserta su HTML.
- POST `/api/newsletter/` conecta exclusivamente con `https://escueladeeudemonia.com/wp-admin/admin-ajax.php`. Reconstruye los campos desde una lista cerrada y fija acción e IDs.
- Credenciales de MailerLite permanecen en WordPress. No se reenvían cookies ni Authorization. TLS verificado, cuerpo limitado a 4 KiB, tiempos acotados, sin caché ni registro de acceso y sin reintentos automáticos del POST.
- Solo `success: true` confirma la solicitud, sin prometer entrega del correo. Ante error o sin JavaScript se ofrece el formulario original.
- El build genera `.astro/suscripcion.nginx.conf`; Docker lo instala como `/etc/nginx/suscripcion.conf`. `nginx.conf` depende de ese archivo. El resolver `127.0.0.11` corresponde a Docker.
- Dev/preview incluyen middleware equivalente. El sitio conserva su build estático.

## Validación del 18-oct, sin altas reales

Ejecutada en el checkout real de `feat/epistolas-suscripcion`:

| Comando | Resultado |
|---|---|
| `npm run check` | 0 errores, 0 warnings, 5 hints preexistentes. |
| `npm test` | 34/34 pruebas aprobadas. |
| `npm run build` | 113 páginas, configuración nginx generada. |
| `npm run smoke` | Suscripción, home, 66 episodios en RSS y 66 reproductores correctos. |
| `node scripts/comprobar-nginx-suscripcion.mjs` | Aprobado: nginx real en Docker con upstream local simulado; sintaxis, circuito, destino fijo, privacidad y límites. |
| `node scripts/comprobar-origen-suscripcion.mjs` | Aprobado: GET público del formulario y lectura de su token. Ningún POST real. |
| `node scripts/comprobar-nginx-origen.mjs` | Aprobado tras corregir la profundidad TLS: GET al origen real mediante nginx en Docker, sin altas. |

El workflow ejecuta estas comprobaciones en GitHub, y la corrección #55 añade una séptima comprobación de DNS/TLS con el nginx real contra el origen. La prueba nginx usa direcciones `.invalid` y no conecta al WordPress real. El smoke ahora comprueba el contrato real, sustituyendo la guarda inicial por `code` vacío.

## Correo de confirmación — configuración verificada

Fran mostró una captura con remitente `blog@pablotovar.com` y texto del blog antiguo; exige **`contacto@escueladeeudemonia.com`**. La captura no identifica el formulario que originó ese correo y no acredita el comportamiento de esta revisión todavía sin publicar.

La captura aportada por Fran el 18-oct (`codex-clipboard-2e802c10-fcd0-408d-be7a-30c1965dcb26.png`) muestra el panel «Double opt-in for API and integrations» ON y el remitente «Pablo Tovar (Escuela de Eudemonía) (contacto@escueladeeudemonia.com)». El asunto «Please confirm your subscription» y el texto visible «Thank you for your interest in our newsletter!» son genéricos en inglés; no presentan la suscripción como el blog antiguo. Se indica a Fran cómo traducir el asunto. El bloqueo de configuración queda resuelto con esta evidencia. No acredita entrega ni grupo final.

Criterios de comprobación y mantenimiento:

1. Localizar en MailerLite Classic EDE la confirmación usada por API/integraciones, mantener el doble opt-in y verificar/corregir su remitente.
2. Revisar el alcance: esta confirmación puede ser compartida por otras altas API. No modificar remitentes globales, formularios ajenos ni datos legales por deducción.
3. Revisar el contenido del mensaje para que corresponda a la suscripción de Eudemonía. No sustituir datos legales sin aprobación.
4. Registrar la configuración comprobada por Fran. Una persona autorizada verifica después el alta, el grupo correcto y la recepción/confirmación. El agente no envía altas ni correos de prueba.

El remitente se configura en MailerLite, no en Astro. La API Classic `/settings/double_optin` expone activación/desactivación, no edición del remitente. La ayuda pública distingue la confirmación de cada formulario de la confirmación de API/integraciones y remite a documentación autenticada para Classic. Fran confirma el 18-oct que está dentro de Classic; se le guía por el panel.

## Git y publicación

Fran autorizó el 17-oct «Publícalo»; no falta una nueva autorización de despliegue. La PR #54 puede salir de borrador tras la captura de MailerLite; fusionar únicamente con CI aprobado. La revisión inicial remota era `1a1be805303358f54a3a76daee93fefb94358651`; se verificó antes de recuperar el payload `.epistolas-wordpress.tmp`.

El 17-oct las restricciones de la sesión impedían escribir Git/GitHub, usar sockets/Docker y consultar el origen. El 18-oct `git fetch origin` y `gh pr view` funcionan mediante ejecución autorizada. Se guarda todo el trabajo previo con `git stash push -u -m 'Cambios locales previos y revisión epístolas conservados antes de retomar PR 54 (2026-10-18)'` y se cambia a la rama real `feat/epistolas-suscripcion`. No se crea worktree ni se fusiona la rama antigua `codex/nocturno-2026-10-01`.

Se aplica solo la revisión preparada sobre la cabeza comprobada. El ESTADO previo también se conserva en `/tmp/eudemonia-estado-antes-20261018.md`; se incorporan a la versión actual los metadatos, filas y notas de sincronización del PM conservando su contenido. El stash no se descarta y el respaldo antiguo `docs/estado-previo-epistolas.bak.patch` sigue ignorado. No aplicar el stash completo sobre esta rama: contiene versiones de una base antigua.

Tras verificar MailerLite y CI, fusionar la PR #54 y comprobar el despliegue automático de Coolify: home, ancla, formulario y contexto por GET. No enviar una suscripción desde el agente. La solución depende del bloque Kadence existente durante la migración; si cambia el contrato, el GET de CI y el enlace de respaldo ayudan a detectarlo y recuperarse.

Referencias: [remitente de confirmación](https://www.mailerlite.com/help/how-to-change-the-sender-address), [doble opt-in API/integraciones](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers), [API Classic](https://developers-classic.mailerlite.com/reference/change-double-optin-status), [Kadence](https://github.com/stellarwp/kadence-blocks/blob/master/includes/form-ajax.php).

## Corrección del proxy en producción (18-oct)

La PR #54 se fusionó con CI aprobado, merge `78adeaa978fd74289ebb4827f968e6d3fc2dd619`. Home y cajetín respondían 200, pero el contexto del formulario devolvía 502. Se reprodujo con nginx real en una red Docker propia: `upstream SSL certificate verify error: (20:unable to get local issuer certificate)`. El origen presenta la cadena YR2 → Root YR → ISRG Root X1; la profundidad predeterminada 1 de nginx era insuficiente. La prueba simulada usaba HTTP y el GET directo usaba el cliente Node, por lo que ninguna cubría esa configuración TLS de nginx.

Se establece `proxy_ssl_verify_depth 4` manteniendo la validación de certificados, SNI y las autoridades del sistema. El GET real del contexto pasa entonces a HTTP 200 y permite extraer el token. Se incorpora `scripts/comprobar-nginx-origen.mjs` a CI: nginx real con configuración sin reemplazos, red Docker propia y petición GET pública al contexto; comprueba DNS, TLS, estado, cabeceras y token sin realizar altas. El bridge predeterminado de Docker no ofrece el resolver integrado 127.0.0.11; la prueba crea y retira una red propia, igual que el despliegue en Coolify.

## Publicación verificada

- PR #54: CI aprobado, merge `78adeaa978fd74289ebb4827f968e6d3fc2dd619`.
- PR #55: corrección TLS, commit `60c762de30e72b1e49e9096a4eb31407f3815072`, CI aprobado (run 39116635063, 36 s), merge `578e3a56f0b8c284085dce3720cadf2011c2f1ad`.
- 18-oct a las **11:47:40 de Madrid** (`2026-10-18T09:47:40.391Z`): `/` y `/epistolas/` HTTP 200, enlace y ancla correctos, frase aprobada y formulario WordPress presentes. `/api/newsletter/contexto/` HTTP 200, tipo texto, `no-store`, sin cookies y token original legible. GET a `/api/newsletter/` HTTP 405 como corresponde a una ruta exclusiva de POST.
- Evidencia estructurada en `docs/2026-10-18-suscripcion-epistolas-produccion.json`. No contiene token ni datos personales.
- Ninguna alta ni correo enviados por el agente. Se pide a Fran probar el formulario con una dirección aún no suscrita y confirmar recepción, remitente y enlace de confirmación. Esta prueba humana queda pendiente; la configuración de grupo y las pruebas con origen simulado no acreditan entrega real.

## Fallo detectado en la prueba humana: campo action

Fran comunica que el formulario muestra error. Su captura de Red solo muestra `contexto/`. La lectura de contexto y token se confirma también en Chromium. Al ejecutar el formulario real con todos los POST interceptados y simulados dentro de Chromium, se observa el destino incorrecto `/epistolas/[object%20HTMLInputElement]`: el input oculto de Kadence `name="action"` oculta la propiedad DOM `form.action`. No había que deducir el éxito a partir del GET del contexto.

Se conserva ese campo y se lee el endpoint con `form.getAttribute("action")`. Nueva prueba `scripts/comprobar-formulario-navegador.mjs`: sirve el build local, simula contexto y POST en un servidor exclusivo de prueba, bloquea conexiones externas desde Chromium y exige un único envío al endpoint correcto con el token y la acción Kadence. Verifica explícitamente que el campo sigue ocultando `form.action`, reproduciendo la condición real. Pasa con la corrección sin realizar ninguna alta ni envío externo. Se añade a CI; `CHROME_PATH` permite elegir Chromium en el VPS.

La PR #56 incluye esta corrección y la evidencia, con título y descripción adaptados al alcance final. CI final aprobado (run 39117436261, 41 s); merge `95513b8e811cb7f1ef5cb810b5728029bd353958`. La primera ejecución había pasado la prueba del formulario y fallado al borrar el perfil de Chrome; se añadió reintento de limpieza, sin omitir pruebas.

### Verificación posterior a la corrección del destino

El 18-oct a las **12:00:09 de Madrid** se confirma que el HTML público contiene `getAttribute("action")`. A continuación Chromium ejecuta el formulario de producción con datos `.invalid`: el contexto real devuelve 200, el destino construido es exactamente `https://eudemonia.es/api/newsletter/` y la respuesta simulada muestra confirmación. Todos los POST, incluido ese envío, se interceptan y responden dentro del navegador; ninguno llega a WordPress/MailerLite. Esta comprobación verifica el JS desplegado y no acredita aceptación real del alta ni entrega del correo.

Fran recibe la indicación de recargar y repetir la prueba humana. EUW-019 permanece en curso hasta confirmar alta, recepción, confirmación y grupo final. La configuración de remitente ya está comprobada por captura del panel; no se ha modificado MailerLite desde el agente.

## Confirmación de funcionamiento y revisión de copy

Fran confirma «Sí, funciona y recibo el correo». La captura muestra que la confirmación promete entregar el libro, aunque el cajetín ofrece epístolas. El grupo configurado para el formulario sigue siendo Newsletter Eudemonía. Queda identificar y corregir la plantilla que produce ese texto en MailerLite Classic. La edición de esa confirmación no está expuesta por las herramientas disponibles y no se ha modificado.

Propuesta neutra para revisar en la plantilla correcta del panel Classic, conservando el enlace dinámico del botón y el pie legal:

- Asunto: **Confirma tu suscripción a Escuela de Eudemonía**
- Cuerpo: «Gracias por tu interés en Escuela de Eudemonía. Pulsa el botón para confirmar tu correo y completar la suscripción. Si no has solicitado esta suscripción, puedes ignorar este mensaje.»
- Botón: **Confirmar mi correo**

Si la confirmación es compartida, el texto no debe prometer un recurso específico. No modificar otras plantillas o automatizaciones por deducción. No se guardan direcciones de prueba, identificadores de contactos ni registros privados de suscriptor.

El registro final sigue en PR #57. Sus primeras dos ejecuciones de CI pasan tipos, pruebas, build, smoke y Chromium; fallan en el GET externo a WordPress (timeout y después HTTP 202). La corrección funcional #56 permanece publicada con CI aprobado.

## Formulario nuevo y CTA destacado — 19-oct-2026

Fran localiza la configuración incorrecta y crea un formulario nuevo para el grupo Newsletter. Proporciona su URL pública: https://landing.mailerlite.com/webforms/landing/c2f9e8. La lectura del HTML confirma el identificador `6138835`, el endpoint `https://static.mailerlite.com/webforms/submit/c2f9e8`, nombre opcional, correo y callback a `/gracias`. El grupo es el indicado por Fran; el HTML público no acredita por sí solo el grupo ni la entrega de la confirmación.

La página de epístolas integra ese formulario mediante `MailerLiteForm.astro`, con estilos de marca, correo y consentimiento obligatorios y botón «Recibir las epístolas». Conserva el ancla `/epistolas/#suscribirse` y el texto aprobado. Se retira la conexión Kadence, sus rutas nginx, middleware y pruebas específicas de WordPress. Los formularios del libro y del audio mantienen sus identificadores.

La portada sustituye el enlace pequeño del final por una sección después del hero: «Las epístolas de Pablo Tovar, en tu correo», frecuencia mensual, gratuidad y botón granate «Recibir las epístolas». Incluye un enlace secundario para leer las anteriores. El diseño se apila en móvil.

Verificación: check sin errores ni avisos (cinco hints previos), pruebas, build de 113 páginas y smoke de 66 episodios/reproductores. Chromium ejecuta el JavaScript público de MailerLite: bloquea correo inválido y ausencia de consentimiento, intercepta el envío JSONP al formulario nuevo y simula la respuesta para verificar la redirección a gracias. Solo permite descargar tres scripts públicos; todas las altas se interceptan y el agente no crea suscriptores ni envía correos. Se eliminan de CI las comprobaciones del origen WordPress porque ya no participa en esta integración.

PR de sustitución: https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/58. Imagen Docker construida y `nginx -t` aprobado tras retirar el proxy. Se revisan portada y formulario en móvil, y portada en escritorio. La recepción real del nuevo correo queda fuera de la prueba simulada.

Corrección de Fran, 19-oct: el titular de portada pasa a «Las epístolas de la Escuela». También se corrige la referencia en «Pódcast y epístolas»: escriben tanto Pablo como los mentores, por lo que no se atribuye el conjunto exclusivamente a Pablo.
