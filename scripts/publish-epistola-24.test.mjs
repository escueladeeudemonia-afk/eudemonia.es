import test from "node:test";
import assert from "node:assert/strict";
import { activate, change, article, verifyWebsite } from "./publish-epistola-24.mjs";

function fixture(overrides = {}, files = change.files, checks) {
  const calls = [];
  const pr = {
    number: change.pr, state: "open", merged: false, draft: false,
    base: { ref: "main", repo: { full_name: change.repository } },
    head: { ref: change.branch, sha: change.head, repo: { full_name: change.repository } },
    mergeable: true, mergeable_state: "clean", ...overrides,
  };
  return { calls, pr, api: async (path, options = {}) => {
    calls.push({ path, ...options });
    if (path.includes("/contents/")) return { content: Buffer.from(`---\npubDate: "${new Date(change.activateAt).toISOString()}"\n---\n`).toString("base64") };
    if (options.method === "PUT") return { merged: true, sha: "merge-commit" };
    if (path.includes("/check-runs?")) return { check_runs: checks ?? [{
      id: 1, name: "validar", head_sha: change.head, status: "completed", conclusion: "success",
    }] };
    return path.includes("/files?") ? files : pr;
  } };
}

test("el 29 de noviembre a las 08:00 de Madrid equivale a las 07:00 UTC", () => {
  const local = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(Date.parse("2026-11-29T08:00:00+01:00"));
  assert.equal(local, "29/11/2026, 08:00");
  assert.equal(new Date(change.activateAt).toISOString(), "2026-11-29T07:00:00.000Z");
});

test("dry-run valida la PR sin esperar ni fusionar", async () => {
  const f = fixture();
  assert.equal((await activate({ ...f, now: () => 0 })).status, "dry-run");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("rechaza adelantos y no publica después de caducar", async () => {
  const f = fixture();
  await assert.rejects(activate({ ...f, dryRun: false, now: () => change.prepareAt - 1 }));
  assert.equal((await activate({ ...f, dryRun: false, now: () => change.expiresAt })).status, "expired");
  assert.equal(f.calls.length, 0);
});

test("espera al corte y fusiona solo el SHA revisado", async () => {
  const f = fixture();
  let clock = change.activateAt - 120_000;
  const pause = async (ms) => { assert.ok(ms <= 60_000); clock += ms; };
  assert.equal((await activate({ ...f, dryRun: false, now: () => clock, pause })).status, "merged");
  assert.equal(clock, change.activateAt);
  assert.equal(f.calls.at(-1).body.sha, change.head);
});

test("no fusiona si la espera o la validación cruzan la caducidad", async () => {
  for (const stage of ["wait", "checks"]) {
    const f = fixture();
    let clock = stage === "wait" ? change.activateAt - 1 : change.activateAt;
    const api = async (path, options) => {
      if (stage === "checks" && path.includes("/check-runs?")) clock = change.expiresAt;
      return f.api(path, options);
    };
    await assert.rejects(activate({ api, dryRun: false, now: () => clock,
      pause: async () => { clock = change.expiresAt; } }));
    assert.equal(f.calls.some((call) => call.method === "PUT"), false);
  }
});

test("una publicación ya fusionada no se repite", async () => {
  const f = fixture({ merged: true, state: "closed", merge_commit_sha: "previous-merge" });
  const result = await activate({ ...f, dryRun: false, now: () => change.activateAt });
  assert.equal(result.status, "already-merged");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("bloquea cambios de PR, repositorio, rama, SHA, archivos y conflictos", async () => {
  for (const f of [
    fixture({ number: 999 }),
    fixture({ base: { ref: "otra", repo: { full_name: change.repository } } }),
    fixture({ base: { ref: "main", repo: { full_name: "otra/web" } } }),
    fixture({ head: { ref: "otra", sha: change.head, repo: { full_name: change.repository } } }),
    fixture({ head: { ref: change.branch, sha: "changed", repo: { full_name: change.repository } } }),
    fixture({}, [...change.files, { filename: "otra.astro", status: "added" }]),
    fixture({}, change.files.map((file) => ({ ...file, status: "removed" }))),
    fixture({ mergeable: false }),
    fixture({ mergeable_state: "blocked" }),
    fixture({ state: "closed", merged: false }),
    fixture({ draft: true }),
  ]) {
    await assert.rejects(activate({ ...f, dryRun: false, now: () => change.activateAt }));
    assert.equal(f.calls.some((call) => call.method === "PUT"), false);
  }
});

test("exige CI reciente y aprobado para el SHA exacto", async () => {
  const success = { id: 1, name: "validar", head_sha: change.head,
    status: "completed", conclusion: "success" };
  for (const checks of [[], [{ ...success, head_sha: "another" }],
    [{ ...success, name: "otro" }], [{ ...success, conclusion: "failure" }],
    [success, { ...success, id: 2, status: "in_progress", conclusion: null }],
    [success, { ...success, id: 2, conclusion: "failure" }]]) {
    const f = fixture({}, undefined, checks);
    await assert.rejects(activate({ ...f, dryRun: false, now: () => change.activateAt }));
    assert.equal(f.calls.some((call) => call.method === "PUT"), false);
  }
});

test("acepta que el otro calendario fusione la misma PR durante la petición", async () => {
  const f = fixture();
  const api = async (path, options = {}) => {
    if (path.includes("/contents/")) return { content: Buffer.from(`---\npubDate: "${new Date(change.activateAt).toISOString()}"\n---\n`).toString("base64") };
    if (options.method === "PUT") {
      f.pr.merged = true;
      f.pr.state = "closed";
      f.pr.merge_commit_sha = "other-calendar";
      throw new Error("La PR ya está fusionada");
    }
    return f.api(path, options);
  };
  const result = await activate({ api, dryRun: false, now: () => change.activateAt });
  assert.deepEqual(result, { status: "already-merged", commit: "other-calendar" });
});

test("un error de merge sin publicación confirmada sigue siendo un error", async () => {
  const f = fixture();
  const api = async (path, options = {}) => {
    if (path.includes("/contents/")) return { content: Buffer.from(`---\npubDate: "${new Date(change.activateAt).toISOString()}"\n---\n`).toString("base64") };
    if (options.method === "PUT") throw new Error("Fusión rechazada");
    return f.api(path, options);
  };
  await assert.rejects(activate({ api, dryRun: false, now: () => change.activateAt }), /Fusión rechazada/);
});

const url = `https://eudemonia.es/epistolas/${article.slug}/`;
const published = `${article.title} Epístola #24 Pablo Tovar 29 de noviembre de 2026
 datetime="${new Date(change.activateAt).toISOString()}"
<link rel="canonical" href="${url}">
<meta name="robots" content="noindex,nofollow">
Hay un color que no puedes ver. Seguiremos compartiendo los detalles de cada actividad`;
const sitemap = '<loc>https://eudemonia.es/epistolas/</loc>';
const contentFor = (address) => address.includes('sitemap') ? sitemap : published;
const expiredClock = () => { let tick=0; return () => (tick += 13*60_000); };

test("exige contenido, autor, fecha, canonical, noindex e índice y excluye la pieza del sitemap", async () => {
  const visited = [];
  await verifyWebsite({ fetchPage: async (address) => {
    visited.push(address);
    return { status: 200, text: async () => contentFor(address) };
  } });
  assert.equal(new Set(visited).size, 3);
  for (const missing of ["Pablo Tovar", "29 de noviembre de 2026", "noindex", "canonical", "Hay un color", "Seguiremos compartiendo", article.slug]) {
    await assert.rejects(verifyWebsite({
      fetchPage: async (address) => ({ status: 200, text: async () => contentFor(address).replaceAll(missing, "") }),
      now: expiredClock(), pause: async () => {},
    }));
  }
  await assert.rejects(verifyWebsite({
    fetchPage: async (address) => ({ status: 200, text: async () => contentFor(address) + (address.includes('sitemap') ? url : '') }),
    now: expiredClock(), pause: async () => {},
  }));
  for (const route of [article.slug, "/epistolas/", "sitemap-0.xml"]) {
    await assert.rejects(verifyWebsite({
      fetchPage: async (address) => ({ status: address.includes(route) ? 404 : 200, text: async () => contentFor(address) }),
      now: expiredClock(), pause: async () => {},
    }));
  }
});

test("reintenta la verificación mientras termina el despliegue", async () => {
  let ready = false;
  await verifyWebsite({
    fetchPage: async (address) => ({ status: ready ? 200 : 404, text: async () => contentFor(address) }),
    pause: async () => { ready = true; },
  });
  assert.equal(ready, true);
});

test("impide publicar con una fecha de ficha distinta al calendario", async () => {
  const f = fixture();
  const api = async (path, options) => path.includes("/contents/") ?
    { content: Buffer.from(`---\npubDate: "${new Date(change.activateAt + 60_000).toISOString()}"\n---\n`).toString("base64") } : f.api(path, options);
  await assert.rejects(activate({ api, dryRun: false, now: () => change.activateAt }), /fecha de la ficha/);
  assert.equal(f.calls.some(call => call.method === "PUT"), false);
});
