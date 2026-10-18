import test from "node:test";
import assert from "node:assert/strict";
import { comprobarSuscripcion } from "./comprobar-suscripcion.mjs";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";

const { wordpress } = suscripcionEpistolas;
const home = '<a href="/epistolas/#suscribirse">Recibe la epístola mensual</a>';
const epistolas = `
  <section id="suscribirse" class="scroll-mt-24">
    <p>Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras.</p>
    <form action="${wordpress.endpoint}" method="post" data-newsletter-wordpress="true" data-context-url="${wordpress.contextEndpoint}">
      <input type="email" name="kb_field_0" required>
      <input type="checkbox" name="kb_field_1" value="accept" required>
      <input type="hidden" name="_kb_form_id" value="${wordpress.formId}">
      <input type="hidden" name="_kb_form_post_id" value="${wordpress.postId}">
      <input type="hidden" name="action" value="kb_process_ajax_submit">
      <input name="_kb_verify_email">
      <a href="/privacidad/">política de privacidad</a>
    </form>
    <a href="${wordpress.fallbackUrl}">Formulario original</a>
  </section>`;

test("acepta el formulario original con ancla, copy, RGPD y acceso desde la home", () => {
  assert.doesNotThrow(() => comprobarSuscripcion({ home, epistolas }));
});

test("bloquea formulario ausente, destino incorrecto y los embeds antiguos", () => {
  for (const page of [
    epistolas.replace(/<form\b[\s\S]*?<\/form>/, ""),
    epistolas.replace(`action="${wordpress.endpoint}"`, 'action="https://static.mailerlite.com/webforms/submit/f1v7e1"'),
    epistolas.replace('method="post"', 'method="get"'),
  ]) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: page }), /endpoint/);
  }
});

test("bloquea IDs, token o controlador del formulario ausentes", () => {
  for (const value of [wordpress.formId, wordpress.postId, 'data-context-url="', 'data-newsletter-wordpress="']) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replaceAll(value, "") }));
  }
});

test("exige el formulario dentro de la sección estable de suscripción", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace('id="suscribirse"', 'id="otro"') }), /sección/);
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("scroll-mt-24", "") }), /scroll-mt-24/);
  const outside = epistolas.replace(/<form\b[\s\S]*?<\/form>/, "") + epistolas.match(/<form\b[\s\S]*?<\/form>/)[0];
  assert.throws(() => comprobarSuscripcion({ home, epistolas: outside }), /endpoint/);
});

test("exige el texto aprobado, la barra final y el acceso desde la home", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("Gratis,", "Gratuita,") }), /línea exacta/);
  for (const page of [home.replace("/epistolas/#", "/epistolas#"), home.replace("Recibe", "Lee"), ""]) {
    assert.throws(() => comprobarSuscripcion({ home: page, epistolas }), /Home/);
  }
});

test("exige correo, consentimiento enviado, antispam, privacidad y alternativa", () => {
  for (const value of ['name="kb_field_0"', 'type="checkbox"', 'name="kb_field_1"', 'name="_kb_verify_email"', "/privacidad/", wordpress.fallbackUrl]) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace(value, "") }));
  }
});

test("rechaza IDs duplicados", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas + '<div id="suscribirse"></div>' }), /duplicados/);
});
