# Epístola 24 — Te duró tres días

Encargo de Fran del 25-nov-2026: trasladar la pieza de la web antigua y publicarla el **domingo 29 de noviembre de 2026 a las 08:00 Europe/Madrid (07:00 UTC)**.

## Contenido y URL

- Fuente: borrador WordPress `epistolas/6904`, «#24_Te duró tres días», autor Pablo Tovar. Última modificación `2026-11-25T12:12:32Z`; SHA-256 del `content.raw`: `903cae088c396efa875ac58aa034dbe3c91ed8b32e335a9f8277812e24757933`.
- PR de contenido [#97](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/97), SHA revisado `8058475513dcd98cba56925e750169f7e04f1bc0`. Contiene únicamente `src/content/epistolas/24-te-duro-tres-dias.md`. **No fusionar antes del corte.**
- URL futura: <https://eudemonia.es/epistolas/24-te-duro-tres-dias/>. Al preparar la programación devuelve 404 y no figura en el índice. `pubDate` por sí solo no oculta una pieza en Astro: debe seguir fuera de main hasta el corte.
- Se compararon íntegramente las 1.474 palabras desde el comienzo de la carta hasta el cierre. Se conservan patrocinio, agenda, énfasis y enlaces editoriales, incluido el 13-mar de Phronesis que figura en esta fuente. No se modifican calendarios, cobros ni otras páginas para conciliarlos con la carta.
- La plantilla reemplaza la cabecera duplicada de WordPress y la navegación Compartir/Suscribirte. Se conservan el lema y la autoría. Se adaptan los enlaces finales de suscripción/proyecto y se retiran dos parámetros `utm_source=chatgpt.com`.
- WordPress permanece como borrador y sin modificaciones. No se programan campañas ni se envían correos.

## Programación y comprobación

Temporizador principal del VPS: `eudemonia-epistola-24-20261129.timer`. Activado, `enabled`/`active`, próxima ejecución **29-nov-2026 08:00:00 CET**, `Persistent=true`, precisión de un segundo, sin retraso aleatorio y `Linger=yes`. Runtime aislado en `~/.local/lib/eudemonia-epistola-24-20261129/` con autenticación existente de `gh`, sin guardar claves en las unidades.

El calendario de ensayo disparó el **25-nov a las 15:23:50 de Madrid** y terminó a las **15:23:52**, con código 0 y `{"status":"dry-run","merged":false}`. Usó el mismo script/configuración instalados contra la PR real. El instalador se detuvo después al intentar parar un timer transitorio ya retirado por systemd; se corrigió esa parada, se compararon las copias y se activó el timer definitivo. Las unidades pasan `systemd-analyze --user verify`.

Respaldo preparado en `.github/workflows/publish-epistola-24.yml`: arranque previo a las 06:43 UTC con espera hasta las 07:00, y recuperaciones a los minutos 7, 23 y 43 entre las 07 y las 09 UTC. Su activación y ensayo se registrarán al fusionar la PR de programación. El ensayo del VPS acredita un disparo real; un `workflow_dispatch` solo acredita ejecución manual de Actions, no puntualidad de su cron.

Ambos caminos exigen repositorio, PR, rama, SHA, único archivo y CI aprobado; comparan la fecha del Markdown con el calendario y rechazan modificaciones posteriores. No fusionan antes de las 08:00 Madrid ni desde las 11:00 Madrid. Una fusión existente no se repite. Tras fusionar comprueban durante doce minutos página, título, autor, fecha/hora, canonical, principio/final del contenido, índice y `noindex,nofollow`, además de la exclusión individual del sitemap. El servicio reintenta cada minuto ante fallos hasta caducar.

La hora fija el inicio de la publicación; la disponibilidad depende del tiempo de despliegue de Coolify. Los disparadores son independientes, pero ambos dependen de GitHub y Coolify. No se da por publicada antes de comprobar su URL real.

## Validación y evidencia

- Contenido: `check` sin errores/avisos, 8 hints previos; 68 pruebas; build UTC y smoke correctos. [CI completo](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/45633072665) aprobado, incluidas las pruebas de navegador existentes.
- Publicador: 13 pruebas específicas, 81 en total; check, build y smoke aprobados. Verificador probado contra el HTML generado real. El build de programación no genera la epístola.
- Chromium local: 390 y 1280 px, título/autor/fecha correctos, sin desbordamiento horizontal; conexiones externas y envíos bloqueados.
- Lectura final de WordPress confirma la fuente sin cambios. Fundación, Substack, Medita y restaurante devuelven 200. Las dos páginas comerciales de WordPress rechazan la consulta automatizada con 403; sus enlaces originales se conservan, sin afirmar validación visual de esos destinos.
- Evidencia y fuente en `/home/fran/projects/escuela-de-eudemonia/entregables/epistola-24-20261129/`, incluido `instalacion-20261125T142337Z/`. La fuente no contiene credenciales y no se sube junto con el programador.

## Operación, recuperación y cancelación

Consultar:

```bash
systemctl --user status eudemonia-epistola-24-20261129.timer
journalctl --user -u eudemonia-epistola-24-20261129.service --no-pager
node ~/.local/lib/eudemonia-epistola-24-20261129/scripts/publish-epistola-24.mjs --verify-only
```

Para cancelar por decisión de Fran, detener/deshabilitar timer **y servicio**, desactivar `publish-epistola-24.yml` y cancelar sus ejecuciones activas. Revisar antes PR #97: cancelar calendarios no revierte una publicación ya realizada.

```bash
systemctl --user disable --now eudemonia-epistola-24-20261129.timer
systemctl --user stop eudemonia-epistola-24-20261129.service
gh workflow disable publish-epistola-24.yml --repo escueladeeudemonia-afk/eudemonia.es
```

Si cambia la fuente o la hora, detener ambos caminos, revisar la ficha y actualizar el SHA/configuración y las copias instaladas antes de reactivar. No ejecutar de nuevo el instalador sobre unidades existentes. Durante la ventana, se puede iniciar el servicio ya instalado para recuperar un fallo. Fuera de la ventana, revisar y autorizar la recuperación concreta; no eliminar las guardas.

**Hecho cuando:** la URL publicada responde 200 después del corte y pasa el verificador; conservar evidencias y retirar solo los recursos de esta publicación. Seguimiento EUW-032, dentro del circuito editorial EDE-045.
