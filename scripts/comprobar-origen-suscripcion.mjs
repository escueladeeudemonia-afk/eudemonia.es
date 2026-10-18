import assert from "node:assert/strict";
import { suscripcionEpistolas } from "../src/data/suscripcion.mjs";
import { obtenerNonce } from "../src/scripts/suscripcion.mjs";

const { wordpress } = suscripcionEpistolas;
const response = await fetch(wordpress.fallbackUrl, { signal: AbortSignal.timeout(20000) });
assert.equal(response.status, 200, "El formulario original no responde 200");
const html = await response.text();
obtenerNonce(html, wordpress.formId);
const form = [...html.matchAll(/<form\b[^>]*>[\s\S]*?<\/form>/g)].map((match) => match[0]).find((value) => value.includes(`value="${wordpress.formId}"`));
assert.ok(form, "No se encuentra el formulario original");
for (const value of ['name="kb_field_0"', 'name="kb_field_1"', 'name="_kb_verify_email"', `value="${wordpress.postId}"`, 'value="kb_process_ajax_submit"']) assert.ok(form.includes(value), value);
assert.ok(!/recaptcha_response|g-recaptcha-response/.test(form), "El formulario original ahora necesita reCAPTCHA: revisar la integración");
console.log("Formulario original y token verificados mediante GET público. Ninguna alta ni envío.");
