# Guía de escucha del podcast — 9 de noviembre de 2026

Fran encarga revisar el correo de Pablo, aplicar directamente sus instrucciones
en la web y avisarle cuando pueda revisarlo y dar feedback. El mensaje
«Podcast - Itinerarios», del 9-nov a las 12:59 de Madrid, llega a
`fran.lledo@eudemonia.es`. Su adjunto aprobado por Pablo se conserva en
[la fuente](fuentes/261109-podcast-empieza-aqui.md).

## Resultado

- Nueva `/podcast/empieza-aqui/`: destacado del #62, cuatro episodios para
  empezar y ocho itinerarios con 46 recomendaciones, conservando sus textos
  y su orden. Cuatro enlaces adicionales a Claves del pensamiento humano.
- Barra fija de ocho enlaces con salto de línea; mide la cabecera y la barra
  para mantener los títulos visibles al saltar, también desde el índice.
- Franja en `/podcast/`, enlace al principio del grupo «Empieza» del menú
  compartido y acceso al final de los 67 episodios, antes de sus etiquetas.
- Listas editables en `src/data/itinerarios-podcast.ts`. Componentes compartidos
  para botones y episodios. RSS, fichas, metadatos y reproductores conservados.

Se parte de `origin/main` `64b7ff8` comprobado con fetch, en el worktree
`podcast-itinerarios-20261109`. No se modifica el canónico antiguo ni su
`ESTADO.md` con cambios pendientes del PM. No se incorpora ni fusiona la PR
futura #71 de precios de CreaTuVida.

## Comprobaciones previas

`npm run check`: cero errores y avisos, cinco sugerencias previas. `npm test`:
52 pruebas aprobadas. Build: 117 páginas. Smoke: ocho itinerarios, 46 destinos
distintos con reproductor, 67 episodios y reproductores en sus fichas y RSS.
La guía se indexa y aparece en sitemap; no se añade como episodio al RSS.

Chromium comprueba 320, 390, 768 y 1280 px: sin desbordamiento, 32 saltos
internos, cuatro entradas por ancla externa, menú móvil, franja, buscador y
reproductor conservados. Comparación de las 50 tarjetas contra el MD original:
textos y orden idénticos. Revisión visual y navegación: evidencia en
`docs/evidencias/podcast-itinerarios-20261109/`. Los ensayos de navegador
interceptan las peticiones externas. Chromium del sistema bajo
`/opt/ai/playwright/` conserva el sandbox mediante su perfil AppArmor; el
binario antiguo del caché del usuario ya no puede arrancar con sandbox.

## Publicación y reversión

Publicación mediante rama → PR revisada y CI → merge → despliegue Coolify.
Pendiente registrar aquí la PR, la comprobación pública y el aviso enviado.

Para revertir, preparar una PR que revierta el commit de implementación y
validar check, test, build y smoke; al fusionar se retiran la guía y sus tres
accesos. No cambiar los episodios ni la programación de CreaTuVida.

El seguimiento operativo corresponde a EDE-045; publicar esta guía no cierra
el resto del circuito editorial ni los pendientes de EDE-043.
