# CreaTuVida · 13.ª edición · enero de 2027

Fran solicita el 29-oct-2026 actualizar la web y crear el nuevo producto y sus Payment Links en Stripe de la Fundación. La epístola #23 confirma **29, 30 y 31 de enero de 2027**, Residencia Salesiana, El Campello. Fran elige **abrir con tarifa anticipada**. Se conserva el descuento anterior del 20 %: **416 € particulares y pequeños autónomos / 624 € empresas**, sobre 520/780 €.

La fecha de fin de la tarifa anticipada está pendiente de respuesta. No se publica ni programa una fecha supuesta. Se han preparado también las tarifas generales para efectuar el cambio cuando se acuerde.

## Stripe

Cuenta verificada mediante API: **Fundación Escuela de Eudemonía**, `acct_1UJX36DSZpK2mD7f`, entorno real, cobros habilitados. Producto nuevo: `prod_VWwNh7gtKVT05T`, «CreaTuVida Enero 2027 · 13.ª edición».

| Modalidad | Importe | Payment Link |
|---|---:|---|
| Particulares, anticipada | 416 € | https://book.stripe.com/28EbJ15tD6Qd6yy75gdEs07 |
| Empresas, anticipada | 624 € | https://book.stripe.com/4gMeVd3lv1vT1eeahsdEs08 |
| Particulares, general | 520 € | https://book.stripe.com/7sYcN57BLb6t4qq4X8dEs09 |
| Empresas, general | 780 € | https://book.stripe.com/aFa14n6xH5M9aOO4X8dEs0a |

El inventario exacto de IDs, precios y URLs está en `docs/evidencias/ctv-enero-2027/stripe-catalogo.json`. Las cuatro líneas se consultaron después de crearlas: producto correcto, EUR, pago único, cantidad 1 e importes correctos. Se usaron claves de idempotencia en las creaciones.

Se conservan las condiciones de octubre: impuestos automáticos y creación de factura desactivados; precios con `tax_behavior=unspecified`; sin códigos promocionales en tarifa anticipada y admitidos en la general; redirección a `https://escueladeeudemonia.com/creatuvida/gracias-ctv/`. Se añade recogida obligatoria del nombre y metadatos de edición/tarifa en enlace y PaymentIntent. Medios de pago dinámicos de la cuenta.

Los dos checkouts anticipados se abrieron en Chromium: comercio, fechas, producto e importe verificados, sin introducir datos ni hacer pagos. La página de gracias y la logística devuelven HTTP 200. No se enviaron correos ni se comprobó una automatización de confirmación de inscripción. La consulta de webhooks propios devuelve una lista vacía; no permite inferir el estado de automatizaciones externas. Los productos y enlaces de octubre permanecen sin modificar.

Acceso: el conector de Stripe de la app repite la solicitud de autenticación. Se utiliza la clave restringida de la Fundación mediante `ai-op run`, referencia en `/home/fran/projects/escuela-de-eudemonia/repo/config/stripe.1password.env`; procedimiento en `docs/stripe-api.md` de aquel repo. Ninguna clave se copia a la web ni a estas evidencias.

## Web y validación

- Nueva edición en SEO, cabecera, calendario y cierre de `/creatuvida/`; inscripciones abiertas y botones con los dos nuevos enlaces anticipados.
- Fechas y precios coherentes en portada, La Escuela, Fundación, Participa y Transparencia. Fecha corregida también en la portada provisional.
- Horarios, lugar, facilitadores, alojamiento aparte y destino de los ingresos conservados.
- `npm run check`: sin errores ni advertencias, cinco sugerencias anteriores. `npm test`, `npm run build` y `npm run smoke`: correctos, 66 episodios/reproductores. HTML comprobado: nuevas fechas, precios y enlaces; sin aviso de cierre ni enlaces de octubre.
- Programadores antiguos desactivados antes de reabrir: timer `eudemonia-creatuvida-cierre-20261018.timer` y workflows `creatuvida-cierre-18-oct.yml` / `creatuvida-precios-5-oct.yml`. La PR #45 se había fusionado el 18-oct a las 21:59:03 UTC; su timer ya no tenía próxima ejecución.

Publicación mediante PR a `main` y despliegue automático de Coolify. Comprobar la página pública después de fusionar. El cambio de tarifa y la fecha de cierre de inscripciones de enero requieren concretar sus fechas; no reutilizar los programadores de octubre.
