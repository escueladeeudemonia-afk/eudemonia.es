# Formularios preparados para MailerLite nuevo — 31-oct-2026

Cambio preparado en rama, pendiente del corte de MailerLite. No fusionar ni publicar
mientras los flujos de entrega del destino sigan desactivados o sus remitentes
pendientes de autenticación. La web publicada continúa usando Classic.

La cuenta nueva es **2756175**, cuyo nombre visible el 6-nov es **Fundación Escuela
de Eudemonía**; la Classic es **2359724**, Apolonio Consulting S. L.
Fran pide migrar toda la cuenta y usar **contacto@eudemonia.es** para las newsletters.
La copia y la operativa se siguen en EDE-043 del repositorio común, en
`migracion/mailerlite/2026-10-31-continuacion.md`.

## Cambio de integración

Se mantienen diseño, consentimiento obligatorio, contenido y redirección a gracias.
El alta pasa al endpoint público `https://dashboard.mailerlite.com/jsonp/2756175/forms/{formId}/subscribe`.
El ID del alta y el del contenedor/callback son diferentes en el sistema nuevo:

| Recurso | Formulario nuevo / parámetro GA4 | Contenedor y callback (`grootId`) |
|---|---|---|
| Libro | 202778184196818343 | 47845308 |
| Audio de estoicismo | 202778185704670640 | 47845312 |
| Newsletter / epístolas | 202778189574964505 | 47845314 |

Los identificadores y el script oficial se centralizan en `src/data/suscripcion.mjs`.
El callback sigue emitiendo un solo `generate_lead` por éxito, con el ID público del
formulario nuevo, y conserva el plazo de redirección de 1500 ms y la ausencia de
email/nombre en Analytics. Se retira el píxel antiguo de Classic.

Fuente verificada: HTML público de `https://preview.mailerlite.io/forms/2756175/{formId}/share`;
el informe de los tres recursos vive en el repo común,
`migracion/mailerlite/2026-10-31-embeds-publicos.json`. El script nuevo usa jQuery 3.7.1.
No se incluyen claves de API ni solicitudes de alta en servidor.

## Validación y publicación

Validación local completada: check sin errores (cinco sugerencias previas), **35
pruebas**, build de **114 páginas**, smoke y ambos scripts Chromium aprobados.
Se probaron los tres formularios y Tally en **16 escenarios** de consentimiento,
bloqueo y ausencia de Analytics, con los scripts reales del proveedor. Los envíos JSONP y Analytics
se interceptan; las pruebas usan direcciones `.invalid`. Se conserva el sandbox de
Chromium. Esto comprueba el navegador; no acredita el correo de confirmación ni la
entrega real del recurso.

A las 09:23 de Madrid, `eudemonia.es` quedó autenticado (SPF, DKIM y verificación).
Confirmación del formulario, tres bienvenidas y borrador Ep66 ya usan
`contacto@eudemonia.es`, con comprobación posterior. API doble opt-in restaurado;
su asunto/contenido personalizados siguen bloqueados por premium y deben resolverse
antes de conectar integraciones. No afecta al cambio de remitente del formulario web.

Antes de publicar: reconciliar altas y bajas desde la copia, revisar colas y coordinar la activación de
las secuencias de libro, audio y newsletter. Las automatizaciones migradas están
apagadas por instrucción de Fran. Tally y WordPress necesitan su propia continuidad.

## Continuación del 6 de noviembre

La PR [#74](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/74) sigue
en borrador. Su último CI del 31-oct había fallado al arrancar Chromium; la nota
anterior de CI aprobada no describía ese último commit. Se incorpora el `main`
publicado **50845f3**, con el contacto nuevo y CreaTuVida de febrero, sin tocar
el árbol canónico ni sus cambios pendientes del PM.

Las tres pruebas de navegador usan `--no-sandbox` únicamente dentro del runner
efímero de GitHub Actions (`GITHUB_ACTIONS=true`), como requiere ese entorno. Las
ejecuciones locales conservan el sandbox. Se mantienen todas las intercepciones
de altas, Analytics y solicitudes de factura.

Validación local de esta versión: check con **0 errores, 0 warnings y 5 hints**,
**52 pruebas**, build de **116 páginas**, smoke y tres scripts Chromium correctos
(formulario, 16 escenarios de leads y 12 de factura). No se enviaron altas,
correos, solicitudes de factura ni conversiones. El resultado final de Actions
queda asociado al SHA de la PR; no se acredita aquí hasta que termine.

En la cuenta nueva siguen los **14 flujos apagados**. Se aplicaron y verificaron
cuatro bajas y dos rebotes posteriores; quedan cuatro altas y tres diferencias
de nombre, además de grupos/colas. Los formularios de esta PR apuntan cada uno
al grupo y la bienvenida correspondientes. Esto no demuestra entrega real.
La confirmación API conserva `contacto@eudemonia.es`, pero la edición del
asunto/contenido sigue restringida por premium. Continuidad operativa:
`repo/operaciones/automatizaciones/2026-11-06-salida-zapier.md` en el espacio común.

Antes de fusionar, completar la conciliación, comprobar colas y autorizar el
corte con la activación de las secuencias necesarias. Conservar las cuatro
automatizaciones que ya estaban pausadas en Classic; no activar todo en bloque.
