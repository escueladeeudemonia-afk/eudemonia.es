import test from 'node:test';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
const root=new URL('../',import.meta.url);
test('El motor del cuaderno supera las pruebas de cálculo, privacidad y ambas modalidades',()=>{
 const out=execFileSync(process.execPath,['tools/cuaderno-relacion/test.mjs'],{cwd:root,encoding:'utf8'});
 assert.match(out,/15 meaningful tests passed/);
});
test('La ruta usa Base con la medición desactivada y permanece fuera del menú',()=>{
 const page=readFileSync(new URL('src/pages/cuaderno-relacion.astro',root),'utf8');
 const base=readFileSync(new URL('src/layouts/Base.astro',root),'utf8');
 assert.match(page,/analytics=\{false\}/);
 assert.match(page,/noindex=\{true\}/);
 assert.match(base,/analytics = true/);
 assert.match(base,/analytics && <CookieConsent \/>/);
 assert(!readFileSync(new URL('src/data/navegacion.ts',root),'utf8').includes('/cuaderno-relacion'));
});
