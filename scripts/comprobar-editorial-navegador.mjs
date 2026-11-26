import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir, mkdtemp, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { once } from 'node:events';
import { randomBytes } from 'node:crypto';
import { setTimeout as sleep } from 'node:timers/promises';
import { Store } from '../editorial/store.mjs';
import { createApp } from '../editorial/server.mjs';

const artifacts = resolve(process.env.EDITORIAL_EVIDENCE_DIR ?? '.astro/editorial-evidence');
await mkdir(artifacts, { recursive: true });
const profile = await mkdtemp(resolve('.astro/editorial-chrome-'));
const port = 18000 + Math.floor(Math.random() * 10000), origin = `http://127.0.0.1:${port}`;
const password = randomBytes(24).toString('hex');
const store = new Store(':memory:');
store.addUser('editora@example.test', 'Toñi · prueba local', password);
const server = createApp({ store, origin, publishingEnabled: true, secure: false, staticDir: resolve('dist') });
server.listen(port, '127.0.0.1'); await once(server, 'listening');
const ciArgs = process.env.GITHUB_ACTIONS === 'true' ? ['--no-sandbox'] : [];
const browser = spawn(process.env.CHROME_PATH ?? '/usr/bin/google-chrome', ['--headless', ...ciArgs, '--disable-dev-shm-usage', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
const browserClosed = new Promise(done => { browser.once('exit', done); browser.once('error', done); });
let closeBrowser = async () => { browser.kill(); };
let ws; const errors = [], external = [];
try {
  let debugPort;
  for (let i = 0; i < 100; i++) { try { debugPort = (await readFile(`${profile}/DevToolsActivePort`, 'utf8')).split('\n')[0]; break; } catch { await sleep(100); } }
  assert.ok(debugPort, 'No arrancó Chromium. Revisar CHROME_PATH.');
  const target = await (await fetch(`http://127.0.0.1:${debugPort}/json/new?about:blank`, { method: 'PUT' })).json();
  ws = new WebSocket(target.webSocketDebuggerUrl); await once(ws, 'open');
  let next = 0; const pending = new Map();
  const call = (method, params = {}) => new Promise((resolve, reject) => { const id = ++next; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  closeBrowser = async () => {
    // Cierre cooperativo: Chromium tiene hijos que todavía escriben el perfil al salir el padre.
    await Promise.race([call('Browser.close').catch(() => {}), sleep(2000)]);
    if (browser.exitCode === null && browser.signalCode === null) browser.kill();
  };
  ws.addEventListener('message', event => {
    const m = JSON.parse(event.data);
    if (m.id) { const p = pending.get(m.id); pending.delete(m.id); if (m.error) p.reject(m.error); else p.resolve(m.result); }
    if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.text);
    if (m.method === 'Fetch.requestPaused') {
      const { requestId, request } = m.params;
      if (request.url.startsWith(`${origin}/`)) call('Fetch.continueRequest', { requestId }).catch(() => {});
      else { external.push(request.url); call('Fetch.failRequest', { requestId, errorReason: 'BlockedByClient' }).catch(() => {}); }
    }
    if (m.method === 'Page.javascriptDialogOpening') call('Page.handleJavaScriptDialog', { accept: true }).catch(() => {});
  });
  const js = async expression => { const r = await call('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description ?? 'Error en navegador'); return r.result.value; };
  const wait = async expression => { for (let i = 0; i < 100; i++) { if (await js(expression)) return; await sleep(100); } throw new Error(`No se cumplió: ${expression}; mensaje: ${await js("document.getElementById(\"message\")?.textContent")}`); };
  const fill = (selector, value) => js(`{ const e = document.querySelector(${JSON.stringify(selector)}); e.value = ${JSON.stringify(value)}; e.dispatchEvent(new Event('input',{bubbles:true})); }`);
  const click = selector => js(`document.querySelector(${JSON.stringify(selector)}).click()`);
  const screenshot = async name => { const { data } = await call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true }); await writeFile(resolve(artifacts, name), Buffer.from(data, 'base64')); };
  await call('Page.enable'); await call('Runtime.enable'); await call('Fetch.enable', { patterns: [{ urlPattern: '*' }] });
  await call('Emulation.setDeviceMetricsOverride', { width: 1365, height: 1000, deviceScaleFactor: 1, mobile: false });
  await call('Page.navigate', { url: `${origin}/admin/` }); await wait(`!document.getElementById('login-view')?.hidden`);
  await screenshot('login.png');
  await fill('[name=email]', 'editora@example.test'); await fill('[name=password]', password);
  await js(`document.getElementById('login-form').requestSubmit()`); await wait(`!document.getElementById('dashboard').hidden`);
  assert.equal(await js(`document.querySelectorAll('[data-create]').length`), 2);
  await screenshot('panel.png'); await click('[data-create=epistola]');
  await fill('#entry-number', '25'); await fill('#entry-title', 'El valor de hacer una pausa');
  await fill('#entry-description', 'Un texto de prueba para revisar la experiencia de edición, sin publicarlo.');
  const paste = '<h1 style="font-size:90px;color:red">Una pausa a tiempo</h1><p>A veces necesitamos <strong>detenernos</strong> para ver con claridad. Este es un texto de prueba para revisar el editor.</p><h4>Volver a lo importante</h4><p>Podemos empezar por una pregunta sencilla: ¿qué merece hoy nuestra atención?</p><ul><li>Escuchar con calma.</li><li>Dejar espacio para pensar.</li></ul><p><a href="https://example.test">Un enlace de prueba</a></p>';
  await js(`{ const dt = new DataTransfer(); dt.setData('text/html', ${JSON.stringify(paste)}); dt.setData('text/plain','Texto de prueba'); const el=document.querySelector('.tiptap'); el.focus(); el.dispatchEvent(new ClipboardEvent('paste',{clipboardData:dt,bubbles:true,cancelable:true})); }`);
  await wait(`document.querySelector('.tiptap h2')?.textContent === 'Una pausa a tiempo'`);
  assert.equal(await js(`document.querySelector('.tiptap h1') === null && document.querySelector('.tiptap [style]') === null`), true);
  await click('#save-button'); await wait(`document.getElementById('save-state').textContent === 'Guardado'`);
  assert.equal(store.list().length, 1); assert.match(store.list()[0].html, /<h2>Una pausa a tiempo/);
  await screenshot('editor-escritorio.png');
  await click('#preview-button'); await wait(`document.getElementById('preview-frame').contentDocument?.querySelector('#preview-epistola [data-preview-title]')?.textContent === 'El valor de hacer una pausa'`);
  assert.equal(await js(`document.getElementById('preview-frame').contentDocument.querySelector('#preview-epistola [data-preview-body] h2').textContent`), 'Una pausa a tiempo');
  await screenshot('vista-previa.png'); await click('#close-preview');
  await call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  assert.equal(await js(`document.documentElement.scrollWidth <= innerWidth`), true, 'El editor no debe desbordar en móvil');
  await screenshot('editor-movil.png');
  await fill('#schedule-date', '2030-01-01T08:00'); await click('#schedule-button');
  await wait(`document.getElementById('entry-status').textContent === 'Programada'`);
  assert.equal(store.list()[0].publishAt, '2030-01-01T07:00:00.000Z');
  await call('Page.reload'); await wait(`!document.getElementById('dashboard')?.hidden`);
  await click('.entry-row'); await wait(`!document.getElementById('cancel-button').hidden`); await click('#cancel-button');
  await wait(`document.getElementById('entry-status').textContent === 'Borrador'`);
  await click('#back'); await wait(`!document.getElementById('dashboard').hidden`); await click('[data-create=podcast]');
  await fill('#entry-number', '68'); await fill('#entry-title', 'Una conversación para vivir mejor');
  await fill('#entry-description', 'Descripción de prueba del nuevo episodio del podcast.');
  await fill('#entry-player', 'https://player.simplecast.com/AbcDef12');
  await js(`{ const el=document.querySelector('.tiptap'); el.focus(); }`); await call('Input.insertText', { text: 'Contenido de prueba del episodio, preparado para comprobar el formulario.' });
  await click('#save-button'); await wait(`document.getElementById('save-state').textContent === 'Guardado'`);
  assert.equal(store.list()[0].simplecastId, 'AbcDef12');
  await click('#logout'); await wait(`!document.getElementById('login-view').hidden`);
  const response = await fetch(`${origin}/admin/api/entries`); assert.equal(response.status, 401);
  assert.deepEqual(errors, []); assert.deepEqual(external, [], 'El panel no debe enviar contenido ni analítica a terceros');
  await writeFile(resolve(artifacts, 'resultado.json'), JSON.stringify({ login: true, templates: true, paste: true, desktop: true, mobile: true, scheduling: true, cancellation: true, sessionRecovery: true, podcast: true, externalRequests: external.length, published: false }, null, 2));
  console.log('Panel editorial comprobado: login, pegado, plantillas, móvil, guardado, programación, cancelación y podcast. Cero publicaciones y cero conexiones externas.');
} finally {
  await closeBrowser(); ws?.close(); await browserClosed;
  await new Promise(done => server.close(done)); store.close();
  await rm(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
}
