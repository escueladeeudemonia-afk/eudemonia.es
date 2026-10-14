# Episodio 65 — publicación preparada para el 15 de octubre

Hora autorizada por Fran: **15-oct-2026 a las 00:30 Europe/Madrid**, equivalente a **14-oct-2026 a las 22:30 UTC**. La fusión dispara el build y despliegue de Coolify; la disponibilidad pública depende de que termine ese despliegue.

## Contenido revisado

- [PR #49](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/49), rama `feat/podcast-ep65`, SHA `3117a6be98ff87250d6be9ac455e31caf4c4e117`. Debe permanecer abierta hasta la hora indicada, sin auto-merge inmediato.
- Título web: **La cifra que nunca llega**. Episodio 65, temporada 5, fecha editorial `2026-10-15T00:30:00+02:00`.
- Fuente: `Ep65 de la Temperada 5_WEB.docx`, adjunto facilitado por Fran el 14-oct. SHA-256: `676b74935dd29f03ac8aa134799e5014b8fb05a51ecfd7d2bc06e5a1dddace80`.
- El cuerpo editorial estaba dentro de una tabla del DOCX. Se extrajeron también esos párrafos, conservando el énfasis y los hipervínculos. Se corrigió «Hay Hay», se dejó una sola firma y se descartó el encabezado residual «Ep64 de la Temperada 5». Las URL propias se normalizaron a HTTPS, sin `www` y con barra final.
- Simplecast: `b248e6e8-3da1-4e34-99ea-65c1ebb91fb4`, confirmado mediante el endpoint público `/episodes/<id>/player`: número 65, temporada 5, duración **20:23 (1223 segundos)**. El título del audio es «La cifra que nunca llega. Tranquilidad financiera sin esperar a tenerlo todo resuelto (Dinero y Buena Vida 8).».
- La ficha incorpora `timeZone: "Europe/Madrid"` en el formato de fecha. Así muestra el 15 de octubre incluso al construir con `TZ=UTC`, conservando el instante UTC real en los metadatos.
- [URL de publicación](https://eudemonia.es/podcast/ep65-la-cifra-que-nunca-llega/). Antes de activar la publicación devolvía HTTP 404.

## Validación

- Contenido: `npm run check` sin errores ni warnings (5 hints previos), 15 pruebas, build con `TZ=UTC` y `npm run smoke` aprobados. Hay 66 episodios y reproductores en ese build.
- Todos los párrafos editoriales se compararon con el DOCX, incluidos los de la tabla. Se comprobaron título, fecha visible, instante UTC, duración, reproductor, firma única, índice, RSS y sitemap.
- CI de la PR #49 aprobado: [run 38593038937](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38593038937).
- Programador: check, 27 pruebas, build y smoke aprobados. El build de la programación conserva los 65 episodios que ya están en producción; el nuevo contenido solo llegará mediante la PR #49.
- Dry-run contra la PR real: `{"status":"dry-run","merged":false}`. El verificador también se ejecutó contra los cuatro documentos generados por el build del episodio.

## Programación y respaldo

`scripts/publish-episode-65.mjs` deriva del publicador del cierre de CreaTuVida. Comprueba repositorio, PR, rama, SHA, los dos archivos y sus tipos de cambio, ausencia de conflictos y la validación CI más reciente del SHA revisado. No permite publicar antes de la hora autorizada. Dos ejecuciones simultáneas pueden reconocer la fusión realizada por la otra.

- Ventana de preparación: desde las 00:00 de Madrid del 15-oct; publicación a las 00:30; caducidad a las 03:30. Fuera de esa ventana no se realiza una fusión tardía o anual.
- Workflow `.github/workflows/publish-episode-65.yml`: arranque previsto a las 00:13 de Madrid, con espera hasta las 00:30, y reintentos a las 00:37, 00:47 y 00:57. `workflow_dispatch` usa dry-run por defecto.
- Timer persistente del VPS: `eudemonia-podcast-ep65-20261015.timer`, calendario `2026-10-14 22:30:00 UTC`, precisión de 1 segundo, sin retraso aleatorio y `Persistent=true`. El usuario ya tiene `Linger=yes`, por lo que no requiere que el chat o una sesión estén abiertos.
- Servicio: `eudemonia-podcast-ep65-20261015.service`. Usa una copia del script en `~/.local/lib/eudemonia-podcast-ep65-20261015/` y la autenticación existente de `gh`, sin extraer ni guardar credenciales. Reintenta cada 60 segundos si falla; la caducidad limita los intentos de publicación.
- SHA-256 del script instalado: `f7ab45f01d3900da9b286bd50c32476d604e62ab99867abefaf9f368ecea5f91`.
- Un disparo real de prueba del timer con `DRY_RUN=true` terminó el 14-oct a las 17:57:55 de Madrid con código 0 y `merged:false`. La prueba adicional de calendario absoluto UTC arrancó a las **17:58:32 de Madrid** y terminó a las **17:58:34**, con `Result=success`, código 0 y `merged:false`. El timer de producción siguió activo y persistente para las 00:30; la PR #49 permaneció abierta, fusionable y sin auto-merge.

Los calendarios del VPS y GitHub tienen disparadores separados, pero ambos dependen de GitHub para fusionar y de Coolify para desplegar. El historial de los episodios 63/64 y del early bird obliga a mantener el respaldo del VPS. Las pruebas de calendario no publican ni demuestran la puntualidad del futuro despliegue.

Tras una fusión, el publicador espera hasta 12 minutos y exige HTTP 200 y el contenido esperado en la ficha, el reproductor, el índice, el RSS y el sitemap. El resultado queda en el journal del servicio y, en GitHub, en la ejecución del workflow. Un fallo termina con código distinto de cero. No se han programado correos ni mensajes a Toñi.

## Comprobar, recuperar y avisar

```bash
gh pr view 49 --repo escueladeeudemonia-afk/eudemonia.es --json state,headRefOid,mergedAt,mergeCommit
gh run list --repo escueladeeudemonia-afk/eudemonia.es --workflow publish-episode-65.yml --limit 10
systemctl --user list-timers 'eudemonia-podcast-ep65*' --all
journalctl --user -u eudemonia-podcast-ep65-20261015.service --no-pager -n 40
```

Verificación pública independiente, sin fusionar ni modificar nada:

```bash
node scripts/publish-episode-65.mjs --verify-only
```

Recuperación autorizada después de las 00:30 y antes de las 03:30 de Madrid:

```bash
GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es GITHUB_REF=refs/heads/main DRY_RUN=false node scripts/publish-episode-65.mjs
```

Si cambian el SHA, los archivos o CI, el publicador se detiene. Revisar esos cambios antes de actualizar su autorización. Fuera de la ventana, revisar la PR y el despliegue antes de decidir una recuperación manual.

Solo después de confirmar la web, el aviso preparado para Fran/Toñi es: «El episodio 65, La cifra que nunca llega, ya está publicado y verificado: https://eudemonia.es/podcast/ep65-la-cifra-que-nunca-llega/». Si falla la verificación, avisar de que no se ha confirmado la publicación, con el estado de la PR y la ejecución fallida; no anunciar éxito por el mero merge.

## Cancelar y cerrar

Antes de la hora prevista, detener los dos disparadores y cualquier ejecución que ya esté esperando:

```bash
systemctl --user disable --now eudemonia-podcast-ep65-20261015.timer
systemctl --user stop eudemonia-podcast-ep65-20261015.service
gh workflow disable publish-episode-65.yml --repo escueladeeudemonia-afk/eudemonia.es
# Consultar las ejecuciones pendientes y cancelar cada run de esta publicación.
gh pr close 49 --repo escueladeeudemonia-afk/eudemonia.es
```

Tras verificar la publicación real: marcar EUW-018 como hecha, desactivar y retirar el timer/servicio y retirar el workflow y el script de un solo uso mediante PR. Conservar este documento y los logs como evidencia. Hasta entonces EUW-018 permanece en curso.
