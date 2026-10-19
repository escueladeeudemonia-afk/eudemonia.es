import assert from "node:assert/strict";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

export function comprobarSuscripcion({ home, epistolas }) {
  assert.ok(
    /<a\b[^>]*\bhref="\/epistolas\/#suscribirse"[^>]*>\s*Recibir las epístolas\s*<\/a>/.test(home),
    "Home: falta el enlace «Recibir las epístolas» a /epistolas/#suscribirse",
  );

  const section = epistolas.match(/<section\b[^>]*\bid="suscribirse"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(section, "Epístolas: falta la sección id=\"suscribirse\"");
  assert.ok(section.includes("scroll-mt-24"), "Epístolas: falta scroll-mt-24 en la sección de suscripción");
  assert.ok(
    section.includes("Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras."),
    "Epístolas: falta la línea exacta de suscripción",
  );

  const form = section.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
  const { formId, code, redirectUrl } = suscripcionEpistolas;
  assert.ok(
    form && form.includes(`action="https://static.mailerlite.com/webforms/submit/${code}"`) && form.includes('method="post"'),
    "Epístolas: falta el endpoint del nuevo formulario MailerLite",
  );
  assert.ok(section.includes(`id="mlb2-${formId}"`), "Epístolas: ID del formulario incorrecto");
  assert.ok(form.includes(`data-code="${code}"`), "Epístolas: código del formulario incorrecto");
  assert.ok(/<input\b[^>]*\btype="email"[^>]*\bname="fields\[email\]"[^>]*\brequired\b/.test(form), "Epístolas: falta el correo obligatorio");
  assert.ok(form.includes('name="fields[name]"'), "Epístolas: falta el campo nombre del formulario nuevo");
  assert.ok(/<input\b[^>]*\btype="checkbox"[^>]*\brequired\b/.test(form), "Epístolas: falta el checkbox RGPD obligatorio");
  assert.ok(/\bhref="\/privacidad\/"/.test(form), "Epístolas: falta el enlace a privacidad");
  assert.ok(form.includes('name="ml-submit" value="1"'), "Epístolas: falta ml-submit");
  assert.ok(form.includes('name="anticsrf" value="true"'), "Epístolas: falta anticsrf");
  assert.ok(section.includes(`function ml_webform_success_${formId}()`), "Epístolas: falta el callback del nuevo formulario");
  assert.ok(section.includes(redirectUrl), "Epístolas: falta el destino de gracias");
  assert.ok(!section.includes("kb_field_") && !section.includes("/api/newsletter/"), "Epístolas: quedan referencias a WordPress");
  const ids = [...epistolas.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "Epístolas: IDs DOM duplicados");
}
