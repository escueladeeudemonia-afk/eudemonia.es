import { readFile, writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

const { wordpress } = suscripcionEpistolas;
const source = new URL(wordpress.fallbackUrl);
const fixedFields = new URLSearchParams({ action: "kb_process_ajax_submit", _kb_form_id: wordpress.formId, _kb_form_post_id: wordpress.postId });

export function prepararCuerpoSuscripcion(body) {
  const fields = body.match(/^kb_field_0=([a-zA-Z0-9%+._~*-]{1,768})&kb_field_1=accept&_kb_verify_email=&_kb_form_id=[a-zA-Z0-9_-]+&_kb_form_post_id=[0-9]+&action=kb_process_ajax_submit&_kb_form_verify=([a-f0-9]{10})$/);
  return fields ? `kb_field_0=${fields[1]}&kb_field_1=accept&_kb_verify_email=&_kb_form_verify=${fields[2]}&${fixedFields}` : null;
}

export function generarProxySuscripcion() {
  if (source.origin !== "https://escueladeeudemonia.com" || !/^\d+_[\w-]+$/.test(wordpress.formId) || !/^\d+$/.test(wordpress.postId)) {
    throw new Error("Configuración del formulario original no válida");
  }
  const common = `
    resolver 127.0.0.11 valid=300s ipv6=off;
    resolver_timeout 5s;
    set $newsletter_host ${source.hostname};
    proxy_ssl_server_name on;
    proxy_ssl_verify on;
    proxy_ssl_trusted_certificate /etc/ssl/certs/ca-certificates.crt;
    proxy_pass_request_headers off;
    proxy_set_header Host ${source.hostname};
    proxy_set_header Connection "";
    proxy_http_version 1.1;
    proxy_hide_header Set-Cookie;
    proxy_hide_header Cache-Control;
    proxy_hide_header Expires;
    proxy_hide_header Content-Type;
    proxy_cache off;
    proxy_next_upstream off;
    proxy_connect_timeout 5s;
    proxy_read_timeout 20s;
    proxy_send_timeout 10s;
    add_header Cache-Control "no-store" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Content-Security-Policy "default-src 'none'; frame-ancestors 'none'; sandbox" always;
    access_log off;`;
  return `location = ${wordpress.contextEndpoint} {
    if ($request_method != GET) { return 405; }
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_pass https://$newsletter_host${source.pathname};
    add_header Content-Type "text/plain; charset=utf-8" always;
    ${common}
}

location = ${wordpress.endpoint} {
    if ($request_method != POST) { return 405; }
    if ($http_content_type !~* "^application/x-www-form-urlencoded(;|$)") { return 415; }
    client_max_body_size 4k;
    client_body_buffer_size 8k;
    proxy_request_buffering on;
    set $newsletter_fields "${fixedFields}";
    proxy_set_body $newsletter_payload;
    proxy_set_header Content-Type "application/x-www-form-urlencoded";
    proxy_pass https://$newsletter_host/wp-admin/admin-ajax.php;
    add_header Content-Type "application/json; charset=utf-8" always;
    ${common}
}
`;
}

export function crearMiddlewareSuscripcion(request = fetch) {
  return async (incoming, outgoing, next) => {
    const path = incoming.url?.split("?")[0];
    if (path !== wordpress.endpoint && path !== wordpress.contextEndpoint) return next();
    outgoing.setHeader("Cache-Control", "no-store");
    outgoing.setHeader("X-Content-Type-Options", "nosniff");
    outgoing.setHeader("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; sandbox");
    const context = path === wordpress.contextEndpoint;
    if (incoming.method !== (context ? "GET" : "POST")) {
      outgoing.writeHead(405).end();
      return;
    }
    try {
      let body;
      if (!context) {
        if (!/^application\/x-www-form-urlencoded(?:;|$)/i.test(incoming.headers["content-type"] ?? "")) {
          outgoing.writeHead(415).end();
          return;
        }
        const chunks = [];
        let size = 0;
        for await (const chunk of incoming) {
          size += Buffer.byteLength(chunk);
          if (size > 4096) {
            outgoing.writeHead(413).end();
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        body = prepararCuerpoSuscripcion(Buffer.concat(chunks).toString("utf8"));
        if (!body) {
          outgoing.writeHead(400).end();
          return;
        }
      }
      const upstream = await request(context ? `${source.origin}${source.pathname}` : `${source.origin}/wp-admin/admin-ajax.php`, {
        method: context ? "GET" : "POST",
        body,
        headers: context ? {} : { "Content-Type": "application/x-www-form-urlencoded" },
        redirect: "error",
        signal: AbortSignal.timeout(context ? 15000 : 25000),
      });
      outgoing.setHeader("Content-Type", context ? "text/plain; charset=utf-8" : "application/json; charset=utf-8");
      outgoing.writeHead(upstream.status).end(await upstream.text());
    } catch {
      outgoing.writeHead(502).end();
    }
  };
}

export function proxySuscripcion() {
  const configure = (server) => { server.middlewares.use(crearMiddlewareSuscripcion()); };
  return { name: "suscripcion-wordpress", configureServer: configure, configurePreviewServer: configure };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const directory = new URL("../.astro/", import.meta.url);
  await mkdir(directory, { recursive: true });
  await writeFile(new URL("suscripcion.nginx.conf", directory), generarProxySuscripcion());
  const nginx = await readFile(new URL("../nginx.conf", import.meta.url), "utf8");
  if (!nginx.includes("include /etc/nginx/suscripcion.conf;")) throw new Error("nginx no incluye el proxy de suscripción");
}
