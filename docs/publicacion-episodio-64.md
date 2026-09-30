# Episodio 64 — publicación prevista

**Estado al 30-sep-2026:** contenido preparado en la [PR #34](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/34), sin fusionar. Publicación autorizada para el **1-oct-2026 a las 00:30, Europe/Madrid** (`2026-09-30T22:30:00Z`). La [URL futura](https://eudemonia.es/podcast/ep64-actuas-tan-bien-que-te-pierdes/) devuelve 404 hasta el despliegue.

## Fuente y ficha

- Fuente entregada por Toñi: `Ep64 de la Temperada 5_WEB.docx`, adjunta a la tarea del 30-sep-2026.
- Título web: **¿Actúas tan bien que te pierdes?**. El título del episodio #63 aparece pegado delante en el DOCX y se descartó como resto de edición. Se corrigió también la mayúscula de «Pregúntate» tras «y».
- Episodio **64**, temporada **5**, fecha editorial `2026-10-01T00:30:00+02:00`.
- Reproductor Simplecast: `e7ed4066-7624-4456-8d07-1ab031a20d61`, confirmado como **S5:EP64**, duración **30:01**. El título del audio es «Cuando el personaje se te queda pegado. Ep64»; se mantiene el título web del DOCX, como en el #63.
- Archivo único de la PR: `src/content/episodes/ep64-actuas-tan-bien-que-te-pierdes.md`; commit revisado `3300463c1fcb6a15e7125d1d76b74c9fd449bba9`.

## Preparación y verificación

- Se conservaron los párrafos editoriales, énfasis y enlaces del DOCX. Se normalizaron los enlaces propios a HTTPS, sin `www`, y se retiró el UTM de una campaña antigua en el enlace de patrocinio.
- `npm run check`: 0 errores, 0 warnings, 5 hints preexistentes.
- `npm run build`: correcto; genera página, índice, RSS y sitemap en la rama de contenido. El HTML incluye el reproductor y la fecha UTC correcta.
- La URL pública respondió **404** antes de publicar, como corresponde a una PR todavía abierta.

## Programación y recuperación

- El publicador comprueba repositorio, PR #34, archivo único y SHA exacto antes de fusionar. No permite adelantar la publicación y caduca el 1-oct a la 01:30 de Madrid. Si encuentra la PR ya fusionada, verifica el despliegue sin repetir el merge. Sus pruebas locales comprueban hora de Madrid, SHA, reintentos y bloqueos.
- GitHub Actions intentará iniciar antes de las 00:30, esperar hasta esa hora y reintentar a las 00:37 y 00:47. Después del merge comprobará página, reproductor, índice, RSS y sitemap. **Un `workflow_dispatch` de prueba no acredita que funcione el disparo `schedule`.**
- Para no depender solo de GitHub, la automatización de Codex `verificar-y-recuperar-la-publicaci-n-del-episodio-64` se programó para las **00:30 de Madrid** en esta tarea. Puede fusionar la PR si GitHub no lo ha hecho y el SHA sigue siendo el revisado, verificar la web y avisar del resultado. Depende de que el host local esté disponible.
- La [PR #33](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/33) activó una prueba temporal de disparos reales de GitHub el 30-sep. A las **08:17 de Madrid**, el workflow estaba activo pero la API no registraba ejecuciones `event=schedule` tras las ventanas de las 07:56, 08:01, 08:06, 08:11 y 08:16. Por tanto, **el calendario de GitHub sigue sin validarse**. Este PR retira la prueba temporal; la automatización de Codex a las 00:30 es la vía operativa de publicación, y GitHub queda como intento adicional.

## Cierre pendiente

Tras las 00:30, comprobar la URL pública, el reproductor S5:EP64, el índice, RSS y sitemap. Registrar hora real del merge y del HTTP 200, actualizar `ESTADO.md`, retirar el workflow específico y confirmar a Fran que la URL ya está disponible para Toñi. Si no se publica, indicar el bloqueo y conservar la PR abierta sin cambiar su contenido.
