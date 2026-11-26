import { randomUUID } from 'node:crypto';
import { fail, publicationFile, publicPath } from './content.mjs';
import { parseDocument } from 'htmlparser2';
import { findOne, textContent } from 'domutils';

export const repository = 'escueladeeudemonia-afk/eudemonia.es';
export function githubApi(token, transport = fetch) {
  return async (path, method = 'GET', body) => {
    const response = await transport(`https://api.github.com/repos/${repository}${path}`, {
      method, redirect: 'error', signal: AbortSignal.timeout(15000),
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'Content-Type': 'application/json' },
      ...(body && { body: JSON.stringify(body) }),
    });
    if (response.status === 404 && method === 'GET') return null;
    // Nunca devolver cuerpos del proveedor que puedan incluir datos de configuración.
    fail(response.ok, `GitHub no ha completado la operación (${response.status}).`, 502);
    return response.status === 204 ? null : response.json();
  };
}

export class Publisher {
  constructor(api, origin = 'https://eudemonia.es', transport = fetch) { this.api = api; this.origin = origin; this.fetch = transport; }
  async prepare(entry) {
    const file = publicationFile(entry);
    const branch = `editorial/${entry.id}`;
    let ref = await this.api(`/git/ref/heads/${branch}`);
    if (!ref) {
      const base = await this.api('/git/ref/heads/main');
      const directory = file.path.slice(0, file.path.lastIndexOf('/'));
      const existing = await this.api(`/contents/${directory}?ref=${base.object.sha}`);
      const prefix = new RegExp(`^${entry.type === 'podcast' ? 'ep' : ''}${entry.number}[-_]`);
      fail(!existing?.some(f => prefix.test(f.name)), 'Ese número ya está publicado en la web.', 409);
      // También se respetan las piezas programadas fuera del panel (p. ej. epístola 24).
      const pulls = await this.api('/pulls?state=open&per_page=100');
      fail(pulls.length < 100, 'Hay demasiadas propuestas abiertas para comprobar los números. Revisión técnica necesaria.', 409);
      for (const pr of pulls) {
        if (pr.head.ref === branch) continue;
        const files = await this.api(`/pulls/${pr.number}/files?per_page=100`);
        fail(files.length < 100, 'Una propuesta abierta necesita revisión antes de publicar.', 409);
        fail(!files.some(f => f.filename.startsWith(`${directory}/`) && prefix.test(f.filename.slice(directory.length + 1))), 'Ese número ya tiene una publicación preparada. Usa el siguiente.', 409);
      }
      ref = await this.api('/git/refs', 'POST', { ref: `refs/heads/${branch}`, sha: base.object.sha });
    }
    const existingFile = await this.api(`/contents/${file.path}?ref=${branch}`);
    if (existingFile) {
      fail(Buffer.from(existingFile.content, 'base64').toString('utf8') === file.markdown, 'El contenido preparado ha cambiado fuera del panel. Revisión técnica necesaria.', 409);
    } else {
      await this.api(`/contents/${file.path}`, 'PUT', { branch, message: `feat(editorial): prepara ${entry.title}`, content: Buffer.from(file.markdown).toString('base64') });
    }
    const prs = await this.api(`/pulls?state=all&head=${encodeURIComponent(`escueladeeudemonia-afk:${branch}`)}&base=main&per_page=10`);
    const pr = prs[0] ?? await this.api('/pulls', 'POST', {
      head: branch, base: 'main', title: `feat(editorial): publica ${entry.title}`,
      body: `Contenido preparado desde el panel editorial.\n\nTipo: ${entry.type}. Número: ${entry.number}.\nFecha: ${entry.publishAt} (instante UTC).\n\nEl publicador comprueba archivo, contenido, SHA y CI antes de fusionar.`,
    });
    return { branch, pr: pr.number, head: pr.head.sha, revision: file.revision };
  }
  async advance(entry) {
    const { job } = entry, file = publicationFile(entry);
    fail(job.revision === file.revision, 'La versión aprobada no coincide con el contenido.');
    const pr = await this.api(`/pulls/${job.pr}`);
    fail(pr && pr.base.repo.full_name === repository && pr.head.repo.full_name === repository && pr.base.ref === 'main' && pr.head.ref === job.branch && pr.head.sha === job.head && !pr.draft,
      'La propuesta de publicación ha cambiado. Revisión técnica necesaria.', 409);
    const files = await this.api(`/pulls/${job.pr}/files?per_page=100`);
    fail(files.length === 1 && files[0].filename === file.path && files[0].status === 'added', 'La propuesta incluye cambios ajenos a esta publicación.', 409);
    const content = await this.api(`/contents/${file.path}?ref=${job.head}`);
    fail(content && Buffer.from(content.content, 'base64').toString('utf8') === file.markdown, 'El texto de la propuesta no coincide con el aprobado.', 409);
    if (!pr.merged) {
      fail(pr.state === 'open', 'La propuesta se ha cerrado sin publicar.', 409);
      const checks = await this.api(`/commits/${job.head}/check-runs?per_page=100`);
      const validation = checks.check_runs.filter(c => c.name === 'validar' && c.head_sha === job.head && c.app?.slug === 'github-actions').sort((a, b) => b.id - a.id)[0];
      if (!validation || validation.status !== 'completed') return false;
      fail(validation.conclusion === 'success', 'La comprobación de la web ha fallado. Revisión técnica necesaria.', 409);
      if (pr.mergeable === null) return false;
      fail(pr.mergeable && !['blocked', 'dirty'].includes(pr.mergeable_state), 'La publicación tiene un conflicto o un bloqueo.', 409);
      fail(Date.now() >= Date.parse(entry.publishAt), 'Todavía no es la hora de publicar.');
      const merged = await this.api(`/pulls/${job.pr}/merge`, 'PUT', { sha: job.head, merge_method: 'merge' });
      fail(merged.merged, 'GitHub todavía no ha confirmado la publicación.', 502);
      return false; // Se verifica el despliegue en la siguiente vuelta, sin repetir el merge.
    }
    return this.verify(entry);
  }
  async verify(entry) {
    const read = async path => {
      const res = await this.fetch(new URL(path, this.origin), { redirect: 'error', signal: AbortSignal.timeout(15000), headers: { 'Cache-Control': 'no-cache' } });
      return res.ok ? res.text() : '';
    };
    const path = publicPath(entry);
    const html = await read(path);
    if (!html.includes(`data-editorial-revision="${entry.job.revision}"`)) return false;
    const document = parseDocument(html);
    const title = findOne(n => n.name === 'h1', document.children, true);
    const canonical = findOne(n => n.name === 'link' && n.attribs.rel === 'canonical', document.children, true);
    if (!title || textContent(title).trim() !== entry.title || !canonical) return false;
    if (canonical.attribs.href.replace(/\/$/, '') !== new URL(path, this.origin).href.replace(/\/$/, '')) return false;
    if (!html.includes(`datetime="${new Date(entry.publishAt).toISOString()}"`)) return false;
    const index = await read(entry.type === 'epistola' ? '/epistolas/' : '/podcast/');
    if (!index.includes(entry.slug)) return false;
    const sitemap = await read('/sitemap-0.xml');
    if (!sitemap.includes('<urlset')) return false;
    if (entry.type === 'epistola') return /name="robots"[^>]*content="noindex/.test(html) && !sitemap.includes(entry.slug);
    return sitemap.includes(entry.slug) && html.includes(`player.simplecast.com/${entry.simplecastId}`) && (await read('/podcast/feed.xml')).includes(entry.slug);
  }
}

export function createWorker(store, publisher, { now = Date.now } = {}) {
  const owner = randomUUID();
  let running = false;
  return async () => {
    if (running || !store.acquire(owner)) return;
    running = true;
    const heartbeat = setInterval(() => store.acquire(owner), 30000);
    try {
      const candidates = store.list().filter(e => ['scheduled', 'publishing'].includes(e.status) && Date.parse(e.publishAt) <= now() && (!e.nextAttemptAt || e.nextAttemptAt <= now()));
      // Serializar todas las publicaciones para evitar carreras en main y en Coolify.
      const current = candidates.find(e => e.status === 'publishing') ?? candidates.sort((a, b) => Date.parse(a.publishAt) - Date.parse(b.publishAt))[0];
      if (!current) return;
      let entry = current;
      try {
        fail(now() - Date.parse(entry.publishAt) < 24 * 3600000, 'La publicación lleva más de 24 horas pendiente. Revisa y reintenta expresamente.', 409);
        if (entry.status === 'scheduled') entry = store.write({ ...entry, status: 'publishing' }, entry.version);
        if (!entry.job) entry = store.write({ ...entry, job: await publisher.prepare(entry) }, entry.version);
        if (await publisher.advance(entry)) {
          store.write({ ...entry, status: 'published', error: null, publishedAt: new Date(now()).toISOString() }, entry.version);
          store.audit('publisher', entry.id, 'published');
        } else {
          store.write({ ...entry, nextAttemptAt: now() + 30000, error: null }, entry.version);
        }
      } catch (error) {
        const attempts = (entry.attempts ?? 0) + 1;
        store.write({ ...entry, attempts, status: error.status === 409 || attempts >= 20 ? 'failed' : 'publishing',
          error: error.status ? error.message : 'No se ha podido completar la publicación. Se volverá a intentar.', nextAttemptAt: now() + Math.min(attempts * 60000, 900000) }, entry.version);
        store.audit('publisher', entry.id, 'publication-error');
      }
    } finally { clearInterval(heartbeat); store.release(owner); running = false; }
  };
}
