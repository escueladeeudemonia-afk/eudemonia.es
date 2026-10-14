# CreaTuVida: tarifa vigente y cierre del 18 de octubre

Fran autorizó el 14-oct-2026 publicar la tarifa vigente de La Escuela y programar el cierre web de las inscripciones. No se ha consultado ni modificado Stripe: sus enlaces conservan sus valores y siguen bajo control de la Fundación.

## Corrección publicada

- Base: `origin/main` actualizado, en una copia aislada en `~/projects/eudemonia.es/worktrees/ctv-cierre-20261014`. La rama canónica `codex/nocturno-2026-10-01` y su ESTADO sin commit permanecen intactos.
- Commit `2c7d639`; PR #44, merge `f072916191e8afbaed0b58676d8b438f0a9835aa` a las 09:23:39 UTC del 14-oct. El merge disparó el despliegue habitual de Coolify.
- Check, 7 pruebas, build y smoke locales aprobados; CI `validar` aprobado (run 38541851629).
- Verificación con `curl -fsS -H 'Cache-Control: no-cache'`: `/la-escuela/` y `/creatuvida/` respondieron correctamente a las 09:24:47 UTC, ambas con 520/780 € y sin las cadenas 416 o 624 en su HTML.

## Versión cerrada preparada

- PR #45: https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/45
- Rama `fix/creatuvida-cierre-18-oct`, SHA inmutable `e802c3b81ce7d2a88600d5d42243265325a7c841`. Solo modifica `src/data/creatuvida.yaml` y `src/pages/creatuvida.astro`.
- `inscripcion.cerrada: true` muestra «Acceso cerrado» y el mensaje de finalización. Retira los enlaces a Stripe de las tarjetas de precios y los botones de reserva de la cabecera y el cierre. Mantiene los precios y el contacto como información.
- Los payment links no cambian. Los textos nuevos y el estado están en el YAML.
- Check, 7 pruebas, build y smoke aprobados; CI de la PR aprobado (run 38542116527). HTML cerrado comprobado por HTTP local: aviso presente, cero enlaces Stripe y cero textos «Reservar plaza» o «Ver precio y reservar».
- La PR debe seguir abierta hasta el corte; no activar auto-merge inmediato ni modificar su SHA sin actualizar y volver a validar ambos programadores.

## Mecanismo y horario

Se reutiliza el mecanismo del early bird: GitHub Actions fusiona una PR revisada y Coolify construye y despliega `main`. El script deriva de `activate-creatuvida-prices.mjs` y conserva sus barreras de fecha, repositorio, rama, SHA, archivos y conflictos; además exige que CI `validar` esté aprobado para ese SHA. La fusión es idempotente y el verificador exige HTTP 200, «Acceso cerrado» y ausencia de enlaces de pago y llamadas de reserva.

- Corte autorizado: **18-oct-2026 a las 23:59 Europe/Madrid = 18-oct-2026 a las 21:59 UTC**. Todavía es CEST, UTC+2.
- Workflow `.github/workflows/creatuvida-cierre-18-oct.yml`: primer cron a las 21:43 UTC, con espera hasta las 21:59; reintentos a las 22:07, 22:17 y 22:27 UTC del 18-oct.
- Ventana de preparación desde las 21:30 UTC; caducidad el 19-oct a las 21:59 UTC para impedir ejecuciones anuales fuera de la ventana. `workflow_dispatch` usa `dry_run: true` por defecto y no publica.
- El estado cerrado se hará visible al terminar el build y despliegue de Coolify posterior a la fusión; no es una transición instantánea del HTML a las 23:59.

## Respaldo independiente en el VPS

El historial del early bird muestra PR #37 fusionada el 4-oct a las 22:05:04 UTC y disparos `schedule` posteriores, a las 00:09 y 00:45 UTC del 5-oct. Un dry-run manual no valida la puntualidad del cron. No se depende únicamente de ese calendario.

- Unidades versionadas en `ops/eudemonia-creatuvida-cierre-20261018.{service,timer}` e instaladas en `~/.config/systemd/user/`.
- Timer activado, `OnCalendar=2026-10-18 21:59:00 UTC`, `AccuracySec=1s`, sin retraso aleatorio, `Persistent=true`. `Linger=yes` permite ejecución sin sesión abierta.
- Ejecuta una copia del mismo script en `~/.local/lib/eudemonia-ctv-cierre-20261018/close-creatuvida-registration.mjs`. Usa la autenticación existente de `gh`; no extrae ni guarda tokens. Reintenta cada 60 segundos ante errores.
- SHA-256 del script instalado: `df38fd925e94e50fa39f6878f3e3e28513130b362ec9419c2526c4e94259afee`.
- Prueba real del timer: `eudemonia-creatuvida-cierre-20261018-prueba` disparó el 14-oct a las 11:28:53 de Madrid (09:28:53 UTC), con `DRY_RUN=true`. Resultado: `success`, código 0 y `{"status":"dry-run","merged":false}`. Se probó el disparo real sin fusionar ni cerrar inscripciones.

## Comprobar y recuperar

```bash
gh pr view 45 --repo escueladeeudemonia-afk/eudemonia.es --json state,headRefOid,mergedAt,mergeCommit
gh run list --repo escueladeeudemonia-afk/eudemonia.es --workflow creatuvida-cierre-18-oct.yml --limit 10
systemctl --user list-timers 'eudemonia-creatuvida*' --all
journalctl --user -u eudemonia-creatuvida-cierre-20261018.service --no-pager -n 30
```

Tras el corte, desde el repo se puede ejecutar solo el verificador web:

```bash
node --input-type=module -e 'import { verifyWebsite } from "./scripts/close-creatuvida-registration.mjs"; await verifyWebsite()'
```

La recuperación manual, solo después del corte, es fusionar la PR #45 con `--match-head-commit e802c3b81ce7d2a88600d5d42243265325a7c841` tras revisar CI y ejecutar el verificador anterior. Si la PR cambia o entra en conflicto, el programador se detiene; revisar antes de actualizar su autorización.

## Cancelar o reabrir

Antes del corte: desactivar el timer, detener el servicio si estuviera ejecutándose, desactivar el workflow y cerrar la PR #45. Revisar y cancelar también cualquier ejecución de Actions ya iniciada.

```bash
systemctl --user disable --now eudemonia-creatuvida-cierre-20261018.timer
systemctl --user stop eudemonia-creatuvida-cierre-20261018.service
gh workflow disable creatuvida-cierre-18-oct.yml --repo escueladeeudemonia-afk/eudemonia.es
gh pr close 45 --repo escueladeeudemonia-afk/eudemonia.es
```

Después del cierre, desactivar primero los programadores y publicar mediante otra PR `inscripcion.cerrada: false` para recuperar los botones con los mismos enlaces normales. Validar check, test, build y smoke y comprobar el despliegue. Reabrir la web no cambia Stripe.
