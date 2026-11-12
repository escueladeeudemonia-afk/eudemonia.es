#!/usr/bin/env bash
# Ejecutar como fran desde una terminal normal del VPS. No ejecuta merges.
set -euo pipefail
[[ $(id -un) == fran ]] || { echo 'Ejecutar como fran, sin sudo.' >&2; exit 1; }
ep67_source=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)
ep67_unit=eudemonia-podcast-ep67-20261115
ep67_old=eudemonia-podcast-ep67-20261116
ep67_runtime="$HOME/.local/lib/$ep67_unit"
ep67_units="$HOME/.config/systemd/user"
ep67_evidence="$HOME/projects/escuela-de-eudemonia/evidencias/episodio-67/instalacion-$(date -u +%Y%m%dT%H%M%SZ)"

# Comprobar el bus antes de modificar directorios del sistema de usuario.
systemctl --user show-environment >/dev/null
python3 "$ep67_source/ops/preparar-podcast-ep67.py" --check
node "$ep67_source/scripts/publish-episode-67.test.mjs"
node --input-type=module - "$ep67_source" <<'JS'
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
const {change}=await import(pathToFileURL(process.argv[2]+'/scripts/publish-episode-67.mjs'));
assert.ok(Date.now()<change.activateAt,'Para una recuperación posterior, seguir el runbook');
assert.ok(Number.isInteger(change.pr) && change.pr>0);
assert.match(change.head,/^[0-9a-f]{40}$/);
JS
export GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es
export GITHUB_REF=refs/heads/main
DRY_RUN=true node "$ep67_source/scripts/publish-episode-67.mjs"

mkdir -p "$ep67_evidence" "$ep67_runtime/scripts" "$ep67_runtime/ops" "$ep67_units"
for ep67_file in "$ep67_units/$ep67_unit.timer" "$ep67_units/$ep67_unit.service" "$ep67_units/$ep67_old.timer" "$ep67_units/$ep67_old.service" "$ep67_runtime/ops/podcast-ep67.json" "$ep67_runtime/scripts/publish-episode-67.mjs"; do
  if [[ -f "$ep67_file" ]]; then cp -p -- "$ep67_file" "$ep67_evidence/"; fi
done
# Retirar solo la programación anulada del #67 si alguien llegó a instalarla.
if systemctl --user cat "$ep67_old.timer" >/dev/null 2>&1; then
  systemctl --user disable --now "$ep67_old.timer"
fi
if systemctl --user cat "$ep67_old.service" >/dev/null 2>&1; then
  systemctl --user stop "$ep67_old.service"
fi
systemctl --user stop "$ep67_unit.timer" "$ep67_unit.service" 2>/dev/null || true
install -m 0644 "$ep67_source/scripts/publish-episode-67.mjs" "$ep67_runtime/scripts/publish-episode-67.mjs"
install -m 0644 "$ep67_source/ops/podcast-ep67.json" "$ep67_runtime/ops/podcast-ep67.json"
install -m 0644 "$ep67_source/ops/$ep67_unit.service" "$ep67_units/$ep67_unit.service"
install -m 0644 "$ep67_source/ops/$ep67_unit.timer" "$ep67_units/$ep67_unit.timer"

# Disparo real del calendario con el runtime instalado; DRY_RUN impide publicar.
ep67_trial="$ep67_unit-ensayo-$(date +%s)"
ep67_when=$(date -u -d '+10 seconds' '+%Y-%m-%d %H:%M:%S UTC')
systemd-run --user --unit="$ep67_trial" --on-calendar="$ep67_when" \
  --timer-property=AccuracySec=1s --timer-property=RandomizedDelaySec=0 \
  --property=Type=oneshot --property=RemainAfterExit=yes \
  --setenv=GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es \
  --setenv=GITHUB_REF=refs/heads/main --setenv=DRY_RUN=true \
  /usr/bin/node "$ep67_runtime/scripts/publish-episode-67.mjs"
ep67_exit=0
for ((ep67_attempt=0;ep67_attempt<60;ep67_attempt++)); do
  ep67_exit=$(systemctl --user show "$ep67_trial.service" -p ExecMainExitTimestampMonotonic --value)
  [[ "$ep67_exit" != 0 && -n "$ep67_exit" ]] && break
  sleep 2
done
[[ "$ep67_exit" != 0 && -n "$ep67_exit" ]] || { echo 'Ensayo sin completar; timer definitivo sin habilitar.' >&2; exit 1; }
[[ $(systemctl --user show "$ep67_trial.service" -p Result --value) == success ]]
[[ $(systemctl --user show "$ep67_trial.service" -p ExecMainStatus --value) == 0 ]]
journalctl --user -u "$ep67_trial.service" --no-pager > "$ep67_evidence/ensayo-systemd.log"
systemctl --user stop "$ep67_trial.service"
systemctl --user daemon-reload
systemctl --user enable --now "$ep67_unit.timer"
systemctl --user is-enabled "$ep67_unit.timer"
systemctl --user is-active "$ep67_unit.timer"
systemctl --user show "$ep67_unit.timer" -p NextElapseUSecRealtime -p ActiveState -p UnitFileState | tee "$ep67_evidence/timer.txt"
sha256sum "$ep67_runtime/scripts/publish-episode-67.mjs" "$ep67_runtime/ops/podcast-ep67.json" > "$ep67_evidence/sha256.txt"
echo "Timer instalado con la hora del JSON. El respaldo GitHub requiere su propia activación. Evidencias: $ep67_evidence"
