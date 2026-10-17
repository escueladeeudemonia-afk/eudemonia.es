import assert from "node:assert/strict";

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
  assert.ok(
    form && /\baction="https:\/\/static\.mailerlite\.com\/webforms\/submit\/[a-zA-Z0-9]+"/.test(form),
    "Epístolas: falta un formulario con action https://static.mailerlite.com/webforms/submit/<code> y code no vacío; pendiente crear el formulario de Newsletter Eudemonía en MailerLite EDE",
  );
  assert.ok(/\bid="mlb2-\d+"/.test(section), "Epístolas: falta el formId numérico de MailerLite");
  assert.ok(/<input\b[^>]*\btype="checkbox"[^>]*\brequired\b/.test(form), "Epístolas: falta el checkbox RGPD obligatorio");
  assert.ok(/\bhref="\/privacidad\/?"/.test(form), "Epístolas: falta el enlace a la política de privacidad");
}
