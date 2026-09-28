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

El estado de publicación, el PR y la comprobación de producción se registran en `docs/plan-ad-grants.md` y en `docs/2026-09-25-ad-grants-remediacion-web.md` del repositorio Escuela de Eudemonía. AboveX debe revisar y reenviar la solicitud: publicar el texto no activa Ad Grants.
