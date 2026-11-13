# CreaTuVida · 5, 6 y 7 de marzo de 2027

Fran confirma el 13-nov-2026 el traslado de la 13.ª edición desde el 26–28 de febrero al **5–7 de marzo de 2027** y pide actualizar eudemonia.es.

## Cambio

Nueve fuentes: YAML de CreaTuVida (SEO, etiqueta de edición, resumen, días y cierre), portada, Fundación, La Escuela, Participa, Transparencia, home provisional, epístola 23 y episodio 66. Viernes 5/sábado 6: 09:30–19:00; domingo 7: 09:30–14:30. Check-in del viernes desde 09:00. Residencia Salesiana, El Campello.

El plazo anticipado sigue siendo el domingo 7-feb-2027 incluido. No se modifica la tarifa, los enlaces ni objetos de Stripe; tampoco se envían comunicaciones. Las fechas de ediciones históricas ajenas se conservan.

## Base y verificación

Base de producción revisada: `3ea5c9d9837d76ad37f35b71d46267a9e9a87e32`. Worktree propio `ctv-marzo-20261113`, rama `fix/creatuvida-marzo-2027`. Los cambios PM y otros trabajos de los árboles canónicos se conservan.

Check sin errores ni avisos (cinco sugerencias previas), 65 pruebas aprobadas, build de 117 páginas y smoke aprobados. Verificación de publicación en curso.

PR #71 futura conserva las fechas de marzo con únicamente las tres fuentes de precios, SHA `bff348c681cdd8180d5ed5d3f6807e1034bb5e25`. Resuelto el conflicto de portada preservando 520/780 € solo en esa rama futura. Guarda del publicador y del instalador sincronizadas; comprobación del HTML posterior al corte y fixture adaptadas a marzo. Corte conservado: 8-feb-2027 00:00 Madrid. No se ejecuta ni se instala el programador: el pendiente anterior de systemd sigue en EUW-027. Los metadatos/comprobaciones de Stripe conservan sus valores actuales de febrero porque este encargo es exclusivamente web.

El episodio 67 sigue aislado en PR #87 para el 15-nov; no se modifica su contenido ni su SHA. La nota del DOCX sobre el cambio web es histórica una vez publicado este cambio.

## Reversión

Revertir mediante otra PR el commit que cambia las nueve fuentes, pasar check/test/build/smoke y verificar producción. No sobrescribir archivos completos ni restaurar estados antiguos de Stripe.
