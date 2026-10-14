# CreaTuVida: tarifa vigente y cierre del 18 de octubre

Fran autorizó el 14-oct-2026 publicar la tarifa vigente de La Escuela y programar el cierre web de las inscripciones. No se ha consultado ni modificado Stripe: sus enlaces conservan sus valores y siguen bajo control de la Fundación.

## Auditoría inicial y decisiones de la sesión

La primera petición fue de solo lectura: localizar todos los accesos de pago del CreaTuVida y distinguir early bird de tarifa normal. Se revisaron el checkout canónico de la web, `main` remoto, las páginas públicas y las notas/campaña del repo operativo `escuela-de-eudemonia`.

| Ubicación comprobada el 14-oct | Resultado |
|---|---|
| Rama local `codex/nocturno-2026-10-01`, `src/data/creatuvida.yaml:23–24`, opciones 145/150 y botones generados en `src/pages/creatuvida.astro:187` | Conservaba los enlaces early bird: particulares `https://buy.stripe.com/aFa4gz9JT2zX0aa2P0dEs00` (416 €) y empresas `https://buy.stripe.com/dRm8wPaNX7Uh3mmahsdEs01` (624 €). Esa rama no se usó para publicar ni se fusionó durante esta sesión. |
| `main` y `/creatuvida/`, YAML líneas 23–24 y botones en Astro línea 198 | Ya usaban la tarifa normal: particulares `https://buy.stripe.com/3cIcN57BLeiFcWWdtEdEs03` (520 €) y empresas `https://buy.stripe.com/14AeVdcW5gqN1ee89kdEs02` (780 €). |
| Notas operativas `migracion/paginas/creatuvida.md:56–60` | Identificaban los dos enlaces early bird y los dos normales, estos últimos verificados como de la Fundación el 30-sep. No hacía falta crear payment links. |
| `/la-escuela/`, `src/pages/la-escuela.astro:182–183` | Conservaba el copy de 416/624 € hasta el 4-oct. Su enlace conducía a la landing de tarifa normal; el texto se corrigió en PR #44. |
| Gracias de Astro y páginas WordPress de gracias CTV, lista preferente y su gracias | No se encontraron payment links directos. Los enlaces de navegación a CreaTuVida conducían a la landing. |
| Campaña local `marketing/CreaTuVida/Lanzamiento Octubre 2026/260906_Campana_CTV_Octubre2026_13correos.md` del repo operativo | Los 13 emails enlazaban a `https://eudemonia.es/creatuvida/`, sin Stripe directo. Los correos 4–7 conservaban el copy histórico early bird; los 8–13 correspondían a la etapa de tarifa normal. |
| Históricos de marketing: 63 DOCX y 5 XLSX | No se encontraron URLs Stripe en los documentos ni sus hipervínculos. |

La revisión de emails corresponde a las copias locales; no acredita sus versiones ni sus envíos en Drive o MailerLite. No se pudo consultar la cuenta autenticada de Stripe porque el conector requería reautenticación; el estado activo/inactivo de los enlaces early bird quedó sin comprobar.

Después de la auditoría, Fran autorizó corregir y publicar el precio de La Escuela y programar el cierre web. Su instrucción expresa fue conservar Stripe y sus enlaces. Se trabajó desde `origin/main` en una copia aislada y se mantuvieron los cambios previos del canónico.

## Corrección publicada

- Base: `origin/main` actualizado, en una copia aislada en `~/projects/eudemonia.es/worktrees/ctv-cierre-20261014`. La rama canónica `codex/nocturno-2026-10-01` y su ESTADO sin commit permanecen intactos.
- Commit `2c7d639`; PR #44, merge `f072916191e8afbaed0b58676d8b438f0a9835aa` a las 09:23:39 UTC del 14-oct. El merge disparó el despliegue habitual de Coolify.
- Check, 7 pruebas, build y smoke locales aprobados; CI `validar` aprobado (run 38541851629).
- Verificación con `curl -fsS -H 'Cache-Control: no-cache'`: `/la-escuela/` y `/creatuvida/` respondieron correctamente a las 09:24:47 UTC, ambas con 520/780 € y sin las cadenas 416 o 624 en su HTML.

## Registro de commits y PR

| Trabajo | Commit de trabajo | PR y merge | Estado al cierre de la sesión |
|---|---|---|---|
| Precio vigente de La Escuela | `2c7d639` | [#44](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/44), `f072916` | Publicado y verificado en vivo. |
| Versión cerrada de la landing | `e802c3b` | [#45](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/45), sin fusionar | Preparada para el 18-oct a las 23:59 de Madrid. |
| Programador, respaldo y runbook | `658cdd0` | [#46](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/46), `6a43dbf` | Calendario instalado y activo. |
| Evidencias de instalación y pruebas | `160e274` | [#47](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/47), `afa300e` | Publicadas en `main`. |

La última verificación pública con `curl` de esta sesión se hizo a las **11:35:50–51 de Madrid (09:35:50–51 UTC)**: ambas rutas devolvieron HTTP 200, mostraron 520/780 €, no contenían 416/624 y mantenían abiertas las inscripciones. El cierre futuro no se ha adelantado.

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

## Instalación y comprobación del calendario

- Programador publicado: commit `658cdd057dcedb6dfc498ddc9d216fde7cf24c04`, PR #46, merge `6a43dbf1c9df47afff800d24e233666fcd83b3b6` el 14-oct a las 09:32:39 UTC. CI aprobado (run 38543002294), con check, 15 pruebas, build y smoke.
- Workflow registrado como `active` en GitHub, ID `384157072`.
- Prueba `workflow_dispatch` con `dry_run=true` desde `main`: [run 38543127260](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/38543127260), completado correctamente el 14-oct a las 09:33:01 UTC. La PR #45 permaneció abierta, fusionable y con el SHA autorizado.
- Tras la instalación se repitió `curl` sobre `/la-escuela/` y `/creatuvida/`: 520/780 €, sin 416/624, reservas abiertas y los dos enlaces normales intactos. La versión cerrada no está publicada aún.

## Respaldo independiente en el VPS

El historial del early bird muestra PR #37 fusionada el 4-oct a las 22:05:04 UTC y disparos `schedule` posteriores, a las 00:09 y 00:45 UTC del 5-oct. Un dry-run manual no valida la puntualidad del cron. No se depende únicamente de ese calendario.

- Unidades versionadas en `ops/eudemonia-creatuvida-cierre-20261018.{service,timer}` e instaladas en `~/.config/systemd/user/`.
- Timer activado, `OnCalendar=2026-10-18 21:59:00 UTC`, `AccuracySec=1s`, sin retraso aleatorio, `Persistent=true`. `Linger=yes` permite ejecución sin sesión abierta.
- Ejecuta una copia del mismo script en `~/.local/lib/eudemonia-ctv-cierre-20261018/close-creatuvida-registration.mjs`. Usa la autenticación existente de `gh`; no extrae ni guarda tokens. Reintenta cada 60 segundos ante errores.
- SHA-256 del script instalado: `df38fd925e94e50fa39f6878f3e3e28513130b362ec9419c2526c4e94259afee`.
- Prueba real del timer: `eudemonia-creatuvida-cierre-20261018-prueba` disparó el 14-oct a las 11:28:53 de Madrid (09:28:53 UTC), con `DRY_RUN=true`. Resultado: `success`, código 0 y `{"status":"dry-run","merged":false}`. Se probó el disparo real sin fusionar ni cerrar inscripciones.

## Revisión de fiabilidad y alcance de las pruebas

Fran recordó el fallo de programación del podcast y pidió comprobar la fiabilidad del cierre. El precedente del episodio #63 fue una prueba manual satisfactoria seguida de un calendario que no se disparó; está documentado en `docs/publicacion-episodio-63.md`. Por eso se mantuvieron los dos disparadores y se probó un arranque real del timer del VPS.

Se volvió a comprobar el **14-oct a las 12:01 de Madrid** que el timer sigue activo y persistente para el 18-oct a las 23:59, y que la PR #45 sigue abierta, fusionable, sin auto-merge y con el SHA autorizado. La revalidación anterior del script instalado contra la PR real terminó con `{"status":"dry-run","merged":false}`; su hash coincidía con el script versionado.

La independencia es la del **disparo**: GitHub Actions y el timer del VPS tienen calendarios separados. Ambos necesitan GitHub para fusionar y Coolify para construir y desplegar. El respaldo no elimina esas dependencias compartidas.

El dry-run de Actions y el disparo real de prueba del VPS validaron el arranque, la autenticación, la lectura, el SHA, los archivos y CI de la PR. Las barreras de fecha y la equivalencia horaria se comprobaron en las pruebas automatizadas del script; el modo dry-run omite la espera y la barrera de ejecución real. **Esas pruebas de integración no ejecutaron la fusión ni el despliegue final del cierre.** Estas comprobaciones no permiten garantizar disponibilidad ni cambio instantáneo del HTML a las 23:59; ese es el momento programado de fusión, seguido de la latencia de Coolify.

Tras aclarar estos límites, Fran dio su conformidad al plan. **EUW-016 está hecha; EUW-017 sigue en curso hasta comprobar el cierre real en producción.** La instrucción de conservar Stripe continúa vigente.

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
