import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

type Kind = 'epistola' | 'podcast';
interface Entry { id?: string; type: Kind; title: string; number: number; author: string; description: string; html: string; simplecastId: string; version?: number; status?: string; url?: string; publishAt?: string; error?: string; job?: { pr: number } | null; }
const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;
const input = (id: string) => $<HTMLInputElement>(id);
let csrf = '', publishingEnabled = false, entry: Entry | null = null, dirty = false, busy = false;
let entries: Entry[] = [];
const labels: Record<string, string> = { draft: 'Borrador', scheduled: 'Programada', publishing: 'Publicando', published: 'Publicada', failed: 'Necesita revisión' };
const formatDate = (date: string) => new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'medium', timeStyle: 'short' }).format(new Date(date));
const editable = () => !entry?.id || entry.status === 'draft';

function message(text = '', error = false) { $('message').textContent = text; $('message').hidden = !text; $('message').classList.toggle('is-error', error); if (error) $('message').focus(); }
function show(view: 'login-view' | 'dashboard' | 'editor-view') { for (const id of ['login-view', 'dashboard', 'editor-view', 'loading']) $(id).hidden = id !== view; }
function markDirty() { if (editable()) { dirty = true; $('save-state').textContent = 'Cambios sin guardar'; } }
function controlState() {
  $<HTMLFieldSetElement>('content-fields').disabled = busy || !editable();
  editor.setEditable(!busy && editable(), false);
  input('entry-number').readOnly = !!entry?.id;
  for (const id of ['save-button', 'schedule-button', 'publish-button']) $<HTMLButtonElement>(id).disabled = busy || !editable() || (id !== 'save-button' && !publishingEnabled);
  $<HTMLButtonElement>('preview-button').disabled = busy;
  $('cancel-button').hidden = !entry?.id || entry.status !== 'scheduled';
  $('retry-button').hidden = !entry?.id || entry.status !== 'failed';
  $<HTMLButtonElement>('cancel-button').disabled = busy; $<HTMLButtonElement>('retry-button').disabled = busy || !publishingEnabled;
  $('setup-note').hidden = publishingEnabled;
  input('schedule-date').disabled = busy || !editable();
}
async function api(path: string, method = 'GET', data?: unknown) {
  const response = await fetch(`/admin/api/${path}`, { method, credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf }, ...(data !== undefined && { body: JSON.stringify(data) }) });
  let result;
  try { result = await response.json(); } catch { throw new Error('No se puede conectar con el servicio editorial. Inténtalo de nuevo en unos minutos.'); }
  if (!response.ok) { if (response.status === 401) { show('login-view'); $('account').hidden = true; } throw new Error(result.error ?? 'No se ha podido completar la operación.'); }
  return result;
}
async function perform(action: () => Promise<void>) {
  if (busy) return;
  busy = true; controlState(); message();
  try { await action(); } catch (error) { message((error as Error).message, true); }
  finally { busy = false; controlState(); }
}

// ProseMirror limita el documento a estructura editorial; no incorpora fuentes, tamaños o colores pegados.
const editor = new Editor({
  element: $('text-editor'),
  extensions: [StarterKit.configure({ heading: { levels: [2, 3] }, code: false, codeBlock: false, strike: false, underline: false, link: { openOnClick: false, protocols: ['https', 'http', 'mailto'] } })],
  content: '<p></p>',
  editorProps: {
    attributes: { role: 'textbox', 'aria-labelledby': 'text-label', 'aria-multiline': 'true', 'data-placeholder': 'Pega aquí el texto de la publicación…' },
    transformPastedHTML: html => html.replace(/<(\/?)h1\b/gi, '<$1h2').replace(/<(\/?)h[4-6]\b/gi, '<$1h3'),
  },
  onUpdate: markDirty,
  onSelectionUpdate: ({ editor }) => {
    for (const button of document.querySelectorAll<HTMLButtonElement>('[data-command]')) {
      if (!['undo', 'redo'].includes(button.dataset.command!)) button.setAttribute('aria-pressed', String(editor.isActive(button.dataset.command!)));
    }
    $<HTMLSelectElement>('block-format').value = editor.isActive('heading', { level: 2 }) ? 'h2' : editor.isActive('heading', { level: 3 }) ? 'h3' : 'p';
  },
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-command]')) {
  button.addEventListener('click', () => {
    const chain = editor.chain().focus();
    switch (button.dataset.command) {
      case 'bold': chain.toggleBold().run(); break; case 'italic': chain.toggleItalic().run(); break;
      case 'bulletList': chain.toggleBulletList().run(); break; case 'orderedList': chain.toggleOrderedList().run(); break;
      case 'blockquote': chain.toggleBlockquote().run(); break; case 'undo': chain.undo().run(); break; case 'redo': chain.redo().run(); break;
    }
  });
}
$('block-format').addEventListener('change', () => { const value = $<HTMLSelectElement>('block-format').value; if (value === 'p') editor.chain().focus().setParagraph().run(); else editor.chain().focus().setHeading({ level: value === 'h2' ? 2 : 3 }).run(); });
$('link-button').addEventListener('click', () => { input('link-url').value = editor.getAttributes('link').href ?? ''; $<HTMLDialogElement>('link-dialog').showModal(); });
$<HTMLDialogElement>('link-dialog').addEventListener('close', () => {
  const result = $<HTMLDialogElement>('link-dialog').returnValue;
  if (result === 'remove') editor.chain().focus().extendMarkRange('link').unsetLink().run();
  if (result === 'confirm') {
    const href = input('link-url').value.trim();
    if (!/^(https?:\/\/|mailto:)/i.test(href)) { message('El enlace debe empezar por https://, http:// o mailto:.', true); return; }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }
});
for (const id of ['entry-title', 'entry-number', 'entry-description', 'entry-author', 'entry-player']) $(id).addEventListener('input', markDirty);

function collect(): Entry {
  return { ...entry!, type: entry!.type, title: input('entry-title').value, number: Number(input('entry-number').value), author: input('entry-author').value, description: input('entry-description').value, simplecastId: input('entry-player').value, html: editor.getHTML() };
}
function openEntry(e: Entry) {
  entry = e; dirty = false;
  const epistola = e.type === 'epistola';
  $('editor-kind').textContent = epistola ? 'Epístola' : 'Podcast'; $('editor-heading').textContent = e.id ? 'Tu publicación' : epistola ? 'Nueva epístola' : 'Nuevo podcast';
  input('entry-title').value = e.title; input('entry-number').value = e.number ? String(e.number) : '';
  input('entry-description').value = e.description; input('entry-author').value = e.author; input('entry-player').value = e.simplecastId;
  editor.commands.setContent(e.html || '<p></p>', { emitUpdate: false });
  $('author-field').hidden = !epistola; $('player-field').hidden = epistola;
  $('save-state').textContent = e.id ? 'Guardado' : 'Sin guardar'; $('entry-status').textContent = labels[e.status ?? 'draft'];
  $('entry-status').dataset.status = e.status ?? 'draft';
  $('publication-error').textContent = e.error ?? ''; $('publication-error').hidden = !e.error;
  if (e.status === 'scheduled' || e.status === 'publishing') $('save-state').textContent = `${labels[e.status]} · ${formatDate(e.publishAt!)}`;
  $('future-link').hidden = !e.url;
  if (e.url) { const link = $<HTMLAnchorElement>('entry-url'); link.href = e.url; link.textContent = e.url; }
  $('url-help').textContent = e.status === 'published' ? 'Publicación comprobada en la web.' : 'Estará disponible cuando se publique.';
  input('schedule-date').value = e.publishAt ? new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(e.publishAt)).replace(' ', 'T') : '';
  show('editor-view'); controlState();
}
function canLeave() { return !dirty || window.confirm('Tienes cambios sin guardar. ¿Quieres salir y descartarlos?'); }
async function dashboard() {
  entries = (await api('entries')).entries;
  const target = $('entries'); target.replaceChildren();
  if (!entries.length) { const empty = document.createElement('div'); empty.className = 'empty-state'; empty.innerHTML = '<h3>Tu próxima publicación empieza aquí.</h3><p>Crea una epístola o un podcast. Los borradores y las publicaciones programadas aparecerán en esta mesa.</p>'; target.append(empty); }
  for (const e of entries) {
    const row = document.createElement('button'); row.className = 'entry-row';
    const content = document.createElement('span'), kind = document.createElement('span'), title = document.createElement('strong'), date = document.createElement('span'), status = document.createElement('span');
    kind.className = 'entry-kind'; kind.textContent = `${e.type === 'epistola' ? 'Epístola' : 'Podcast'} · ${e.number}`;
    title.textContent = e.title; date.className = 'entry-date'; date.textContent = e.publishAt ? formatDate(e.publishAt) : 'Sin fecha de publicación';
    status.className = 'status-pill'; status.dataset.status = e.status; status.textContent = labels[e.status!]; content.append(kind, title, date); row.append(content, status);
    row.addEventListener('click', () => perform(async () => { openEntry((await api(`entries/${e.id}`)).entry); })); target.append(row);
  }
  show('dashboard'); entry = null; dirty = false;
}
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-create]')) button.addEventListener('click', () => {
  const type = button.dataset.create as Kind;
  openEntry({ type, title: '', number: 0, author: 'Pablo Tovar', description: '', html: '', simplecastId: '', status: 'draft' }); input('entry-title').focus();
});
$('back').addEventListener('click', () => { if (canLeave()) perform(dashboard); });
$('refresh').addEventListener('click', () => perform(dashboard));
async function save() {
  const { entry: saved } = await api(entry?.id ? `entries/${entry.id}` : 'entries', entry?.id ? 'PUT' : 'POST', collect());
  const chosenDate = input('schedule-date').value;
  openEntry(saved); input('schedule-date').value = chosenDate; message('Borrador guardado.');
}
$('save-button').addEventListener('click', () => perform(save));
async function schedule(now: boolean) {
  if (!now && !input('schedule-date').value) throw new Error('Elige la fecha y hora de publicación.');
  if (now && !window.confirm('¿Publicar esta pieza en la web ahora?')) return;
  const localDate = input('schedule-date').value;
  await save();
  const result = await api(`entries/${entry!.id}/schedule`, 'POST', { version: entry!.version, localDate, now });
  openEntry(result.entry); message(now ? 'Publicación en marcha. Aquí podrás ver cuando esté disponible.' : `Publicación programada para el ${formatDate(result.entry.publishAt)} (Madrid).`);
}
$('schedule-button').addEventListener('click', () => perform(() => schedule(false)));
$('publish-button').addEventListener('click', () => perform(() => schedule(true)));
$('cancel-button').addEventListener('click', () => perform(async () => { if (!confirm('¿Cancelar la programación y volver a borrador?')) return; openEntry((await api(`entries/${entry!.id}/cancel`, 'POST', { version: entry!.version })).entry); message('Programación cancelada. Puedes editar el borrador.'); }));
$('retry-button').addEventListener('click', () => perform(async () => { openEntry((await api(`entries/${entry!.id}/retry`, 'POST', { version: entry!.version })).entry); message('La publicación se volverá a comprobar.'); }));
$('copy-url').addEventListener('click', () => perform(async () => { await navigator.clipboard.writeText(entry!.url!); message('Enlace copiado.'); }));
$('preview-button').addEventListener('click', () => perform(async () => {
  const preview = (await api('preview', 'POST', { ...collect(), localDate: input('schedule-date').value })).entry;
  preview.publishAt ??= entry?.publishAt;
  const frame = $<HTMLIFrameElement>('preview-frame');
  frame.onload = () => {
    const doc = frame.contentDocument!;
    for (const kind of ['epistola', 'podcast']) doc.getElementById(`preview-${kind}`)!.hidden = kind !== preview.type;
    const root = doc.getElementById(`preview-${preview.type}`)!;
    root.querySelector('[data-preview-title]')!.textContent = preview.title;
    root.querySelector('[data-preview-number]')!.textContent = `${preview.type === 'epistola' ? 'Epístola #' : 'Episodio '}${preview.number}`;
    root.querySelector('[data-preview-date]')!.textContent = new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', dateStyle: 'long' }).format(new Date(preview.publishAt ?? Date.now()));
    const author = root.querySelector('[data-preview-author]'); if (author) author.textContent = preview.author;
    const summary = root.querySelector('[data-preview-description]'); if (summary) summary.textContent = preview.description;
    // Respuesta del saneador del servidor autenticado, nunca el HTML bruto del portapapeles.
    root.querySelector('[data-preview-body]')!.innerHTML = `<div>${preview.html}</div>`;
    const player = root.querySelector('[data-preview-player]');
    if (player && /^[a-zA-Z0-9_-]{6,80}$/.test(preview.simplecastId)) {
      const audio = doc.createElement('iframe'); audio.src = `https://player.simplecast.com/${preview.simplecastId}?dark=false`; audio.title = 'Reproductor del episodio'; audio.width = '100%'; audio.height = '200'; player.append(audio);
    }
    doc.addEventListener('click', event => { if ((event.target as Element).closest('a')) event.preventDefault(); });
  };
  frame.src = '/admin/vista-previa/'; $<HTMLDialogElement>('preview-dialog').showModal();
}));
$('close-preview').addEventListener('click', () => { $<HTMLDialogElement>('preview-dialog').close(); const frame = $<HTMLIFrameElement>('preview-frame'); frame.onload = null; frame.src = 'about:blank'; });
$('login-form').addEventListener('submit', event => {
  event.preventDefault(); perform(async () => {
    const form = new FormData($<HTMLFormElement>('login-form'));
    const session = await api('login', 'POST', Object.fromEntries(form));
    csrf = session.csrf; publishingEnabled = session.publishingEnabled; $('user-name').textContent = session.user.name; $('account').hidden = false;
    $<HTMLFormElement>('login-form').reset(); if (entry && dirty) show('editor-view'); else await dashboard();
  });
});
$('logout').addEventListener('click', () => { if (canLeave()) perform(async () => { await api('logout', 'POST', {}); csrf = ''; dirty = false; entry = null; entries = []; editor.commands.setContent(''); $('entries').replaceChildren(); $('account').hidden = true; show('login-view'); }); });
window.addEventListener('beforeunload', event => { if (dirty) event.preventDefault(); });
setInterval(() => {
  if (busy || dirty || !entry?.id || !['scheduled', 'publishing'].includes(entry.status!)) return;
  perform(async () => { openEntry((await api(`entries/${entry!.id}`)).entry); });
}, 15000);
perform(async () => {
  try {
    const session = await api('session'); csrf = session.csrf; publishingEnabled = session.publishingEnabled; $('user-name').textContent = session.user.name; $('account').hidden = false; await dashboard();
  } catch (error) { show('login-view'); if (!(error as Error).message.includes('iniciar sesión')) throw error; }
});
