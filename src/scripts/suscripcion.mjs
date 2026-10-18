export function obtenerNonce(html, formId) {
  if (!html.includes(`value="${formId}"`)) throw new Error("El formulario original ha cambiado");
  const config = html.match(/\bkadence_blocks_form_params\s*=\s*(\{[^<]*?\})\s*;/)?.[1];
  const nonce = config ? JSON.parse(config).nonce : undefined;
  if (typeof nonce !== "string" || !/^[a-f0-9]{10}$/.test(nonce)) {
    throw new Error("No se encuentra el token del formulario original");
  }
  return nonce;
}

export async function enviarSuscripcion(formData, endpoint, contextEndpoint, request = fetch) {
  if (!contextEndpoint || formData.get("kb_field_1") !== "accept" || formData.get("_kb_verify_email")) {
    throw new Error("Formulario incompleto");
  }
  const context = await request(contextEndpoint, {
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(15000),
  });
  if (!context.ok) throw new Error("Formulario original no disponible");
  const nonce = obtenerNonce(await context.text(), formData.get("_kb_form_id"));
  const body = new URLSearchParams();
  for (const field of ["kb_field_0", "kb_field_1", "_kb_verify_email", "_kb_form_id", "_kb_form_post_id", "action"]) {
    body.set(field, String(formData.get(field) ?? ""));
  }
  body.set("_kb_form_verify", nonce);
  const response = await request(endpoint, {
    method: "POST",
    body,
    credentials: "omit",
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok || (await response.json())?.success !== true) {
    throw new Error("El formulario original no confirmó la solicitud");
  }
}
