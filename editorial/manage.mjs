import { Store } from './store.mjs';
import { fail } from './content.mjs';
process.umask(0o077);
const [command, email, ...name] = process.argv.slice(2);
const store = new Store(process.env.EDITORIAL_DB ?? './.editorial/data.sqlite');
try {
  if (command === 'user') {
    fail(!process.stdin.isTTY, 'La contraseña debe llegar por stdin desde el gestor de secretos; no como argumento.');
    let password = '';
    for await (const chunk of process.stdin) { password += chunk; fail(password.length <= 202, 'Contraseña demasiado larga.'); }
    fail(email && name.length, 'Uso: node editorial/manage.mjs user correo nombre');
    store.addUser(email, name.join(' '), password.trimEnd());
    console.log('Cuenta guardada. Las sesiones anteriores de esta cuenta se han cerrado.');
  } else if (command === 'backup') {
    fail(email && !email.includes("'"), 'Indica un archivo nuevo para la copia.');
    store.db.prepare('VACUUM INTO ?').run(email);
    console.log('Copia coherente creada. Contiene información privada; conservar con acceso restringido.');
  } else if (command === 'disable') {
    fail(email, 'Indica el correo de la cuenta.');
    store.db.prepare('DELETE FROM sessions WHERE email=?').run(email.toLowerCase());
    store.db.prepare('DELETE FROM users WHERE email=?').run(email.toLowerCase());
    console.log('Acceso retirado. Contenidos conservados.');
  } else fail(false, 'Comandos: user, backup, disable.');
} finally { store.close(); }
