# Confirmación de CreaTuVida en eudemonia.es

Fran pide trasladar la página de gracias del `.com` y conservar el recorrido de compra. Se publica `/creatuvida/gracias-ctv/` con el layout y los estilos de marca, `noindex,nofollow` y exclusión del sitemap. No emite conversiones por visitar o recargar la página ni acredita por sí misma un pago.

Se conserva la solicitud de factura: ocho campos y procesamiento Kadence original, formulario `3431_3db68d-cd` de la página WordPress 3431. El plugin específico `factura-ctv` del repositorio común proporciona un nonce público actual en `GET /wp-json/ede/v1/factura-ctv` y permite el POST de ese formulario desde `https://eudemonia.es` y `https://www.eudemonia.es`. Ambas peticiones del navegador usan `credentials: omit`: no comparten cookies de alumnos. No se copian destinatarios ni acciones de correo al frontend. El formulario conserva honeypot, validación y mensajes; bloquea envíos duplicados y permite reintentar un error.

El botón «Acceder» conserva `https://escueladeeudemonia.com/`: el plugin independiente `acceso-con-sesion` reconoce la cookie al llegar a WordPress y devuelve 302 al Ágora, sin caché, solo en la portada 2808 con GET/HEAD y sin parámetros. Recuperación, login y permisos de alumnos se conservan.

La operación en Stripe cambia exclusivamente `after_completion.redirect.url` en los cuatro enlaces vigentes de febrero de 2027. Se añade una 301 exacta de `/creatuvida/gracias-ctv/` del `.com` al `.es`, conservando parámetros. Informe operativo, copias y diarios: `repo/docs/2026-11-04-acceder-y-gracias-ctv.md` del espacio común.

## Validación

`check`, `test`, `build`, `smoke`; `scripts/comprobar-factura-ctv.mjs` comprueba validación, errores de configuración/red/servidor, éxito y doble envío en 1365, 390 y 320 px. Todas las escrituras se interceptan. Admite `CTV_TEST_ORIGIN=https://eudemonia.es` para comprobar el HTML/JS publicado y `CTV_SCREENSHOTS=<carpeta>` para capturas. No manda correos ni datos a Analytics.

## Revertir

Primero restaurar las URL de Stripe y desactivar la nueva 301 con los operadores del informe común. Después abrir una PR que revierta este cambio, con las mismas comprobaciones y fusión a `main`. El adaptador WP solo debe desactivarse cuando deje de usarse el formulario nuevo. La página WP original sigue intacta. Conviene mantener disponible la página nueva durante la transición por los 301 que puedan haber guardado los navegadores. No tocar el programador de tarifas ni la PR futura #71.
