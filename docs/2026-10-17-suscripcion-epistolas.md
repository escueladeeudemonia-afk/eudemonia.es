# Suscripción de epístolas — PR #54

Actualizado el 18-oct-2026. Esta revisión reemplaza el borrador inicial con IDs vacíos. El acceso Git/GitHub y las comprobaciones de red y Docker ya funcionan. La publicación sigue pendiente de verificar/corregir el correo de confirmación en MailerLite Classic EDE y de aprobar CI.

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

El workflow ejecuta estas seis comprobaciones en GitHub. La prueba nginx usa direcciones `.invalid` y no conecta al WordPress real. El smoke ahora comprueba el contrato real, sustituyendo la guarda inicial por `code` vacío.

## Condición pendiente: correo de confirmación

Fran mostró una captura con remitente `blog@pablotovar.com` y texto del blog antiguo; exige **`contacto@escueladeeudemonia.com`**. La captura no identifica el formulario que originó ese correo y no acredita el comportamiento de esta revisión todavía sin publicar.

Antes del merge:

1. Localizar en MailerLite Classic EDE la confirmación usada por API/integraciones, mantener el doble opt-in y verificar/corregir su remitente.
2. Revisar el alcance: esta confirmación puede ser compartida por otras altas API. No modificar remitentes globales, formularios ajenos ni datos legales por deducción.
3. Revisar el contenido del mensaje para que corresponda a la suscripción de Eudemonía. No sustituir datos legales sin aprobación.
4. Registrar la configuración comprobada por Fran. Una persona autorizada verifica después el alta, el grupo correcto y la recepción/confirmación. El agente no envía altas ni correos de prueba.

El remitente se configura en MailerLite, no en Astro. La API Classic `/settings/double_optin` expone activación/desactivación, no edición del remitente. La ayuda pública distingue la confirmación de cada formulario de la confirmación de API/integraciones y remite a documentación autenticada para Classic. Fran confirma el 18-oct que está dentro de Classic; se le guía por el panel.

## Git y publicación

Fran autorizó el 17-oct «Publícalo»; no falta una nueva autorización de despliegue. Se mantiene la PR #54 en borrador mientras falte comprobar MailerLite. La revisión inicial remota era `1a1be805303358f54a3a76daee93fefb94358651`; se verificó antes de recuperar el payload `.epistolas-wordpress.tmp`.

El 17-oct las restricciones de la sesión impedían escribir Git/GitHub, usar sockets/Docker y consultar el origen. El 18-oct `git fetch origin` y `gh pr view` funcionan mediante ejecución autorizada. Se guarda todo el trabajo previo con `git stash push -u -m 'Cambios locales previos y revisión epístolas conservados antes de retomar PR 54 (2026-10-18)'` y se cambia a la rama real `feat/epistolas-suscripcion`. No se crea worktree ni se fusiona la rama antigua `codex/nocturno-2026-10-01`.

Se aplica solo la revisión preparada sobre la cabeza comprobada. El ESTADO previo también se conserva en `/tmp/eudemonia-estado-antes-20261018.md`; se incorporan a la versión actual los metadatos, filas y notas de sincronización del PM conservando su contenido. El stash no se descarta y el respaldo antiguo `docs/estado-previo-epistolas.bak.patch` sigue ignorado. No aplicar el stash completo sobre esta rama: contiene versiones de una base antigua.

Tras verificar MailerLite y CI, fusionar la PR #54 y comprobar el despliegue automático de Coolify: home, ancla, formulario y contexto por GET. No enviar una suscripción desde el agente. La solución depende del bloque Kadence existente durante la migración; si cambia el contrato, el GET de CI y el enlace de respaldo ayudan a detectarlo y recuperarse.

Referencias: [remitente de confirmación](https://www.mailerlite.com/help/how-to-change-the-sender-address), [doble opt-in API/integraciones](https://www.mailerlite.com/help/how-to-use-double-opt-in-when-collecting-subscribers), [API Classic](https://developers-classic.mailerlite.com/reference/change-double-optin-status), [Kadence](https://github.com/stellarwp/kadence-blocks/blob/master/includes/form-ajax.php).
