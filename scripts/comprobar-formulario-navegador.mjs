// Prueba el formulario con el JavaScript público de MailerLite.
// Solo permite descargar tres scripts estáticos; intercepta todos los envíos, también JSONP.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { setTimeout } from "node:timers/promises";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

const { formId, code, redirectUrl } = suscripcionEpistolas;
const posts = [];
const root = resolve("dist");
const server = createServer(async (request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  try {
    const file = resolve(root, `.${decodeURIComponent(path)}`, ...(path.endsWith("/") ? ["index.html"] : []));
    assert.ok(file.startsWith(`${root}/`));
    const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
    response.setHeader("Content-Type", types[extname(file)] ?? "application/octet-stream");
    response.end(await readFile(file));
  } catch {
    response.writeHead(404).end();
  }
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const origin = `http://127.0.0.1:${server.address().port}`;
await mkdir(".astro", { recursive: true });
const profile = await mkdtemp(resolve(".astro/chrome-form-"));
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
  assert.ok(port, "Chromium no arrancó; definir CHROME_PATH si es necesario");
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
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) request.reject(message.error); else request.resolve(message.result);
    }
    if (message.method === "Fetch.requestPaused") {
      const { requestId, request } = message.params;
      const url = new URL(request.url);
      const scripts = [
        "https://static.mailerlite.com/js/w/webforms.min.js?vd4de52e171e8eb9c47c0c20caf367ddf",
        "https://assets.mlcdn.com/ml/ajax/libs/jquery/1.8.3/jquery.min.js",
        "https://static.mailerlite.com/js/w/ml_jQuery.inputmask.bundle.min.js?v3.3.1",
      ];
      if (url.origin === "https://static.mailerlite.com" && url.pathname === `/webforms/submit/${code}`) {
        posts.push({ url: request.url, body: request.postData, method: request.method });
        const callback = url.searchParams.get("callback");
        const body = callback ? `${callback}({"success":true});` : '{"success":true}';
        call("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: callback ? "text/javascript" : "application/json" }], body: Buffer.from(body).toString("base64") }).catch(() => {});
      } else if (request.url === redirectUrl) {
        call("Fetch.fulfillRequest", { requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "text/html" }], body: Buffer.from('<h1 id="gracias-simuladas">Gracias</h1>').toString("base64") }).catch(() => {});
      } else if (request.method === "GET" && (request.url.startsWith(`${origin}/`) || scripts.includes(request.url))) {
        call("Fetch.continueRequest", { requestId }).catch(() => {});
      } else {
        call("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" }).catch(() => {});
      }
    }
  });
  const evaluate = async (expression) => (await call("Runtime.evaluate", { expression, returnByValue: true })).result.value;
  await call("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  await call("Page.navigate", { url: `${origin}/epistolas/` });
  let ready = false;
  for (let attempt = 0; attempt < 200; attempt++) {
    ready = await evaluate(`Boolean(window.ml_jQuery && window.ml_jQuery._data(document.querySelector('#mlb2-${formId} form'), 'events')?.submit)`);
    if (ready) break;
    await setTimeout(100);
  }
  assert.ok(ready, "MailerLite debe cargar y registrar su controlador de envío");
  // Correo inválido y consentimiento ausente deben impedir cualquier envío.
  await evaluate(`(()=>{const form=document.querySelector('#mlb2-${formId} form');form.querySelector('input[type="email"]').value='incorrecto';form.requestSubmit();})()`);
  await setTimeout(100);
  assert.equal(posts.length, 0);
  await evaluate(`(()=>{const form=document.querySelector('#mlb2-${formId} form');form.querySelector('input[type="email"]').value='navegador@example.invalid';form.requestSubmit();})()`);
  await setTimeout(100);
  assert.equal(posts.length, 0, "El consentimiento debe impedir el envío");
  await evaluate(`(()=>{const form=document.querySelector('#mlb2-${formId} form');form.querySelector('input[type="checkbox"]').checked=true;form.requestSubmit();})()`);
  let redirected = false;
  for (let attempt = 0; attempt < 100; attempt++) {
    redirected = await evaluate(`Boolean(document.getElementById('gracias-simuladas'))`);
    if (redirected) break;
    await setTimeout(100);
  }
  assert.equal(posts.length, 1, "Debe haber un solo envío simulado");
  const submission = new URL(posts[0].url);
  assert.equal(submission.pathname, `/webforms/submit/${code}`);
  const fields = posts[0].method === "GET" ? submission.searchParams : new URLSearchParams(posts[0].body);
  assert.equal(fields.get("fields[email]"), "navegador@example.invalid");
  assert.equal(fields.get("ml-submit"), "1");
  assert.equal(fields.get("anticsrf"), "true");
  assert.ok(redirected, "El callback del formulario nuevo debe dirigir a gracias");
  console.log("Chromium: validación, formulario nuevo, envío JSONP interceptado y redirección correctos. Sin altas ni correos.");
} finally {
  ws?.close();
  browser.kill();
  await closed;
  await new Promise((done) => server.close(done));
  // Chrome puede terminar de vaciar archivos del perfil después de salir el proceso principal.
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
