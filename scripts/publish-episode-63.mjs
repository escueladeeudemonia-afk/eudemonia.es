import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

export const publication = Object.freeze({
  repository: "escueladeeudemonia-afk/eudemonia.es",
  pr: 19,
  head: "8a720a55e44a63d7a7f7b3c7f8e71d69a0b44447",
  branch: "feat/podcast-ep63-programado",
  file: "src/content/episodes/ep63-el-cansancio-no-te-quita-inteligencia.md",
  slug: "ep63-el-cansancio-no-te-quita-inteligencia",
  title: "El cansancio no te quita inteligencia",
  player: "129c327f-ca4c-4e64-996c-e0a6bfc83a4e",
  prepareAt: Date.parse("2026-09-15T05:30:00Z"),
  publishAt: Date.parse("2026-09-15T06:00:00Z"),
  expiresAt: Date.parse("2026-09-15T07:00:00Z"),
});

export function validatePullRequest(pr, files) {
  assert.equal(pr.number, publication.pr, "PR inesperada");
  assert.equal(pr.base.repo.full_name, publication.repository, "Repositorio base inesperado");
  assert.equal(pr.head.repo.full_name, publication.repository, "Repositorio de origen inesperado");
  assert.equal(pr.base.ref, "main", "La PR no apunta a main");
  assert.equal(pr.head.ref, publication.branch, "Rama inesperada");
  assert.equal(pr.head.sha, publication.head, "Ha cambiado el contenido revisado de la PR");
  assert.equal(pr.draft, false, "La PR está en borrador");
  assert.equal(files.length, 1, "La PR contiene cambios adicionales");
  assert.equal(files[0].filename, publication.file, "Archivo inesperado");
  assert.equal(files[0].status, "added", "El episodio no es una incorporación nueva");
  assert.ok(pr.merged || pr.state === "open", "La PR está cerrada sin fusionar");
}

// El modo de comprobación consulta la PR, pero nunca espera a la hora ni la fusiona.
// La fecha y el SHA están fijados: este script no publica otras piezas.
export async function publish({ api, dryRun = true, now = Date.now, pause = sleep }) {
  if (!dryRun) {
    if (now() >= publication.expiresAt) return { status: "expired" };
    assert.ok(now() >= publication.prepareAt, "Aún no es el día y la ventana de publicación");
    while (now() < publication.publishAt) {
      await pause(Math.min(publication.publishAt - now(), 60_000));
    }
    assert.ok(now() < publication.expiresAt, "La ventana de publicación ha terminado");
  }

  const resource = `/repos/${publication.repository}/pulls/${publication.pr}`;
  const pr = await api(resource);
  const files = await api(`${resource}/files?per_page=100`);
  validatePullRequest(pr, files);

  if (!pr.merged) {
    assert.equal(pr.mergeable, true, "La PR no está lista para fusionar; el siguiente intento la comprobará");
    assert.equal(pr.mergeable_state, "clean", "GitHub no considera limpia la fusión");
  }
  if (dryRun) return { status: "dry-run", merged: pr.merged };
  if (pr.merged) return { status: "already-merged", commit: pr.merge_commit_sha };
  assert.ok(now() >= publication.publishAt && now() < publication.expiresAt,
    "Fuera de la ventana autorizada al intentar fusionar");

  const result = await api(`${resource}/merge`, {
    method: "PUT",
    body: {
      sha: publication.head,
      merge_method: "merge",
      commit_title: "feat(podcast): publica el episodio 63 el 15 de septiembre",
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

export async function verifyPublication({ fetchPage = fetch, pause = sleep, attempts = 49, now = Date.now } = {}) {
  const targets = [
    [`/podcast/${publication.slug}/`, [publication.title, publication.player, "2026-09-15T06:00:00.000Z"]],
    ["/podcast/", [publication.slug]],
    ["/podcast/feed.xml", [publication.slug, "Tue, 15 Sep 2026 06:00:00 GMT"]],
    ["/sitemap-0.xml", [`/podcast/${publication.slug}/`]],
  ];
  let failures = [];
  const deadline = now() + 12 * 60_000;
  for (let attempt = 0; attempt < attempts; attempt++) {
    const checks = await Promise.all(targets.map(async ([path, expected]) => {
      try {
        const response = await fetchPage(`https://eudemonia.es${path}`, {
          headers: { "Cache-Control": "no-cache" },
          signal: AbortSignal.timeout(20_000),
        });
        const body = await response.text();
        return response.status === 200 && expected.every((text) => body.includes(text))
          ? null : `${path}: HTTP ${response.status} o contenido aún pendiente`;
      } catch (error) {
        return `${path}: ${error.message}`;
      }
    }));
    failures = checks.filter(Boolean);
    if (failures.length === 0) return;
    console.log(`Comprobación ${attempt + 1}: ${failures.join("; ")}`);
    if (now() >= deadline) break;
    if (attempt + 1 < attempts) await pause(15_000);
  }
  throw new Error(`No se ha confirmado el despliegue: ${failures.join("; ")}`);
}

async function main() {
  assert.equal(process.env.GITHUB_REPOSITORY, publication.repository, "Repositorio de ejecución inesperado");
  assert.equal(process.env.GITHUB_REF, "refs/heads/main", "Ejecutar solo desde main");
  assert.ok(process.env.GH_TOKEN, "Falta el token temporal de GitHub Actions");
  const dryRun = process.env.DRY_RUN !== "false";
  const result = await publish({ api: github, dryRun });
  console.log(JSON.stringify(result));
  if (!dryRun && result.status !== "expired") {
    await verifyPublication();
    console.log("Publicación verificada: página, reproductor, índice, RSS y sitemap.");
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `Resultado: **${result.status}**.\n\n` +
      (dryRun ? "Comprobación sin publicar ni fusionar.\n" :
        result.status === "expired" ? "La programación ha caducado; no se ha publicado nada.\n" :
          `[Episodio publicado y verificado](https://eudemonia.es/podcast/${publication.slug}/).\n`));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
