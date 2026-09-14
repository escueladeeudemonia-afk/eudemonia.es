# Publicación del episodio 63 sin depender del Mac

La [PR #19](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/19) contiene el episodio revisado. El workflow `publish-episode-63.yml` la fusionará desde un runner de GitHub Actions el **15 de septiembre de 2026, a partir de las 08:00 de Europe/Madrid (06:00 UTC)**. El merge inicia el despliegue habitual de Coolify. No necesita el Mac ni Codex abierto.

El primer trabajo se solicita a las 07:47 de Madrid y espera a las 08:00 antes de fusionar. Hay otros intentos a las 08:07 y 08:17. El publicador caduca a las 09:00 de ese día y no puede publicar en años posteriores, aunque la expresión del calendario sea anual. GitHub puede retrasar trabajos programados; el margen inicial reduce ese riesgo sin permitir una publicación anticipada.

El script comprueba el repositorio, la rama base, el único archivo autorizado y el commit revisado `8a720a55e44a63d7a7f7b3c7f8e71d69a0b44447`. Utiliza el token temporal de GitHub Actions, limitado a este repositorio. No guarda credenciales personales. La API de fusión vuelve a comprobar el SHA para evitar una carrera con nuevos cambios. Una PR ya fusionada pasa directamente a verificación, sin repetir la publicación.

Después comprueba durante un máximo aproximado de 12 minutos la página, el ID del reproductor, la fecha editorial, el índice, el RSS y el sitemap. El resultado y los errores quedan en el registro del workflow. La disponibilidad pública comienza cuando termina el despliegue; no se promete disponibilidad al segundo.

## Comprobar o cancelar

- Prueba local de las restricciones: `node --test scripts/publish-episode-63.test.mjs`.
- Prueba en GitHub: ejecutar el workflow manualmente en `main` con **Comprobar la configuración sin publicar** activado (valor predeterminado). Consulta la PR y no la fusiona.
- Para cancelar, desactivar el workflow en GitHub Actions. Si ya hay una ejecución esperando a las 08:00, cancelarla también. Cerrar la PR sin fusionar impide que el script publique.
- No fusionar la PR #19 manualmente antes de la hora. Modificar su contenido requiere revisar la nueva versión y actualizar el SHA autorizado en el script.
- Después de la publicación se pueden retirar este workflow y sus scripts mediante una PR de limpieza.

Referencia del planificador: [eventos programados de GitHub Actions](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#schedule).
