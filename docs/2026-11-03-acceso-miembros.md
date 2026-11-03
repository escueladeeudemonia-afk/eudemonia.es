# Acceso al campus de miembros — EDE-044

Petición de Fran del 3-nov-2026 para los cambios web de Pablo. La cabecera incluye «Acceder» visible también en móvil, fuera del desplegable, con destino **`https://escueladeeudemonia.com/`**. La URL se define en `src/data/navegacion.ts`.

La última instrucción de Fran sustituye la propuesta inicial de redirigir la portada del `.com`: ahora muestra la página de acceso WP 2808. WordPress normaliza `/acceder/` con un 301 interno a `/`, que responde 200 con el mismo formulario. El botón usa directamente `/` para evitar ese salto. Ágora, cuenta y contenidos siguen en WordPress; no se cambia su restricción de acceso.

Implementación desde `origin/main` (`1872147`) en el worktree `acceder-comunidad-20261103`, rama `feat/acceder-comunidad`. El canónico y sus cambios PM sin commit quedan intactos. Copias de los archivos previos y evidencias en `/home/fran/projects/escuela-de-eudemonia/evidencias/cambios-web-20261103/`.

Validación local: `check` sin errores (cinco sugerencias previas), 47 pruebas aprobadas, build y smoke correctos (67 reproductores/RSS). Chromium comprueba el botón y el menú móvil a 320, 390, 768, 1024 y 1280 px, sin desbordamiento. Las peticiones externas de esta comprobación se bloquean: no se envían formularios ni Analytics.

Publicación pendiente de PR, revisión, CI y despliegue. Si falla «Validar web antes de fusionar», investigar y documentar el fallo antes de cualquier merge. No se permite saltar checks.

Reversión: revertir el commit de este cambio mediante una PR nueva. Si se restaura la antigua portada WordPress, cambiar antes el botón a `/acceder/` o retirar el botón mediante la PR de reversión. El rollback de WordPress, sus backups y las verificaciones de las rutas internas se documentan en el repo operativo, `docs/2026-11-03-cambios-web-bloqueo.md`.
