#!/usr/bin/env bash
# Ejecutar como fran en una terminal normal del VPS; nunca desde root.
set -euo pipefail
[[ $(id -un) == fran ]] || { echo 'Ejecuta como fran, sin sudo.' >&2; exit 1; }
ctv_source=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
ctv_unit=eudemonia-ctv-fin-anticipada-20270208
ctv_old=eudemonia-ctv-fin-anticipada-20270118
ctv_runtime="$HOME/.local/lib/$ctv_unit"
ctv_units="$HOME/.config/systemd/user"
ctv_backup="$HOME/projects/escuela-de-eudemonia/evidencias/ctv-fin-anticipada-20270207/instalacion-$(date -u +%Y%m%dT%H%M%SZ)"
# Fallar antes de modificar archivos si no se dispone del bus del usuario.
systemctl --user show-environment >/dev/null
node --test "$ctv_source/scripts/finish-creatuvida-early-bird-2027.test.mjs"
node --input-type=module - "$ctv_source" <<'JS'
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const {change}=await import(pathToFileURL(process.argv[2]+'/scripts/finish-creatuvida-early-bird-2027.mjs'));
assert.equal(change.head,'f96959b52cfa59d4638823cc05d2527768c62f9a');
assert.equal(change.activateAt,Date.parse('2027-02-07T23:00:00Z'));
assert.ok(Date.now()<change.prepareAt,'Revisar instalación dentro de la ventana del corte');
JS
# Verificar acceso, PR, CI, metadatos, cuatro importes/enlaces y permisos de lectura.
DRY_RUN=true "$HOME/.local/bin/ai-op" run --env-file="$HOME/projects/escuela-de-eudemonia/repo/config/stripe.1password.env" -- /usr/bin/node "$ctv_source/scripts/finish-creatuvida-early-bird-2027.mjs"
mkdir -p "$ctv_backup" "$ctv_runtime" "$ctv_units"
for ctv_file in "$ctv_units/$ctv_old.timer" "$ctv_units/$ctv_old.service" "$HOME/.local/lib/$ctv_old/finish-creatuvida-early-bird-2027.mjs"; do
  if [[ -f "$ctv_file" ]]; then cp -p -- "$ctv_file" "$ctv_backup/"; fi
done
systemctl --user show "$ctv_old.timer" > "$ctv_backup/timer-anterior.txt"
systemctl --user disable --now "$ctv_old.timer"
systemctl --user stop "$ctv_old.service"
install -m 0644 "$ctv_source/scripts/finish-creatuvida-early-bird-2027.mjs" "$ctv_runtime/finish-creatuvida-early-bird-2027.mjs"
install -m 0644 "$ctv_source/ops/$ctv_unit.service" "$ctv_units/$ctv_unit.service"
install -m 0644 "$ctv_source/ops/$ctv_unit.timer" "$ctv_units/$ctv_unit.timer"
# Ensayo del disparo de systemd con el script instalado y sin mutaciones.
ctv_trial="$ctv_unit-ensayo-$(date +%s)"
systemd-run --user --unit="$ctv_trial" --on-active=5s --timer-property=AccuracySec=1s --property=RemainAfterExit=yes --setenv=DRY_RUN=true --setenv=PATH=/usr/local/bin:/usr/bin:/bin "$HOME/.local/bin/ai-op" run --env-file="$HOME/projects/escuela-de-eudemonia/repo/config/stripe.1password.env" -- /usr/bin/node "$ctv_runtime/finish-creatuvida-early-bird-2027.mjs"
for ((ctv_attempt=0;ctv_attempt<60;ctv_attempt++)); do
  ctv_exit=$(systemctl --user show "$ctv_trial.service" -p ExecMainExitTimestampMonotonic --value)
  [[ "$ctv_exit" != 0 && -n "$ctv_exit" ]] && break
  sleep 2
done
[[ "$ctv_exit" != 0 && -n "$ctv_exit" ]] || { echo 'El ensayo no terminó: no se habilita el calendario real.' >&2; exit 1; }
[[ $(systemctl --user show "$ctv_trial.service" -p Result --value) == success ]]
journalctl --user -u "$ctv_trial.service" --no-pager > "$ctv_backup/ensayo-systemd.log"
systemctl --user stop "$ctv_trial.timer" "$ctv_trial.service"
systemctl --user daemon-reload
systemctl --user enable --now "$ctv_unit.timer"
systemctl --user is-enabled "$ctv_unit.timer"
systemctl --user is-active "$ctv_unit.timer"
[[ $(systemctl --user is-enabled "$ctv_old.timer" 2>/dev/null || true) == disabled ]]
systemctl --user show "$ctv_unit.timer" -p ActiveState -p UnitFileState -p NextElapseUSecRealtime > "$ctv_backup/timer-nuevo.txt"
cat "$ctv_backup/timer-nuevo.txt"
sha256sum "$ctv_runtime/finish-creatuvida-early-bird-2027.mjs" > "$ctv_backup/sha256-script.txt"
echo "Instalación y ensayo completados. Evidencias: $ctv_backup"
