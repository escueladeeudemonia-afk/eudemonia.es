// Comprueba el TLS real del proxy usando exclusivamente GET, sin altas ni correos.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { setTimeout } from "node:timers/promises";
import { generarProxySuscripcion } from "./proxy-suscripcion.mjs";
import { obtenerNonce } from "../src/scripts/suscripcion.mjs";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

const docker = (args) => execFileSync("docker", args, { encoding: "utf8" }).trim();
const network = `eudemonia-newsletter-${randomUUID()}`;
await mkdir(".astro", { recursive: true });
const directory = await mkdtemp(resolve(".astro/nginx-origen-"));
let networkCreated = false;
let container;
try {
  // Red propia: Docker habilita su resolver 127.0.0.11, igual que en Coolify.
  await writeFile(`${directory}/default.conf`, await readFile("nginx.conf", "utf8"));
  await writeFile(`${directory}/suscripcion.conf`, generarProxySuscripcion());
  docker(["network", "create", network]);
  networkCreated = true;
  container = docker(["run", "--rm", "-d", "--network", network,
    "-p", "127.0.0.1::80",
    "-v", `${directory}/default.conf:/etc/nginx/conf.d/default.conf:ro`,
    "-v", `${directory}/suscripcion.conf:/etc/nginx/suscripcion.conf:ro`,
    "-v", `${resolve("dist")}:/usr/share/nginx/html:ro`, "nginx:alpine"]);
  const binding = docker(["port", container, "80/tcp"]);
  assert.match(binding, /^127\.0\.0\.1:\d+$/);
  const origin = `http://${binding}`;
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try {
      const response = await fetch(origin, { signal: AbortSignal.timeout(1000) });
      assert.equal(response.status, 200);
      ready = true;
      break;
    } catch {
      await setTimeout(250);
    }
  }
  assert.ok(ready, "nginx no arrancó");
  const response = await fetch(`${origin}${suscripcionEpistolas.wordpress.contextEndpoint}`, {
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(response.status, 200, "El proxy debe validar TLS y recuperar el formulario real");
  assert.match(response.headers.get("content-type"), /text\/plain/);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.equal(response.headers.get("set-cookie"), null);
  obtenerNonce(await response.text(), suscripcionEpistolas.wordpress.formId);
  console.log("nginx: DNS, TLS y token del origen real verificados solo mediante GET. Ninguna alta ni envío.");
} catch (error) {
  if (container) process.stderr.write(docker(["logs", "--tail", "10", container]));
  throw error;
} finally {
  try {
    if (container) docker(["stop", container]);
  } finally {
    try {
      if (networkCreated) docker(["network", "rm", network]);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  }
}
