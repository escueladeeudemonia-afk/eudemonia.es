import test from "node:test";
import assert from "node:assert/strict";
import { activate, change, episode, verifyWebsite } from "./publish-episode-65.mjs";

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
    if (options.method === "PUT") return { merged: true, sha: "merge-commit" };
    if (path.includes("/check-runs?")) return { check_runs: checks ?? [{
      id: 1, name: "validar", head_sha: change.head, status: "completed", conclusion: "success",
    }] };
    return path.includes("/files?") ? files : pr;
  } };
}

test("el 15 de octubre a las 00:30 de Madrid equivale al 14 a las 22:30 UTC", () => {
  const local = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(change.activateAt);
  assert.equal(local, "15/10/2026, 00:30");
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
    fixture({ number: 50 }),
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
    if (options.method === "PUT") throw new Error("Fusión rechazada");
    return f.api(path, options);
  };
  await assert.rejects(activate({ api, dryRun: false, now: () => change.activateAt }), /Fusión rechazada/);
});

const published = `La cifra que nunca llega Episodio 65 15 de octubre de 2026 00:20:23
player.simplecast.com/${episode.player}?dark=false datetime="2026-10-14T22:30:00.000Z"
${episode.slug} <link>https://eudemonia.es/podcast/${episode.slug}/</link>
<loc>https://eudemonia.es/podcast/${episode.slug}/</loc>`;

test("exige página, reproductor, fecha, duración, índice, RSS y sitemap", async () => {
  const visited = [];
  await verifyWebsite({ fetchPage: async (url) => {
    visited.push(url);
    return { status: 200, text: async () => published };
  } });
  assert.equal(new Set(visited).size, 4);
  for (const missing of [episode.player, "15 de octubre de 2026", "00:20:23", "<link>", "<loc>"]) {
    await assert.rejects(verifyWebsite({
      fetchPage: async () => ({ status: 200, text: async () => published.replaceAll(missing, "") }),
      now: (() => { let tick = 0; return () => (tick += 13 * 60_000); })(),
      pause: async () => {},
    }));
  }
  for (const route of ["ep65-", "feed.xml", "sitemap-0.xml"]) {
    await assert.rejects(verifyWebsite({
      fetchPage: async (url) => ({ status: url.includes(route) ? 404 : 200, text: async () => published }),
      now: (() => { let tick = 0; return () => (tick += 13 * 60_000); })(),
      pause: async () => {},
    }));
  }
});

test("reintenta la verificación mientras termina el despliegue", async () => {
  let ready = false;
  await verifyWebsite({
    fetchPage: async () => ({ status: ready ? 200 : 404, text: async () => published }),
    pause: async () => { ready = true; },
  });
  assert.equal(ready, true);
});
