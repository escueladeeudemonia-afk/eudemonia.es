import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

// Publicación autorizada para el 15-oct-2026 a las 00:30 Europe/Madrid.
export const change = Object.freeze({
  repository: "escueladeeudemonia-afk/eudemonia.es",
  pr: 49,
  branch: "feat/podcast-ep65",
  head: "3117a6be98ff87250d6be9ac455e31caf4c4e117",
  files: [
    { filename: "src/content/episodes/ep65-la-cifra-que-nunca-llega.md", status: "added" },
    { filename: "src/pages/podcast/[slug].astro", status: "modified" },
  ],
  prepareAt: Date.parse("2026-10-14T22:00:00Z"),
  activateAt: Date.parse("2026-10-14T22:30:00Z"),
  expiresAt: Date.parse("2026-10-15T01:30:00Z"),
});

export const episode = Object.freeze({
  slug: "ep65-la-cifra-que-nunca-llega",
  title: "La cifra que nunca llega",
  player: "b248e6e8-3da1-4e34-99ea-65c1ebb91fb4",
});

export function validatePullRequest(pr, files) {
  assert.equal(pr.number, change.pr, "PR inesperada");
  assert.equal(pr.base.repo.full_name, change.repository, "Repositorio base inesperado");
  assert.equal(pr.head.repo.full_name, change.repository, "Repositorio de origen inesperado");
  assert.equal(pr.base.ref, "main", "La PR no apunta a main");
  assert.equal(pr.head.ref, change.branch, "Rama inesperada");
  assert.equal(pr.head.sha, change.head, "Ha cambiado la PR revisada");
  assert.equal(pr.draft, false, "La PR está en borrador");
  const byName = (a, b) => a.filename.localeCompare(b.filename);
  assert.deepEqual(files.map(({ filename, status }) => ({ filename, status })).sort(byName),
    [...change.files].sort(byName), "La PR contiene archivos o cambios inesperados");
  assert.ok(pr.merged || pr.state === "open", "La PR está cerrada sin fusionar");
}

export async function activate({ api, dryRun = true, now = Date.now, pause = sleep }) {
  if (!dryRun) {
    if (now() >= change.expiresAt) return { status: "expired" };
    assert.ok(now() >= change.prepareAt, "Fuera de la ventana de preparación");
    while (now() < change.activateAt) {
      await pause(Math.min(change.activateAt - now(), 60_000));
    }
    assert.ok(now() < change.expiresAt, "La ventana de publicación ha terminado");
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
    const validation = checks.check_runs.filter((run) =>
      run.name === "validar" && run.head_sha === change.head).sort((a, b) => b.id - a.id)[0];
    assert.ok(validation?.status === "completed" && validation.conclusion === "success",
      "La validación más reciente de la PR revisada no ha terminado correctamente");
  }
  if (dryRun) return { status: "dry-run", merged: pr.merged };
  if (pr.merged) return { status: "already-merged", commit: pr.merge_commit_sha };
  assert.ok(now() >= change.activateAt && now() < change.expiresAt,
    "Fuera de la ventana autorizada al intentar fusionar");

  try {
    const result = await api(`${resource}/merge`, {
      method: "PUT",
      body: {
        sha: change.head,
        merge_method: "merge",
        commit_title: "feat(podcast): publica el episodio 65",
      },
    });
    assert.equal(result.merged, true, "GitHub no confirmó la fusión");
    return { status: "merged", commit: result.sha };
  } catch (error) {
    // El otro calendario puede haber fusionado esta misma PR mientras esperábamos.
    const latest = await api(resource);
    validatePullRequest(latest, files);
    if (latest.merged) return { status: "already-merged", commit: latest.merge_commit_sha };
    throw error;
  }
}

async function github(path, { method = "GET", body } = {}) {
  // En el VPS se reutiliza gh sin extraer ni guardar credenciales.
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
  const url = `https://eudemonia.es/podcast/${episode.slug}/`;
  const pages = [
    [url, [episode.title, "Episodio 65", "15 de octubre de 2026", "00:20:23",
      `player.simplecast.com/${episode.player}?dark=false`,
      'datetime="2026-10-14T22:30:00.000Z"']],
    ["https://eudemonia.es/podcast/", [episode.slug, episode.title]],
    ["https://eudemonia.es/podcast/feed.xml", [`<link>${url}</link>`, episode.title]],
    ["https://eudemonia.es/sitemap-0.xml", [`<loc>${url}</loc>`]],
  ];
  const deadline = now() + 12 * 60_000;
  do {
    try {
      const results = await Promise.all(pages.map(async ([address, expected]) => {
        const response = await fetchPage(address, {
          headers: { "Cache-Control": "no-cache" },
          signal: AbortSignal.timeout(20_000),
        });
        const html = await response.text();
        return response.status === 200 && expected.every((value) => html.includes(value));
      }));
      if (results.every(Boolean)) return;
      console.log("Publicación aún pendiente en página, reproductor, índice, RSS o sitemap.");
    } catch (error) {
      console.log(`Comprobación pendiente: ${error.message}`);
    }
    if (now() >= deadline) break;
    await pause(15_000);
  } while (true);
  throw new Error("No se ha confirmado la publicación completa del episodio 65");
}

async function main() {
  if (process.argv.includes("--verify-only")) {
    await verifyWebsite();
    console.log("Episodio 65 verificado en producción: página, reproductor, índice, RSS y sitemap.");
    return;
  }
  assert.equal(process.env.GITHUB_REPOSITORY, change.repository, "Repositorio de ejecución inesperado");
  assert.equal(process.env.GITHUB_REF, "refs/heads/main", "Ejecutar solo desde main");
  const dryRun = process.env.DRY_RUN !== "false";
  const result = await activate({ api: github, dryRun });
  console.log(JSON.stringify(result));
  if (!dryRun && result.status !== "expired") {
    await verifyWebsite();
    console.log("Episodio 65 verificado en producción: página, reproductor, índice, RSS y sitemap.");
  }
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `Resultado: **${result.status}**.\n\n` +
      (dryRun ? "Prueba de publicación sin fusionar ni desplegar.\n" :
        result.status === "expired" ? "La programación ha caducado sin publicar.\n" :
          `[Episodio 65 verificado](https://eudemonia.es/podcast/${episode.slug}/).\n`));
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
