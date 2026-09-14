import test from "node:test";
import assert from "node:assert/strict";
import { publication, publish, verifyPublication } from "./publish-episode-63.mjs";

function fixture(overrides = {}, files = [{ filename: publication.file, status: "added" }]) {
  const calls = [];
  const pr = {
    number: 19, state: "open", merged: false, draft: false,
    base: { ref: "main", repo: { full_name: publication.repository } },
    head: { ref: publication.branch, sha: publication.head, repo: { full_name: publication.repository } },
    mergeable: true, mergeable_state: "clean", ...overrides,
  };
  return { calls, api: async (path, options = {}) => {
    calls.push({ path, ...options });
    if (options.method === "PUT") return { merged: true, sha: "merge-commit" };
    return path.includes("/files?") ? files : pr;
  } };
}

test("la prueba de configuración consulta sin publicar incluso antes de la fecha", async () => {
  const f = fixture();
  assert.equal((await publish({ ...f, now: () => 0 })).status, "dry-run");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("no permite una publicación prematura ni repite la programación otro día", async () => {
  const f = fixture();
  await assert.rejects(publish({ ...f, dryRun: false, now: () => publication.prepareAt - 1 }));
  assert.equal((await publish({ ...f, dryRun: false, now: () => publication.expiresAt })).status, "expired");
  assert.equal(f.calls.length, 0);
});

test("espera hasta las 08:00 de Madrid y fusiona comprobando el SHA revisado", async () => {
  const f = fixture();
  let clock = publication.publishAt - 120_000;
  const pause = async (ms) => {
    assert.equal(f.calls.length, 0);
    assert.ok(ms <= 60_000);
    clock += ms;
  };
  assert.equal((await publish({ ...f, dryRun: false, now: () => clock, pause })).status, "merged");
  assert.equal(clock, publication.publishAt);
  assert.equal(f.calls.at(-1).body.sha, publication.head);
});

test("un reintento no vuelve a fusionar una PR ya publicada", async () => {
  const f = fixture({ merged: true, state: "closed", merge_commit_sha: "previous-merge" });
  assert.equal((await publish({ ...f, dryRun: false, now: () => publication.publishAt })).status, "already-merged");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("espera a que GitHub termine de recalcular la fusión", async () => {
  const f = fixture();
  let reads = 0;
  let waited = 0;
  const api = async (path, options) => {
    const result = await f.api(path, options);
    if (path.endsWith("/pulls/19") && ++reads === 1) return { ...result, mergeable: null };
    return result;
  };
  const result = await publish({ api, dryRun: false, now: () => publication.publishAt,
    pause: async (ms) => { waited += ms; } });
  assert.equal(result.status, "merged");
  assert.equal(reads, 2);
  assert.equal(waited, 5_000);
});

test("rechaza contenido cambiado, archivos extra y bloqueos de GitHub", async () => {
  for (const f of [
    fixture({ head: { ref: publication.branch, sha: "different", repo: { full_name: publication.repository } } }),
    fixture({}, [{ filename: publication.file, status: "added" }, { filename: "otra-pagina.astro", status: "modified" }]),
    fixture({ mergeable_state: "blocked" }),
    fixture({ mergeable: false }),
    fixture({ state: "closed", merged: false }),
    fixture({ draft: true }),
  ]) {
    await assert.rejects(publish({ ...f, dryRun: false, now: () => publication.publishAt }));
    assert.equal(f.calls.some((call) => call.method === "PUT"), false);
  }
});

test("la verificación espera al despliegue y no confunde un 200 antiguo con publicación", async () => {
  let rounds = 0;
  const complete = [publication.title, publication.player, publication.slug,
    "2026-09-15T06:00:00.000Z", "Tue, 15 Sep 2026 06:00:00 GMT", `/podcast/${publication.slug}/`].join(" ");
  await verifyPublication({
    fetchPage: async () => ({ status: 200, text: async () => rounds === 0 ? "sitio anterior" : complete }),
    pause: async () => { rounds++; }, attempts: 2,
  });
  assert.equal(rounds, 1);
  await assert.rejects(verifyPublication({
    fetchPage: async () => ({ status: 404, text: async () => "not found" }), attempts: 1,
  }));
});
