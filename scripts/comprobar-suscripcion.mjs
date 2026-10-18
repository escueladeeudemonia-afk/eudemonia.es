import assert from "node:assert/strict";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

export function comprobarSuscripcion({ home, epistolas }) {
  assert.ok(
    /<a\b[^>]*\bhref="\/epistolas\/#suscribirse"[^>]*>\s*Recibe la epístola mensual\s*<\/a>/.test(home),
    "Home: falta el enlace «Recibe la epístola mensual» a /epistolas/#suscribirse",
  );

  const section = epistolas.match(/<section\b[^>]*\bid="suscribirse"[^>]*>[\s\S]*?<\/section>/)?.[0];
  assert.ok(section, "Epístolas: falta la sección id=\"suscribirse\"");
  assert.ok(section.includes("scroll-mt-24"), "Epístolas: falta scroll-mt-24 en la sección de suscripción");
  assert.ok(
    section.includes("Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras."),
    "Epístolas: falta la línea exacta de suscripción",
  );

  const form = section.match(/<form\b[^>]*>[\s\S]*?<\/form>/)?.[0];
  const { wordpress } = suscripcionEpistolas;
  assert.ok(
    form && form.includes(`action="${wordpress.endpoint}"`) && form.includes('method="post"'),
    "Epístolas: falta el formulario conectado al endpoint de la newsletter existente",
  );
  for (const [name, value] of Object.entries({ _kb_form_id: wordpress.formId, _kb_form_post_id: wordpress.postId, action: "kb_process_ajax_submit" })) {
    assert.ok(form.includes(`name="${name}" value="${value}"`), `Epístolas: falta ${name} del formulario original`);
  }
  assert.ok(form.includes('data-newsletter-wordpress="true"'), "Epístolas: falta el controlador del formulario");
  assert.ok(form.includes(`data-context-url="${wordpress.contextEndpoint}"`), "Epístolas: falta el origen del token de WordPress");
  assert.ok(/<input\b[^>]*\btype="email"[^>]*\bname="kb_field_0"[^>]*\brequired\b/.test(form), "Epístolas: falta el correo obligatorio");
  assert.ok(/<input\b[^>]*\btype="checkbox"[^>]*\brequired\b/.test(form), "Epístolas: falta el checkbox RGPD obligatorio");
  assert.ok(form.includes('name="kb_field_1" value="accept"'), "Epístolas: falta enviar el consentimiento al formulario original");
  assert.ok(form.includes('name="_kb_verify_email"'), "Epístolas: falta el campo antispam");
  assert.ok(/\bhref="\/privacidad\/?"/.test(form), "Epístolas: falta el enlace a la política de privacidad");
  assert.ok(section.includes(`href="${wordpress.fallbackUrl}"`), "Epístolas: falta el enlace al formulario original como alternativa");
  const ids = [...epistolas.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
  assert.equal(new Set(ids).size, ids.length, "Epístolas: IDs DOM duplicados");
  assert.ok(!section.includes("static.mailerlite.com/webforms/submit/"), "Epístolas: no usar un embed antiguo o sin configurar");
}
