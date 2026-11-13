# CreaTuVida · 5, 6 y 7 de marzo de 2027

Fran confirma el 13-nov-2026 el traslado de la 13.ª edición desde el 26–28 de febrero al **5–7 de marzo de 2027** y pide actualizar eudemonia.es.

## Cambio

Nueve fuentes: YAML de CreaTuVida (SEO, etiqueta de edición, resumen, días y cierre), portada, Fundación, La Escuela, Participa, Transparencia, home provisional, epístola 23 y episodio 66. Viernes 5/sábado 6: 09:30–19:00; domingo 7: 09:30–14:30. Check-in del viernes desde 09:00. Residencia Salesiana, El Campello.

El plazo anticipado sigue siendo el domingo 7-feb-2027 incluido. No se modifica la tarifa, los enlaces ni objetos de Stripe; tampoco se envían comunicaciones. Las fechas de ediciones históricas ajenas se conservan.

## Base y verificación

Base de producción revisada: `3ea5c9d9837d76ad37f35b71d46267a9e9a87e32`. Worktree propio `ctv-marzo-20261113`, rama `fix/creatuvida-marzo-2027`. Los cambios PM y otros trabajos de los árboles canónicos se conservan.

Check sin errores ni avisos (cinco sugerencias previas), 65 pruebas aprobadas, build de 117 páginas y smoke aprobados. [PR #89](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/89) publicada: merge `89eaac6c768ef4641f74bd999053ee7a5a8692cb` el 13-nov a las **10:21:40 de Madrid**. CI completa aprobada en el segundo intento: el primero falló al arrancar Chrome, sin errores de tipos, pruebas ni build. Localmente pasan los tres recorridos Chromium, incluidos 16 escenarios de leads y 12 de factura, con todas las escrituras interceptadas.

Producción comprobada a las **10:22:22 de Madrid**: nueve rutas HTTP 200, fechas de marzo presentes y sin las fechas anteriores de esta edición. SEO, días de la semana, horarios, precios, sede y plazo anticipado correctos en CreaTuVida. [Informe de producción](evidencias/ctv-marzo-20261113/produccion.json).

PR #71 futura conserva las fechas de marzo con únicamente las tres fuentes de precios, SHA `3417295630d6a435b8c3a0ddd49e1a2bcfd84cca`. Resuelto el conflicto de portada preservando 520/780 € solo en esa rama futura. Guarda del publicador y del instalador sincronizadas; comprobación del HTML posterior al corte y fixture adaptadas a marzo. Check/test/build/smoke locales aprobados para la tarifa futura. Incorporado el merge publicado a su rama para que GitHub actualice la base y exponga exactamente las tres fuentes permitidas, manteniendo el corte pendiente. Simulación de fusión tras publicar #89 sin conflictos; diferencia de exactamente tres fuentes de precios. Corte conservado: 8-feb-2027 00:00 Madrid. No se ejecuta ni se instala el programador: el pendiente anterior de systemd sigue en EUW-027. Los metadatos/comprobaciones de Stripe conservan sus valores actuales de febrero porque este encargo es exclusivamente web.

El episodio 67 sigue aislado en PR #87 para el 15-nov; no se modifica su contenido ni su SHA. La nota del DOCX sobre el cambio web es histórica una vez publicado este cambio.

## Cierre de sesión · 13-nov-2026

Fran pide documentar, hacer commit y cerrar después de confirmar la actualización. Las PR #89 y [#90](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/90) están fusionadas. La segunda registra la verificación y sincroniza el SHA final de la tarifa futura; merge `512c37d820d92a321f7f39de91cd5dbb8f7e9b70`, **10:26:26 de Madrid**. CI de #90 y de la rama futura #71 aprobadas.

Verificación final de producción a las **10:26:30 de Madrid**: las nueve rutas responden HTTP 200 y muestran marzo. [Informe final](evidencias/ctv-marzo-20261113/produccion-final.json). La función `validatePullRequest` se comprobó con la respuesta real de GitHub: SHA `3417295630d6a435b8c3a0ddd49e1a2bcfd84cca` y exactamente las tres fuentes permitidas; no se ejecutó el corte.

La actualización de fechas de la web queda completada. La PR #71 permanece abierta para el corte confirmado del 8-feb-2027 a las 00:00 de Madrid. EUW-027 conserva el pendiente previo de instalación/ensayo de systemd y verificación del corte real. No se operó Stripe ni se enviaron comunicaciones. Los cambios ajenos de los árboles canónicos se conservan.

## Reversión

Revertir mediante otra PR el commit que cambia las nueve fuentes, pasar check/test/build/smoke y verificar producción. No sobrescribir archivos completos ni restaurar estados antiguos de Stripe.
