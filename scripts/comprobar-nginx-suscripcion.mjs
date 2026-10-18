import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile, mkdir, mkdtemp, rm } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { generarProxySuscripcion } from "./proxy-suscripcion.mjs";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";
import { enviarSuscripcion } from "../src/scripts/suscripcion.mjs";

const { wordpress } = suscripcionEpistolas;
const calls = [];
const upstream = createServer(async (request, response) => {
  let body = "";
  for await (const chunk of request) body += chunk;
  calls.push({ url: request.url, method: request.method, headers: request.headers, body });
  response.setHeader("Set-Cookie", "no-reenviar=1");
  if (request.url === "/sobre-ti/") {
    response.setHeader("Content-Type", "text/html");
    response.end(`<input value="${wordpress.formId}"><script>var kadence_blocks_form_params = {"nonce":"123456abcd"};</script>`);
  } else {
    response.setHeader("Content-Type", "application/json");
    response.end(JSON.stringify({ success: Boolean(body) }));
  }
});
await new Promise((done) => upstream.listen(0, "127.0.0.1", done));
const upstreamPort = upstream.address().port;
const reserve = createServer();
await new Promise((done) => reserve.listen(0, "127.0.0.1", done));
const port = reserve.address().port;
await new Promise((done) => reserve.close(done));
const origin = `http://127.0.0.1:${port}`;
await mkdir(".astro", { recursive: true });
const directory = await mkdtemp(resolve(".astro/nginx-newsletter-"));
let container;
try {
  const nginx = (await readFile("nginx.conf", "utf8")).replace("listen 80;", `listen ${port};`);
  const proxy = generarProxySuscripcion()
    .replaceAll("set $newsletter_host escueladeeudemonia.com;", `set $newsletter_host 127.0.0.1:${upstreamPort};`)
    .replaceAll("proxy_pass https://$newsletter_host", "proxy_pass http://$newsletter_host");
  assert.ok(!proxy.includes("proxy_pass https:"));
  assert.ok(!proxy.includes("set $newsletter_host escueladeeudemonia.com;"));
  await writeFile(`${directory}/default.conf`, nginx);
  await writeFile(`${directory}/suscripcion.conf`, proxy);
  const mounts = ["-v", `${directory}/default.conf:/etc/nginx/conf.d/default.conf:ro`, "-v", `${directory}/suscripcion.conf:/etc/nginx/suscripcion.conf:ro`, "-v", `${resolve("dist")}:/usr/share/nginx/html:ro`];
  execFileSync("docker", ["run", "--rm", "--network", "none", ...mounts, "nginx:alpine", "nginx", "-t"], { stdio: "inherit" });
  container = execFileSync("docker", ["run", "--rm", "-d", "--network", "host", ...mounts, "nginx:alpine"], { encoding: "utf8" }).trim();
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      assert.equal(response.status, 200);
      assert.equal(response.headers.get("cache-control"), "no-cache");
      ready = true;
      break;
    } catch {
      await setTimeout(250);
    }
  }
  assert.ok(ready, "nginx no arrancó");
  const form = new FormData();
  for (const [name, value] of Object.entries({ kb_field_0: "prueba+epistolas@example.invalid", kb_field_1: "accept", _kb_form_id: wordpress.formId, _kb_form_post_id: wordpress.postId, _kb_verify_email: "", action: "kb_process_ajax_submit" })) form.set(name, value);
  await enviarSuscripcion(form, `${origin}${wordpress.endpoint}`, `${origin}${wordpress.contextEndpoint}`);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, "/sobre-ti/");
  assert.equal(calls[1].url, "/wp-admin/admin-ajax.php");
  const fields = Object.fromEntries(new URLSearchParams(calls[1].body));
  assert.equal(fields._kb_form_id, wordpress.formId);
  assert.equal(fields._kb_form_post_id, wordpress.postId);
  assert.equal(fields._kb_form_verify, "123456abcd");
  assert.equal(fields.kb_field_0, "prueba+epistolas@example.invalid");
  assert.equal(fields.kb_field_1, "accept");
  const response = await fetch(`${origin}${wordpress.endpoint}?action=otra`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Cookie: "privado=1", Authorization: "privado" },
    body: "kb_field_0=prueba%40example.invalid&kb_field_1=accept&_kb_verify_email=&_kb_form_id=otro&_kb_form_post_id=1&action=kb_process_ajax_submit&_kb_form_verify=123456abcd",
  });
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("set-cookie"), null);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.match(response.headers.get("content-type"), /application\/json/);
  const last = calls.at(-1);
  assert.equal(last.url, "/wp-admin/admin-ajax.php");
  assert.equal(last.headers.cookie, undefined);
  assert.equal(last.headers.authorization, undefined);
  const forced = Object.fromEntries(new URLSearchParams(last.body));
  assert.equal(forced.action, "kb_process_ajax_submit");
  assert.equal(forced._kb_form_id, wordpress.formId);
  assert.equal(forced._kb_form_post_id, wordpress.postId);
  const polluted = await fetch(`${origin}${wordpress.endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: "action=otra&" + "x=&".repeat(1001),
  });
  assert.equal((await polluted.json()).success, false);
  assert.equal(calls.at(-1).body, "");
  const context = await fetch(`${origin}${wordpress.contextEndpoint}`);
  assert.match(context.headers.get("content-type"), /text\/plain/);
  assert.match(context.headers.get("content-security-policy"), /sandbox/);
  const count = calls.length;
  assert.equal((await fetch(`${origin}${wordpress.endpoint}`)).status, 405);
  assert.equal((await fetch(`${origin}${wordpress.contextEndpoint}`, { method: "POST" })).status, 405);
  assert.equal((await fetch(`${origin}${wordpress.endpoint}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })).status, 415);
  assert.equal((await fetch(`${origin}${wordpress.endpoint}`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: "x".repeat(4097) })).status, 413);
  assert.equal(calls.length, count);
  console.log("nginx: sintaxis, circuito simulado, destino fijo, privacidad y límites correctos. Sin altas reales.");
} finally {
  if (container) execFileSync("docker", ["stop", container], { stdio: "ignore" });
  await new Promise((done) => upstream.close(done));
  await rm(directory, { recursive: true, force: true });
}
