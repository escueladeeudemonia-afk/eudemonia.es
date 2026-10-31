# Formularios preparados para MailerLite nuevo — 31-oct-2026

Cambio preparado en rama, pendiente del corte de MailerLite. No fusionar ni publicar
mientras los flujos de entrega del destino sigan desactivados o sus remitentes
pendientes de autenticación. La web publicada continúa usando Classic.

La cuenta nueva es **2756175**, Apolonio Consulting S. L.; la Classic es **2359724**.
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

El canónico tiene cambios del PM que se conservan intactos. Esta rama parte del
`origin/main` consultado el 31-oct, **950a1d8**, e incluye las publicaciones recientes
de epístola 23 y CreaTuVida enero. No incorpora ni sobrescribe el ESTADO pendiente
del canónico.
