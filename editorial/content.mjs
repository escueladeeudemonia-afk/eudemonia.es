import sanitize from 'sanitize-html';
import { createHash } from 'node:crypto';
import { stringify } from 'yaml';
import { parseDocument } from 'htmlparser2';
import { textContent } from 'domutils';

export class InputError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
export const fail = (condition, message, status = 400) => { if (!condition) throw new InputError(message, status); };
export const digest = value => createHash('sha256').update(value).digest('hex');
export const textOnly = value => textContent(parseDocument(sanitize(String(value ?? ''), { allowedTags: [], allowedAttributes: {} }))).replace(/[\u0000-\u001f]/g, ' ').replace(/\s+/g, ' ').trim();
export const slugify = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 100).replace(/-$/, '');

export function normalizeHtml(value) {
  fail(typeof value === 'string' && Buffer.byteLength(value) <= 250_000, 'El texto es demasiado largo (máximo 250 KB).');
  return sanitize(value, {
    allowedTags: ['p', 'h2', 'h3', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'blockquote', 'br', 'hr'],
    allowedAttributes: { a: ['href', 'rel'], ol: ['start'] },
    allowedSchemes: ['https', 'http', 'mailto'], allowProtocolRelative: false,
    nonTextTags: ['script', 'style', 'textarea', 'option', 'iframe', 'svg', 'math', 'noscript', 'template'],
    transformTags: {
      h1: 'h2', h4: 'h3', h5: 'h3', h6: 'h3', b: 'strong', i: 'em', div: 'p',
      a: (tagName, attribs) => ({ tagName, attribs: { href: attribs.href ?? '', rel: 'noopener noreferrer' } }),
    },
  }).replace(/\r\n?|\n/g, ' ').trim();
}

const madridFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
});
export function madridLocal(instant) { return madridFormatter.format(new Date(instant)).replace(' ', 'T'); }
export function madridInstant(local) {
  fail(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local ?? ''), 'Indica una fecha y hora de Madrid.');
  const guess = Date.parse(`${local}:00Z`);
  const matches = [1, 2].map(offset => guess - offset * 3_600_000).filter(date => Number.isFinite(date) && madridLocal(date) === local);
  fail(matches.length === 1, matches.length === 2 ? 'Esta hora se repite por el cambio de horario. Elige una hora anterior o posterior.' : 'La fecha no existe o coincide con el salto al horario de verano.');
  return new Date(matches[0]).toISOString();
}

export function simplecastId(value) {
  const input = String(value ?? '').trim();
  if (!input) return '';
  let id = input;
  if (input.startsWith('https://')) {
    const url = new URL(input);
    fail(url.hostname === 'player.simplecast.com' && !url.username && !url.password, 'Pega el enlace del reproductor de Simplecast (player.simplecast.com).');
    id = url.pathname.replace(/^\//, '').replace(/\/$/, '');
  }
  fail(/^[a-zA-Z0-9_-]{6,80}$/.test(id), 'El enlace o identificador de Simplecast no es válido.');
  return id;
}

export function normalizeEntry(input, previous = null) {
  fail(input && ['epistola', 'podcast'].includes(input.type), 'Selecciona epístola o podcast.');
  fail(!previous || input.type === previous.type, 'No se puede cambiar el tipo de una pieza guardada.');
  const title = textOnly(input.title);
  fail(title.length >= 3 && title.length <= 180, 'El título debe tener entre 3 y 180 caracteres.');
  const number = Number(input.number);
  fail(Number.isInteger(number) && number >= 1 && number <= 99999, 'Indica un número válido para la publicación.');
  fail(!previous || number === previous.number, 'El número y la URL se conservan después de guardar.');
  const html = normalizeHtml(input.html ?? '');
  const description = textOnly(input.description).slice(0, 320);
  const author = textOnly(input.author || 'Pablo Tovar').slice(0, 120);
  const playerId = input.type === 'podcast' ? simplecastId(input.simplecastId) : '';
  const slug = previous?.slug ?? `${input.type === 'podcast' ? 'ep' : ''}${number}-${slugify(title)}`;
  fail(/^(ep)?\d+-[a-z0-9-]+$/.test(slug), 'El título debe contener letras o números para formar la URL.');
  return { type: input.type, title, number, html, description, author, simplecastId: playerId, slug };
}

export function validatePublication(entry) {
  fail(textOnly(entry.html).length >= 20, 'Añade el texto antes de publicar.');
  fail(entry.description.length >= 10, 'Añade un resumen de al menos 10 caracteres.');
  fail(entry.type !== 'podcast' || !!entry.simplecastId, 'Añade el reproductor de Simplecast antes de publicar el podcast.');
}
export const contentPath = e => `src/content/${e.type === 'epistola' ? 'epistolas' : 'episodes'}/${e.slug}.md`;
export const publicPath = e => `/${e.type === 'epistola' ? 'epistolas' : 'podcast'}/${e.slug}/`;

export function publicationFile(entry) {
  validatePublication(entry);
  fail(Number.isFinite(Date.parse(entry.publishAt)), 'Falta la fecha de publicación.');
  const data = { title: entry.title, description: entry.description, pubDate: entry.publishAt, draft: false,
    ...(entry.type === 'epistola' ? { number: entry.number, author: entry.author } : { episodeNumber: entry.number, simplecastId: entry.simplecastId }) };
  const revision = digest(JSON.stringify(data) + entry.html);
  data.editorialVersion = revision;
  // Un bloque HTML evita reinterpretar como Markdown el texto pegado. Solo contiene HTML saneado.
  const markdown = `---\n${stringify(data)}---\n\n<div data-editorial-revision="${revision}">\n${normalizeHtml(entry.html)}\n</div>\n`;
  return { path: contentPath(entry), markdown, revision };
}
