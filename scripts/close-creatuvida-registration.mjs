import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

export const change = Object.freeze({
  repository: "escueladeeudemonia-afk/eudemonia.es",
  pr: 45,
  branch: "fix/creatuvida-cierre-18-oct",
  head: "e802c3b81ce7d2a88600d5d42243265325a7c841",
  files: ["src/data/creatuvida.yaml", "src/pages/creatuvida.astro"],
  prepareAt: Date.parse("2026-10-18T21:30:00Z"),
  activateAt: Date.parse("2026-10-18T21:59:00Z"),
  expiresAt: Date.parse("2026-10-19T21:59:00Z"),
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
    const checks = await api(`/repos/${change.repository}/commits/${change.head}/check-runs?per_page=100`);
    assert.ok(checks.check_runs.some((run) => run.name === "validar" &&
      run.head_sha === change.head && run.status === "completed" && run.conclusion === "success"),
      "La validación de la PR revisada no ha terminado correctamente");
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
      commit_title: "feat(creatuvida): cierra las inscripciones de octubre",
    },
  });
  assert.equal(result.merged, true, "GitHub no confirmó la fusión");
  return { status: "merged", commit: result.sha };
}

async function github(path, { method = "GET", body } = {}) {
  // El respaldo del VPS usa la autenticación existente de gh, sin extraer credenciales.
  if (!process.env.GH_TOKEN) {
    const args = ["api", "--method", method, path];
    if (body) args.push("--input", "-");
    return JSON.parse(execFileSync("gh", args, {
      encoding: "utf8", input: body ? JSON.stringify(body) : undefined,
      timeout: 30_000, maxBuffer: 5 * 1024 * 1024,
      stdio: ["pipe", "pipe", "pipe"],
    }));
  }
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
  const expected = ["Acceso cerrado", "Las inscripciones para la edición"];
  const obsolete = [
    "Reservar plaza", "Ver precio y reservar",
    "https://buy.stripe.com/", "https://checkout.stripe.com/", "416 €", "624 €",
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
      console.log(`Página aún sin el cierre de inscripciones: HTTP ${response.status}`);
    } catch (error) {
      console.log(`Comprobación pendiente: ${error.message}`);
    }
    if (now() >= deadline) break;
    await pause(15_000);
  } while (true);
  throw new Error("No se ha confirmado el cierre de inscripciones de CreaTuVida");
}

async function main() {
  assert.equal(process.env.GITHUB_REPOSITORY, change.repository, "Repositorio de ejecución inesperado");
  assert.equal(process.env.GITHUB_REF, "refs/heads/main", "Ejecutar solo desde main");
  const dryRun = process.env.DRY_RUN !== "false";
  const result = await activate({ api: github, dryRun });
  console.log(JSON.stringify(result));
  if (!dryRun && result.status !== "expired") {
    await verifyWebsite();
    console.log("Acceso cerrado y ausencia de botones de pago verificados en producción.");
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `Resultado: **${result.status}**.\n\n` +
      (dryRun ? "Prueba del cierre sin fusionar ni publicar.\n" :
        result.status === "expired" ? "La programación ha caducado sin publicar.\n" :
          "[Cierre de inscripciones verificado](https://eudemonia.es/creatuvida/).\n"));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
