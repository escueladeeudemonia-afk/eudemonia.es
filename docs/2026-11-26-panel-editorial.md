# Panel editorial para Toñi

Encargo de Fran del 26-nov-2026: desarrollar `/admin/` con login y dos opciones, nueva epístola y nuevo podcast. Copiar y pegar debe conservar el texto y adaptar los encabezados, tamaños y colores a las plantillas de la web. Incluye borrador, vista previa y programación acordados en esta conversación.

## Entrega y alcance

Desarrollo en `feat/admin-editorial`, [PR #99 en borrador](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/99), worktree `webs/eudemonia.es/worktrees/admin-editorial-20261126`, desde `aafc60c`. El canónico conserva su rama y su modificación previa de `ESTADO.md`; copia adicional del diff en `/tmp/eudemonia-estado-canonico-20261126.patch`. No se alteran los programadores existentes, incluida la epístola 24 del 29-nov.

- `/admin/`: acceso por correo y contraseña, dos entradas, listado y editor visual Tiptap. No se insertan herramientas, fuentes ni tamaños arbitrarios.
- Pegado: párrafos, listas, enlaces, negrita, cursiva y citas; H1 → H2, H4–H6 → H3. Sin imágenes, tablas, estilos incrustados, iframes arbitrarios ni código. El audio se añade mediante el enlace/ID del reproductor Simplecast. El texto no se corrige ni reescribe con IA.
- `EpistolaArticle.astro` y `PodcastArticle.astro` contienen las plantillas que comparten las páginas públicas y la vista previa. El contenido nuevo usa las colecciones existentes, conservando índices, RSS y criterio de indexación. Las URLs ya publicadas se conservan.
- Número explícito. Tras guardar, número y URL permanecen fijos. El publicador comprueba colisiones tanto en main como en las PR abiertas, incluidas publicaciones programadas por otros mecanismos.
- Borradores, estado, usuarios, sesiones y programaciones en SQLite persistente, fuera de Git, del build y de la carpeta pública. Un único servicio editorial y un volumen persistente. Ningún dato se guarda en localStorage.
- Una pieza programada se cancela antes de editarla. Una vez iniciada la publicación, la versión queda fija; una pieza ya publicada se consulta desde el panel, pero la edición de históricos queda para una ampliación.
- Login de equipo administrado mediante CLI; sin registro público ni envío de correos de contraseña. La recuperación inicial la realiza Fran mediante el gestor de secretos.

## Publicación y recuperación

El servicio consulta su cola cada 15 segundos. La fecha se interpreta siempre en Europe/Madrid; las horas inexistentes o duplicadas durante cambios de horario se rechazan con un mensaje claro. Al reiniciarse recoge lo pendiente. No se crean ramas ni PR de un borrador o una pieza futura hasta alcanzar su hora.

Un publicador común sustituye el trabajo manual por pieza: crea una rama `editorial/<uuid>` y una PR con **un solo archivo nuevo**. Antes de fusionar exige repositorio/rama/SHA, contenido íntegro esperado y el check `validar` más reciente, terminado correctamente y emitido por GitHub Actions. No hace push directo a main ni modifica los workflows, pagos, campañas u otros archivos. Las operaciones remotas se recuperan por sus identificadores estables si se pierde una respuesta.

Después del merge, verifica la versión concreta en el HTML público, título, fecha, canonical, índice y sitemap y, para podcast, el reproductor y RSS. Para epístolas exige noindex y exclusión del sitemap. Solo entonces cambia a «Publicada». El inicio a la hora elegida no implica disponibilidad instantánea: CI y Coolify añaden latencia. Serializa las publicaciones mientras se verifica cada despliegue.

Los fallos de red se reintentan con espera creciente. Un bloqueo de CI/contenido queda visible como «Necesita revisión», sin saltarse las comprobaciones. Caducidad de 24 horas para evitar publicaciones tardías inadvertidas; un operador debe revisar cualquier recuperación que supere ese margen. No presentar como prueba de producción las pruebas con proveedores simulados.

## Acceso y datos

- Contraseñas de al menos 14 caracteres; scrypt N=131072/r=8/p=1, sal aleatoria. Secretos suministrados por stdin desde el gestor, nunca argumentos, Git o logs.
- Sesiones aleatorias: solo su hash en SQLite, caducidad de 12 horas, cookie HttpOnly/Secure/SameSite=Strict limitada a `/admin/`. Cambiar la contraseña revoca las sesiones.
- Escrituras con Origin exacto y token CSRF. Límite persistente de intentos por cuenta e IP; no se confía en cabeceras de IP enviadas por el cliente. Tras el proxy, el límite IP es compartido por el equipo.
- Saneamiento también en servidor, límites de entrada y control de versión para impedir sobreescrituras entre pestañas. CSP, no-store y noindex en el servicio. Sin analítica en panel/vista previa.
- Auditoría de acciones con actor, ID, acción y fecha; no registra contraseñas ni cuerpos de borradores.
- `/healthz` solo indica disponibilidad del proceso. No acredita publicación ni disponibilidad de GitHub.

## Desarrollo local

Requiere Node 22.13 o posterior. Node 22 todavía etiqueta SQLite como experimental; se fija la rama 22 en Docker y CI.

1. `npm ci` y `npm run build`.
2. Crear una cuenta de prueba: suministrar una contraseña de prueba por stdin a `node editorial/manage.mjs user correo nombre`. El comando crea la base indicada por `EDITORIAL_DB` (por defecto `.editorial/data.sqlite`). No usar contraseñas reales en pruebas.
3. Ejecutar `EDITORIAL_ORIGIN=http://127.0.0.1:4322 EDITORIAL_STATIC_DIR=dist npm run editorial`. HTTP solo está admitido para localhost/127.0.0.1. Abrir `http://127.0.0.1:4322/admin/`.
4. Publicación apagada por defecto. Para desarrollar la UI con `npm run dev`, iniciar el servicio con `EDITORIAL_ORIGIN=http://localhost:4321`; Vite deriva `/admin/api` al servicio local 4322.

`npm test` incluye las pruebas de contenido, fechas, persistencia, concurrencia, publicador y API. `scripts/comprobar-editorial-navegador.mjs` inicia un servicio efímero sin publicador, crea credenciales aleatorias de prueba, bloquea las conexiones externas y prueba el flujo real. La cuenta y los borradores de prueba desaparecen al cerrar.

## Puesta en servicio pendiente de autorización

Antes de activar `/admin/` en producción:

1. Revisar/fusionar la PR de implementación solo con autorización de Fran. La rama de producción despliega automáticamente.
2. Preparar el servicio con `Dockerfile.editorial`, dentro de la misma red Docker que la web, con alias DNS **editorial**, puerto interno 4322 y volumen persistente `/data`. Sin puerto público propio. `compose.editorial.yaml` expresa el contrato; no sustituir ciegamente la aplicación actual de Coolify. Web y servicio deben corresponder al mismo commit.
3. Configurar `EDITORIAL_ORIGIN=https://eudemonia.es`, `EDITORIAL_DB=/data/editorial.sqlite` y `EDITORIAL_STATIC_DIR=/app/dist`. Nginx deriva solo `/admin/` al servicio; la resolución dinámica evita que su caída impida servir la web pública. El dominio con `www` debe dirigir `/admin/` al dominio canónico antes de usar el formulario.
4. Crear cuentas de Toñi (`toni.fernandez@eudemonia.es`) y Fran, con contraseñas distintas guardadas en 1Password/EDE. Ejecutar `manage.mjs user` dentro del contenedor como usuario node, con el mismo volumen. La contraseña llega por stdin, sin imprimirse. No se han creado cuentas reales ni se han enviado invitaciones.
5. Proveer una credencial dedicada al repositorio `escueladeeudemonia-afk/eudemonia.es`: Contents y Pull requests de escritura, Checks de lectura, Metadata de lectura. No usar el token automático `GITHUB_TOKEN` de Actions para crear PR, porque sus eventos no disparan normalmente otros workflows. Preferir credencial dedicada limitada al repo, guardada en 1Password e inyectada como `EDITORIAL_GITHUB_TOKEN`; comprobar que la política del repositorio permite al publicador fusionar tras CI. No desactivar protecciones para hacerlo funcionar.
6. Mantener `EDITORIAL_PUBLISH_ENABLED=false` mientras se comprueban login, borrador y vista previa sobre HTTPS. Habilitarlo expresamente cuando el circuito y la credencial estén preparados. Hace falta una prueba de publicación autorizada para acreditar GitHub → CI → Coolify → verificación real; la suite no modifica GitHub.
7. Incorporar una copia consistente de SQLite al respaldo: `node editorial/manage.mjs backup <archivo-nuevo>` ejecuta VACUUM INTO. El archivo incluye datos privados y debe entrar en el respaldo cifrado con acceso restringido. No copiar solamente el `.sqlite` en caliente ignorando WAL. Probar restauración en un servicio aislado antes de entregar acceso.

Para pausar la publicación: poner `EDITORIAL_PUBLISH_ENABLED=false` y reiniciar solo el servicio editorial. Después comprobar PR y cola: un merge ya aceptado puede seguir desplegándose. El cambio no revierte publicaciones. Para retirar una cuenta: `manage.mjs disable correo`; conserva los textos. No ejecutar `docker compose down -v` ni borrar el volumen.

## Dependencias y límites de comprobación

Tiptap 3.35.0 y sanitize-html 2.18.2 fijados. Se actualiza RSS a 4.0.19 por su corrección de escape de campos, relevante para contenido procedente del editor. `npm audit` también señala avisos anteriores del árbol Astro 5 y herramientas de desarrollo; no se hace una migración mayor de Astro en este encargo. El servicio no arranca el servidor SSR/dev de Astro, no acepta imágenes ni atributos/tag names del usuario y sanea el HTML antes de generar el Markdown. La migración de dependencias heredadas requiere su propia revisión.

Capturas y resultado de navegador: `/home/fran/projects/escuela-de-eudemonia/entregables/admin-editorial-20261126/`. Estado final de validación y referencia de PR se incorporan al cerrar el desarrollo. Desarrollar el servicio no acredita su despliegue, una cuenta de Toñi disponible ni un disparo real en producción.

## Validación del desarrollo

- `npm run check`: cero errores y avisos, ocho hints preexistentes.
- `npm test`: suite de aplicación y publicadores aprobada (93 pruebas, incluidas 12 nuevas del panel).
- Build de 121 páginas y smoke aprobados: 68 episodios/reproductores, RSS, guía, formularios, facturas y cuaderno. Admin y vista previa sin analítica y fuera del sitemap.
- Chromium real: login, pegado H1/H4 normalizado, enlaces/énfasis/listas, guardado, vista previa compartida, recuperación de sesión tras recarga, programación en Madrid, cancelación, formulario de podcast y logout. Escritorio 1365 px y móvil 390 px sin desbordamiento. Todo con proveedores bloqueados, sin publicar.
- Comprobaciones existentes de navegador: formulario MailerLite, 16 escenarios de leads y 12 de factura aprobados; altas, conversiones y envíos interceptados.
- Publicador probado con API simulada: ausencia/fallo de CI, archivo ajeno, contenido cambiado, colisión con PR de otra programación, respuesta perdida de creación de PR y recuperación sin duplicar, versión antigua en HTML público y criterios de indexación.
- `git diff --check` correcto. El diff previo del canónico conserva el mismo SHA-256 que al comenzar.
- Primer CI: comprobaciones funcionales aprobadas, pero el cierre del perfil Chromium detectó una escritura tardía de un hijo (`ENOTEMPTY`). La prueba usa ahora cierre cooperativo y reintentos limitados sobre el perfil temporal que ella misma creó; conserva sandbox local y bloqueo de conexiones externas.

Pendientes de la puesta en servicio: integración real de red/volumen en Coolify, credencial dedicada, cuentas reales, respaldo/restauración y una publicación autorizada de extremo a extremo. No se han desplegado contenedores ni ejecutado el publicador contra GitHub.
