// Prueba el HTML/JS construido en Chromium contra un servidor local simulado.
// Todas las solicitudes externas se bloquean; no se contacta WordPress ni MailerLite.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { setTimeout } from "node:timers/promises";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

const { wordpress } = suscripcionEpistolas;
const posts = [];
const root = resolve("dist");
const server = createServer(async (request, response) => {
  const path = new URL(request.url, "http://localhost").pathname;
  if (request.method === "POST") {
    let body = "";
    for await (const chunk of request) body += chunk;
    posts.push({ path, body });
    response.writeHead(path === wordpress.endpoint ? 200 : 404, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ success: path === wordpress.endpoint }));
    return;
  }
  if (path === wordpress.contextEndpoint) {
    response.setHeader("Content-Type", "text/plain");
    response.end(`<input value="${wordpress.formId}"><script>var kadence_blocks_form_params = {"nonce":"123456abcd"};</script>`);
    return;
  }
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
      const method = request.url.startsWith(`${origin}/`) ? "Fetch.continueRequest" : "Fetch.failRequest";
      call(method, { requestId, ...(method === "Fetch.failRequest" ? { errorReason: "BlockedByClient" } : {}) }).catch(() => {});
    }
  });
  const evaluate = async (expression) => (await call("Runtime.evaluate", { expression, returnByValue: true })).result.value;
  await call("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  await call("Page.navigate", { url: `${origin}/epistolas/` });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    ready = await evaluate(`Boolean(document.querySelector('form[data-newsletter-wordpress] button[type="submit"]:not(:disabled)'))`);
    if (ready) break;
    await setTimeout(100);
  }
  assert.ok(ready, "El formulario debe habilitarse al cargar su JS");
  // El campo Kadence action debe seguir existiendo: reproduce la colisión del DOM.
  assert.equal(await evaluate(`document.querySelector('form[data-newsletter-wordpress]').action instanceof HTMLInputElement`), true);
  await evaluate(`(()=>{const form=document.querySelector('form[data-newsletter-wordpress]');form.querySelector('input[type="email"]').value='navegador@example.invalid';form.querySelector('input[type="checkbox"]').checked=true;form.requestSubmit();})()`);
  let hidden = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    hidden = await evaluate(`document.querySelector('form[data-newsletter-wordpress]').hidden`);
    if (hidden || posts.length) break;
    await setTimeout(100);
  }
  await setTimeout(100);
  hidden = await evaluate(`document.querySelector('form[data-newsletter-wordpress]').hidden`);
  assert.equal(posts.length, 1, "El formulario debe enviar una sola solicitud");
  assert.equal(posts[0].path, wordpress.endpoint, "El campo action no debe cambiar la URL del envío");
  const fields = new URLSearchParams(posts[0].body);
  assert.equal(fields.get("kb_field_0"), "navegador@example.invalid");
  assert.equal(fields.get("_kb_form_verify"), "123456abcd");
  assert.equal(fields.get("action"), "kb_process_ajax_submit");
  assert.equal(hidden, true, "El cliente debe mostrar confirmación tras la respuesta simulada");
  console.log("Chromium: formulario construido, campo action, URL de envío y confirmación correctos. Solo servidor simulado, sin altas.");
} finally {
  ws?.close();
  browser.kill();
  await closed;
  await new Promise((done) => server.close(done));
  await rm(profile, { recursive: true, force: true });
}
