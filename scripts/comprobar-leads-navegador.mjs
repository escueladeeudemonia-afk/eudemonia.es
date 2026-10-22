// Ejecuta el build con los scripts reales de MailerLite y Google.
// Intercepta altas y /g/collect: nunca crea suscriptores ni conversiones de prueba en GA4.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { setTimeout } from "node:timers/promises";

const root = resolve("dist");
const server = createServer(async (request, response) => {
  try {
    const path = new URL(request.url, "http://localhost").pathname;
    const file = resolve(root, `.${decodeURIComponent(path)}`, ...(path.endsWith("/") ? ["index.html"] : []));
    assert.ok(file.startsWith(`${root}/`));
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch { response.writeHead(404).end(); }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(".astro", { recursive: true });
const profile = await mkdtemp(resolve(".astro/chrome-leads-"));
const browser = spawn(process.env.CHROME_PATH ?? "/usr/bin/google-chrome", ["--headless", "--no-sandbox", "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
let launchError;
browser.on("error", (error) => { launchError = error; });
const closed = new Promise((done) => { browser.once("exit", done); browser.once("error", done); });
let ws;
try {
  let port;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (launchError) throw launchError;
    try { port = (await readFile(`${profile}/DevToolsActivePort`, "utf8")).split("\n")[0]; break; } catch { await setTimeout(100); }
  }
  assert.ok(port, "Chromium no arrancó; definir CHROME_PATH");
  const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((done, reject) => { ws.addEventListener("open", done, { once: true }); ws.addEventListener("error", reject, { once: true }); });
  let id = 0;
  const pending = new Map();
  const call = (method, params = {}) => new Promise((resolve, reject) => {
    const requestId = ++id;
    pending.set(requestId, { resolve, reject });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };
  const until = async (predicate, message) => {
    for (let attempt = 0; attempt < 150; attempt++) {
      if (await predicate()) return;
      await setTimeout(100);
    }
    assert.fail(message);
  };
  const scripts = [
    "https://static.mailerlite.com/js/w/webforms.min.js?vd4de52e171e8eb9c47c0c20caf367ddf",
    "https://assets.mlcdn.com/ml/ajax/libs/jquery/1.8.3/jquery.min.js",
    "https://static.mailerlite.com/js/w/ml_jQuery.inputmask.bundle.min.js?v3.3.1",
  ];
  let scenario;
  let success = false;
  const submissions = [];
  const collects = [];
  const redirects = [];
  const interceptionErrors = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(message.error); else request.resolve(message.result);
    }
    if (message.method !== "Fetch.requestPaused") return;
    const handle = async () => {
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      const fulfill = (body, type = "text/javascript") => call("Fetch.fulfillRequest", {
        requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: type }], body: Buffer.from(body).toString("base64"),
      });
      if (url.origin === "https://static.mailerlite.com" && url.pathname.startsWith("/webforms/submit/")) {
        assert.equal(url.pathname, `/webforms/submit/${scenario.code}`);
        const fields = request.method === "GET" ? url.searchParams : new URLSearchParams(request.postData);
        assert.equal(fields.get("fields[email]"), "test+ga4@example.invalid");
        submissions.push({ resource: scenario.resource, success });
        const callback = url.searchParams.get("callback");
        const payload = JSON.stringify({ success });
        // Simular también un callback repetido del proveedor en la misma respuesta.
        const duplicate = success ? `;window.ml_webform_success_${scenario.formId}();` : "";
        return fulfill(callback ? `${callback}(${payload});${duplicate}` : payload, callback ? "text/javascript" : "application/json");
      }
      if (/^(?:[a-z0-9-]+\.)?google-analytics\.com$/.test(url.hostname) && url.pathname === "/g/collect") {
        for (const line of (request.postData || "").split("\n")) {
          const params = new URLSearchParams(url.search);
          new URLSearchParams(line).forEach((value, key) => params.set(key, value));
          collects.push(params);
        }
        return call("Fetch.fulfillRequest", { requestId, responseCode: 204 });
      }
      if (request.url === "https://eudemonia.es/gracias/") {
        redirects.push(Date.now());
        return fulfill('<h1 id="gracias-simuladas">Gracias</h1>', "text/html");
      }
      const googleScript = url.hostname === "www.googletagmanager.com" && ["/gtag/js", "/gtag/destination"].includes(url.pathname);
      if (request.method === "GET" && (url.origin === origin || scripts.includes(request.url) || (googleScript && !scenario.blocked))) {
        return call("Fetch.continueRequest", { requestId });
      }
      return call("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
    };
    handle().catch((error) => {
      // Al navegar, Chromium cancela las intercepciones de la página anterior.
      if (error.code !== -32602 || error.message !== "Invalid InterceptionId.") interceptionErrors.push(error);
    });
  });
  await call("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  await call("Network.enable");
  await call("Network.setCacheDisabled", { cacheDisabled: true });
  const resources = [
    { resource: "libro", formId: "6132167", code: "d4r9a4" },
    { resource: "estoicismo", formId: "6132169", code: "g0r3z2" },
  ];
  for (const resource of resources) {
    for (const mode of ["granted", "denied", "blocked", "missing"]) {
      scenario = { ...resource, blocked: ["blocked", "missing"].includes(mode) };
      success = false;
      const start = collects.length;
      const submitStart = submissions.length;
      const redirectStart = redirects.length;
      await call("Page.navigate", { url: `${origin}/${resource.resource}/?prueba=${mode}` });
      const form = `document.querySelector('#mlb2-${resource.formId} form')`;
      await until(() => evaluate(`Boolean(window.ml_jQuery && window.ml_jQuery._data(${form}, 'events')?.submit && window.gtag)`), "MailerLite y el consentimiento deben estar preparados");
      await evaluate(`document.querySelector('[data-consent="${mode === "granted" ? "granted" : "denied"}"]').click()`);
      if (!scenario.blocked) await until(async () => collects.slice(start).some((params) => params.get("en") === "page_view"), "El tag real de Google debe emitir page_view (interceptado)");
      const events = () => collects.slice(start).filter((params) => params.get("en") === "generate_lead");
      // Email inválido y privacidad ausente no deben intentar el alta.
      await evaluate(`(()=>{const f=${form};f.querySelector('input[type="email"]').value='incorrecto';f.requestSubmit();})()`);
      await evaluate(`(()=>{const f=${form};f.querySelector('input[type="email"]').value='test+ga4@example.invalid';f.requestSubmit();})()`);
      await setTimeout(150);
      assert.equal(submissions.length, submitStart);
      assert.equal(events().length, 0);
      await evaluate(`(()=>{const f=${form};f.querySelector('input[type="checkbox"]').checked=true;f.requestSubmit();})()`);
      await until(async () => submissions.length === submitStart + 1 && await evaluate(`!window.ml_jQuery(${form}).data('loading')`), "Debe finalizar el envío fallido simulado");
      assert.equal(events().length, 0, "Un rechazo de MailerLite no es un lead");
      assert.equal(redirects.length, redirectStart);
      if (mode === "missing") await evaluate("window.gtag = undefined");
      success = true;
      const beforeSuccess = Date.now();
      await evaluate(`${form}.requestSubmit()`);
      await until(() => evaluate("Boolean(document.getElementById('gracias-simuladas'))"), "Debe navegar a gracias aunque la analítica esté bloqueada");
      await setTimeout(250);
      assert.equal(submissions.length, submitStart + 2);
      assert.equal(redirects.length, redirectStart + 1, "El callback duplicado debe navegar una sola vez");
      if (scenario.blocked) {
        assert.equal(events().length, 0);
        if (mode === "blocked") assert.ok(redirects.at(-1) - beforeSuccess >= 1400, "El plazo independiente debe permitir navegar sin cargar Google");
      } else {
        assert.equal(events().length, 1, "Un éxito y callback duplicado deben emitir un solo lead");
        const lead = events()[0];
        assert.equal(lead.get("tid"), "G-6H8PEESGGG");
        assert.equal(lead.get("ep.lead_magnet"), resource.resource);
        assert.equal(lead.get("ep.form_id") ?? lead.get("epn.form_id"), resource.formId);
        assert.ok(!decodeURIComponent(lead.toString()).includes("test+ga4"), "No enviar el email a Analytics");
        console.log(JSON.stringify({ resource: resource.resource, consent: mode, endpoint: "/g/collect", tid: lead.get("tid"), en: lead.get("en"), lead_magnet: lead.get("ep.lead_magnet"), form_id: resource.formId, intercepted: true }));
      }
      // Ni entrar directamente a gracias ni recargarla debe generar conversiones.
      const count = events().length;
      await call("Page.navigate", { url: `${origin}/gracias/` });
      await until(() => evaluate("location.pathname === '/gracias/' && Boolean(document.querySelector('h1'))"), "Debe abrir gracias");
      await call("Page.reload");
      await setTimeout(800);
      assert.equal(events().length, count);
      assert.deepEqual(interceptionErrors, []);
      console.log(`${resource.resource}/${mode}: validación, rechazo, éxito duplicado y gracias comprobados.`);
    }
  }
  console.log("Sin altas, correos ni conversiones enviados a servicios reales. Email de prueba: test+ga4@example.invalid.");
} finally {
  ws?.close();
  browser.kill();
  await closed;
  await new Promise((done) => server.close(done));
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
