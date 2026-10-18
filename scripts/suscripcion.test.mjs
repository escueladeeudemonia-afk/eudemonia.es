import test from "node:test";
import assert from "node:assert/strict";
import { Readable } from "node:stream";
import { readFile } from "node:fs/promises";
import { enviarSuscripcion, obtenerNonce } from "../src/scripts/suscripcion.mjs";
import { crearMiddlewareSuscripcion, generarProxySuscripcion, prepararCuerpoSuscripcion } from "./proxy-suscripcion.mjs";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

const { wordpress } = suscripcionEpistolas;
const html = `<input name="_kb_form_id" value="${wordpress.formId}"><script>var kadence_blocks_form_params = {"nonce":"123456abcd","ajaxurl":"https://escueladeeudemonia.com/wp-admin/admin-ajax.php"};</script>`;
const data = () => {
  const form = new FormData();
  for (const [name, value] of Object.entries({ kb_field_0: "prueba+epistolas@example.invalid", kb_field_1: "accept", _kb_verify_email: "", _kb_form_id: wordpress.formId, _kb_form_post_id: wordpress.postId, action: "kb_process_ajax_submit" })) {
    form.set(name, value);
  }
  return form;
};

test("lee el token público del formulario original sin ejecutar su HTML o JS", () => {
  assert.equal(obtenerNonce(html, wordpress.formId), "123456abcd");
  for (const page of ["", html.replace(wordpress.formId, "otro"), html.replace("123456abcd", "incorrecto"), html.replace('{"nonce":', '{nonce:')]) {
    assert.throws(() => obtenerNonce(page, wordpress.formId));
  }
});

test("envía una sola solicitud con consentimiento y token, sin cookies", async () => {
  const calls = [];
  const request = async (url, options) => {
    calls.push({ url, options });
    return calls.length === 1 ? new Response(html) : Response.json({ success: true, html: "<script>ignorado</script>" });
  };
  await enviarSuscripcion(data(), wordpress.endpoint, wordpress.contextEndpoint, request);
  assert.equal(calls.length, 2);
  assert.equal(calls[0].url, wordpress.contextEndpoint);
  assert.equal(calls[1].url, wordpress.endpoint);
  assert.equal(calls[1].options.method, "POST");
  assert.equal(calls[1].options.body.get("kb_field_0"), "prueba+epistolas@example.invalid");
  assert.equal(calls[1].options.body.get("kb_field_1"), "accept");
  assert.equal(calls[1].options.body.get("_kb_form_verify"), "123456abcd");
  assert.equal(calls[1].options.body.get("_kb_form_id"), wordpress.formId);
  for (const call of calls) {
    assert.equal(call.options.credentials, "omit");
    assert.equal(call.options.redirect, "error");
  }
});

test("no contacta WordPress sin consentimiento o si se activa el antispam", async () => {
  for (const field of ["kb_field_1", "_kb_verify_email"]) {
    const form = data();
    form.set(field, "incorrecto");
    await assert.rejects(enviarSuscripcion(form, wordpress.endpoint, wordpress.contextEndpoint, () => assert.fail("No debe haber peticiones")), /incompleto/);
  }
});

test("no envía el correo si falla la lectura del formulario original", async () => {
  for (const response of [new Response("", { status: 503 }), new Response("HTML cambiado")]) {
    let calls = 0;
    await assert.rejects(enviarSuscripcion(data(), wordpress.endpoint, wordpress.contextEndpoint, async () => {
      calls++;
      return response;
    }));
    assert.equal(calls, 1);
  }
});

test("no confirma ni reintenta errores de red, HTTP, JSON o rechazo de Kadence", async () => {
  for (const response of [new Response("", { status: 502 }), new Response("no es JSON"), Response.json({ success: false }), Response.json({ success: "true" }), new Error("Timeout")]) {
    let calls = 0;
    await assert.rejects(enviarSuscripcion(data(), wordpress.endpoint, wordpress.contextEndpoint, async () => {
      calls++;
      if (calls === 1) return new Response(html);
      if (response instanceof Error) throw response;
      return response;
    }));
    assert.equal(calls, 2);
  }
});

const validBody = `kb_field_0=prueba%40example.invalid&kb_field_1=accept&_kb_verify_email=&_kb_form_id=${wordpress.formId}&_kb_form_post_id=${wordpress.postId}&action=kb_process_ajax_submit&_kb_form_verify=123456abcd`;

async function invoke({ path = wordpress.endpoint, method = "POST", type = "application/x-www-form-urlencoded", body = validBody, request }) {
  const incoming = Readable.from([body]);
  incoming.url = path;
  incoming.method = method;
  incoming.headers = { "content-type": type, cookie: "secreto", authorization: "secreto" };
  const result = { headers: {}, status: undefined, body: undefined, next: false };
  const outgoing = {
    setHeader: (name, value) => { result.headers[name] = value; },
    writeHead: (status) => { result.status = status; return outgoing; },
    end: (value) => { result.body = value; },
  };
  await crearMiddlewareSuscripcion(request)(incoming, outgoing, () => { result.next = true; });
  return result;
}

test("preview conserva el destino fijo y no reenvía credenciales, cookies ni query", async () => {
  const result = await invoke({
    path: `${wordpress.endpoint}?action=otra`,
    body: validBody.replace(wordpress.formId, "otro").replace(`_kb_form_post_id=${wordpress.postId}`, "_kb_form_post_id=1"),
    request: async (url, options) => {
      assert.equal(url, "https://escueladeeudemonia.com/wp-admin/admin-ajax.php");
      assert.deepEqual(options.headers, { "Content-Type": "application/x-www-form-urlencoded" });
      const fields = Object.fromEntries(new URLSearchParams(options.body));
      assert.equal(fields.action, "kb_process_ajax_submit");
      assert.equal(fields._kb_form_id, wordpress.formId);
      assert.equal(fields._kb_form_post_id, wordpress.postId);
      return Response.json({ success: true }, { headers: { "Set-Cookie": "no-reenviar" } });
    },
  });
  assert.equal(result.status, 200);
  assert.equal(result.headers["Cache-Control"], "no-store");
  assert.equal(result.headers["Set-Cookie"], undefined);
});

test("preview sirve el contexto como texto inerte, sin ejecutar HTML del .com", async () => {
  const result = await invoke({ path: wordpress.contextEndpoint, method: "GET", request: async (url, options) => {
    assert.equal(url, "https://escueladeeudemonia.com/sobre-ti/");
    assert.equal(options.body, undefined);
    return new Response(html);
  } });
  assert.equal(result.status, 200);
  assert.equal(result.headers["Content-Type"], "text/plain; charset=utf-8");
  assert.match(result.headers["Content-Security-Policy"], /sandbox/);
});

test("preview rechaza métodos, formatos y cuerpos grandes antes del upstream", async () => {
  const request = () => assert.fail("No debe contactar WordPress");
  for (const [options, status] of [[{ method: "GET" }, 405], [{ path: wordpress.contextEndpoint }, 405], [{ type: "application/json" }, 415], [{ body: "x".repeat(4097) }, 413], [{ body: validBody + "&action=otra" }, 400]]) {
    assert.equal((await invoke({ ...options, request })).status, status);
  }
  assert.equal((await invoke({ path: "/otra/", request })).next, true);
});

test("preview comunica errores de conexión sin exponer datos", async () => {
  const result = await invoke({ request: async () => { throw new Error("dato privado"); } });
  assert.equal(result.status, 502);
  assert.equal(result.body, undefined);
});

test("nginx fija formulario y acción, valida TLS y limita tamaño, métodos y reintentos", () => {
  const config = generarProxySuscripcion();
  for (const value of [wordpress.endpoint, wordpress.contextEndpoint, `&_kb_form_id=${wordpress.formId}&_kb_form_post_id=${wordpress.postId}`, 'proxy_set_body $newsletter_payload;', "proxy_ssl_verify on;", "proxy_pass_request_headers off;", "proxy_hide_header Set-Cookie;", "client_max_body_size 4k;", "proxy_next_upstream off;", "return 405;", "return 415;", 'Cache-Control "no-store"']) {
    assert.ok(config.includes(value), value);
  }
});

test("descarta parámetros extra, duplicados y contaminación de los IDs fijados", () => {
  const safe = prepararCuerpoSuscripcion(validBody);
  assert.equal(new URLSearchParams(safe).get("_kb_form_id"), wordpress.formId);
  for (const body of [validBody + "&action=otra", "action=otra&" + validBody, validBody.replace("kb_field_1=accept", "kb_field_1="), validBody.replace("_kb_verify_email=", "_kb_verify_email=bot"), validBody + "&x=".repeat(1001)]) {
    assert.equal(prepararCuerpoSuscripcion(body), null);
  }
});

test("el mapa nginx aplica la misma lista cerrada que preview", async () => {
  const nginx = await readFile(new URL("../nginx.conf", import.meta.url), "utf8");
  const pattern = nginx.match(/"~(\^kb_field_0=[^"\n]+)"/);
  assert.ok(pattern, "Falta el mapa regex de nginx");
  const matcher = new RegExp(pattern[1]);
  for (const body of [validBody, validBody + "&action=otra", validBody.replace("_kb_verify_email=", "_kb_verify_email=bot"), validBody.replace("kb_field_1=accept", "kb_field_1=")]) {
    assert.equal(matcher.test(body), prepararCuerpoSuscripcion(body) !== null);
  }
  assert.match(nginx, /map \$request_body \$newsletter_payload/);
  assert.match(nginx, /default "";/);
});
