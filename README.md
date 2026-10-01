# eudemonia.es

Web institucional de la **Fundación Eudemonía** (nombre legal: *Fundación Escuela de Eudemonía*). Publicada en [eudemonia.es](https://eudemonia.es).

## Desarrollo

Astro 5 genera un sitio estático. Tailwind CSS v4 usa los tokens de marca de `src/styles/global.css`; la tipografía Poppins se sirve desde `@fontsource/poppins`. En producción, Coolify construye la imagen con `Dockerfile` y nginx sirve `dist/`.

```bash
npm ci
npm run dev       # http://localhost:4321
npm run check     # tipos y componentes Astro
npm test          # pruebas de los scripts de publicación
npm run build     # sitio estático en dist/
npm run smoke     # páginas, recursos, RSS y reproductores del build
```

Las PR hacia `main` ejecutan estas comprobaciones en GitHub Actions. El flujo de publicación es **rama → PR → revisión → merge a `main`**; el merge dispara el despliegue automático. No se hace push directo a `main`.

## Estructura

| Ruta | Contenido |
|---|---|
| `src/layouts/Base.astro` | Plantilla común, metadatos, navegación, pie y consentimiento de cookies |
| `src/pages/` | Páginas institucionales, CreaTuVida, captación, Eude-Score y descanso |
| `src/pages/podcast/` | Índice, episodios y RSS |
| `src/pages/epistolas/` | Índice y detalle de epístolas |
| `src/content/episodes/` | Episodios del pódcast en Markdown |
| `src/content/epistolas/` | Epístolas de Pablo Tovar en Markdown |
| `src/data/creatuvida.yaml` | Copy y enlaces de CreaTuVida |
| `src/data/navegacion.ts` | Única fuente del menú de cabecera y pie |
| `src/pages/descanso/[test].astro`, `public/descanso/` | Plantilla de los cuatro tests y sus motores JavaScript |
| `public/brand/`, `public/equipo/`, `public/libro/`, `public/estoicismo/` | Recursos públicos |

## Publicar contenido

Cada episodio es un archivo `src/content/episodes/epNN-titulo-slug.md`: el nombre sin `.md` es el slug de `/podcast/`. El frontmatter requiere `title`, `description` y `pubDate`; para mostrar el reproductor se conserva `simplecastId`. `episodeNumber`, `season`, `duration`, `audioUrl` y los enlaces a plataformas son opcionales. `draft: true` lo oculta del build de producción y del RSS. El esquema completo está en `src/content/config.ts`.

Cada epístola está en `src/content/epistolas/`. Las nuevas usan guiones en el nombre (`N-titulo-slug.md`). El frontmatter requiere `title`, `description` y `pubDate`. Las epístolas históricas con guion bajo conservan sus URL; no se renombran sin redirecciones.

El texto definitivo lo entregan Pablo o Toñi. Antes de anunciar una publicación, comprobar `npm run check`, `npm run build`, `npm run smoke` y la URL ya desplegada. El procedimiento editorial y las restricciones para agentes están en [AGENTS.md](AGENTS.md); las tareas abiertas, en [ESTADO.md](ESTADO.md).
