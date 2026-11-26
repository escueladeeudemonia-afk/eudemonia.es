import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { Store } from './store.mjs';
import { fail, normalizeEntry, madridInstant, publicPath } from './content.mjs';
import { Publisher, githubApi, createWorker } from './publisher.mjs';

const cookieName = 'eudemonia_editorial';
const cookies = req => Object.fromEntries((req.headers.cookie ?? '').split(';').map(v => v.trim().split('=')));
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp' };
async function body(req) {
  fail(req.headers['content-type']?.split(';')[0] === 'application/json', 'Formato de solicitud no válido.', 415);
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; fail(size <= 300000, 'El contenido es demasiado grande.', 413); chunks.push(chunk); }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')); } catch { fail(false, 'Solicitud no válida.'); }
}
const present = e => ({ ...e, url: `https://eudemonia.es${publicPath(e)}`, job: e.job ? { pr: e.job.pr } : null });

export function createApp({ store, origin, publishingEnabled = false, staticDir = null, secure = true }) {
  const originUrl = new URL(origin);
  fail(secure || ['localhost', '127.0.0.1'].includes(originUrl.hostname), 'HTTP solo se permite para pruebas locales.');
  const cookie = (token, maxAge = 43200) => `${cookieName}=${token}; Path=/admin/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
  const server = createServer(async (req, res) => {
    res.setHeader('Cache-Control', 'no-store'); res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow'); res.setHeader('Referrer-Policy', 'same-origin');
    res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-src 'self' https://player.simplecast.com; frame-ancestors 'self'; form-action 'self'; base-uri 'none'");
    const json = (value, code = 200) => { res.statusCode = code; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.end(JSON.stringify(value)); };
    try {
      const url = new URL(req.url, origin), path = url.pathname;
      if (path === '/healthz' && req.method === 'GET') return json({ ok: true });
      if (!path.startsWith('/admin/api/')) {
        if (staticDir && req.method === 'GET') {
          const file = resolve(staticDir, `.${decodeURIComponent(path)}`);
          fail(file.startsWith(resolve(staticDir) + '/'), 'Ruta no válida.', 404);
          try {
            const target = (await stat(file)).isDirectory() ? resolve(file, 'index.html') : file;
            const data = await readFile(target);
            res.setHeader('Content-Type', types[extname(target)] ?? 'application/octet-stream'); res.end(data); return;
          } catch { fail(false, 'Página no encontrada.', 404); }
        }
        fail(false, 'Página no encontrada.', 404);
      }
      const write = req.method !== 'GET';
      if (write) fail(req.headers.origin === originUrl.origin, 'Origen de solicitud no permitido.', 403);
      if (path === '/admin/api/login' && req.method === 'POST') {
        const input = await body(req);
        const session = store.login(input.email, input.password, req.socket.remoteAddress ?? 'unknown');
        res.setHeader('Set-Cookie', cookie(session.token));
        return json({ user: session.user, csrf: session.csrf, publishingEnabled });
      }
      const token = cookies(req)[cookieName];
      const session = store.session(token);
      fail(session, 'Vuelve a iniciar sesión para continuar.', 401);
      if (write) fail(req.headers['x-csrf-token'] === session.csrf, 'La sesión ha cambiado. Vuelve a abrir el panel.', 403);
      if (path === '/admin/api/session' && req.method === 'GET') return json({ user: { email: session.email, name: session.name }, csrf: session.csrf, publishingEnabled });
      if (path === '/admin/api/logout' && req.method === 'POST') { store.logout(token); res.setHeader('Set-Cookie', cookie('', 0)); return json({ ok: true }); }
      if (path === '/admin/api/entries' && req.method === 'GET') return json({ entries: store.list().map(present) });
      if (path === '/admin/api/preview' && req.method === 'POST') {
        const input = await body(req);
        return json({ entry: { ...normalizeEntry(input), ...(input.localDate && { publishAt: madridInstant(input.localDate) }) } });
      }
      if (path === '/admin/api/entries' && req.method === 'POST') return json({ entry: present(store.save(await body(req), session.email)) }, 201);
      const match = path.match(/^\/admin\/api\/entries\/([a-f0-9-]{36})(?:\/(schedule|cancel|retry))?$/);
      fail(match, 'Ruta no encontrada.', 404);
      const [, id, action] = match;
      if (!action && req.method === 'GET') { const entry = store.get(id); fail(entry, 'Publicación no encontrada.', 404); return json({ entry: present(entry) }); }
      if (!action && req.method === 'PUT') return json({ entry: present(store.save(await body(req), session.email, id)) });
      fail(req.method === 'POST', 'Método no permitido.', 405);
      const input = await body(req);
      if (action === 'cancel') return json({ entry: present(store.cancel(id, input.version, session.email)) });
      fail(publishingEnabled, 'El panel está en preparación. La publicación se habilitará al ponerlo en servicio.', 503);
      if (action === 'schedule') {
        const date = input.now === true ? new Date(store.now()).toISOString() : madridInstant(input.localDate);
        fail(input.now === true || Date.parse(date) > store.now(), 'Elige una fecha futura.');
        return json({ entry: present(store.schedule(id, input.version, date, session.email)) });
      }
      if (action === 'retry') {
        const e = store.get(id);
        fail(e && e.status === 'failed' && e.version === input.version, 'La publicación ha cambiado.', 409);
        // No modificar la fecha editorial ni volver a publicar una versión distinta.
        fail(store.now() - Date.parse(e.publishAt) < 24 * 3600000, 'Esta publicación necesita revisión técnica por superar las 24 horas.', 409);
        const next = store.write({ ...e, status: e.job ? 'publishing' : 'scheduled', error: null, attempts: 0, nextAttemptAt: 0 }, e.version);
        store.audit(session.email, id, 'retry'); return json({ entry: present(next) });
      }
      fail(false, 'Ruta no encontrada.', 404);
    } catch (error) {
      if (!res.headersSent) json({ error: error.status ? error.message : 'No se ha podido completar la operación.' }, error.status ?? 500);
      else res.end();
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;
  return server;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  process.umask(0o077);
  const origin = process.env.EDITORIAL_ORIGIN ?? 'https://eudemonia.es';
  const enabled = process.env.EDITORIAL_PUBLISH_ENABLED === 'true';
  fail(!enabled || !!process.env.EDITORIAL_GITHUB_TOKEN, 'Falta la credencial del publicador.');
  const store = new Store(process.env.EDITORIAL_DB ?? './.editorial/data.sqlite');
  const server = createApp({ store, origin, publishingEnabled: enabled, secure: !origin.startsWith('http:'), staticDir: process.env.EDITORIAL_STATIC_DIR });
  const worker = enabled ? createWorker(store, new Publisher(githubApi(process.env.EDITORIAL_GITHUB_TOKEN))) : async () => {};
  const interval = setInterval(() => worker().catch(() => console.error('No se ha podido ejecutar el programador editorial.')), 15000);
  server.listen(Number(process.env.PORT ?? 4322), process.env.EDITORIAL_HOST ?? '127.0.0.1', () => console.log('Servicio editorial preparado.'));
  process.on('SIGTERM', () => { clearInterval(interval); server.close(); });
}
