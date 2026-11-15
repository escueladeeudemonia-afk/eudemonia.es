# Evaluación de la relación de pareja

Pablo solicita publicar la herramienta en eudemonia.es sin iniciar sesión en ChatGPT. El 15-nov-2026 confirma el nombre «Evaluación de la relación de pareja», la ruta /evaluacion-pareja/ y la publicación. Se conserva el logo original de la Fundación. No se presenta como programa ni como instrumento validado.

## Alcance

- Ruta principal: `/evaluacion-pareja/`, creada con Base.astro, canonical y noindex. Fuera del menú y del sitemap durante el piloto.
- Aplicación autocontenida en un marco de mismo origen: `/evaluacion-pareja/aplicacion.html`.
- Copia descargable: `/evaluacion-pareja/evaluacion-pareja.html`.
- Dos modalidades: una persona con prácticas propias o dos personas que comparten sus informes voluntariamente.
- 54 preguntas en nueve áreas; intimidad sexual opcional. Datos y recomendaciones sin cambios respecto al piloto revisado en el chat.
- Respuestas sólo en memoria; exportaciones cifradas. Sin API de respuestas, almacenamiento central o acceso de facilitación.
- Sin GA4 ni CookieConsent en esta ruta. Base conserva su comportamiento predeterminado en el resto de páginas mediante una nueva prop `analytics`, true por defecto.
- Fuentes Poppins servidas desde el propio dominio; las descargas sin conexión usan fuentes del sistema.

## Código y comprobación

Fuentes y logo en `tools/evaluacion-pareja/`; `npm run build` genera los recursos estáticos antes de Astro. La integración dispone de pruebas en `scripts/evaluacion-pareja.test.mjs`, además de 15 comprobaciones del motor y verificaciones del HTML generado en `scripts/comprobar-build.mjs`.

Comprobaciones obligatorias: `npm run check`, `npm test`, `npm run build` y `npm run smoke`. El CI mantiene las pruebas existentes de formularios, conversiones y facturas con los envíos interceptados.

Tras el despliegue, abrir la ruta sin sesión, confirmar ambas modalidades, acceso al marco y descarga sin conexión. Comprobar que la ruta, el marco y las fuentes responden 200 por HTTPS y que no se incorporan login ni medición.

## Reversión

Revertir el commit de integración mediante PR revierte la nueva ruta y su build. La propiedad de Base tiene true como valor predeterminado; los formularios, páginas legales, pagos y automatizaciones existentes no cambian.

La revisión profesional y el piloto de uso se mantienen como fases posteriores de contenido; publicar la herramienta no las acredita.
