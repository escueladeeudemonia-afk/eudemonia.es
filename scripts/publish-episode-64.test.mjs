import test from "node:test";
import assert from "node:assert/strict";
import { publication, publish, verifyPublication } from "./publish-episode-64.mjs";

function fixture(overrides = {}, files = [{ filename: publication.file, status: "added" }]) {
  const calls = [];
  const pr = {
    number: publication.pr, state: "open", merged: false, draft: false,
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

test("la prueba de configuración consulta sin publicar", async () => {
  const f = fixture();
  assert.equal((await publish({ ...f, now: () => 0 })).status, "dry-run");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("rechaza el adelanto y caduca el mismo día", async () => {
  const f = fixture();
  await assert.rejects(publish({ ...f, dryRun: false, now: () => publication.prepareAt - 1 }));
  assert.equal((await publish({ ...f, dryRun: false, now: () => publication.expiresAt })).status, "expired");
  assert.equal(f.calls.length, 0);
});

test("la hora fijada es el 1 de octubre a las 00:30 de Madrid", () => {
  const formatted = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(publication.publishAt);
  assert.equal(formatted, "01/10/2026, 00:30");
});

test("espera hasta la hora y fusiona el SHA revisado", async () => {
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

test("un reintento no duplica el merge", async () => {
  const f = fixture({ merged: true, state: "closed", merge_commit_sha: "previous-merge" });
  assert.equal((await publish({ ...f, dryRun: false, now: () => publication.publishAt })).status, "already-merged");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("rechaza cambios en la PR, archivos extra y bloqueos", async () => {
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

test("la verificación espera al despliegue y detecta un 404", async () => {
  let rounds = 0;
  const complete = [publication.title, publication.player, publication.slug,
    "2026-09-30T22:30:00.000Z", "Wed, 30 Sep 2026 22:30:00 GMT", `/podcast/${publication.slug}/`].join(" ");
  await verifyPublication({
    fetchPage: async () => ({ status: 200, text: async () => rounds === 0 ? "sitio anterior" : complete }),
    pause: async () => { rounds++; }, attempts: 2,
  });
  assert.equal(rounds, 1);
  await assert.rejects(verifyPublication({
    fetchPage: async () => ({ status: 404, text: async () => "not found" }), attempts: 1,
  }));
});
