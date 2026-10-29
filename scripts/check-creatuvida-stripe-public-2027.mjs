import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { catalog, change } from './finish-creatuvida-early-bird-2027.mjs';
import { setTimeout as pause } from 'node:timers/promises';

const dryRun = process.env.DRY_RUN !== 'false';
if (!dryRun && Date.now() >= change.expiresAt) { console.log('Comprobación de enero caducada.'); process.exit(0); }
if (!dryRun) assert.ok(Date.now() >= change.activateAt && Date.now() < change.expiresAt, 'Fuera del plazo de comprobación pública');
const profile = await mkdtemp(join(tmpdir(), 'ctv-stripe-publico-'));
const browser = spawn(process.env.CHROME_PATH ?? '/usr/bin/google-chrome', ['--headless', '--no-sandbox', '--disable-dev-shm-usage', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: 'ignore' });
let launchError;
browser.on('error', (error) => { launchError = error; });
let ws;
try {
  let port;
  for (let i=0; i<80; i++) { try { if (launchError) throw launchError; port=(await readFile(`${profile}/DevToolsActivePort`, 'utf8')).split('\n')[0]; break; } catch { await pause(100); } }
  assert.ok(port, 'Chromium no ha arrancado');
  const target=await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, {method:'PUT'})).json();
  ws=new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve,reject)=>{ws.addEventListener('open',resolve,{once:true});ws.addEventListener('error',reject,{once:true});});
  let id=0; const pending=new Map();
  const call=(method,params={})=>new Promise((resolve,reject)=>{
    const n=++id;
    const timer=setTimeout(()=>{pending.delete(n);reject(new Error(`Chromium no responde: ${method}`));},10_000);
    pending.set(n,{resolve,reject,timer});ws.send(JSON.stringify({id:n,method,params}));
  });
  ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(m.error):p.resolve(m.result);}});
  const evaluate=async(expression)=>(await call('Runtime.evaluate',{expression,returnByValue:true})).result.value;
  for (const link of catalog.early) {
    await call('Page.navigate',{url:link.url});
    const deadline = Date.now() + 60_000;
    let verified = false;
    do {
      await pause(500);
      const body = await evaluate('document.body?.innerText ?? ""');
      verified = dryRun
        ? body.includes('CreaTuVida Enero 2027') && body.includes(String(link.amount / 100))
        : body.includes('La tarifa anticipada terminó el 17 de enero de 2027');
      if (verified) break;
    } while (Date.now() < deadline);
    assert.ok(verified, `Estado público de Stripe inesperado: ${link.url}`);
    console.log(JSON.stringify({url:link.url, expected:dryRun?'active':'inactive', verified:true}));
  }
} finally {ws?.close();browser.kill('SIGTERM');await pause(200);await rm(profile,{recursive:true,force:true});}
