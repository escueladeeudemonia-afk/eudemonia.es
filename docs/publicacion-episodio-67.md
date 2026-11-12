# Episodio 67 — preparado con horario provisional, calendario no activado

**Estado al 12-nov-2026:** ficha y programador preparados, sin publicar. La instalación del timer está bloqueada por el entorno; el respaldo GitHub permanece en su PR sin activar. No presentar este estado como una publicación automáticamente garantizada.

- Fecha comunicada por Toñi: **lunes 16-nov-2026**, correo del equipo a las 08:00 de Madrid.
- Hora propuesta por Séneca siguiendo el #66: **01:00 Europe/Madrid (00:00 UTC)**. **Fran todavía NO ha confirmado esa hora.** Se deja editable y señalada como provisional; el DOCX no indica otra fecha ni hora del episodio.
- URL futura: https://eudemonia.es/podcast/ep67-si-tu-tambien-eres-tribal/
- [PR de contenido #87](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/87), rama `feat/podcast-ep67`, SHA `671cf127d048601de5ed3e144950b534b616ac31`. Solo añade `src/content/episodes/ep67-si-tu-tambien-eres-tribal.md`. Mantener fuera de main hasta el momento previsto.

## Fuente y decisiones editoriales

Fuente: `/home/fran/projects/escuela-de-eudemonia/migracion/podcast/ep67-documento.docx`, ruta física `repo/migracion/podcast/ep67-documento.docx`, nombre original **Ep67 de la Temporada 5_WEB.docx**. SHA-256 `484d8107c3f0dc6b30f0f6a83caed4a59d1e319f2f7020bcf3b8fbb7d45f6d5b`. El Google Doc previo devolvía 403; se trabaja únicamente con el DOCX autorizado, sin volver a intentar Drive.

Título literal: **Sí, tú también eres tribal** (con tilde y coma). Comparados los **31 párrafos del cuerpo y las notas** con el DOCX: palabras, listas, énfasis y destinos conservados. Solo se normalizan las URLs de eudemonia.es a HTTPS, sin www y con barra final. No se modifican títulos alternativos de episodios relacionados ni referencias científicas.

El DOCX anuncia CreaTuVida **5–7 marzo 2027**, y contiene una nota que dice que la web aún muestra **26–28 febrero**. La lectura pública del 12-nov confirma febrero. Se conserva la nota literalmente y se registra la discrepancia; este encargo no modifica la página de venta, metadatos comerciales, Stripe ni la programación de esa formación. La nota del documento se trata como contenido de la fuente, no como autorización para esas operaciones.

## Audio y enlaces

Simplecast `2093af43-c668-4a91-b15d-76df8b47ac86`; el endpoint público `/episodes/<id>/player` confirma número 67, temporada 5 y **1826 segundos (30:26)**. Título del alojamiento: «Tribus: nosotros y ellos (Psicología Social 6). Ep67». Reproductor HTTP 200, audio HTTP 206 con `audio/mpeg` en petición de un byte. Sin cambios de título, publicación o distribución en plataformas de audio.

Los cuatro episodios relacionados, CreaTuVida, epístolas, patrocinio, biografía y tres libros responden 200. Tres DOI responden 200 y seis rechazan la lectura automatizada con 403; se mantienen los enlaces de la fuente sin inventar sustitutos ni afirmar validación del contenido de esas publicaciones.

## Comprobaciones realizadas

Contenido: check con 0 errores y 0 warnings (cinco hints anteriores), **52 pruebas**, build con `TZ=UTC` y smoke aprobados; 118 páginas, 68 piezas en RSS y 68 reproductores. Ficha indexable, iframe único del episodio, fecha de Madrid, duración, índice, RSS y sitemap comprobados con el verificador real del publicador sobre el build construido.

Programación: check sin errores/warnings, **65 pruebas** (las 52 previas y 13 específicas), build y smoke aprobados, con las 67 piezas actualmente publicadas y sin la ficha nueva. Las pruebas cubren tiempo/zona, espera, caducidad, PR/repositorio/rama/SHA/archivos, conflicto, CI reciente, carreras entre disparadores, comprobación del despliegue y bloqueo cuando la fecha de ficha difiere del calendario. Sintaxis del instalador validada con `bash -n`. El generador se comprobó también con horas 00:15, 02:30 y 23:00, incluyendo cambio de día UTC.

[CI de contenido](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/43241978048) aprobado. Después de finalizar, el ensayo local contra la PR real terminó correctamente con `DRY_RUN=true`, resultado `dry-run` y `merged:false`. El primer intento se había detenido por CI aún pendiente, conforme a la barrera prevista. No se ha realizado ensayo de systemd ni ensayo del nuevo workflow desde main.

## Bloqueos y alcance de la programación

1. `systemctl --user list-timers --all --no-pager` devolvió **Failed to connect to user scope bus via local transport: No data available**. No se ha intentado eludirlo ni modificar unidades de otros servicios. Los archivos existen en Git; el timer **no está instalado ni habilitado** desde esta sesión.
2. La orden vigente dice **«No fusiones nada a main antes de la hora acordada»**. Por ello la PR del programador también se deja abierta: un workflow `schedule` nuevo solo se activa al estar en la rama predeterminada. **El respaldo GitHub no queda activo por subir esa PR.** Para disponer de respaldo antes del corte se necesita que Fran aclare esa restricción para la PR exclusiva del programador. No se presupone esa excepción a partir de lo que se hizo con el #66.
3. La 01:00 sigue pendiente de confirmación de Fran. La propuesta no se transforma en una aprobación histórica por quedar escrita en código.

Timer previsto: **`eudemonia-podcast-ep67-20261116.timer`**, `Persistent=true`, `OnCalendar=2026-11-16 00:00:00 UTC`, precisión de un segundo y sin retraso aleatorio. El publicador espera hasta el corte, admite recuperación hasta las **07:30 Madrid del mismo día**, exige la PR/SHA/archivo/CI revisados y comprueba la fecha del Markdown obtenido de GitHub. Tras fusionar comprueba ficha, reproductor, fecha, duración, índice, RSS y sitemap durante hasta doce minutos; una fusión ya realizada no se repite. GitHub y VPS comparten GitHub/Coolify; el HTML estará disponible al completar el despliegue, con su latencia.

## Activar el timer desde una terminal con acceso al VPS

No ejecutar hasta revisar/ratificar o corregir la hora provisional, comprobar CI y asumir que el respaldo GitHub aún necesita su activación separada. Como usuario fran, sin sudo:

```bash
bash /home/fran/projects/escuela-de-eudemonia/webs/eudemonia.es/worktrees/ep67-programacion-20261112/ops/instalar-podcast-ep67.sh
```

El instalador falla antes de escribir si no dispone del bus. Comprueba calendario, pruebas y PR real; copia solo script/config/unidades del #67 a `~/.local/lib/eudemonia-podcast-ep67-20261116/` y `~/.config/systemd/user/`; conserva copias previas si hay que cambiar la hora. Ejecuta un disparo real absoluto con `DRY_RUN=true`, exige salida 0 y solo entonces habilita el timer persistente. Guarda evidencia en `/home/fran/projects/escuela-de-eudemonia/evidencias/episodio-67/`. No modifica el timer del #66 ni el de CreaTuVida.

Comprobar después `systemctl --user is-enabled`, `is-active`, `NextElapseUSecRealtime` y `loginctl show-user fran -p Linger`; sin linger el calendario puede depender de una sesión abierta. Registrar resultados reales, sin confundir el instalador preparado con una instalación realizada.

## Cambiar la hora si Fran indica otra

Un único archivo central gobierna la ejecución: **`ops/podcast-ep67.json`**. Mantener `timeZone=Europe/Madrid` y el día local 16-nov.

1. Si hubiera timer/workflow activos, detener timer y servicio, desactivar el workflow y cancelar ejecuciones en curso antes de editar. En esta sesión ninguno ha quedado activo.
2. Cambiar `publicationAt` del JSON con la hora y zona confirmadas y actualizar `hourStatus`. En el worktree de contenido, cambiar el único `pubDate` de la ficha al mismo instante. Revisar el diff, repetir check/build/smoke y guardar/push el commit de `feat/podcast-ep67`; cambiar pubDate cambia el SHA revisado.
3. Desde el worktree del programador, actualizar el SHA y regenerar unidades y cron:

```bash
python3 ops/preparar-podcast-ep67.py --content-checkout /home/fran/projects/escuela-de-eudemonia/webs/eudemonia.es/worktrees/ep67-20261112
python3 ops/preparar-podcast-ep67.py --check
node scripts/publish-episode-67.test.mjs
```

El generador exige el worktree de contenido limpio y su rama correcta; comprueba coincidencia de pubDate antes de fijar su HEAD. No hace commits, pushes, merges, instalaciones ni cambios en servicios. Guardar/push la configuración y artefactos revisados; esperar CI de la ficha, repetir el ensayo real con `DRY_RUN=true` y reinstalar el timer desde una terminal autorizada. Para el ensayo local, usar las variables `GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es`, `GITHUB_REF=refs/heads/main` y `DRY_RUN=true`. El script fija el repo y el archivo permitido; no publicar con una configuración incoherente.

4. Actualizar la documentación y el título/aviso de PRs con la hora confirmada. Si procede activar el respaldo, revisar expresamente la restricción sobre la fusión previa del programador y ejecutar su ensayo desde main con `dry_run=true`. Una simulación no demuestra puntualidad del futuro cron.

## Cancelar, recuperar y cerrar

Para cancelar: deshabilitar y parar `eudemonia-podcast-ep67-20261116.timer`, detener su servicio, desactivar `publish-episode-67.yml` y cancelar ejecuciones activas. Comprobar antes el estado de PR #87; cancelar calendarios no deshace un merge ya realizado.

Si no se publica, comprobar PR/SHA/CI, hora y estado de Coolify. Dentro de la ventana se puede reejecutar el servicio instalado; es idempotente. Después de la caducidad requiere una nueva decisión, no una ampliación silenciosa de la ventana.

Tras la publicación verificar con `node scripts/publish-episode-67.mjs --verify-only`, registrar merge/horas y comprobar ficha, reproductor, fecha, índice, RSS y sitemap públicos. Conservar journal, cerrar **EUW-029** dentro de **EDE-045** y retirar solo los recursos del #67. No enviar correos, operar MailerLite, redes o plataformas de audio ni tocar los trabajos de Zapier/n8n de la otra sesión.
