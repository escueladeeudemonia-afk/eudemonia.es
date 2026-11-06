// Prueba la factura CTV con toda escritura interceptada; nunca envía correos.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve, extname } from "node:path";
import { setTimeout } from "node:timers/promises";
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
const origin = process.env.CTV_TEST_ORIGIN ?? `http://127.0.0.1:${server.address().port}`;
await mkdir(".astro", { recursive: true });
const profile = await mkdtemp(resolve(".astro/chrome-factura-"));
const ciChromeArgs = process.env.GITHUB_ACTIONS === "true" ? ["--no-sandbox"] : [];
const browser = spawn(process.env.CHROME_PATH ?? "/usr/bin/google-chrome", ["--headless", ...ciChromeArgs, "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: "ignore" });
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
    const timer = globalThis.setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP sin respuesta: ${method}`)); }, 20000);
    pending.set(requestId, { resolve: (v) => { clearTimeout(timer); resolve(v); }, reject: (e) => { clearTimeout(timer); reject(e); } });
    ws.send(JSON.stringify({ id: requestId, method, params }));
  });
  const configUrl = "https://escueladeeudemonia.com/wp-json/ede/v1/factura-ctv";
  const submitUrl = "https://escueladeeudemonia.com/wp-admin/admin-ajax.php";
  let loaded = false;
  let mode = "success";
  let posts = 0;
  const interceptionErrors = [];
  ws.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.method === "Page.loadEventFired") loaded = true;
    if (process.env.CTV_DEBUG && message.method === "Fetch.requestPaused") console.log("fetch", message.params.request.method, message.params.request.url);
    if (message.method === "Page.javascriptDialogOpening") call("Page.handleJavaScriptDialog", { accept: false });
    if (message.id) {
      const request = pending.get(message.id);
      pending.delete(message.id);
      if (!request) return;
      if (message.error) request.reject(message.error); else request.resolve(message.result);
    }
    if (message.method !== "Fetch.requestPaused") return;
    const intercept = async () => {
      const { requestId, request } = message.params;
      const fulfill = (data, code = 200) => call("Fetch.fulfillRequest", { requestId, responseCode: code,
        responseHeaders: [{ name: "Content-Type", value: "application/json" }, { name: "Access-Control-Allow-Origin", value: origin }],
        body: Buffer.from(JSON.stringify(data)).toString("base64") });
      if (request.url === configUrl) {
        assert.equal(request.method, "GET");
        assert.ok(!Object.keys(request.headers).some((key) => key.toLowerCase() === "cookie"));
        return fulfill({ nonce: "prueba-interceptada" }, mode === "config-error" ? 503 : 200);
      }
      if (request.url === submitUrl) {
        assert.equal(request.method, "POST");
        assert.ok(!Object.keys(request.headers).some((key) => key.toLowerCase() === "cookie"));
        const data = request.postData ?? (await call("Network.getRequestPostData", { requestId: message.params.networkId })).postData;
        assert.match(data, /name="action"\r?\n\r?\nkb_process_ajax_submit/);
        assert.match(data, /name="_kb_form_post_id"\r?\n\r?\n3431/);
        assert.match(data, /3431_3db68d-cd/);
        assert.match(data, /prueba-interceptada/);
        assert.match(data, /factura@example.invalid/);
        posts++;
        if (mode === "network-error") return call("Fetch.failRequest", { requestId, errorReason: "Failed" });
        return fulfill({ success: mode === "success" });
      }
      if (request.method === "GET" && request.url.startsWith(`${origin}/`)) return call("Fetch.continueRequest", { requestId });
      return call("Fetch.failRequest", { requestId, errorReason: "BlockedByClient" });
    };
    intercept().catch((error) => { interceptionErrors.push(error); call("Fetch.failRequest", { requestId: message.params.requestId, errorReason: "BlockedByClient" }).catch(() => {}); });
  });
  const evaluate = async (expression) => {
    if (process.env.CTV_DEBUG) console.log("evaluate", expression);
    const result = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const until = async (expression) => {
    for (let i = 0; i < 150; i++) { if (await evaluate(expression)) return; await setTimeout(100); }
    throw new Error(`Tiempo agotado: ${expression}`);
  };
  const navigate = async () => {
    loaded = false;
    await call("Page.navigate", { url: `${origin}/creatuvida/gracias-ctv/` });
    for (let i = 0; !loaded && i < 200; i++) await setTimeout(100);
    assert.ok(loaded, "La página no terminó de cargar");
  };
  await call("Page.enable");
  await call("Network.enable");
  await call("Network.setCacheDisabled", { cacheDisabled: true });
  await call("Fetch.enable", { patterns: [{ urlPattern: "*", requestStage: "Request" }] });
  for (const width of [1365, 390, 320]) {
    await call("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: width < 600 });
    for (mode of ["config-error", "server-error", "network-error", "success"]) {
      await navigate();
      await until(`Boolean(document.querySelector('#factura-ctv button:not(:disabled)'))`);
      assert.equal(await evaluate(`document.querySelector('meta[name="robots"]').content`), "noindex,nofollow");
      assert.equal(await evaluate(`document.querySelector('link[rel="canonical"]').href`), "https://eudemonia.es/creatuvida/gracias-ctv/");
      assert.equal(await evaluate(`document.documentElement.scrollWidth <= innerWidth`), true);
      const before = posts;
      assert.equal(await evaluate(`document.querySelector('#factura-ctv').checkValidity()`), false);
      await setTimeout(100);
      assert.equal(posts, before, "Los campos vacíos impiden el envío");
      await evaluate(`(() => { const f = document.querySelector('#factura-ctv'); for (let i=0; i<8; i++) f.elements.namedItem('kb_field_'+i).value = i === 7 ? 'factura@example.invalid' : 'Prueba ficticia'; f.requestSubmit(); f.requestSubmit(); })()`);
      await until(`!document.querySelector('#factura-status').textContent.startsWith('Enviando')`);
      assert.equal(posts - before, mode === "config-error" ? 0 : 1, "Evitar duplicados y envíos si falla el nonce");
      const message = await evaluate(`document.querySelector('#factura-status').textContent`);
      assert.match(message, mode === "success" ? /ya está la factura solicitada/ : /No hemos podido confirmar/);
      assert.equal(await evaluate(`document.querySelector('#factura-ctv fieldset').disabled`), mode === "success");
      if (mode === "success" && process.env.CTV_SCREENSHOTS) {
        await navigate();
        await until(`Boolean(document.querySelector('#factura-ctv button:not(:disabled)'))`);
        await evaluate(`document.fonts.ready`);
        await evaluate(`Array.from(document.querySelectorAll('button')).find(b => b.textContent.trim() === 'Rechazar')?.click()`);
        const shot = await call("Page.captureScreenshot", { format: "png", captureBeyondViewport: true });
        await writeFile(`${process.env.CTV_SCREENSHOTS}/gracias-${width}.png`, Buffer.from(shot.data, "base64"));
      }
      console.log(`Factura ${width}px ${mode}: OK; POST interceptado.`);
    }
  }
  assert.deepEqual(interceptionErrors, []);
  console.log("12 escenarios de factura aprobados, sin envíos ni Analytics reales.");
} finally {
  ws?.close();
  browser.kill();
  await closed;
  server.closeAllConnections();
  await new Promise((done) => server.close(done));
  // Chrome puede terminar de vaciar archivos del perfil después de salir el proceso principal.
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
}
