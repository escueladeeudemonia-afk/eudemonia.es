import { DatabaseSync } from 'node:sqlite';
import { randomBytes, randomUUID, scryptSync, timingSafeEqual } from 'node:crypto';
import { mkdirSync, chmodSync } from 'node:fs';
import { dirname } from 'node:path';
import { digest, fail, normalizeEntry, validatePublication } from './content.mjs';
const scryptOptions = { N: 131072, r: 8, p: 1, maxmem: 256 * 1024 * 1024 };

export function passwordHash(password) {
  fail(typeof password === 'string' && password.length >= 14 && password.length <= 200, 'La contraseña debe tener entre 14 y 200 caracteres.');
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64, scryptOptions).toString('hex')}`;
}
export function passwordMatches(password, hash) {
  const [salt, expected] = hash.split(':');
  const actual = scryptSync(String(password).slice(0, 200), salt, 64, scryptOptions);
  return timingSafeEqual(actual, Buffer.from(expected, 'hex'));
}

export class Store {
  constructor(path, now = Date.now) {
    if (path !== ':memory:') { mkdirSync(dirname(path), { recursive: true, mode: 0o700 }); }
    this.db = new DatabaseSync(path);
    if (path !== ':memory:') chmodSync(path, 0o600);
    this.now = now;
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS users(email TEXT PRIMARY KEY, name TEXT NOT NULL, password TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS sessions(token TEXT PRIMARY KEY, email TEXT NOT NULL, csrf TEXT NOT NULL, expires INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS entries(id TEXT PRIMARY KEY, type TEXT NOT NULL, number INTEGER NOT NULL, version INTEGER NOT NULL, status TEXT NOT NULL, data TEXT NOT NULL, UNIQUE(type, number));
      CREATE TABLE IF NOT EXISTS audit(id INTEGER PRIMARY KEY, at TEXT NOT NULL, actor TEXT NOT NULL, entry TEXT, action TEXT NOT NULL);
      CREATE TABLE IF NOT EXISTS attempts(key TEXT PRIMARY KEY, count INTEGER NOT NULL, until INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS locks(name TEXT PRIMARY KEY, owner TEXT NOT NULL, until INTEGER NOT NULL);`);
    this.dummyHash = passwordHash(randomBytes(24).toString('hex'));
  }
  audit(actor, entry, action) { this.db.prepare('INSERT INTO audit(at,actor,entry,action) VALUES(?,?,?,?)').run(new Date(this.now()).toISOString(), actor, entry, action); }
  addUser(email, name, password) {
    fail(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), 'Correo no válido.');
    this.db.prepare('INSERT INTO users VALUES(?,?,?) ON CONFLICT(email) DO UPDATE SET name=excluded.name,password=excluded.password').run(email.toLowerCase(), name, passwordHash(password));
    this.db.prepare('DELETE FROM sessions WHERE email=?').run(email.toLowerCase());
  }
  login(email, password, address) {
    email = String(email ?? '').trim().toLowerCase();
    this.db.prepare('DELETE FROM attempts WHERE until<?').run(this.now());
    // Se limita tanto la cuenta como la dirección, sin confiar en X-Forwarded-For del cliente.
    for (const key of [`email:${digest(email)}`, `ip:${digest(address)}`]) {
      const r = this.db.prepare('SELECT * FROM attempts WHERE key=?').get(key);
      fail(!r || r.until < this.now() || r.count < 10, 'Demasiados intentos. Espera quince minutos.', 429);
      this.db.prepare('INSERT INTO attempts VALUES(?,1,?) ON CONFLICT(key) DO UPDATE SET count=CASE WHEN until<? THEN 1 ELSE count+1 END, until=CASE WHEN until<? THEN excluded.until ELSE until END').run(key, this.now() + 900000, this.now(), this.now());
    }
    const user = this.db.prepare('SELECT * FROM users WHERE email=?').get(email);
    const valid = passwordMatches(password ?? '', user?.password ?? this.dummyHash);
    fail(user && valid, 'El correo o la contraseña no son correctos.', 401);
    this.db.prepare('DELETE FROM attempts WHERE key=?').run(`email:${digest(email)}`);
    this.db.prepare('DELETE FROM attempts WHERE key=?').run(`ip:${digest(address)}`);
    this.db.prepare('DELETE FROM sessions WHERE expires<?').run(this.now());
    const token = randomBytes(32).toString('hex'), csrf = randomBytes(32).toString('hex');
    this.db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(digest(token), email, csrf, this.now() + 12 * 3600000);
    this.audit(email, null, 'login');
    return { token, csrf, user: { email, name: user.name } };
  }
  session(token = '') {
    return this.db.prepare('SELECT s.email,s.csrf,u.name FROM sessions s JOIN users u ON u.email=s.email WHERE s.token=? AND s.expires>?').get(digest(token), this.now());
  }
  logout(token = '') { this.db.prepare('DELETE FROM sessions WHERE token=?').run(digest(token)); }
  get(id) { const row = this.db.prepare('SELECT data FROM entries WHERE id=?').get(id); return row ? JSON.parse(row.data) : null; }
  list() { return this.db.prepare('SELECT data FROM entries ORDER BY rowid DESC').all().map(r => JSON.parse(r.data)); }
  write(entry, expectedVersion) {
    const next = { ...entry, version: (expectedVersion ?? 0) + 1, updatedAt: new Date(this.now()).toISOString() };
    if (expectedVersion == null) {
      try { this.db.prepare('INSERT INTO entries VALUES(?,?,?,?,?,?)').run(next.id, next.type, next.number, next.version, next.status, JSON.stringify(next)); }
      catch (error) { if (error.code?.includes('SQLITE') && /UNIQUE/.test(error.message)) fail(false, 'Ya existe una publicación con ese número.', 409); throw error; }
    } else {
      const result = this.db.prepare('UPDATE entries SET version=?,status=?,data=? WHERE id=? AND version=?').run(next.version, next.status, JSON.stringify(next), next.id, expectedVersion);
      fail(result.changes === 1, 'La publicación ha cambiado en otra sesión. Vuelve a abrirla.', 409);
    }
    return next;
  }
  save(input, actor, id = null) {
    const old = id ? this.get(id) : null;
    fail(!id || old, 'Publicación no encontrada.', 404);
    fail(!old || old.status === 'draft', 'Cancela la programación antes de editar. Las piezas en publicación o publicadas no se pueden modificar.', 409);
    fail(!old || input.version === old.version, 'La publicación ha cambiado. Vuelve a abrirla.', 409);
    const data = normalizeEntry(input, old);
    const entry = this.write({ ...data, id: id ?? randomUUID(), status: 'draft', createdBy: old?.createdBy ?? actor, publishAt: null, error: null, job: null }, old?.version);
    this.audit(actor, entry.id, 'save');
    return entry;
  }
  schedule(id, version, publishAt, actor) {
    const e = this.get(id);
    fail(e, 'Publicación no encontrada.', 404);
    fail(e.version === version && e.status === 'draft', 'Guarda el borrador actualizado antes de programar.', 409);
    validatePublication(e);
    fail(Number.isFinite(Date.parse(publishAt)), 'Fecha no válida.');
    const next = this.write({ ...e, status: 'scheduled', publishAt, error: null, attempts: 0 }, version);
    this.audit(actor, id, 'schedule');
    return next;
  }
  cancel(id, version, actor) {
    const e = this.get(id);
    fail(e, 'Publicación no encontrada.', 404);
    fail(e.version === version && e.status === 'scheduled' && !e.job, 'La publicación ya está en marcha; no se puede cancelar desde aquí.', 409);
    const next = this.write({ ...e, status: 'draft', publishAt: null, error: null }, version);
    this.audit(actor, id, 'cancel');
    return next;
  }
  acquire(owner) {
    const now = this.now();
    return this.db.prepare("INSERT INTO locks VALUES('publisher',?,?) ON CONFLICT(name) DO UPDATE SET owner=excluded.owner,until=excluded.until WHERE locks.until<? OR locks.owner=?").run(owner, now + 120000, now, owner).changes === 1;
  }
  release(owner) { this.db.prepare("DELETE FROM locks WHERE name='publisher' AND owner=?").run(owner); }
  close() { this.db.close(); }
}
