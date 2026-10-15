# Episodio 65 — publicación completada y programación retirada

**Estado al 15-oct-2026:** [La cifra que nunca llega](https://eudemonia.es/podcast/ep65-la-cifra-que-nunca-llega/) se publicó mediante la [PR #49](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/49), fusionada a las **00:30:04 de Madrid** (merge `224ffeac9ffc19e5125afcbc2e8a38f162856e5b`). La página, el reproductor, el índice, el RSS y el sitemap quedaron verificados a las **00:30:35**. La hora autorizada era el 15-oct a las 00:30 Europe/Madrid, equivalente al 14-oct a las 22:30 UTC.

El temporizador del VPS realizó la publicación. Los dos disparos registrados de GitHub Actions llegaron después, a las 02:31 y 02:48. La publicación y su programación de un solo uso quedan cerradas; EUW-018 está hecha.

## Resultado de la ejecución real

Todas las horas de esta tabla corresponden a Europe/Madrid del 15-oct-2026.

| Evento | Hora | Evidencia |
|---|---|---|
| Arranque del servicio del VPS | 00:30:00 | Journal de `eudemonia-podcast-ep65-20261015.service`. |
| Fusión de la PR #49 | 00:30:04 | API de GitHub, merge `224ffeac9ffc19e5125afcbc2e8a38f162856e5b`. |
| Comprobaciones mientras terminaba Coolify | 00:30:05 y 00:30:20 | El publicador seguía esperando la publicación completa. |
| Publicación completa verificada y fin del servicio | 00:30:35 | Página, reproductor, índice, RSS y sitemap correctos; `Result=success`, código 0. |
| Primer disparo registrado de GitHub | 02:31:08–02:31:17 | [Run 38660480663](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38660480663), evento `schedule`, resultado `success`. |
| Segundo disparo registrado de GitHub | 02:48:14–02:48:26 | [Run 38662092972](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38662092972), evento `schedule`, resultado `success`. |

A las **12:40 de Madrid del 15-oct**, una nueva comprobación independiente con `--verify-only` confirmó otra vez HTTP 200 y el contenido esperado en los cuatro documentos públicos: ficha, índice, RSS y sitemap, incluido el reproductor del episodio.

El resultado acredita que el respaldo del VPS funcionó a la hora prevista. El calendario de GitHub volvió a llegar tarde; no se ha determinado la causa de ese retraso. Mantener un disparador independiente para futuras publicaciones. El merge y el despliegue son pasos distintos: la confirmación completa llegó 31 segundos después de la fusión.

## Fuente y contenido

- Título web: **La cifra que nunca llega**. Episodio 65, temporada 5, fecha editorial `2026-10-15T00:30:00+02:00`.
- Fuente entregada por Fran el 14-oct: `Ep65 de la Temperada 5_WEB.docx`. SHA-256: `676b74935dd29f03ac8aa134799e5014b8fb05a51ecfd7d2bc06e5a1dddace80`.
- El cuerpo editorial estaba dentro de una tabla del DOCX. Se conservaron sus párrafos, énfasis y enlaces; se corrigieron «Hay Hay», la firma duplicada y el encabezado residual «Ep64 de la Temperada 5». Las URL propias se normalizaron a HTTPS, sin `www` y con barra final.
- Simplecast: `b248e6e8-3da1-4e34-99ea-65c1ebb91fb4`. El endpoint público confirmó número 65, temporada 5 y duración **20:23 (1223 segundos)**. El título del audio es «La cifra que nunca llega. Tranquilidad financiera sin esperar a tenerlo todo resuelto (Dinero y Buena Vida 8).».
- SHA de contenido revisado: `3117a6be98ff87250d6be9ac455e31caf4c4e117`. La PR añadió el Markdown y fijó `Europe/Madrid` al mostrar la fecha de la ficha, para que el build en UTC indique el 15 de octubre conservando el instante UTC real en los metadatos.
- Contenido validado antes de publicar: check sin errores ni warnings (5 hints previos), 15 pruebas, build con `TZ=UTC` y smoke aprobados. Los párrafos se compararon con el DOCX y se comprobaron ficha, índice, RSS y sitemap; el build contiene 66 episodios y reproductores. [CI del contenido](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38593038937) aprobado.

## Preparación y pruebas del 14 de octubre

- Programador, workflow, unidades y runbook publicados mediante la [PR #50](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/50), commit `2a7db63bea2b424e2086b2b58c3ad1a5c0ce4990`, merge `db0cc3a7bc82326b8d41008677711d6ec4713aad` a las 18:03:08 de Madrid. Check, 27 pruebas, build, smoke y [CI](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38594509867) aprobados.
- El publicador fijaba repositorio, PR, rama, SHA, archivos y sus tipos de cambio, ausencia de conflictos y CI reciente aprobado. No fusionaba antes de las 00:30, caducaba a las 03:30 y reconocía una fusión realizada por el otro calendario.
- GitHub tenía un primer arranque previsto a las 00:13 y reintentos a las 00:37, 00:47 y 00:57. El workflow se registró activo con ID `384523268`. [Dry-run desde main](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38594739652) aprobado entre las 18:03:12 y 18:03:30 de Madrid, sin fusionar ni publicar.
- El VPS tenía un timer persistente para `2026-10-14 22:30:00 UTC`, precisión de 1 segundo, sin retraso aleatorio y `Linger=yes`. El servicio usaba la autenticación existente de `gh` y reintentaba cada 60 segundos ante un fallo. SHA-256 del script instalado: `f7ab45f01d3900da9b286bd50c32476d604e62ab99867abefaf9f368ecea5f91`.
- Una prueba real del timer terminó a las 17:57:55. La prueba adicional con calendario absoluto UTC arrancó a las **17:58:32** y terminó a las **17:58:34**, con código 0 y `merged:false`. El verificador también aceptó los cuatro documentos del build real del episodio.
- La conformidad de Fran y el cierre de la sesión de preparación se registraron en la [PR #51](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/51), merge `9d49ffe440e22145ebbe550ea3fb78266f607dde`. La PR del contenido siguió abierta hasta la hora autorizada.

La independencia era la del disparo: VPS y GitHub tenían calendarios separados, pero ambos necesitaban GitHub para fusionar y Coolify para desplegar. Las pruebas manuales y de calendario del día 14 no publicaron el episodio ni demostraban la puntualidad del futuro despliegue; la tabla de ejecución real anterior acredita lo que ocurrió finalmente.

## Cierre y conservación de evidencia

Tras confirmar la publicación, el 15-oct se desactivó el workflow específico y se deshabilitó y retiró el timer del VPS, su servicio y la copia instalada del script. El journal se conservó en `/home/fran/projects/eudemonia.es/evidencias/episodio-65/systemd-publicacion.log`. Las ejecuciones de GitHub y el historial de las PR conservan la evidencia remota.

La retirada se fusionó mediante la [PR #52](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/52) el **15-oct a las 12:46:49 de Madrid**, merge `dc4b3cf2084b10abb9d3c6d89e3b9f76063d5023`, con [CI aprobado](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38722564884). Se eliminaron de `main` los cinco archivos de un solo uso:

- `.github/workflows/publish-episode-65.yml`
- `scripts/publish-episode-65.mjs`
- `scripts/publish-episode-65.test.mjs`
- `ops/eudemonia-podcast-ep65-20261015.service`
- `ops/eudemonia-podcast-ep65-20261015.timer`

El script y sus pruebas siguen disponibles en el commit `2a7db63bea2b424e2086b2b58c3ad1a5c0ce4990` del historial. El contenido del episodio permanece publicado. El cierre de inscripciones de CreaTuVida del 18-oct conserva su propio workflow y timer; no forma parte de esta retirada.

La retirada pasó check sin errores ni warnings (5 hints previos), las 15 pruebas restantes, build y smoke: 66 episodios en RSS y 66 reproductores. Se comprobó que las columnas Notion y la sección «Del PM» permanecen iguales y que EUW-018 pasa a «Hechas».

Después de fusionar el cierre se repitió satisfactoriamente la verificación pública de página, reproductor, índice, RSS y sitemap usando el verificador conservado en git. Al documentar el cierre final, GitHub mostraba el workflow del episodio como `deleted` y el VPS conservaba únicamente el timer de CreaTuVida del 18-oct entre los temporizadores de Eudemonía. La sesión del 15-oct queda cerrada, con EUW-018 hecha, logs conservados y sin actuaciones pendientes para esta publicación.
