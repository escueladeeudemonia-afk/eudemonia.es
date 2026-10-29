# CreaTuVida · 13.ª edición · enero de 2027

Fran solicita el 29-oct-2026 actualizar la web y crear el nuevo producto y sus Payment Links en Stripe de la Fundación. La epístola #23 confirma **29, 30 y 31 de enero de 2027**, Residencia Salesiana, El Campello. Fran elige **abrir con tarifa anticipada**. Se conserva el descuento anterior del 20 %: **416 € particulares y pequeños autónomos / 624 € empresas**, sobre 520/780 €.

Fran confirma después el **17 de enero de 2027** como último día de la tarifa anticipada. Se publica hasta las 23:59 de Madrid; la tarifa general entra el **18-ene a las 00:00** (`2027-01-17T23:00:00Z`). Se prepara el cambio automático de web y la desactivación de los dos enlaces anticipados.

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

Publicación completada mediante [PR #68](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/68), commit `929c05c`, merge `ec29fce` a las **13:38:06 de Madrid**. CI completo aprobado ([ejecución 40874624593](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/40874624593)), incluidos los formularios y Analytics con envíos interceptados. A las **13:38:30–31** se verificaron las siete rutas públicas: HTTP 200, fechas nuevas, precios anticipados y enlaces correctos; sin aviso de cierre ni enlaces anteriores en la venta. Evidencia: `docs/evidencias/ctv-enero-2027/produccion-verificada.json`. El cambio de tarifa queda autorizado para el 18-ene a las 00:00 de Madrid. La fecha de cierre de inscripciones no se ha fijado; no confundirla con el fin de la anticipada ni reutilizar los programadores de octubre.
