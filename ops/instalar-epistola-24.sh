#!/usr/bin/env bash
set -euo pipefail
[[ $(id -un) == fran ]] || { echo 'Ejecutar como fran, sin sudo.' >&2; exit 1; }
epi_source=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
epi_unit=eudemonia-epistola-24-20261129
epi_runtime="$HOME/.local/lib/$epi_unit"
epi_units="$HOME/.config/systemd/user"
epi_evidence="$HOME/projects/escuela-de-eudemonia/entregables/epistola-24-20261129/instalacion-$(date -u +%Y%m%dT%H%M%SZ)"

# Una instalación nueva y específica; no reconfigura otros servicios.
systemctl --user show-environment >/dev/null
[[ ! -e "$epi_runtime" && ! -e "$epi_units/$epi_unit.timer" && ! -e "$epi_units/$epi_unit.service" ]] || {
  echo 'Ya existe esta programación. Revisar su estado antes de modificarla.' >&2; exit 1;
}
node "$epi_source/scripts/publish-epistola-24.test.mjs"
node --input-type=module - "$epi_source" <<'JS'
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {pathToFileURL} from 'node:url';
const {change}=await import(pathToFileURL(process.argv[2]+'/scripts/publish-epistola-24.mjs'));
assert.ok(Date.now()<change.activateAt, 'El calendario ya ha vencido');
assert.equal(new Date(change.activateAt).toISOString(),'2026-11-29T07:00:00.000Z');
assert.equal(change.pr,97);
assert.match(change.head,/^[0-9a-f]{40}$/);
const timer=readFileSync(process.argv[2]+'/ops/eudemonia-epistola-24-20261129.timer','utf8');
assert.ok(timer.includes('OnCalendar=2026-11-29 07:00:00 UTC'));
JS
export GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es
export GITHUB_REF=refs/heads/main
DRY_RUN=true node "$epi_source/scripts/publish-epistola-24.mjs"
mkdir -p "$epi_evidence" "$epi_runtime/scripts" "$epi_runtime/ops" "$epi_units"
install -m 0644 "$epi_source/scripts/publish-epistola-24.mjs" "$epi_runtime/scripts/"
install -m 0644 "$epi_source/ops/epistola-24.json" "$epi_runtime/ops/"
install -m 0644 "$epi_source/ops/$epi_unit.service" "$epi_units/"
install -m 0644 "$epi_source/ops/$epi_unit.timer" "$epi_units/"
systemd-analyze --user verify "$epi_units/$epi_unit.service" "$epi_units/$epi_unit.timer"

# Ensayo con un disparo real del calendario y el mismo publicador instalado.
epi_trial="$epi_unit-ensayo-$(date +%s)"
epi_when=$(date -u -d '+10 seconds' '+%Y-%m-%d %H:%M:%S UTC')
systemd-run --user --unit="$epi_trial" --on-calendar="$epi_when" \
  --timer-property=AccuracySec=1s --timer-property=RandomizedDelaySec=0 \
  --property=Type=oneshot --property=RemainAfterExit=yes \
  --setenv=GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es \
  --setenv=GITHUB_REF=refs/heads/main --setenv=DRY_RUN=true \
  /usr/bin/node "$epi_runtime/scripts/publish-epistola-24.mjs"
epi_exit=0
for ((epi_attempt=0;epi_attempt<60;epi_attempt++)); do
  epi_exit=$(systemctl --user show "$epi_trial.service" -p ExecMainExitTimestampMonotonic --value)
  [[ "$epi_exit" != 0 && -n "$epi_exit" ]] && break
  sleep 2
done
journalctl --user -u "$epi_trial.service" --no-pager > "$epi_evidence/ensayo-systemd.log"
[[ "$epi_exit" != 0 && -n "$epi_exit" ]] || { echo 'Ensayo sin terminar; calendario sin activar.' >&2; exit 1; }
[[ $(systemctl --user show "$epi_trial.service" -p Result --value) == success ]]
[[ $(systemctl --user show "$epi_trial.service" -p ExecMainStatus --value) == 0 ]]
rg -q '"status":"dry-run","merged":false' "$epi_evidence/ensayo-systemd.log"
# systemd retira solo el timer transitorio al dispararlo; parar el servicio conservado.
systemctl --user stop "$epi_trial.service"
systemctl --user daemon-reload
systemctl --user enable --now "$epi_unit.timer"
systemctl --user is-enabled "$epi_unit.timer"
systemctl --user is-active "$epi_unit.timer"
systemctl --user show "$epi_unit.timer" -p NextElapseUSecRealtime -p ActiveState -p UnitFileState | tee "$epi_evidence/timer.txt"
sha256sum "$epi_runtime/scripts/publish-epistola-24.mjs" "$epi_runtime/ops/epistola-24.json" > "$epi_evidence/sha256.txt"
echo "Temporizador activado tras el ensayo. Evidencia: $epi_evidence"
