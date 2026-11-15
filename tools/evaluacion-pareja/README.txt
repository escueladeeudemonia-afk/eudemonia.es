Evaluación de la relación de pareja · Escuela de Eudemonía

Código original del piloto integrado en eudemonia.es/evaluacion-pareja/.
Base conceptual: Aaron T. Beck, Con el amor no basta. Preguntas y agrupación originales; versión exploratoria pendiente de revisión profesional.

Desarrollo
  node tools/evaluacion-pareja/test.mjs
  npm run build

El build genera public/evaluacion-pareja/aplicacion.html, la copia sin conexión y las fuentes Poppins locales. Astro genera la ruta principal con Base.astro y analytics=false; el marco de mismo origen mantiene aislados los estilos de la evaluación. El directorio generado está ignorado por Git.

La modalidad local y la copia sin conexión funcionan sin backend ni cuenta. El espacio privado opcional usa Supabase Auth y almacenamiento por titular; se configura con una clave publicable. Nunca se incluyen claves secretas. No se utiliza ninguna API de IA. Los borradores privados y los informes para compartir también pueden descargarse cifrados voluntariamente. El módulo sexual, las respuestas detalladas y los textos libres requieren elecciones adicionales para compartir.

Se puede trabajar individualmente sin participación de la pareja, o sumar después una segunda perspectiva. La comparación local exige archivos compatibles, código y periodo coincidentes; el espacio privado utiliza una evaluación común por invitación y versiones autorizadas por cada persona. No hay nota global, percentiles ni diagnóstico automático.

El logo de la Fundación es una copia exacta de su original, autorizado por Pablo. No se ha recreado.

Escala 1-5, omisiones excluidas y mínimo de cuatro respuestas válidas por área. Conversión de archivos antiguos 0.1.0 sumando uno, sin cambiar omisiones.

17 pruebas del motor y prueba de generación PDF; pruebas adicionales de integración en scripts/evaluacion-pareja.test.mjs y en npm run smoke. Sin credenciales ni respuestas de parejas en este repositorio.

Configuración del piloto, migraciones, pruebas de permisos y siguientes pasos: docs/evaluacion-pareja.md. La disponibilidad del modo privado depende de terminar SMTP, plantillas, pruebas autenticadas y publicación.
