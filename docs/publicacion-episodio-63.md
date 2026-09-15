# Episodio 63 — publicado y programación retirada

[El cansancio no te quita inteligencia](https://eudemonia.es/podcast/ep63-el-cansancio-no-te-quita-inteligencia/) quedó publicado el **15-sep-2026**, mediante la [PR #19](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/19). El merge manual se completó a las **09:24:35 de Madrid** y la web se verificó a las **09:25:40**, tras el despliegue de Coolify.

Se comprobaron la página, los 19 bloques editoriales, el reproductor Simplecast S5:EP63 de 34:50, el índice, el RSS con 64 piezas y el sitemap. Se conservó la fecha editorial prevista del 15-sep a las 07:30.

## Incidencia de la programación

El workflow preparado el 14-sep debía arrancar a las 07:17 de Madrid, esperar a las 07:30 y reintentar a las 07:37 y 07:47. Caducaba a las 08:30. Aunque las pruebas manuales pasaron, GitHub no registró ninguna ejecución del calendario y el episodio siguió sin publicar hasta la intervención de Fran. La causa exacta de la ausencia de disparos no quedó determinada.

El workflow se desactivó el 15-sep a las 09:25:10. Después, por petición expresa de Fran, se retiraron de `main` estos archivos:

- `.github/workflows/publish-episode-63.yml`
- `scripts/publish-episode-63.mjs`
- `scripts/publish-episode-63.test.mjs`

La programación del #63 queda cerrada. El contenido del episodio permanece publicado. El código anterior y las pruebas quedan disponibles en el historial de git y de GitHub Actions como evidencia; no constituyen una automatización activa.

La ficha detallada vive en el repo operativo «Escuela de Eudemonía»: `migracion/podcast/2026-09-14-ep63-publicacion-programada.md`. Antes de confiar otra publicación a un calendario, validar un disparo programado real y preparar recuperación y aviso independientes; un `dry-run` solo comprueba el script.
