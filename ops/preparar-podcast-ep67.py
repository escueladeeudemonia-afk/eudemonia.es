#!/usr/bin/env python3
"""Genera calendario y unidades desde la hora provisional; no instala ni publica."""
import argparse
import datetime as dt
import itertools
import json
from pathlib import Path
import re
import subprocess
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "ops/podcast-ep67.json"


def artifacts(config):
    instant = dt.datetime.fromisoformat(config["publicationAt"])
    assert instant.utcoffset() is not None, "La fecha debe incluir zona"
    assert config["timeZone"] == "Europe/Madrid"
    assert instant.astimezone(ZoneInfo(config["timeZone"])).date() == dt.date(2026, 11, 16)
    assert instant.second == instant.microsecond == 0, "Usar precisión de minutos"
    utc = instant.astimezone(dt.timezone.utc)
    unit = "eudemonia-podcast-ep67-20261116"
    service = f"""[Unit]
Description=Publicación del episodio 67 de Eudemonía (hora provisional)
StartLimitIntervalSec=0

[Service]
Type=oneshot
Environment=GITHUB_REPOSITORY=escueladeeudemonia-afk/eudemonia.es
Environment=GITHUB_REF=refs/heads/main
Environment=DRY_RUN=false
Environment=PATH=/usr/local/bin:/usr/bin:/bin
WorkingDirectory=%h/.local/lib/{unit}
ExecStart=/usr/bin/node %h/.local/lib/{unit}/scripts/publish-episode-67.mjs
TimeoutStartSec=45min
Restart=on-failure
RestartSec=60s
"""
    timer = f"""[Unit]
Description=Episodio 67 el {instant.isoformat()} (provisional, sin confirmación de Fran)

[Timer]
OnCalendar={utc:%Y-%m-%d %H:%M:%S} UTC
AccuracySec=1s
RandomizedDelaySec=0
Persistent=true
Unit={unit}.service

[Install]
WantedBy=timers.target
"""
    instants = [utc - dt.timedelta(minutes=17)] + [utc + dt.timedelta(hours=h, minutes=m) for h in range(6) for m in (7, 23, 43)]
    by_hour = {}
    for t in instants:
        by_hour.setdefault((t.month, t.day, t.hour), set()).add(t.minute)
    grouped = {}
    for (month, day, hour), minutes in by_hour.items():
        grouped.setdefault((month, day, tuple(sorted(minutes))), []).append(hour)
    cron = "\n".join(f"    - cron: '{','.join(map(str, minutes))} {','.join(map(str, sorted(hours)))} {day} {month} *'" for (month, day, minutes), hours in grouped.items())
    workflow = """name: Publicar episodio 67 (hora provisional del 16-nov)

on:
  schedule:
    # Generado desde ops/podcast-ep67.json. Fran aún no confirma la hora.
CRON
  workflow_dispatch:
    inputs:
      dry_run:
        description: Ensayar sin fusionar ni desplegar
        type: boolean
        required: true
        default: true

permissions:
  contents: write
  pull-requests: write

concurrency:
  group: podcast-ep67-20261116
  cancel-in-progress: false

jobs:
  publicar:
    if: github.repository == 'escueladeeudemonia-afk/eudemonia.es' && github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    timeout-minutes: 45
    steps:
      - name: Descargar main
        uses: actions/checkout@d23441a48e516b6c34aea4fa41551a30e30af803 # v6
        with:
          persist-credentials: false
      - name: Comprobar calendario y barreras
        run: |
          python3 ops/preparar-podcast-ep67.py --check
          node scripts/publish-episode-67.test.mjs
      - name: Publicar solo la PR revisada y verificar la web
        env:
          GH_TOKEN: ${{ github.token }}
          DRY_RUN: ${{ github.event_name == 'workflow_dispatch' && inputs.dry_run && 'true' || 'false' }}
        run: node scripts/publish-episode-67.mjs
""".replace("CRON", cron)
    return {f"ops/{unit}.service": service, f"ops/{unit}.timer": timer, ".github/workflows/publish-episode-67.yml": workflow}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true")
    parser.add_argument("--content-checkout", type=Path, help="Actualizar el SHA tras revisar y commitear un cambio de pubDate")
    args = parser.parse_args()
    config = json.loads(CONFIG.read_text())
    if args.content_checkout:
        assert not args.check, "Separar actualización y comprobación"
        checkout = args.content_checkout.resolve()
        def git(*values):
            return subprocess.check_output(["git", "-C", str(checkout), *values], text=True).strip()
        assert git("branch", "--show-current") == "feat/podcast-ep67"
        assert not git("status", "--porcelain"), "Revisar y commitear antes de fijar el SHA"
        text = (checkout / "src/content/episodes/ep67-si-tu-tambien-eres-tribal.md").read_text()
        source_date = re.search(r'^pubDate:\s*"([^"]+)"', text, re.M).group(1)
        assert dt.datetime.fromisoformat(source_date) == dt.datetime.fromisoformat(config["publicationAt"]), "pubDate y calendario difieren"
        config["contentHead"] = git("rev-parse", "HEAD")
        CONFIG.write_text(json.dumps(config, ensure_ascii=False, indent=2) + "\n")
    for name, value in artifacts(config).items():
        path = ROOT / name
        if args.check:
            assert path.read_text() == value, f"Regenerar {name} desde {CONFIG}"
        else:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text(value)
    print("Calendario comprobado; sin instalación ni publicación." if args.check else "Archivos generados; falta revisión, CI e instalación/activación.")


if __name__ == "__main__":
    main()
