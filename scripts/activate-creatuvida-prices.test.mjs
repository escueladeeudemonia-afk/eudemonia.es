import test from "node:test";
import assert from "node:assert/strict";
import { activate, change, verifyWebsite } from "./activate-creatuvida-prices.mjs";

function fixture(overrides = {}, files = change.files.map((filename) => ({ filename, status: "modified" }))) {
  const calls = [];
  const pr = {
    number: change.pr, state: "open", merged: false, draft: false,
    base: { ref: "main", repo: { full_name: change.repository } },
    head: { ref: change.branch, sha: change.head, repo: { full_name: change.repository } },
    mergeable: true, mergeable_state: "clean", ...overrides,
  };
  return { calls, api: async (path, options = {}) => {
    calls.push({ path, ...options });
    if (options.method === "PUT") return { merged: true, sha: "merge-commit" };
    return path.includes("/files?") ? files : pr;
  } };
}

test("el 5 de octubre a las 00:00 de Madrid equivale al corte UTC", () => {
  const local = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(change.activateAt);
  assert.equal(local, "05/10/2026, 00:00");
});

test("la prueba revisa sin fusionar", async () => {
  const f = fixture();
  assert.equal((await activate({ ...f, now: () => 0 })).status, "dry-run");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("rechaza un adelanto y caduca al terminar la ventana", async () => {
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

test("un segundo disparo no repite el merge", async () => {
  const f = fixture({ merged: true, state: "closed", merge_commit_sha: "previous-merge" });
  assert.equal((await activate({ ...f, dryRun: false, now: () => change.activateAt })).status, "already-merged");
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

test("bloquea contenido cambiado, archivos extra y conflictos", async () => {
  for (const f of [
    fixture({ head: { ref: change.branch, sha: "different", repo: { full_name: change.repository } } }),
    fixture({}, [{ filename: change.files[0], status: "modified" }, { filename: "otra-pagina.astro", status: "modified" }]),
    fixture({ mergeable: false }),
    fixture({ mergeable_state: "blocked" }),
    fixture({ state: "closed", merged: false }),
    fixture({ draft: true }),
  ]) {
    await assert.rejects(activate({ ...f, dryRun: false, now: () => change.activateAt }));
    assert.equal(f.calls.some((call) => call.method === "PUT"), false);
  }
});

test("verifica precio, enlaces y retirada del descuento", async () => {
  const full = ["Desde 520 €", "520 €", "780 €",
    "https://buy.stripe.com/3cIcN57BLeiFcWWdtEdEs03",
    "https://buy.stripe.com/14AeVdcW5gqN1ee89kdEs02"].join(" ");
  await verifyWebsite({ fetchPage: async () => ({ status: 200, text: async () => full }) });
  await assert.rejects(verifyWebsite({
    fetchPage: async () => ({ status: 200, text: async () => `${full} 416 €` }),
    now: (() => { let tick = 0; return () => (tick += 13 * 60_000); })(),
    pause: async () => {},
  }));
});
