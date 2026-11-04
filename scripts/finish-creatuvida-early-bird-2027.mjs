import assert from "node:assert/strict";
import { appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

export const change = Object.freeze({
  repository: "escueladeeudemonia-afk/eudemonia.es",
  pr: 71,
  branch: "fix/creatuvida-tarifa-general-20270118",
  head: "4736e3e2e91f25ba5b4414942c3c07a6989d4d4f",
  files: ["src/data/creatuvida.yaml", "src/pages/index.astro", "src/pages/la-escuela.astro"],
  prepareAt: Date.parse("2027-01-17T22:30:00Z"),
  activateAt: Date.parse("2027-01-17T23:00:00Z"),
  expiresAt: Date.parse("2027-01-20T23:00:00Z"),
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
      commit_title: "fix(creatuvida): activa la tarifa general de enero de 2027",
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

export const catalog = Object.freeze({
  account: "acct_1UJX36DSZpK2mD7f",
  product: "prod_VWwNh7gtKVT05T",
  early: [
    { id: "plink_1UVsV1DSZpK2mD7f1llcpKhZ", price: "price_1UVsV1DSZpK2mD7fiOquwfOt", amount: 41600, url: "https://book.stripe.com/28EbJ15tD6Qd6yy75gdEs07" },
    { id: "plink_1UVsV2DSZpK2mD7fUeGozovu", price: "price_1UVsV2DSZpK2mD7fErtlZkXi", amount: 62400, url: "https://book.stripe.com/4gMeVd3lv1vT1eeahsdEs08" },
  ],
  normal: [
    { id: "plink_1UVsV3DSZpK2mD7fhOHByjAt", price: "price_1UVsV3DSZpK2mD7fVnRQo44O", amount: 52000, url: "https://book.stripe.com/7sYcN57BLb6t4qq4X8dEs09" },
    { id: "plink_1UVsV4DSZpK2mD7f0HD5PX9z", price: "price_1UVsV4DSZpK2mD7fdBAN7Fre", amount: 78000, url: "https://book.stripe.com/aFa14n6xH5M9aOO4X8dEs0a" },
  ],
});

async function stripe(path, body) {
  assert.ok(process.env.STRIPE_EDE_SECRET_KEY, "Falta la clave restringida de la Fundación");
  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_EDE_SECRET_KEY}`,
      "Stripe-Version": "2026-09-30.endive",
      ...(body && { "Content-Type": "application/x-www-form-urlencoded" }),
    },
    ...(body && { body: new URLSearchParams(body) }),
    signal: AbortSignal.timeout(30_000),
  });
  const result = await response.json();
  assert.ok(response.ok, `Stripe ${response.status}: ${result.error?.message ?? "petición fallida"}`);
  return result;
}

async function openSessions(api, link) {
  const sessions = [];
  let cursor;
  do {
    const query = new URLSearchParams({ payment_link: link.id, status: "open", limit: "100", ...(cursor && { starting_after: cursor }) });
    const page = await api(`checkout/sessions?${query}`);
    assert.ok(Array.isArray(page.data), "Respuesta de sesiones inesperada");
    for (const session of page.data) {
      assert.equal(session.payment_link, link.id, "Sesión ajena al enlace anticipado");
      assert.equal(session.livemode, true);
      assert.equal(session.status, "open");
      sessions.push(session.id);
    }
    if (!page.has_more) break;
    assert.ok(page.data.length > 0, "Paginación de sesiones inválida");
    const next = page.data.at(-1).id;
    assert.notEqual(next, cursor, "Paginación de sesiones repetida");
    cursor = next;
  } while (true);
  return sessions;
}

// La retirada de Stripe es independiente del merge: si GitHub falla, no prolongar el descuento.
export async function finishStripe({ api, dryRun = true, now = Date.now, pause = sleep }) {
  if (!dryRun) {
    if (now() >= change.expiresAt) return { status: "expired" };
    assert.ok(now() >= change.prepareAt, "Fuera de la ventana de preparación de Stripe");
    while (now() < change.activateAt) await pause(Math.min(change.activateAt - now(), 60_000));
    assert.ok(now() < change.expiresAt, "La ventana de Stripe ha terminado");
  }
  assert.equal((await api("account")).id, catalog.account, "Cuenta de Stripe incorrecta");
  // Leer y validar todos los destinos antes de modificar cualquiera.
  for (const link of [...catalog.early, ...catalog.normal]) {
    const current = await api(`payment_links/${link.id}`);
    assert.equal(current.id, link.id);
    assert.equal(current.livemode, true);
    assert.equal(current.url, link.url);
    assert.equal(current.metadata.ede_event_id, "ctv-2027-01-29");
    if (catalog.normal.includes(link)) assert.equal(current.active, true, "Tarifa general desactivada");
    const items = await api(`payment_links/${link.id}/line_items?limit=10`);
    assert.equal(items.has_more, false);
    assert.equal(items.data.length, 1);
    const item = items.data[0];
    assert.equal(item.quantity, 1);
    assert.equal(item.amount_total, link.amount);
    assert.equal(item.price.id, link.price);
    assert.equal(item.price.product, catalog.product);
    assert.equal(item.price.currency, "eur");
    assert.equal(item.price.active, true);
  }
  // Esta lectura también comprueba permisos de sesiones durante el ensayo.
  for (const link of catalog.early) await openSessions(api, link);
  if (dryRun) return { status: "dry-run", links: catalog.early.map((link) => link.id) };
  assert.ok(now() >= change.activateAt && now() < change.expiresAt, "Fuera del plazo al modificar Stripe");
  for (const link of catalog.early) {
    const result = await api(`payment_links/${link.id}`, {
      active: "false",
      inactive_message: "La tarifa anticipada terminó el 17 de enero de 2027. Puedes reservar con la tarifa general en https://eudemonia.es/creatuvida/.",
    });
    assert.equal(result.active, false, "Stripe no confirmó la desactivación");
  }
  // Desactivar el enlace no basta para cerrar checkouts que ya estaban abiertos.
  let expiredSessions = 0;
  for (const link of catalog.early) {
    for (const id of await openSessions(api, link)) {
      try {
        const result = await api(`checkout/sessions/${id}/expire`, {});
        assert.equal(result.status, "expired");
        expiredSessions++;
      } catch (error) {
        // Puede haberse pagado o caducado entre la lectura y el POST; nunca tocar pagos completados.
        const current = await api(`checkout/sessions/${id}`);
        assert.equal(current.payment_link, link.id);
        if (!["complete", "expired"].includes(current.status)) throw error;
      }
    }
    assert.equal((await api(`payment_links/${link.id}`)).active, false);
    assert.equal((await openSessions(api, link)).length, 0, "Quedan checkouts anticipados abiertos");
  }
  return { status: "disabled", expiredSessions, links: catalog.early.map((link) => link.id) };
}

export async function verifyWebsite({ fetchPage = fetch, pause = sleep, now = Date.now }) {
  const deadline = now() + 12 * 60_000;
  do {
    try {
      for (const path of ["/creatuvida/", "/", "/la-escuela/"]) {
        const response = await fetchPage(`https://eudemonia.es${path}`, {
          headers: { "Cache-Control": "no-cache" }, signal: AbortSignal.timeout(20_000),
        });
        const html = await response.text();
        assert.equal(response.status, 200);
        for (const value of ["520 €", "780 €", "enero de 2027"]) assert.ok(html.includes(value));
        for (const value of ["416 €", "624 €", "Tarifa anticipada", "tarifa anticipada", "Acceso cerrado", ...catalog.early.map((link) => link.url)]) assert.ok(!html.includes(value));
        if (path === "/creatuvida/") for (const link of catalog.normal) assert.ok(html.includes(link.url));
      }
      return;
    } catch { console.log("Esperando el despliegue de la tarifa general en las tres páginas."); }
    if (now() >= deadline) break;
    await pause(15_000);
  } while (true);
  throw new Error("No se ha confirmado la tarifa general en la web");
}

export async function run({ githubApi = github, stripeApi = stripe, dryRun = true, webOnly = false, now = Date.now, pause = sleep, verify = verifyWebsite } = {}) {
  const results = await Promise.allSettled([
    activate({ api: githubApi, dryRun, now, pause }).then(async (result) => {
      if (!dryRun && result.status !== "expired") await verify({});
      return result;
    }),
    webOnly ? Promise.resolve({ status: "server-managed" }) : finishStripe({ api: stripeApi, dryRun, now, pause }),
  ]);
  const failures = results.filter((r) => r.status === "rejected").map((r) => r.reason.message);
  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    console.log(JSON.stringify({ operation: i === 0 ? "web" : "stripe", ...(result.status === "fulfilled" ? result.value : { status: "failed", error: result.reason.message }) }));
  }
  if (failures.length) throw new Error(failures.join("; "));
  return results.map((result) => result.value);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dryRun = process.env.DRY_RUN !== "false";
  run({ dryRun, webOnly: process.env.WEB_ONLY === "true" }).then((result) => {
    if (process.env.GITHUB_STEP_SUMMARY) appendFileSync(process.env.GITHUB_STEP_SUMMARY,
      `CreaTuVida: ${dryRun ? "ensayo sin cambios" : "ejecución programada"}.\n\n\`\`\`json\n${JSON.stringify(result, null, 2)}\n\`\`\`\n`);
  }).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
