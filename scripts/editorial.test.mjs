import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { once } from 'node:events';
import { normalizeHtml, normalizeEntry, madridInstant, publicationFile } from '../editorial/content.mjs';
import { Store } from '../editorial/store.mjs';
import { createApp } from '../editorial/server.mjs';
import { createWorker, Publisher, repository } from '../editorial/publisher.mjs';

const draft = (extra = {}) => ({ type: 'epistola', title: 'Una vida con sentido', number: 25, description: 'Una reflexión sobre una vida con sentido.', html: '<p>Un texto que merece ser compartido y leído con calma.</p>', author: 'Pablo Tovar', ...extra });
const password = 'solo-para-pruebas-locales-123456';

test('normaliza pegado y elimina código, estilos, iframes y enlaces ejecutables', () => {
  const html = normalizeHtml('<h1 style="font-size:90px" onclick="bad()">Título</h1><h5>Otro</h5><p><b>Énfasis</b> y <i>cursiva</i> <a href="https://example.com">enlace</a></p><script>bad()</script><iframe src="https://evil.test"></iframe><a href="jav&#x61;script:alert(1)">mal</a><img src=x onerror=bad()><svg><script>bad()</script></svg>');
  assert.match(html, /<h2>Título<\/h2><h3>Otro<\/h3>/);
  assert.match(html, /<strong>Énfasis<\/strong>/); assert.match(html, /<em>cursiva<\/em>/);
  assert.match(html, /https:\/\/example.com/);
  assert.doesNotMatch(html, /style=|onclick|javascript:|<script|<iframe|<img|<svg|bad\(\)/);
});
test('horario de Madrid: invierno, verano, fechas inválidas y cambios de hora', () => {
  assert.equal(madridInstant('2026-11-29T08:00'), '2026-11-29T07:00:00.000Z');
  assert.equal(madridInstant('2027-07-01T08:00'), '2027-07-01T06:00:00.000Z');
  assert.throws(() => madridInstant('2027-03-28T02:30'), /salto/);
  assert.throws(() => madridInstant('2027-10-31T02:30'), /repite/);
  assert.throws(() => madridInstant('2027-02-30T08:00'), /fecha/);
});
test('genera contenido seguro para las colecciones existentes y fija la URL', () => {
  const e = normalizeEntry(draft());
  const edited = normalizeEntry(draft({ title: 'Un título diferente' }), e);
  assert.equal(edited.slug, e.slug);
  const file = publicationFile({ ...edited, publishAt: '2026-12-01T07:00:00.000Z' });
  assert.equal(file.path, 'src/content/epistolas/25-una-vida-con-sentido.md');
  assert.match(file.markdown, /data-editorial-revision="[a-f0-9]{64}"/);
  assert.throws(() => normalizeEntry(draft({ number: 26 }), e), /número/);
  assert.throws(() => normalizeEntry(draft({ type: 'podcast', simplecastId: 'https://evil.test/player' })), /Simplecast/);
  assert.throws(() => publicationFile({ ...normalizeEntry(draft({ type: 'podcast' })), publishAt: '2026-12-01' }), /Simplecast/);
  assert.equal(normalizeEntry(draft({ title: 'Atención & calma' })).title, 'Atención & calma');
  const raw = publicationFile({ ...normalizeEntry(draft({ html: '<p>Texto\n\n![imagen](https://evil.test/x)\n\n[enlace](javascript:alert(1))</p>' })), publishAt: '2026-12-01' });
  assert.doesNotMatch(raw.markdown.split('<div data-editorial-revision=')[1], /\n\n/);
});
test('borradores y sesiones sobreviven al reinicio; concurrencia y cancelación conservan contenido', () => {
  const directory = mkdtempSync(join(tmpdir(), 'editorial-store-')), path = join(directory, 'data.sqlite');
  let store = new Store(path);
  try {
    store.addUser('editor@example.test', 'Editora', password);
    const session = store.login('editor@example.test', password, 'local');
    const entry = store.save(draft(), 'editor@example.test');
    assert.throws(() => store.save(draft(), 'editor@example.test'), /Ya existe/);
    const edited = store.save({ ...draft(), version: entry.version }, 'editor@example.test', entry.id);
    assert.throws(() => store.save({ ...draft(), version: entry.version }, 'editor@example.test', entry.id), /cambiado/);
    const scheduled = store.schedule(entry.id, edited.version, '2026-12-01T07:00:00Z', 'editor@example.test');
    assert.throws(() => store.save({ ...draft(), version: scheduled.version }, 'editor@example.test', entry.id), /Cancela/);
    store.close(); store = new Store(path);
    assert.equal(store.session(session.token).email, 'editor@example.test');
    assert.equal(store.get(entry.id).status, 'scheduled');
    const cancelled = store.cancel(entry.id, scheduled.version, 'editor@example.test');
    assert.equal(cancelled.html, entry.html); assert.equal(cancelled.status, 'draft');
    store.logout(session.token); assert.equal(store.session(session.token), undefined);
  } finally { store.close(); rmSync(directory, { recursive: true }); }
});
test('caducan las sesiones y cambiar la contraseña revoca el acceso anterior', () => {
  let now = Date.now(); const store = new Store(':memory:', () => now);
  try {
    store.addUser('editor@example.test', 'Editora', password);
    let session = store.login('editor@example.test', password, 'local');
    now += 13 * 3600000; assert.equal(store.session(session.token), undefined);
    session = store.login('editor@example.test', password, 'local');
    store.addUser('editor@example.test', 'Editora', `${password}-nuevo`);
    assert.equal(store.session(session.token), undefined);
    assert.throws(() => store.login('editor@example.test', password, 'local'), /correctos/);
    assert.throws(() => store.addUser('short@example.test', 'Otra', 'corta'), /14/);
  } finally { store.close(); }
});
test('no inicia publicaciones antes de la fecha y recupera una verificación tras reiniciar sin duplicar', async () => {
  let now = Date.parse('2026-11-29T06:59:00Z');
  const store = new Store(':memory:', () => now); let prepared = 0, advanced = 0;
  const publisher = { prepare: async () => { prepared++; return { pr: 1 }; }, advance: async () => ++advanced >= 2 };
  try {
    const e = store.save(draft(), 'editor'); store.schedule(e.id, e.version, '2026-11-29T07:00:00Z', 'editor');
    await createWorker(store, publisher, { now: () => now })(); assert.equal(prepared, 0);
    now += 60000; await createWorker(store, publisher, { now: () => now })(); assert.equal(prepared, 1); assert.equal(store.get(e.id).status, 'publishing');
    now += 31000; await createWorker(store, publisher, { now: () => now })();
    assert.equal(prepared, 1); assert.equal(store.get(e.id).status, 'published');
    await createWorker(store, publisher, { now: () => now })(); assert.equal(advanced, 2);
  } finally { store.close(); }
});
test('un fallo de proveedor persiste, reintenta y los trabajadores se excluyen', async () => {
  let now = Date.parse('2026-11-29T07:00:00Z'); const store = new Store(':memory:', () => now);
  try {
    const e = store.save(draft(), 'editor'); store.schedule(e.id, e.version, new Date(now).toISOString(), 'editor');
    assert.equal(store.acquire('first'), true); assert.equal(store.acquire('second'), false); store.release('first');
    const worker = createWorker(store, { prepare: async () => { throw new Error('upstream secret'); } }, { now: () => now });
    await worker(); assert.equal(store.get(e.id).status, 'publishing'); assert.doesNotMatch(store.get(e.id).error, /secret/);
    now += 25 * 3600000; await worker(); assert.equal(store.get(e.id).status, 'failed');
  } finally { store.close(); }
});
test('el publicador exige CI del SHA revisado, único archivo y contenido exacto', async () => {
  const e = { ...normalizeEntry(draft()), id: 'test', publishAt: '2020-01-01T00:00:00Z' };
  const file = publicationFile(e); e.job = { pr: 1, branch: 'editorial/test', head: 'expected', revision: file.revision };
  let checks = [], fileList = [{ filename: file.path, status: 'added' }], merged = 0, changed = false;
  const api = async (path, method) => {
    if (method === 'PUT') { merged++; return { merged: true }; }
    if (path.endsWith('/files?per_page=100')) return fileList;
    if (path.includes('/contents/')) return { content: Buffer.from(changed ? 'changed' : file.markdown).toString('base64') };
    if (path.includes('/check-runs')) return { check_runs: checks };
    return { base: { ref: 'main', repo: { full_name: repository } }, head: { ref: e.job.branch, sha: e.job.head, repo: { full_name: repository } }, draft: false, state: 'open', mergeable: true, mergeable_state: 'clean' };
  };
  const p = new Publisher(api);
  assert.equal(await p.advance(e), false); assert.equal(merged, 0);
  checks = [{ id: 1, name: 'validar', head_sha: 'expected', app: { slug: 'github-actions' }, status: 'completed', conclusion: 'failure' }];
  await assert.rejects(p.advance(e), /fallado/); assert.equal(merged, 0);
  checks[0].conclusion = 'success'; fileList.push({ filename: 'nginx.conf', status: 'modified' });
  await assert.rejects(p.advance(e), /ajenos/); fileList.pop(); changed = true;
  await assert.rejects(p.advance(e), /texto/); changed = false;
  await p.advance(e); assert.equal(merged, 1);
});
test('preparación idempotente: recupera una respuesta perdida sin duplicar archivo, rama o PR', async () => {
  const e = { ...normalizeEntry(draft()), id: 'same-id', publishAt: '2020-01-01T00:00:00Z' };
  let ref = null, content = null, pr = null, branches = 0, writes = 0, prs = 0, loseResponse = true;
  const api = async (path, method = 'GET', body) => {
    if (path === '/git/ref/heads/main') return { object: { sha: 'base' } };
    if (path.startsWith('/git/ref/heads/editorial/')) return ref;
    if (path === '/git/refs') { branches++; ref = { object: { sha: 'base' } }; return ref; }
    if (path.includes('/contents/') && path.includes('?ref=base')) return [];
    if (path === '/pulls?state=open&per_page=100') return [];
    if (path.startsWith('/contents/') && method === 'PUT') { writes++; content = { content: body.content }; return {}; }
    if (path.startsWith('/contents/')) return content;
    if (path.startsWith('/pulls?state=all')) return pr ? [pr] : [];
    if (path === '/pulls' && method === 'POST') { prs++; pr = { number: 10, head: { sha: 'content-sha' } }; if (loseResponse) { loseResponse = false; throw new Error('Respuesta perdida'); } return pr; }
    throw new Error(`Petición inesperada ${path}`);
  };
  const p = new Publisher(api);
  await assert.rejects(p.prepare(e), /perdida/);
  assert.deepEqual(await p.prepare(e), { branch: 'editorial/same-id', pr: 10, head: 'content-sha', revision: publicationFile(e).revision });
  assert.equal(branches, 1); assert.equal(writes, 1); assert.equal(prs, 1);
});
test('un número reservado en otra PR impide crear una publicación competidora', async () => {
  const e = { ...normalizeEntry(draft()), id: 'same-id', publishAt: '2020-01-01T00:00:00Z' };
  const api = async (path, method = 'GET') => {
    assert.equal(method, 'GET');
    if (path === '/git/ref/heads/main') return { object: { sha: 'base' } };
    if (path.startsWith('/git/ref/heads/editorial/')) return null;
    if (path.startsWith('/contents/')) return [];
    if (path.startsWith('/pulls?')) return [{ number: 97, head: { ref: 'feat/otra' } }];
    if (path.startsWith('/pulls/97/files')) return [{ filename: 'src/content/epistolas/25-titulo-anterior.md' }];
  };
  await assert.rejects(new Publisher(api).prepare(e), /ya tiene una publicación/);
});
test('publicada exige la revisión exacta, el índice y el criterio de indexación', async () => {
  const e = { ...normalizeEntry(draft()), job: { revision: 'version-real' }, publishAt: '2026-12-01T07:00:00.000Z' };
  let html = '<div data-editorial-revision="version-antigua"></div>';
  const p = new Publisher(null, 'https://example.test', async url => new Response(String(url).endsWith('sitemap-0.xml') ? '<urlset></urlset>' : String(url).endsWith('/epistolas/') ? e.slug : html));
  assert.equal(await p.verify(e), false);
  html = `<h1>${e.title}</h1><link rel="canonical" href="https://example.test/epistolas/${e.slug}/"><time datetime="${e.publishAt}"></time><div data-editorial-revision="version-real"></div>`; assert.equal(await p.verify(e), false);
  html += '<meta name="robots" content="noindex,nofollow">'; assert.equal(await p.verify(e), true);
});
test('API: login, cookies, CSRF, borrador, vista previa, programación y cierre de sesión', async () => {
  const store = new Store(':memory:'); store.addUser('editor@example.test', 'Editora', password);
  const server = createApp({ store, origin: 'http://127.0.0.1:4322', secure: false, publishingEnabled: true });
  server.listen(0, '127.0.0.1'); await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}/admin/api/`;
  let cookie = '', csrf = '';
  const request = (path, method = 'GET', data, origin = 'http://127.0.0.1:4322') => fetch(base + path, { method, headers: { Cookie: cookie, Origin: origin, 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, ...(data && { body: JSON.stringify(data) }) });
  try {
    assert.equal((await request('entries')).status, 401);
    assert.equal((await request('login', 'POST', { email: 'editor@example.test', password }, 'https://evil.test')).status, 403);
    const login = await request('login', 'POST', { email: 'editor@example.test', password });
    cookie = login.headers.get('set-cookie').split(';')[0]; assert.match(login.headers.get('set-cookie'), /HttpOnly; SameSite=Strict/);
    const auth = await login.json(); csrf = auth.csrf;
    const saved = await (await request('entries', 'POST', draft())).json(); assert.ok(saved.entry.id);
    const preview = await (await request('preview', 'POST', draft({ html: '<h1 style="font-size:90px">Hola</h1><p>Texto.</p>' }))).json();
    assert.equal(preview.entry.html, '<h2>Hola</h2><p>Texto.</p>');
    assert.equal((await request(`entries/${saved.entry.id}/schedule`, 'POST', { version: saved.entry.version, localDate: '2030-01-01T08:00' })).status, 200);
    const correct = csrf; csrf = 'incorrect'; assert.equal((await request('logout', 'POST', {})).status, 403); csrf = correct;
    assert.equal((await request('logout', 'POST', {})).status, 200); assert.equal((await request('entries')).status, 401);
  } finally { await new Promise(done => server.close(done)); store.close(); }
});
