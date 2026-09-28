# Destino de los ingresos — cambio solicitado por AboveX

Peter revisó las correcciones web el 28-sep-2026 (Spark `84398`) y pidió explicar en CreaTuVida y en cualquier página con precios cómo se emplean los ingresos antes de reenviar Ad Grants.

Fran confirmó en esta sesión que las inscripciones cubren la organización y realización de CreaTuVida y que el excedente sostiene la actividad educativa de la Fundación, incluidos el pódcast y las epístolas gratuitos. El artículo 11 de los [estatutos](../public/legales/estatutos-fundacion-eudemonia.pdf) se contrastó en su página 4: al menos el 70 % de resultados e ingresos, después de los gastos de obtención, se destina a los fines; el resto incrementa dotación o reservas según el Patronato. No se presenta este porcentaje como una proporción de cada inscripción bruta.

## Implementación

- Copy común en `financiacion` dentro de `src/data/creatuvida.yaml`.
- Componente `src/components/DestinoIngresos.astro`, con detalle o resumen y variante para el fondo granate de La Escuela.
- CreaTuVida: bloque visible después de las tarjetas de precio y antes de las condiciones.
- Portada, La Escuela, Participa y Fundación: resumen visible con enlace al detalle.
- Transparencia: explicación práctica y estatutaria en `#destino-ingresos`; fecha 28-sep-2026.
- Organizaciones: destino estatutario de los ingresos de los encargos y enlace al detalle.

## Validación previa a publicar

- `npm run check`: 0 errores y 0 warnings, con 5 hints preexistentes.
- `npm run build`: 105 páginas generadas.
- HTML de las siete rutas comprobado, incluido el ancla y el enlace a estatutos.
- Precios, botones y demás campos anteriores del YAML idénticos a `origin/main`.
- Revisión de CreaTuVida en escritorio y móvil; enlace al detalle de Transparencia comprobado en navegador.

## Publicación y cierre del 28-sep

Publicado mediante [PR #30](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/30), merge `fc4bf71` a las 16:43:48 de Madrid. Las siete rutas de producción respondieron HTTP 200 y mostraron la explicación nueva en la comprobación de las 16:45.

Fran confirmó después «Correo enviado» en el chat: avisó a Peter de que los cambios están publicados, enlazó CreaTuVida y Transparencia y pidió a Peter y Jakub una última revisión y el reenvío si todo está correcto. La evidencia es la confirmación directa de Fran; no se ha vuelto a consultar Spark para obtener el ID o la hora exacta del correo. Codex no envió el mensaje.

La implementación web está cerrada como EUW-013. La revisión final, la confirmación del reenvío y la decisión de Google siguen en EDE-036, en el proyecto Escuela de Eudemonía. No consta todavía aprobación ni ID de Ads: publicar el texto y avisar a AboveX no activa Ad Grants.

El detalle de decisiones, publicación y próximos pasos vive en [el plan de Ad Grants](https://github.com/Soyfranlledo/escuela-de-eudemonia/blob/master/docs/plan-ad-grants.md) y [el runbook de remediación](https://github.com/Soyfranlledo/escuela-de-eudemonia/blob/master/docs/2026-09-25-ad-grants-remediacion-web.md) del repositorio Escuela de Eudemonía.
