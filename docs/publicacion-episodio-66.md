# Episodio 66 — publicación programada

**Preparado el 31-oct-2026. Publicación prevista: 1-nov-2026 a las 01:00 Europe/Madrid, equivalente a 00:00 UTC.** La ficha todavía no está publicada. Fran pidió que estuviera pública antes del correo que enviará el equipo a las 08:00, y permitió adelantarla a medianoche o a la una. Se elige la una.

URL definitiva, futura hasta el despliegue: https://eudemonia.es/podcast/ep66-deja-de-decir-no-tengo-tiempo/

## Contenido revisado

- [PR #75](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/75), rama `feat/podcast-ep66`, SHA `d35d505bfe15ead13a4c760ce5c1b79811decb90`. Único archivo añadido: `src/content/episodes/ep66-deja-de-decir-no-tengo-tiempo.md`. Mantener la PR sin fusionar hasta el corte.
- Título web: **Deja de decir «no tengo tiempo»**. Fecha editorial `2026-11-01T01:00:00+01:00`. Se conserva la zona Madrid en la ficha; el build se comprobó en UTC.
- Fuente: `Ep66 de la Temperada 5_WEB.docx`, adjunto por Fran. SHA-256 `57cebc61f719cd6d48358995d10de43f71740763ea1a274c708273eb349016bb`. Los 23 párrafos del cuerpo y las notas se compararon con el DOCX; se conservan sus énfasis, listas y enlaces. La escena de Epicteto mantiene la aclaración de que es una recreación.
- Correcciones: `bit.ly/EfectividadPersona` devolvía 404; se usa `bit.ly/EfectividadPersonal`, ya presente correctamente en las notas y verificado hacia la lección de YouTube. URLs propias normalizadas a HTTPS y barra final; eliminado solo el UTM `utm_source=chatgpt.com` del DOI. Las notas anunciaban CreaTuVida 28–30 enero; Fran confirma corregirlas a **29–31 enero 2027**, coherente con la edición aprobada y la web pública.
- Reproductor Simplecast `08673eb2-1267-4a3d-a243-72b05a85688a`. El endpoint público `/episodes/<id>/player` confirma número 66, temporada 5 y **1580 segundos (26:20)**. Título del alojamiento: «No tengo tiempo. El tiempo no se tiene: se hace. Ep66». El audio responde HTTP 206 a una petición de un byte, con `audio/mpeg`. No se cambia su alojamiento ni su disponibilidad.
- Los enlaces propios, Substack, lección y cuatro libros responden HTTP 200. La editorial del DOI responde 403 al cliente automatizado: no se modifica la referencia suministrada.

## Validación previa

Check sin errores ni warnings (cinco hints anteriores), pruebas, build con `TZ=UTC` y smoke aprobados. El build de contenido tiene 67 piezas en RSS y 67 reproductores. Ficha indexable, un solo iframe del episodio, fecha del 1 de noviembre, duración, índice, RSS y sitemap comprobados.

[CI de la PR de contenido](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/41188367984) aprobado. El programador también comprobó la PR real con `DRY_RUN=true`: `merged:false`. Su verificador pasó contra los cuatro documentos reales construidos de la ficha, índice, RSS y sitemap. Las doce pruebas del publicador cubren hora/zona, espera, caducidad, identidad de PR/repositorio/rama/SHA/archivos, conflictos, CI reciente, carreras entre disparadores y verificación/reintentos del despliegue.

## Ensayo real del calendario del VPS

El 31-oct a las **10:25:40 de Madrid (09:25:40 UTC)** el timer absoluto de ensayo arrancó el mismo script instalado, con `DRY_RUN=true`, contra la PR real. Terminó a las **10:25:41**, `Result=success`, `ExecMainStatus=0` y `merged:false`. Un primer ensayo a las 10:23:49 también devolvió `merged:false`; se repitió conservando el estado del servicio para acreditar su salida. Las unidades persistentes pasan `systemd-analyze --user verify`.

El timer definitivo está `enabled`/`active` y anuncia **1-nov-2026, 01:00 CET** como próxima ejecución. Es una programación futura: este ensayo no acredita aún la publicación ni la puntualidad de Coolify.

## Programación y límites

- `scripts/publish-episode-66.mjs` fija repositorio, PR 75, rama y SHA anteriores y permite únicamente el archivo añadido del episodio. La PR debe seguir abierta, sin conflictos y con la validación reciente aprobada para ese SHA. Si cambia, el publicador se detiene; no acepta otro contenido por deducción.
- Ventana de preparación desde 00:30 de Madrid; ninguna fusión antes de las **01:00**. Recuperación hasta las **07:30 de Madrid** del mismo día (06:30 UTC). Después caduca sin fusionar.
- Disparador principal: `eudemonia-podcast-ep66-20261101.timer`, persistente, `OnCalendar=2026-11-01 00:00:00 UTC`, precisión de un segundo y sin retraso aleatorio. `Linger=yes`. Servicio con autenticación existente de `gh`, sin extraer claves, y reintentos cada 60 segundos si falla. Script instalado en `/home/fran/.local/lib/eudemonia-podcast-ep66-20261101/publish-episode-66.mjs`; SHA-256 `e4d2977d80babb005ab856b203d8d85f020152b0fc5f4458d9c1d9803133a15d`.
- Disparador de respaldo: `.github/workflows/publish-episode-66.yml`. Primer cron el 31-oct a las 23:43 UTC; el script espera al corte si llega antes. Reintentos el 1-nov a los minutos 7, 23 y 43 de las horas UTC 00–05. GitHub ya llegó tarde en los episodios anteriores: un ensayo manual aprobado no demuestra puntualidad de su calendario.
- Tras fusionar, verifica durante hasta doce minutos HTTP 200, título, número, fecha y duración, reproductor, índice, RSS y sitemap. Una fusión ya realizada por el otro disparador no se repite. Los disparadores son independientes, pero ambos necesitan GitHub y Coolify. La web cambia al completar el despliegue, con su latencia.
- La programación solo publica esta ficha. El correo de las 08:00 lo envía el equipo; este trabajo no programa ni envía campañas.

## Comprobar, cancelar o recuperar

Consultar el timer y la ejecución del VPS:

```bash
systemctl --user status eudemonia-podcast-ep66-20261101.timer
journalctl --user -u eudemonia-podcast-ep66-20261101.service --no-pager
```

Para cancelar antes de publicar: detener/deshabilitar el timer **y detener el servicio**, desactivar el workflow y cancelar sus ejecuciones activas. Revisar antes el estado de la PR: cancelar un calendario no deshace un merge ya realizado.

```bash
systemctl --user disable --now eudemonia-podcast-ep66-20261101.timer
systemctl --user stop eudemonia-podcast-ep66-20261101.service
gh workflow disable publish-episode-66.yml --repo escueladeeudemonia-afk/eudemonia.es
gh run list --workflow publish-episode-66.yml --repo escueladeeudemonia-afk/eudemonia.es
```

Antes de recuperar manualmente, comprobar la PR/SHA/CI, la hora autorizada y si ya se fusionó. Se puede reejecutar el servicio dentro de la ventana; es idempotente. Si la PR se fusionó y falta la web, revisar el despliegue de Coolify en lugar de duplicar el contenido.

Tras la publicación, ejecutar `node scripts/publish-episode-66.mjs --verify-only`, registrar horas y merge, conservar el journal, cerrar EUW-028 y retirar únicamente workflow, publicador/pruebas y unidades del episodio. No tocar los programadores de CreaTuVida ni otras tareas del VPS.
