import test from "node:test";
import assert from "node:assert/strict";
import { comprobarSuscripcion } from "./comprobar-suscripcion.mjs";

const home = '<a href="/epistolas/#suscribirse">Recibir las epístolas</a>';
const epistolas = `
  <section id="suscribirse" class="scroll-mt-24">
    <p>Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras.</p>
    <div id="mlb2-6138835">
      <form action="https://static.mailerlite.com/webforms/submit/c2f9e8" method="post" data-code="c2f9e8">
        <input type="text" name="fields[name]">
        <input type="email" name="fields[email]" required>
        <input type="checkbox" required>
        <input type="hidden" name="ml-submit" value="1">
        <input type="hidden" name="anticsrf" value="true">
        <a href="/privacidad/">política de privacidad</a>
      </form>
    </div>
    <script>function ml_webform_success_6138835(){window.location.href="https://eudemonia.es/gracias/"}</script>
  </section>`;

test("acepta el formulario proporcionado por Fran con consentimiento y destino de gracias", () => {
  assert.doesNotThrow(() => comprobarSuscripcion({ home, epistolas }));
});

test("rechaza los formularios de regalos y el proxy anterior", () => {
  for (const destination of ["d4r9a4", "g0r3z2", "/api/newsletter/"]) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replaceAll("c2f9e8", destination) }), /endpoint/);
  }
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replaceAll("6138835", "6132167") }), /ID/);
});

test("exige el correo, consentimiento, callback y parámetros de MailerLite", () => {
  for (const value of ['name="fields[email]"', 'type="checkbox"', '/privacidad/', 'name="ml-submit"', 'name="anticsrf"', 'function ml_webform_success_6138835()', 'https://eudemonia.es/gracias/']) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace(value, "") }));
  }
});

test("mantiene el ancla de suscripción, el copy y el enlace desde la portada", () => {
  for (const value of ['id="suscribirse"', 'scroll-mt-24', 'Gratis,']) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace(value, "") }));
  }
  assert.throws(() => comprobarSuscripcion({ home: home.replace('/#', '#'), epistolas }), /Home/);
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas + '<div id="suscribirse"></div>' }), /duplicados/);
});
