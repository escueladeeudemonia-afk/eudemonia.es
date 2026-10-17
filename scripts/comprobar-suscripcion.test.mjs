import test from "node:test";
import assert from "node:assert/strict";
import { comprobarSuscripcion } from "./comprobar-suscripcion.mjs";

const home = '<a href="/epistolas/#suscribirse">Recibe la epístola mensual</a>';
const epistolas = `
  <section id="suscribirse" class="scroll-mt-24">
    <p>Una carta al mes, para leer con calma. Gratis, y te puedes ir cuando quieras.</p>
    <div id="mlb2-1234567">
      <form action="https://static.mailerlite.com/webforms/submit/abc123" method="post">
        <input type="checkbox" required>
        <a href="/privacidad/">política de privacidad</a>
      </form>
    </div>
  </section>`;

test("acepta un formulario configurado con ancla, copy, RGPD y acceso desde la home", () => {
  assert.doesNotThrow(() => comprobarSuscripcion({ home, epistolas }));
});

test("bloquea un code vacío y un formulario ausente o con destino distinto", () => {
  for (const page of [
    epistolas.replace("submit/abc123", "submit/"),
    epistolas.replace(/<form\b[\s\S]*?<\/form>/, ""),
    epistolas.replace("https://static.mailerlite.com", "https://example.com"),
  ]) {
    assert.throws(() => comprobarSuscripcion({ home, epistolas: page }), /code no vacío/);
  }
});

test("bloquea un formId vacío aunque haya code", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("mlb2-1234567", "mlb2-") }), /formId/);
});

test("exige el formulario dentro de la sección estable de suscripción", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace('id="suscribirse"', 'id="otro"') }), /sección/);
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("scroll-mt-24", "") }), /scroll-mt-24/);
  const outside = epistolas.replace(/<form\b[\s\S]*?<\/form>/, "") + epistolas.match(/<form\b[\s\S]*?<\/form>/)[0];
  assert.throws(() => comprobarSuscripcion({ home, epistolas: outside }), /code no vacío/);
});

test("exige el texto aprobado sin cambios", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("Gratis,", "Gratuita,") }), /línea exacta/);
});

test("exige la barra final y el texto del acceso desde la home", () => {
  for (const page of [home.replace("/epistolas/#", "/epistolas#"), home.replace("Recibe", "Lee"), ""]) {
    assert.throws(() => comprobarSuscripcion({ home: page, epistolas }), /Home/);
  }
});

test("exige el consentimiento obligatorio y el enlace de privacidad", () => {
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace(" required", "") }), /RGPD/);
  assert.throws(() => comprobarSuscripcion({ home, epistolas: epistolas.replace("/privacidad/", "/otra/") }), /privacidad/);
});
