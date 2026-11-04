import test from "node:test";
import assert from "node:assert/strict";
import { activate, change, verifyWebsite, finishStripe, catalog, run } from "./finish-creatuvida-early-bird-2027.mjs";

function fixture(overrides = {}, files = change.files.map((filename) => ({ filename, status: "modified" })), conclusion = "success") {
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
    if (path.includes("/check-runs?")) return { check_runs: [{
      name: "validar", head_sha: change.head, status: "completed", conclusion,
    }] };
    return path.includes("/files?") ? files : pr;
  } };
}

test("el 18 de enero a las 00:00 de Madrid equivale al 17 de enero a las 23:00 UTC", () => {
  const local = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(change.activateAt);
  assert.equal(local, "18/01/2027, 00:00");
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

test("bloquea el cierre si la validación de la PR no está aprobada", async () => {
  const f = fixture({}, undefined, "failure");
  await assert.rejects(activate({ ...f, dryRun: false, now: () => change.activateAt }));
  assert.equal(f.calls.some((call) => call.method === "PUT"), false);
});

function stripeFixture({ account = catalog.account, wrongAmount = false, generalInactive = false, sessionLink, failExpire = false, alreadyDisabled = false } = {}) {
  const calls = [];
  const links = new Map([...catalog.early, ...catalog.normal].map((link) => [link.id, {
    ...link, active: !(catalog.early.includes(link) ? alreadyDisabled : generalInactive), livemode: true,
    metadata: { ede_event_id: "ctv-2027-01-29" },
  }]));
  const sessions = sessionLink ? [{ id: "cs_test_fixture", payment_link: sessionLink, livemode: true, status: "open" }] : [];
  return { calls, api: async (path, body) => {
    calls.push({ path, body });
    if (path === "account") return { id: account };
    if (path.startsWith("checkout/sessions?")) {
      const id = new URLSearchParams(path.split("?")[1]).get("payment_link");
      return { data: sessions.filter((s) => s.payment_link === id && s.status === "open").map((s) => ({ ...s })), has_more: false };
    }
    if (path.startsWith("checkout/sessions/")) {
      const session = sessions.find((s) => s.id === path.split("/")[2]);
      assert.ok(session);
      if (path.endsWith("/expire")) {
        if (failExpire) throw new Error("Sin permiso para caducar sesiones");
        session.status = "expired";
      }
      return { ...session };
    }
    const id = path.split("/")[1];
    const link = links.get(id);
    assert.ok(link, "La prueba detecta un enlace fuera de catálogo");
    if (path.includes("/line_items")) return {
      has_more: false,
      data: [{ quantity: 1, amount_total: link.amount + (wrongAmount ? 1 : 0), price: { id: link.price, product: catalog.product, currency: "eur", active: true } }],
    };
    if (body) { assert.ok(catalog.early.some((item) => item.id === id)); link.active = body.active === "true"; }
    return { ...link };
  } };
}

test("Stripe no cambia nada en el ensayo ni antes del corte", async () => {
  const f = stripeFixture();
  assert.equal((await finishStripe({ ...f })).status, "dry-run");
  assert.ok(f.calls.every((call) => !call.body));
  const early = stripeFixture();
  await assert.rejects(finishStripe({ ...early, dryRun: false, now: () => change.prepareAt - 1 }));
  assert.equal(early.calls.length, 0);
});

test("bloquea Stripe si cuenta, importe o enlaces generales no coinciden", async () => {
  for (const f of [stripeFixture({ account: "otra-cuenta" }), stripeFixture({ wrongAmount: true }), stripeFixture({ generalInactive: true })]) {
    await assert.rejects(finishStripe({ ...f, dryRun: false, now: () => change.activateAt }));
    assert.ok(f.calls.every((call) => !call.body));
  }
});

test("desactiva solo los dos enlaces anticipados y caduca sus sesiones abiertas", async () => {
  const f = stripeFixture({ sessionLink: catalog.early[0].id });
  const result = await finishStripe({ ...f, dryRun: false, now: () => change.activateAt });
  assert.equal(result.status, "disabled");
  assert.equal(result.expiredSessions, 1);
  assert.deepEqual(f.calls.filter((c) => c.body && c.path.startsWith("payment_links/")).map((c) => c.path), catalog.early.map((l) => `payment_links/${l.id}`));
});

test("se puede reintentar después de desactivar parcialmente o de completar el trabajo", async () => {
  const f = stripeFixture({ alreadyDisabled: true });
  assert.equal((await finishStripe({ ...f, dryRun: false, now: () => change.activateAt })).status, "disabled");
  assert.equal((await finishStripe({ ...f, dryRun: false, now: () => change.activateAt })).status, "disabled");
});

test("si no puede caducar una sesión abierta informa del fallo y mantiene los enlaces cerrados", async () => {
  const f = stripeFixture({ sessionLink: catalog.early[0].id, failExpire: true });
  await assert.rejects(finishStripe({ ...f, dryRun: false, now: () => change.activateAt }), /Sin permiso/);
  assert.equal(f.calls.filter((c) => c.body?.active === "false").length, 2);
});

test("un fallo de GitHub no impide cerrar Stripe al acabar la oferta", async () => {
  const f = stripeFixture();
  await assert.rejects(run({ githubApi: async () => { throw new Error("GitHub no disponible"); }, stripeApi: f.api, dryRun: false, now: () => change.activateAt, verify: async () => {} }), /GitHub no disponible/);
  assert.equal(f.calls.filter((c) => c.body?.active === "false").length, 2);
});

test("un fallo de Stripe no impide publicar los precios generales", async () => {
  const f = fixture();
  await assert.rejects(run({ githubApi: f.api, stripeApi: async () => { throw new Error("Stripe no disponible"); }, dryRun: false, now: () => change.activateAt, verify: async () => {} }), /Stripe no disponible/);
  assert.equal(f.calls.filter((c) => c.method === "PUT").length, 1);
});

test("el respaldo de GitHub opera solo la web y no necesita acceso a Stripe", async () => {
  const f = fixture();
  const result = await run({ githubApi: f.api, stripeApi: async () => { throw new Error("No debe llamarse"); }, webOnly: true });
  assert.equal(result[0].status, "dry-run");
  assert.equal(result[1].status, "server-managed");
});

test("verifica las tres páginas y detecta precios o enlaces antiguos", async () => {
  const full = ["520 €", "780 €", "enero de 2027", ...catalog.normal.map((l) => l.url)].join(" ");
  const paths = [];
  await verifyWebsite({ fetchPage: async (url) => { paths.push(url); return { status: 200, text: async () => full }; } });
  assert.equal(paths.length, 3);
  for (const old of ["416 €", "624 €", "Tarifa anticipada", catalog.early[0].url]) await assert.rejects(verifyWebsite({
    fetchPage: async () => ({ status: 200, text: async () => `${full} ${old}` }),
    now: (() => { let tick = 0; return () => (tick += 13 * 60_000); })(), pause: async () => {},
  }));
});
