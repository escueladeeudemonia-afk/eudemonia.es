# Episodio 64 — publicación completada

**Estado al 1-oct-2026:** el contenido de la [PR #34](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/34) se fusionó a las **00:31:08 de Madrid** (merge `8889a19fbe251353483742a7b4d7b5acbefc2fb2`). La [URL del episodio](https://eudemonia.es/podcast/ep64-actuas-tan-bien-que-te-pierdes/) respondió HTTP 200 y quedó verificada antes de las 00:31:41. La fecha editorial es el **1-oct-2026 a las 00:30, Europe/Madrid** (`2026-09-30T22:30:00Z`).

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
- La URL pública respondió **404** antes de publicar, como correspondía a una PR todavía abierta.
- El 1-oct a las **00:32:22 de Madrid**, una comprobación independiente confirmó HTTP 200 y el título y reproductor esperados en la página, además de la entrada en el índice, RSS y sitemap.

## Programación y resultado

- El publicador comprobó repositorio, PR #34, archivo único y SHA exacto antes de fusionar. Impidió adelantar la publicación y verificó página, reproductor, índice, RSS y sitemap después del merge.
- GitHub Actions tenía intentos programados para las 00:11, 00:37 y 00:47. La prueba manual del 30-sep terminó bien, pero no se registró ningún disparo `schedule` antes de las 00:30; la programación de GitHub siguió sin acreditarse. El workflow se desactivó tras publicar y se retiró junto con el publicador de un solo uso.
- La automatización de Codex `verificar-y-recuperar-la-publicaci-n-del-episodio-64` se activó a las **00:30:29 de Madrid**. Comprobó hora, PR, SHA y el 404 previo. Al minuto siguiente comprobó que el respaldo local había fusionado la PR y verificó el despliegue.
- El respaldo local independiente con `launchd` estaba previsto para las **00:31, 00:45 y 01:00 de Madrid**. El Mac estaba conectado a corriente y configurado con `sleep 0`. El agente arrancó a las **00:31:05**, fusionó la PR a las **00:31:08** y terminó a las **00:31:41** con código 0 y todas las comprobaciones satisfactorias. Tras confirmar el HTTP 200, se descargó y retiró el LaunchAgent y el lanzador. Los logs de la ejecución quedaron en `~/Library/Application Support/Eudemonia/episode64-launchd.out.log` y `.err.log`; no contienen credenciales.
- El 30-sep a las **15:33 de Madrid** se ejecutó ese mismo LaunchAgent mediante `launchctl kickstart`: terminó con código 0 y `{"status":"dry-run","merged":false}`. La PR #34 seguía abierta y fusionable, con el SHA revisado; el workflow de GitHub seguía activo. La prueba acredita el entorno local y la autenticación, pero no el disparo del calendario de esta noche.
- La [PR #33](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/33) activó una prueba temporal de disparos reales de GitHub el 30-sep. A las **08:17 de Madrid**, el workflow estaba activo pero la API no registraba ejecuciones `event=schedule` tras las ventanas de las 07:56, 08:01, 08:06, 08:11 y 08:16. Por tanto, **el calendario de GitHub sigue sin validarse**. La [PR #35](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/35) retiró la prueba temporal; Codex a las 00:30 y el LaunchAgent local son las vías operativas, y GitHub queda como intento adicional.

## Cierre

El episodio quedó visible en la URL prevista; Fran recibió la confirmación para avisar a Toñi. `ESTADO.md` marca EUW-015 como hecha. El workflow, script y pruebas específicas de este episodio se retiraron en la PR de cierre para evitar futuros disparos.
