// Ejecuta el build con los scripts reales de MailerLite, el widget Tally y Google.
// El iframe Tally se sustituye por un formulario simulado del mismo origen.
// Intercepta altas y /g/collect: nunca crea suscriptores ni conversiones de prueba en GA4.
import assert from "node:assert/strict";
import { formulariosMailerLite, mailerliteFormAction } from "../src/data/suscripcion.mjs";
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
const origin = process.env.LEAD_TEST_ORIGIN === "https://eudemonia.es"
  ? "https://eudemonia.es"
  : `http://127.0.0.1:${server.address().port}`;
console.log(`Origen comprobado: ${origin}. Altas y Analytics interceptados.`);
await mkdir(".astro", { recursive: true });
const profile = await mkdtemp(resolve(".astro/chrome-leads-"));
// Mantener los iframes en el mismo target CDP permite interceptar también sus POST.
const browser = spawn(process.env.CHROME_PATH ?? "/usr/bin/google-chrome", ["--headless", "--disable-dev-shm-usage", "--disable-site-isolation-trials", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
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
    const timeout = globalThis.setTimeout(() => {
      pending.delete(requestId);
      reject(new Error(`CDP sin respuesta: ${method}`));
    }, 20000);
    pending.set(requestId, {
      resolve: (value) => { clearTimeout(timeout); resolve(value); },
      reject: (error) => { clearTimeout(timeout); reject(error); },
    });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  const evaluate = async (expression) => {
    const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
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
    "https://groot.mailerlite.com/js/w/webforms.min.js?v83147fa8ce2d95cb73ece7f28b469519",
    "https://assets.mlcdn.com/ml/ajax/libs/jquery/3.7.1/jquery.min.js",
    "https://static.mailerlite.com/js/w/ml_jQuery.inputmask.bundle.min.js?v3.3.1",
    "https://tally.so/widgets/embed.js",
  ];
  // Nunca cargar el formulario real: las respuestas y su POST son simulados.
  // postMessage sí cruza de https://tally.so al padre con origin/source reales.
  const tallyStub = `<!doctype html><html><body>
    <form><input name="email" type="email" required><button>Enviar</button></form>
    <script>
      const destino = ${JSON.stringify(origin)};
      const enviar = (data) => parent.postMessage(data, destino);
      let formato;
      window.addEventListener('message', (event) => {
        if (event.origin !== destino || event.source !== parent) return;
        if (event.data.action === 'message') enviar(event.data.data);
        if (event.data.action === 'submit') {
          formato = event.data.format;
          document.querySelector('input').value = event.data.email;
          document.querySelector('form').requestSubmit();
        }
      });
      document.querySelector('form').addEventListener('submit', async (event) => {
        event.preventDefault();
        const response = await fetch('/__lead_test_submission__', {
          method: 'POST', body: new URLSearchParams(new FormData(event.target))
        });
        if (!response.ok) { enviar({ event: 'LeadTest.Rejected' }); return; }
        const message = { event: 'Tally.FormSubmitted', payload: {
          formId: 'A7veYN', id: 'submission-privada', respondentId: 'persona-privada',
          formName: 'Eude-Score', fields: [{ answer: { value: 'test+ga4@example.invalid' } }]
        }};
        enviar(formato === 'json' ? JSON.stringify(message) : message);
        enviar(formato === 'json' ? message : JSON.stringify(message));
      });
      enviar({ event: 'LeadTest.Ready' });
    </script></body></html>`;
  let scenario;
  let success = false;
  const submissions = [];
  const collects = [];
  const redirects = [];
  let leadCalls = [];
  const interceptionErrors = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (!request) return;
      if (message.error) request.reject(message.error); else request.resolve(message.result);
    }
    if (message.method === "Runtime.bindingCalled" && message.params.name === "__recordLead") {
      leadCalls.push(JSON.parse(message.params.payload));
    }
    if (message.method !== "Fetch.requestPaused") return;
    const handle = async () => {
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      const fulfill = (body, type = "text/javascript") => call("Fetch.fulfillRequest", {
        requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: type }], body: Buffer.from(body).toString("base64"),
      });
      if (url.origin === "https://tally.so" && url.pathname === "/embed/A7veYN") {
        return fulfill(tallyStub, "text/html");
      }
      if (url.origin === "https://tally.so" && url.pathname === "/__lead_test_submission__") {
        assert.equal(request.method, "POST");
        assert.equal(new URLSearchParams(request.postData).get("email"), "test+ga4@example.invalid");
        submissions.push({ resource: scenario.resource, success });
        return call("Fetch.fulfillRequest", { requestId, responseCode: success ? 200 : 400, body: Buffer.from("{}").toString("base64") });
      }
      if (url.origin === "https://dashboard.mailerlite.com" && url.pathname.startsWith("/jsonp/")) {
        assert.equal(url.origin + url.pathname, mailerliteFormAction(scenario.formId));
        const fields = request.method === "GET" ? url.searchParams : new URLSearchParams(request.postData);
        assert.equal(fields.get("fields[email]"), "test+ga4@example.invalid");
        submissions.push({ resource: scenario.resource, success });
        const callback = url.searchParams.get("callback");
        const payload = JSON.stringify({ success });
        // Simular también un callback repetido del proveedor en la misma respuesta.
        const duplicate = success ? `;window.ml_webform_success_${scenario.grootId}();` : "";
        return fulfill(callback ? `${callback}(${payload});${duplicate}` : payload, callback ? "text/javascript" : "application/json");
      }
      // GA4 utiliza ambos dominios; responder localmente para no enviar eventos reales.
      // https://developers.google.com/tag-platform/security/guides/csp#google_analytics_4_google_analytics
      if (/^(?:[a-z0-9-]+\.)?(?:google-analytics\.com|analytics\.google\.com)$/.test(url.hostname) && url.pathname === "/g/collect") {
        for (const line of (request.postData || "").split("\n")) {
          const params = new URLSearchParams(url.search);
          new URLSearchParams(line).forEach((value, key) => params.set(key, value));
          collects.push(params);
        }
        return call("Fetch.fulfillRequest", { requestId, responseCode: 204 });
      }
      if (request.url === (scenario.resource === "test_eudescore" ? `${origin}/gracias-test/` : "https://eudemonia.es/gracias/") && success) {
        redirects.push(Date.now());
        return fulfill('<h1 id="gracias-simuladas">Gracias</h1>', "text/html");
      }
      const googleScript = url.hostname === "www.googletagmanager.com" && ["/gtag/js", "/gtag/destination"].includes(url.pathname);
      // Incluso en producción, permitir solo páginas/recursos estáticos de la web.
      const localStatic = url.origin === origin && (message.params.resourceType === "Document" || /\.(?:js|css|svg|woff2|webp|png|jpg|mp4|ico)$/.test(url.pathname));
      if (request.method === "GET" && (localStatic || scripts.includes(request.url) || (googleScript && !scenario.blocked))) {
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
  await call("Page.enable"); // Necesario para ejecutar el script al crear cada documento.
  await call("Runtime.enable");
  await call("Runtime.addBinding", { name: "__recordLead" });
  await call("Page.addScriptToEvaluateOnNewDocument", { source: `
    localStorage.removeItem('eudemonia:consentimiento');
    window.addEventListener('message', (event) => {
      if (event.origin === 'https://tally.so' && event.source === document.getElementById('eude-score-form')?.contentWindow) {
        if (event.data?.event === 'LeadTest.Ready') window.__tallyReady = true;
        if (event.data?.event === 'LeadTest.Rejected') window.__tallyRejected = true;
      }
    });
  ` });
  const prepareAnalytics = async (mode, start) => {
    await evaluate(`document.querySelector('[data-consent="${mode === "granted" ? "granted" : "denied"}"]').click()`);
    await evaluate(`(() => {
      const original = window.gtag;
      window.__leads = [];
      window.gtag = (...args) => {
        if (args[0] === 'event' && args[1] === 'generate_lead') {
          window.__leads.push(args[2]);
          window.__recordLead(JSON.stringify({ ...args[2], event_callback: typeof args[2].event_callback }));
        }
        original(...args);
      };
    })()`);
    if (!scenario.blocked) await until(async () => collects.slice(start).some((params) => params.get("en") === "page_view"), "El tag real de Google debe emitir page_view (interceptado)");
  };
  const checkLead = async (resource, mode, start) => {
    const leads = collects.slice(start).filter((params) => params.get("en") === "generate_lead");
    const calls = leadCalls;
    assert.equal(calls.length, mode === "missing" ? 0 : 1, "Un único intento por éxito, incluso con Google bloqueado");
    if (mode !== "missing") assert.deepEqual(calls[0], {
      lead_magnet: resource.resource, form_id: resource.formId, event_callback: "function", event_timeout: 1500,
    }, "Solo parámetros públicos y control de navegación");
    assert.equal(leads.length, scenario.blocked ? 0 : 1, "Un solo collect por envío aceptado");
    if (!scenario.blocked) {
      const lead = leads[0];
      assert.equal(lead.get("tid"), "G-6H8PEESGGG");
      assert.equal(lead.get("ep.lead_magnet"), resource.resource);
      assert.equal(lead.get("ep.form_id") ?? lead.get("epn.form_id"), resource.formId);
      assert.equal(lead.get("gcs"), mode === "granted" ? "G111" : "G100", "Consentimiento conservado en el collect");
      console.log(JSON.stringify({ resource: resource.resource, consent: mode, endpoint: "/g/collect", tid: lead.get("tid"), en: lead.get("en"), lead_magnet: resource.resource, form_id: resource.formId, gcs: lead.get("gcs"), intercepted: true }));
    }
    for (const params of collects.slice(start)) assert.ok(!/test\+ga4|submission-privada|persona-privada/.test(decodeURIComponent(params.toString())), "No enviar datos del formulario a Analytics");
    if (mode !== "granted") {
      const { cookies } = await call("Network.getCookies", { urls: [origin] });
      assert.ok(!cookies.some((cookie) => cookie.name.startsWith("_ga")), "Sin cookies GA al rechazar");
    }
  };
  const resources = [
    { resource: "libro", ...formulariosMailerLite.libro },
    { resource: "estoicismo", ...formulariosMailerLite.estoicismo },
    { resource: "epistolas", ...formulariosMailerLite.epistolas },
  ];
  for (const resource of resources) {
    for (const mode of ["granted", "denied", "blocked", "missing"]) {
      scenario = { ...resource, blocked: ["blocked", "missing"].includes(mode) };
      console.log(`Comprobando ${resource.resource}/${mode}…`);
      leadCalls = [];
      success = false;
      const start = collects.length;
      const submitStart = submissions.length;
      const redirectStart = redirects.length;
      await call("Network.clearBrowserCookies");
      await call("Page.navigate", { url: `${origin}/${resource.resource}/?prueba=${mode}` });
      const form = `document.querySelector('#mlb2-${resource.grootId} form')`;
      await until(() => evaluate(`Boolean(window.ml_jQuery && window.ml_jQuery._data(${form}, 'events')?.submit && window.gtag)`), "MailerLite y el consentimiento deben estar preparados");
      await prepareAnalytics(mode, start);
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
      assert.ok(redirects.at(-1) - beforeSuccess < 2500, "La navegación no debe quedar bloqueada");
      if (mode === "blocked") assert.ok(redirects.at(-1) - beforeSuccess >= 1400, "El plazo independiente debe permitir navegar sin cargar Google");
      await checkLead(resource, mode, start);
      // Ni entrar directamente a gracias ni recargarla debe generar conversiones.
      const count = events().length;
      success = false;
      await call("Page.navigate", { url: `${origin}/gracias/` });
      await until(() => evaluate("location.pathname === '/gracias/' && Boolean(document.querySelector('h1'))"), "Debe abrir gracias");
      await call("Page.reload");
      await setTimeout(800);
      assert.equal(events().length, count);
      assert.deepEqual(interceptionErrors, []);
      console.log(`${resource.resource}/${mode}: validación, rechazo, éxito duplicado y gracias comprobados.`);
    }
  }
  const tally = { resource: "test_eudescore", formId: "A7veYN" };
  for (const mode of ["granted", "denied", "blocked", "missing"]) {
    scenario = { ...tally, blocked: ["blocked", "missing"].includes(mode) };
    console.log(`Comprobando test_eudescore/${mode}…`);
    leadCalls = [];
    success = false;
    const start = collects.length;
    const submitStart = submissions.length;
    const redirectStart = redirects.length;
    const events = () => collects.slice(start).filter((params) => params.get("en") === "generate_lead");
    await call("Network.clearBrowserCookies");
    await call("Page.navigate", { url: `${origin}/test/?prueba=${mode}` });
    await until(() => evaluate("Boolean(window.gtag && document.getElementById('eude-score-form'))"), "Debe abrir el test");
    await evaluate("document.getElementById('eude-score-form').scrollIntoView()");
    await until(() => evaluate("window.__tallyReady === true"), "Debe cargar el iframe simulado con origen Tally");
    await prepareAnalytics(mode, start);

    // Origen exacto, ventana esperada, formulario correcto y mensaje de éxito son obligatorios.
    await evaluate(`(() => {
      const source = document.getElementById('eude-score-form').contentWindow;
      const data = { event: 'Tally.FormSubmitted', payload: { formId: 'A7veYN' } };
      for (const origin of [location.origin, 'https://tally.so.evil.invalid', 'https://sub.tally.so', 'http://tally.so', 'null']) {
        window.dispatchEvent(new MessageEvent('message', { origin, source, data }));
      }
      window.dispatchEvent(new MessageEvent('message', { origin: 'https://tally.so', source: window, data }));
    })()`);
    const sendTally = (data) => evaluate(`document.getElementById('eude-score-form').contentWindow.postMessage(${JSON.stringify(data)}, 'https://tally.so')`);
    for (const data of [null, "{json roto", {}, { event: "Tally.FormSubmitted" },
      { event: "Tally.FormSubmitted", payload: { formId: "otro" } },
      ...["Tally.FormLoaded", "Tally.FormPageView", "Tally.FormSubmissionRejected"].map((event) => ({ event, payload: { formId: "A7veYN" } })),
    ]) await sendTally({ action: "message", data });
    await setTimeout(700);
    assert.equal(events().length, 0);
    assert.equal(await evaluate("window.__leads.length"), 0);
    assert.equal(redirects.length, redirectStart);

    await sendTally({ action: "submit", email: "incorrecto" });
    await setTimeout(150);
    assert.equal(submissions.length, submitStart, "Email inválido: sin intento de envío");
    await sendTally({ action: "submit", email: "test+ga4@example.invalid" });
    await until(() => evaluate("window.__tallyRejected === true"), "Debe finalizar el rechazo simulado de Tally");
    assert.equal(events().length, 0);
    assert.equal(await evaluate("window.__leads.length"), 0);
    assert.equal(redirects.length, redirectStart);

    if (mode === "missing") await evaluate("window.gtag = undefined");
    success = true;
    const beforeSuccess = Date.now();
    await sendTally({ action: "submit", email: "test+ga4@example.invalid", format: mode === "granted" ? "json" : "object" });
    await until(() => evaluate("Boolean(document.getElementById('gracias-simuladas'))"), "Tally debe navegar a gracias aunque Google no funcione");
    await setTimeout(250);
    assert.equal(submissions.length, submitStart + 2);
    assert.equal(redirects.length, redirectStart + 1, "Dos postMessage de éxito deben navegar una sola vez");
    assert.ok(redirects.at(-1) - beforeSuccess < 2500, "La redirección debe tener un plazo máximo");
    if (mode === "blocked") assert.ok(redirects.at(-1) - beforeSuccess >= 1400, "Debe esperar el plazo independiente de 1500 ms");
    await checkLead(tally, mode, start);

    // Sin marcadores en URL/storage: visitar o recargar gracias nunca crea un lead.
    const count = events().length;
    success = false;
    await call("Page.navigate", { url: `${origin}/gracias-test/` });
    await until(() => evaluate("location.pathname === '/gracias-test/' && Boolean(document.querySelector('h1'))"), "Debe abrir gracias-test directamente");
    await call("Page.reload");
    await setTimeout(800);
    assert.equal(events().length, count);
    // Recargar la landing tampoco reproduce el éxito anterior.
    await call("Page.navigate", { url: `${origin}/test/` });
    await until(() => evaluate("location.pathname === '/test/' && Boolean(document.getElementById('eude-score-form'))"), "Debe volver al test");
    await call("Page.reload");
    await setTimeout(800);
    assert.equal(events().length, count);
    assert.deepEqual(interceptionErrors, []);
    console.log(`test_eudescore/${mode}: origen, ventana, payload, rechazo, éxito duplicado, gracias y recargas comprobados.`);
  }
  console.log("16 escenarios: tres formularios MailerLite y Tally × cuatro modos de Analytics.");
  console.log("Sin altas, correos ni conversiones enviados a servicios reales. Email de prueba: test+ga4@example.invalid.");
} finally {
  ws?.close();
  browser.kill();
  await closed;
  await new Promise((done) => server.close(done));
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
