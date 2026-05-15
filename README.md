# eudemonia.es

Web institucional de la **Fundación Eudemonía** (nombre legal: *Fundación Escuela de Eudemonía*).

## Stack

- [Astro 5](https://astro.build) (SSG)
- [Tailwind CSS v4](https://tailwindcss.com)
- Poppins (`@fontsource/poppins`)
- Hosting: VPS Hetzner + [Coolify](https://coolify.io)
- CI/CD: push a `main` = deploy automático

## Desarrollo local

```bash
npm install
npm run dev
```

El servidor de desarrollo arranca en http://localhost:4321.

## Comandos

| Comando | Acción |
|---|---|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción → `./dist/` |
| `npm run preview` | Previsualizar el build localmente |
| `npm run check` | Type-check y validación de Astro |

## Estructura

```
src/
  layouts/
    Base.astro          ← layout maestro con SEO + Header + Footer
  components/
    Header.astro
    Footer.astro
  pages/
    index.astro         ← Home
    fundacion.astro
    organizaciones.astro
    la-escuela.astro
    participa.astro
    contenidos.astro
    contenidos/podcast/
      index.astro       ← listado de episodios
      [slug].astro      ← página por episodio
  content/
    episodes/           ← un .md por episodio del podcast
    articulos/          ← un .md por artículo
  styles/
    global.css          ← tokens de marca + base Tailwind v4
public/
  brand/                ← logo y assets de marca
  robots.txt
```

## Marca

| Token | Valor |
|---|---|
| Granate principal | `#8F023D` |
| Granate oscuro | `#6B012E` |
| Tinta (titulares) | `#1A1A1A` |
| Cuerpo | `#2D2D2D` |
| Papel (fondo) | `#FBFAF7` |
| Fuente | Poppins (400, 500, 600, 700) |

## Flujo de trabajo en equipo

- Rama de producción: `main`
- Para cambios: rama `feat/...` o `fix/...` → PR → revisión → merge → deploy automático en Coolify
- No se hace push directo a `main`

## Añadir un episodio de podcast

(Pendiente de implementar la content collection; este apartado se completará cuando esté.)

Crear un archivo en `src/content/episodes/NN-titulo-slug.md` con frontmatter:

```yaml
---
title: "Título del episodio"
date: 2026-05-15
description: "Una línea explicando el episodio"
guest: "Nombre del invitado"
duration: "1:23:45"
embedUrl: "https://open.spotify.com/embed/episode/..."
audioUrl: "https://..."  # opcional, solo si servimos MP3 propio
---

Transcripción del episodio aquí (markdown).
```
