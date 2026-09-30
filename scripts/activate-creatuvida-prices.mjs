import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

export const change = Object.freeze({
  repository: "escueladeeudemonia-afk/eudemonia.es",
  pr: 37,
  branch: "codex/precios-creatuvida-octubre",
  head: "cdd86119c95015a3cf0a48355f58375951a9f40d",
  files: ["src/data/creatuvida.yaml", "src/pages/creatuvida.astro"],
  prepareAt: Date.parse("2026-10-04T21:30:00Z"),
  activateAt: Date.parse("2026-10-04T22:00:00Z"),
  expiresAt: Date.parse("2026-10-04T23:00:00Z"),
});

export function validatePullRequest(pr, files) {
  assert.equal(pr.number, change.pr, "PR inesperada");
  assert.equal(pr.base.repo.full_name, change.repository, "Repositorio base inesperado");
  assert.equal(pr.head.repo.full_name, change.repository, "Repositorio de origen inesperado");
  assert.equal(pr.base.ref, "main", "La PR no apunta a main");
  assert.equal(pr.head.ref, change.branch, "Rama inesperada");
  assert.equal(pr.head.sha, change.head, "Ha cambiado la PR revisada");
  assert.equal(pr.draft, false, "La PR está en borrador");
  assert.deepEqual(files.map((file) => file.filename).sort(), [...change.files].sort(),
    "La PR contiene archivos inesperados");
  assert.ok(files.every((file) => file.status === "modified"), "La PR no modifica solo archivos existentes");
  assert.ok(pr.merged || pr.state === "open", "La PR está cerrada sin fusionar");
}

export async function activate({ api, dryRun = true, now = Date.now, pause = sleep }) {
  if (!dryRun) {
    if (now() >= change.expiresAt) return { status: "expired" };
    assert.ok(now() >= change.prepareAt, "Fuera de la ventana de preparación");
    while (now() < change.activateAt) {
      await pause(Math.min(change.activateAt - now(), 60_000));
    }
    assert.ok(now() < change.expiresAt, "La ventana de activación ha terminado");
  }

  const resource = `/repos/${change.repository}/pulls/${change.pr}`;
  let pr;
  for (let attempt = 0; attempt < 6; attempt++) {
    pr = await api(resource);
    if (pr.merged || pr.mergeable !== null) break;
    if (attempt < 5) await pause(5_000);
  }
  const files = await api(`${resource}/files?per_page=100`);
  validatePullRequest(pr, files);
  if (!pr.merged) {
    assert.equal(pr.mergeable, true, "GitHub detecta un conflicto de fusión");
    assert.ok(!["blocked", "dirty"].includes(pr.mergeable_state), "GitHub indica un bloqueo de fusión");
  }
  if (dryRun) return { status: "dry-run", merged: pr.merged };
  if (pr.merged) return { status: "already-merged", commit: pr.merge_commit_sha };
  assert.ok(now() >= change.activateAt && now() < change.expiresAt,
    "Fuera de la ventana autorizada al intentar fusionar");

  const result = await api(`${resource}/merge`, {
    method: "PUT",
    body: {
      sha: change.head,
      merge_method: "merge",
      commit_title: "fix(creatuvida): activa la tarifa completa el 5 de octubre",
    },
  });
  assert.equal(result.merged, true, "GitHub no confirmó la fusión");
  return { status: "merged", commit: result.sha };
}

async function github(path, { method = "GET", body } = {}) {
  const response = await fetch(`https://api.github.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${process.env.GH_TOKEN}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(body && { "Content-Type": "application/json" }),
    },
    ...(body && { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(30_000),
  });
  const data = await response.json();
  assert.ok(response.ok, `GitHub ${response.status}: ${data.message ?? "petición fallida"}`);
  return data;
}

export async function verifyWebsite({ fetchPage = fetch, pause = sleep, now = Date.now } = {}) {
  const url = "https://eudemonia.es/creatuvida/";
  const expected = [
    "Desde 520 €", "520 €", "780 €",
    "https://buy.stripe.com/3cIcN57BLeiFcWWdtEdEs03",
    "https://buy.stripe.com/14AeVdcW5gqN1ee89kdEs02",
  ];
  const obsolete = [
    "416 €", "624 €", "El descuento del 20 % se aplica",
    "aFa4gz9JT2zX0aa2P0dEs00", "dRm8wPaNX7Uh3mmahsdEs01",
  ];
  const deadline = now() + 12 * 60_000;
  do {
    try {
      const response = await fetchPage(url, {
        headers: { "Cache-Control": "no-cache" },
        signal: AbortSignal.timeout(20_000),
      });
      const html = await response.text();
      if (response.status === 200 && expected.every((value) => html.includes(value)) &&
          obsolete.every((value) => !html.includes(value))) return;
      console.log(`Página aún sin la tarifa completa: HTTP ${response.status}`);
    } catch (error) {
      console.log(`Comprobación pendiente: ${error.message}`);
    }
    if (now() >= deadline) break;
    await pause(15_000);
  } while (true);
  throw new Error("No se ha confirmado el despliegue de los precios y enlaces en CreaTuVida");
}

async function main() {
  assert.equal(process.env.GITHUB_REPOSITORY, change.repository, "Repositorio de ejecución inesperado");
  assert.equal(process.env.GITHUB_REF, "refs/heads/main", "Ejecutar solo desde main");
  assert.ok(process.env.GH_TOKEN, "Falta el token temporal de GitHub Actions");
  const dryRun = process.env.DRY_RUN !== "false";
  const result = await activate({ api: github, dryRun });
  console.log(JSON.stringify(result));
  if (!dryRun && result.status !== "expired") {
    await verifyWebsite();
    console.log("Tarifa completa verificada en la web de producción.");
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `Resultado: **${result.status}**.\n\n` +
      (dryRun ? "Prueba sin fusionar ni publicar.\n" :
        result.status === "expired" ? "La programación ha caducado sin publicar.\n" :
          "[Precios y enlaces verificados](https://eudemonia.es/creatuvida/).\n"));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
