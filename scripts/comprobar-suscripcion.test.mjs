import test from "node:test";
import assert from "node:assert/strict";
import { comprobarSuscripcion } from "./comprobar-suscripcion.mjs";

const home = '<a href="/epistolas/#suscribirse">Recibir las epístolas</a>';
const epistolas = `
  <section id="suscribirse" class="scroll-mt-24">
    <p>Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras.</p>
    <div id="mlb2-47845314">
      <form action="https://dashboard.mailerlite.com/jsonp/2756175/forms/202778189574964505/subscribe" method="post" data-code="">
        <input type="text" name="fields[name]">
        <input type="email" name="fields[email]" required>
        <input type="checkbox" required>
        <input type="hidden" name="ml-submit" value="1">
        <input type="hidden" name="anticsrf" value="true">
        <a href="/privacidad/">política de privacidad</a>
      </form>
    </div>
    <script>function ml_webform_success_47845314(){window.location.href="https://eudemonia.es/gracias/"}</script>
  </section>`;

test("acepta el formulario proporcionado por Fran con consentimiento y destino de gracias", () => {
  assert.doesNotThrow(() => comprobarSuscripcion({ home, epistolas }));
});

test("rechaza los formularios de regalos y el proxy anterior", () => {
  for (const destination of ["202778184196818343", "202778185704670640", "/api/newsletter/"]) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replaceAll("202778189574964505", destination) }), /endpoint/);
  }
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replaceAll("47845314", "47845308") }), /ID/);
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("/2756175/", "/1064872/") }), /endpoint/);
});

test("exige el correo, consentimiento, callback y parámetros de MailerLite", () => {
  for (const value of ['name="fields[email]"', 'type="checkbox"', '/privacidad/', 'name="ml-submit"', 'name="anticsrf"', 'function ml_webform_success_47845314()', 'https://eudemonia.es/gracias/']) {
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
