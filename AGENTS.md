# eudemonia.es — web de la Fundación Eudemonía

Web institucional de la Fundación Eudemonía (Astro 5 SSG + Tailwind 4, Docker/nginx en Coolify): corporativa, podcast, epístolas, landings de captación y venta del programa CreaTuVida.

**Estado:** activo · **Tipo:** cliente (código) · **Repo:** `escueladeeudemonia-afk/eudemonia.es` (organización del cliente; excepción documentada al estándar `Soyfranlledo/*`)

> Este `AGENTS.md` se reconstruyó el 2026-09-29 a partir de la versión que solo existía en la rama sin fusionar `codex/documenta-sesiones-septiembre` (14/25-sep), actualizada contra el estado real de `main`. Fuente única de verdad para agentes; el `README.md` es la versión corta para humanos y está parcialmente desactualizado — si hay conflicto, manda este archivo y el código.

## Qué es y para qué

Web de la **Fundación Eudemonía** (nombre legal: *Fundación Escuela de Eudemonía*), publicada en **https://eudemonia.es**. La fundación se dedica al desarrollo del liderazgo en organizaciones con propósito y al autoliderazgo personal ("vivir una buena vida"), combinando filosofía práctica (estoicismo), ciencia y experiencia real. La figura central del contenido es **Pablo Tovar** (autor de las epístolas, presentador del podcast y autor del libro *Coaching para líderes cotidianos*). Pablo es quien decide; Toñi entrega textos del podcast. Fran forma parte del equipo de la fundación (aparece en `public/equipo/`) y mantiene técnicamente el repo; el contenido editorial es de Pablo.

- **Migración progresiva desde escueladeeudemonia.com** (WordPress). Hay 64 episodios de podcast (ep0 + #1–#63) y 22 epístolas; #62 y #63 se publicaron directamente en Astro; algunas piezas y assets siguen en el `.com` (ver trampas).
- **Embudo de captación:** landings con regalo (libro en `/libro`, audio de estoicismo en `/estoicismo`) que suscriben a la newsletter vía formularios MailerLite, y la página de venta del programa **CreaTuVida** (`/creatuvida`) con enlaces de pago de Stripe de la Fundación.
- **Cuestionario de vida Eudemónica ("Eude-Score"):** `/test/` es una landing propia con Tally `A7veYN` embebido (11-sep, PR #17; marco adaptado en PR #18). Apoyo: `/gracias-test/` e `/interpretacion-test/`.
- **Módulo de descanso** (`/descanso`) con 4 tests psicoeducativos autoevaluables: cronotipo (MEQ/rMEQ), calidad del sueño (PSQI), somnolencia diurna (Epworth) e insomnio (Escala de Atenas). Es orientación psicoeducativa, NO diagnóstico médico — mantener siempre ese disclaimer.
- **Google for Nonprofits / Ad Grants:** el sitio se preparó para esa revisión. El 28-sep-2026 se publicó el destino de los ingresos en las páginas con precio (PR #30, a petición de la agencia AboveX). A esa fecha no consta aprobación ni ID de Ads. El plan operativo vive en el repo «Escuela de Eudemonía» (`docs/plan-ad-grants.md`, tareas EDE-*). Cuidado con tocar páginas legales, de transparencia y de precios.

Pendientes → `ESTADO.md` (prefijo EUW).

## Mapa del proyecto

**Stack:** Astro 5 (SSG puro, sin SSR), Tailwind CSS v4 (vía `@tailwindcss/vite`, tokens en CSS con `@theme`), TypeScript, `@fontsource/poppins`, `@astrojs/sitemap`, `@astrojs/rss`, `yaml`. Sin framework JS de UI; la única interactividad es JS vanilla.

```
astro.config.mjs        ← site, trailingSlash "always", build format "directory",
                          redirects de compatibilidad (epístola #21, /equipo, borrador de CreaTuVida…),
                          integración sitemap (con exclusiones de borradores)
Dockerfile              ← multi-stage: node:22-alpine (build) → nginx:alpine (serve)
nginx.conf              ← producción: gzip, caché inmutable de /_astro/, HTML revalidado
                          (no-cache, PR #29), feed RSS con caché corta, try_files, error_page 404
src/
  layouts/Base.astro    ← layout maestro: SEO (canonical, OG, Twitter, JSON-LD Organization),
                          verificación de Search Console, Header + Footer, CookieConsent.
                          TODAS las páginas lo usan
  data/
    navegacion.ts       ← menú agrupado compartido por Header y Footer (PR #28): La Fundación,
                          Programas, Contenido, Empieza
    creatuvida.yaml     ← TODO el copy de CreaTuVida + bloque `financiacion` + `enlaces` (Stripe)
  components/
    Header.astro / Footer.astro ← leen src/data/navegacion.ts; Footer con legales
    MailerLiteForm.astro← formulario de suscripción de MailerLite (ver Convenciones)
    CookieConsent.astro ← banner y medición GA4 (Consent Mode v2), inyectado desde Base.astro
    DestinoIngresos.astro ← explicación del destino de los ingresos (detalle/resumen; 28-sep)
  content/
    config.ts           ← content collections "episodes" y "epistolas" (esquemas Zod)
    episodes/           ← 64 .md, ep0…ep63
    epistolas/          ← 22 .md, cartas/artículos de Pablo Tovar
  pages/
    index.astro, fundacion.astro, organizaciones.astro, la-escuela.astro, participa.astro,
    transparencia.astro, aviso-legal.astro, privacidad.astro, cookies.astro
    podcast/index.astro, podcast/[slug].astro (Simplecast + JSON-LD PodcastEpisode), podcast/feed.xml.ts
    epistolas/index.astro, epistolas/[slug].astro (JSON-LD Article)
    libro.astro         ← landing lead magnet: libro de Pablo Tovar (MailerLite)
    estoicismo.astro    ← landing lead magnet: audio de estoicismo (MailerLite)
    creatuvida.astro    ← página de venta CreaTuVida; lee src/data/creatuvida.yaml
    home-provisional.astro ← propuesta de home pendiente de Pablo, no listada
    test.astro          ← landing Eude-Score con Tally embebido
    gracias-test.astro (noindex), interpretacion-test.astro (tramos del Eude-Score)
    descanso.astro      ← panel/selector de los 4 tests de descanso
    gracias.astro       ← gracias post-suscripción newsletter
  styles/global.css     ← tokens de marca (@theme) + jerarquía tipográfica base
public/
  brand/                ← logo.svg, isotipo.svg, firma-eudemonia.png
  equipo/               ← retratos .webp (Pablo Tovar, Fran Lledó, Javier Llansó, Toni Fernández)
  libro/                ← portada del libro .webp
  legales/              ← estatutos-fundacion-eudemonia.pdf
  descanso/             ← MÓDULO ESTÁTICO de tests (fuera de Astro): quiz-engine.js (motor Likert
                          genérico), psqi-engine.js (Pittsburgh), quiz.css, tests/*.js y
                          cronotipo|pittsburgh|epworth|atenas/index.html
  cronotipo/index.html  ← redirección legacy → /descanso/cronotipo/ (mantener)
  robots.txt, favicon.svg
docs/
  2026-09-28-destino-ingresos.md ← cambio pedido por AboveX (PR #30) y su validación
  publicacion-episodio-63.md     ← publicación del #63 y retirada de la programación automática
ESTADO.md               ← pendientes para el Project Manager
README.md               ← versión corta para humanos (parcialmente desactualizada)
```

No se tocan ni se leen a fondo: `node_modules/`, `dist/` (build), `.astro/` (caché), `_archive/` (archivos locales no publicados, ignorado).

**Ramas y worktrees (2026-09-29):** ~19 ramas locales (`feat/*`, `fix/*`, `cursor/*`, `codex/*`), casi todas ya fusionadas en `main`; la única con trabajo sin fusionar es `codex/documenta-sesiones-septiembre` (el `AGENTS.md`/`CLAUDE.md` que este archivo sustituye + un `ESTADO.md` antiguo). Hay 4 worktrees fuera del repo, en `~/Projects/.worktrees/eudemonia-*` (`destino-ingresos`, `ep63`, `publicacion-cloud`, `retira-programacion-ep63`), limpios y sobre ramas ya fusionadas. Origin conserva ~28 ramas antiguas ya fusionadas (ESTADO EUW-011): ignorarlas.

## Cómo se trabaja

```bash
npm install         # instalar dependencias
npm run dev         # servidor de desarrollo → http://localhost:4321
npm run build       # build de producción → ./dist/
npm run preview     # previsualizar el build
npm run check       # astro check (type-check + validación)
```

No hay tests automatizados ni linter. Validación mínima antes de un PR: `npm run check` + `npm run build` sin errores.

**Deploy:** VPS Hetzner con **Coolify**. Cada merge a `main` dispara build y deploy automáticos con el `Dockerfile` (build de Astro + `dist/` servido por nginx con `nginx.conf`). No hay paso manual.

**Flujo git (regla del cliente):** remoto `https://github.com/escueladeeudemonia-afk/eudemonia.es`. Rama de producción `main`. **No se hace push directo a `main`**: rama `feat/...` o `fix/...` (o la que cree la herramienta) → PR → revisión → merge → deploy automático. Commits tipo conventional commits en español (`feat(podcast): ...`, `fix(brand): ...`, `[docs] ...`).

### Publicación editorial

- **WordPress no sincroniza nuevas piezas con Astro.** La Epístola #21 (WP `6708`) devolvió 404 porque la redirección apuntaba a un destino aún inexistente; se publicó aquí con guiones y 301 de compatibilidad para `_` (cambiar el slug interno de WP: EUW-008).
- Toñi/Pablo entregan el texto definitivo; Fran incorpora el Markdown, verifica `check`/`build`, tramita PR y despliegue y comprueba la URL final antes de entregarla para el aviso. Conservar slugs ya compartidos, metadatos y `simplecastId` cuando se revisa solo el texto. Procedimiento ampliado: `migracion/podcast/README.md` del repo «Escuela de Eudemonía».
- El #62 se publicó el 31-ago (índice/RSS/reproductor comprobados); el 1-sep se aplicó el DOCX revisado sin cambiar URL, título, fecha, número ni reproductor. El #63 se publicó el 15-sep (PR #19) con merge manual: la programación automática por GitHub Actions no se disparó y se retiró (`docs/publicacion-episodio-63.md`). **Antes de confiar otra publicación a un calendario, validar un disparo programado real y preparar recuperación y aviso independientes.**

## Reglas y límites

- **Producción:** un merge roto a `main` tumba eudemonia.es (deploy automático). Siempre PR y `check` + `build` antes.
- **Excepción al paso (3) del protocolo de sesión:** el cliente no admite push directo a `main`. Commitea en una rama y abre PR; `main` solo recibe merges.
- **No se toca sin confirmación explícita:** los **payment links de Stripe** de CreaTuVida (`enlaces.reservar_particulares` / `enlaces.reservar_empresas` en `src/data/creatuvida.yaml`; desde el 25-sep son los de la Fundación, PR #27); los textos de `/interpretacion-test` (tramos 25–30, 19–24, 13–18…: **copy de negocio aprobado**); el contenido editorial de episodios/epístolas (material de Pablo Tovar: solo erratas evidentes); páginas legales, de transparencia y de precios (revisión de Ad Grants).
- **Logo:** `isotipo.svg` son 7 pilares formando una "E" con un individuo central; hubo commits corrigiendo versiones inventadas. No regenerarlo ni "mejorarlo" con IA.
- **Secretos:** el sitio es 100 % estático y no usa variables de entorno de servidor (solo `import.meta.env.DEV`). MailerLite, Simplecast, Tally, Stripe, GA4 y Search Console se integran con IDs/URLs públicos embebidos. Las credenciales de APIs (GA4 admin por OAuth, MailerLite EDE) viven en el repo operativo «Escuela de Eudemonía» / 1Password (bóveda «Clientes»), nunca en esta web.
- **`ESTADO.md`:** no toques la columna `Notion` ni la sección «Del PM»; no reutilices IDs; sin secretos.

### Convenciones

- **Idioma:** sitio, commits y comentarios en **español**. `lang="es"`, fechas con `Intl.DateTimeFormat("es-ES")`.
- **Páginas:** toda página usa `Base.astro` con `title`, `description` y `canonical` (ruta relativa sin dominio, ej. `"/fundacion"`). Páginas de gracias/confirmación con `noindex={true}`. URLs con barra final (`trailingSlash: "always"`, `build.format: "directory"`): en redirects y canonicals usar la forma con `/` final.
- **Navegación:** el menú se define solo en `src/data/navegacion.ts` (grupos La Fundación, Programas, Contenido, Empieza; desde PR #28 incluye CreaTuVida, Eude-Score, libro y estoicismo). `/descanso` y los borradores no están en el menú a propósito: no añadir páginas sin que lo pida el propietario.
- **Marca** (Manual de Identidad «240205_Manual de Marca Escuela de Eudemonía.pdf»): tokens en `src/styles/global.css` bajo `@theme`, usados como `var(--color-...)` en clases arbitrarias (`text-[var(--color-granate)]`, `bg-[var(--color-papel)]`). **No introducir hex sueltos**; si falta un tono, añadir token. Paleta: granate `#8f023d` (Pantone 208), granate oscuro hover `#6b012e`, marrón `#826d6f`, tinta `#1a1a1a`, cuerpo `#2d2d2d`, papel `#fbfaf7`, papel-soft `#f5f3ee`, secundarios verde `#898e86` / rosa `#c16571` / azul `#7796a2`. **Poppins** en todo (H1 Bold 700, H2 Light 300, cuerpo 400, citas Medium Italic 500i). `.eyebrow` = texto pequeño granate con tracking previo a un titular.
- **Episodios** (`src/content/episodes/`): archivo `epNN-titulo-slug.md` (el slug ES la URL `/podcast/<slug>`). Frontmatter (`src/content/config.ts`): `title`, `description`, `pubDate` obligatorios; opcionales `episodeNumber`, `season`, `duration` ("HH:MM:SS"), `durationSeconds`, `guest`, `guestRole`, `audioUrl`, `simplecastId`, `spotifyEmbedUrl`, `appleUrl`, `youtubeUrl`, `ivooxUrl`, `cover`, `tags`, `draft`. El cuerpo es la descripción larga/transcripción. El reproductor usa `simplecastId` → iframe `https://player.simplecast.com/<id>?dark=false`; una regresión lo eliminó de los 62 episodios y se restauró (PR #7): **no tocar `simplecastId` en lote sin verificar el render**.
- **Epístolas** (`src/content/epistolas/`): nuevas piezas `N-titulo-slug.md` con guiones (preferencia de Fran, 31-ago). Hay históricos `N_titulo-slug.md` (#13–#20): no renombrarlos sin decisión y redirecciones. Frontmatter: `title`, `description`, `pubDate`; opcionales `number`, `author` (default "Pablo Tovar"), `draft`.
- `draft: true` oculta la pieza en producción pero se ve en `npm run dev` (filtro `isDev || !data.draft` en listados y detalle; `!draft` en el RSS).
- **Formularios MailerLite** (`MailerLiteForm.astro`): replica el embed con estilos de marca. Props `formId`, `code`, `redirectUrl` (normalmente `https://eudemonia.es/gracias`), `submitLabel`, placeholders. Usos: `/libro` → formId `6132167` / code `d4r9a4`; `/estoicismo` → formId `6132169` / code `g0r3z2` (identificadores públicos). Cuenta **Escuela de Eudemonía (EDE)** — distinta de las de Fran. El checkbox de privacidad enlazando a `/privacidad` es obligatorio (RGPD). Campos apilados y con borde visible por decisión explícita (commit `578057f`).
- **Copy de CreaTuVida** (`src/data/creatuvida.yaml`): YAML plano con comentarios por bloque para que lo edite una persona sin tocar código; lo lee `creatuvida.astro` (el borrador `/creatuvida-borrador-9f2c` ya se publicó y redirige a `/creatuvida/`). Se importa en bruto (`?raw`) y se parsea con `yaml`. URLs centralizadas en `enlaces`; en los campos «admite enlaces», mini-markdown: `[texto](@clave)` resuelve contra `enlaces`, `[texto](https://…)` es URL directa, `**negrita**`; el HTML se escapa antes. Si una `@clave` no existe, **el build falla a propósito**. El bloque `financiacion` alimenta `DestinoIngresos.astro`.
- **Módulo de descanso** (`public/descanso/`): HTML + JS vanilla servido tal cual, deliberadamente fuera de Astro. `quiz-engine.js` monta el test de `tests/<nombre>.js` (ítems → suma → umbrales → categoría); el PSQI usa `psqi-engine.js`. Resultados en `localStorage` bajo `eude:descanso:<testId>` para el panel de `/descanso`. Textos `{es, en}` o string. Fuentes científicas citadas en `src/pages/descanso.astro`: mantener atribución y disclaimer. No convertirlo a componentes Astro sin que se pida (integrarlo en la plantilla para analítica/cookies es EUW-004).
- **nginx:** `absolute_redirect off` + `port_in_redirect off` (no perder https tras el proxy de Coolify), caché inmutable de `/_astro/`, HTML con `Cache-Control: no-cache` (PR #29), caché corta (5 min) del RSS, `try_files` compatible con el formato directorio. Tocar con cuidado.

## Documentos de referencia

- Pendientes y hechas → `ESTADO.md`.
- Destino de los ingresos / Ad Grants → `docs/2026-09-28-destino-ingresos.md`; plan completo en el repo «Escuela de Eudemonía» (`docs/plan-ad-grants.md`).
- Publicación del #63 y lecciones de la programación → `docs/publicacion-episodio-63.md`.
- Procedimiento de publicación del podcast → repo «Escuela de Eudemonía», `migracion/podcast/README.md`.
- Campaña CreaTuVida (13 correos preparados el 4–5-sep; Docs y Sheet con permiso de Pablo) → repo «Escuela de Eudemonía», `marketing/CreaTuVida/Lanzamiento Octubre 2026/README.md`. Los estados de envío no se deducen de esta web.

### Relación con otros proyectos

- **`~/Projects/Escuela de Eudemonía`** — repo operativo del trabajo de Fran para la escuela (landings WP del `.com`, Ad Grants, podcast, CreaTuVida, credenciales por puntero).
- **escueladeeudemonia.com** — WordPress original; origen de la migración y aún host de algunos assets y páginas (patrocinio, logística de CreaTuVida).
- **MailerLite EDE** — cuenta de la Escuela (la "lista de Pablo"; Classic API v2, identificada en julio como Apolonio Consulting S.L.). No confundir con las cuentas de Cazatarjetas.

## Aprendizajes y trampas

- **`/og-default.jpg` no existe** — el default de OG en `Base.astro` apunta a un 404 (EUW-001).
- **No hay `src/pages/404.astro`** aunque `nginx.conf` declara `error_page 404 /404.html` → se sirve el 404 pelado de nginx (EUW-002).
- **Dependencia residual del `.com`:** el vídeo y el póster de `/estoicismo` se hotlinkean desde `escueladeeudemonia.com/wp-content/...`; si el WordPress se apaga, se rompen (EUW-003). (El enlace de `/interpretacion-test` a CreaTuVida ya es interno.)
- **Correo de contacto antiguo** (`contacto@escueladeeudemonia.com`) sigue en participa, gracias, privacidad, aviso-legal, transparencia y `creatuvida.yaml` (EUW-006; puede que no todas las apariciones deban cambiar, decide Fran).
- **`/test/`:** su listener acepta `Tally.FormSubmitted` solo desde `https://tally.so`, el iframe esperado y el formulario `A7veYN`, y dirige a `/gracias-test/`. PR #18 quitó `transparentBackground=1` y adaptó el marco al papel; el tema interior de Tally quedó pendiente por autenticación. Falta probar alta en MailerLite EDE y recepción de la interpretación; el listener no acredita conversión GA4 ni entrega del email. No reintroducir la redirección externa.
- **GA4:** instalado desde el 5-ago, propiedad `548845029`, tag `G-6H8PEESGGG`, banner y Consent Mode v2 avanzado. Search Console del `.es` verificada por prefijo URL desde el 6-ago: mantener su meta de verificación en `Base.astro`. El `.com` tiene acceso delegado. Faltan eventos reales, vínculo Ads y accesos de agencia. Los tests HTML de `public/descanso/` no pasan por el layout de medición.
- **MailerLite:** que existan los embeds de libro/audio no demuestra la entrega de los recursos; el acceso al dashboard y las automatizaciones requieren comprobación específica.
- **Programación por GitHub Actions (14-sep):** las pruebas manuales pasaron pero el calendario nunca disparó; causa no determinada. No confiar en un `dry-run`.
- **`README.md` parcialmente desactualizado** (estructura con `/contenidos`, frontmatter de episodios antiguo): no usarlo como referencia técnica ni borrarlo.
- Sep-2026: una sesión corrigió una incompatibilidad de Vite (hoy `vite` figura como devDependency) y dejó `npm run check` y `npm run build` sin errores.

## Protocolo de sesión

Estándar común de `~/Projects` (detalle: `~/Projects/_sistema/PROTOCOLO-SESION.md`). Vale para cualquier herramienta.

- **Al empezar:** `git pull --ff-only`; lee este `AGENTS.md` y, si existe, `ESTADO.md`.
- **Al cerrar:** (1) actualiza `ESTADO.md` si existe; (2) si has aprendido algo durable (comando, trampa, decisión, carpeta nueva) o algo de este archivo ha dejado de ser cierto, corrígelo aquí; (3) `git add -A && git commit -m "<resumen>"` y `git push` **de tu rama de trabajo**. Si en este proyecto `main` despliega en producción (lo dice «Reglas y límites»), no empujes a `main` sin OK de Fran: sube la rama y díselo.
- Nada útil se queda solo en la memoria de una herramienta: si importa, va al repo. Nunca valores de secretos, solo punteros.
- Red de seguridad: cada noche a las 23:30 `~/Projects/_sistema/scripts/sync-todo.sh` sube lo que haya quedado sin commitear.
