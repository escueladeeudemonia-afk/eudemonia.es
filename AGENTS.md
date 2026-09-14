# AGENTS.md — eudemonia.es

Guía canónica para agentes de IA que trabajen en este proyecto. Única fuente de verdad para contexto, convenciones y flujos de trabajo. (El README.md es la versión corta para humanos; si hay conflicto, manda este archivo.)

## Qué es este proyecto

Web institucional de la **Fundación Eudemonía** (nombre legal: *Fundación Escuela de Eudemonía*), publicada en **https://eudemonia.es**. La fundación se dedica al desarrollo del liderazgo en organizaciones con propósito y al autoliderazgo personal ("vivir una buena vida"), combinando filosofía práctica (estoicismo), ciencia y experiencia real. La figura central del contenido es **Pablo Tovar** (autor de las epístolas, presentador del podcast y autor del libro *Coaching para líderes cotidianos*).

Contexto de negocio importante:

- El sitio es una **migración progresiva desde escueladeeudemonia.com** (WordPress). Hay 63 piezas de podcast (ep0 + #1–#62) y 21 epístolas; el #62 se publicó directamente en Astro; algunas piezas siguen apuntando o hospedadas en el `.com` (ver "Gotchas").
- Además de web institucional, funciona como **embudo de captación de leads**: landings con regalo (libro en `/libro`, audio de estoicismo en `/estoicismo`) que suscriben a la newsletter vía formularios MailerLite, y una landing de venta del programa **CreaTuVida** (`/creatuvida`) con enlaces de pago de Stripe.
- Existe un **Cuestionario de vida Eudemónica** ("Eude-Score"): **`/test/` es una landing propia con Tally `A7veYN` embebido**, publicada el 11-sep (PR #17). `/test` normaliza a `/test/`; ya no redirige fuera de la web. Páginas de apoyo: `/gracias-test/` e `/interpretacion-test/`. Falta verificar el flujo completo de puntuación/interpretación por email.
- Hay un **módulo de descanso** (`/descanso`) con 4 tests psicoeducativos autoevaluables: cronotipo (MEQ/rMEQ), calidad del sueño (PSQI), somnolencia diurna (Epworth) e insomnio (Escala de Atenas). Es orientación psicoeducativa, NO diagnóstico médico — mantener siempre ese disclaimer.
- El sitio se preparó en su momento para la revisión de **Google for Nonprofits** (ver historial de commits): cuidado con tocar páginas legales y de transparencia.

## Estado actual — consolidación del 14-sep-2026

- **Activo.** Último despliegue registrado: 11-sep, PR #18 (marco del Eude-Score), después de la landing de la PR #17. Esta actualización es documental; el estado de publicación procede de aquellas sesiones, no de una nueva auditoría externa.
- Historial reciente: epístola #21 (31-ago, PR #11), episodio #62 (31-ago, PR #13; revisión 1-sep, PR #14), borrador corto de CreaTuVida (3-sep, PR #15) y copy YAML (PR #16), Eude-Score embebido (11-sep, PR #17) y marco claro (PR #18).
- **Ad Grants:** según los correos del 9-sep, Pablo quiere contratar AboveX Digital (Peter Sima) por 500 €/mes, pero inicio, firma y facturación siguen por acordar. Registro/cuenta bancaria de la Fundación pendientes según Pablo; aprobación e ID de Ads sin confirmar. El 1-sep fue una previsión histórica. El plan operativo vive en el repo «Escuela de Eudemonía», `docs/plan-ad-grants.md`.
- Pendientes conocidos (TODOs):
  - **Eude-Score:** autenticar el editor Tally para cambiar el tema interior; solo se cambió el marco en Astro. Probar alta en MailerLite EDE y recepción de la interpretación correcta. El listener de envío no acredita conversión GA4 ni entrega del email.
  - **CreaTuVida:** validar con Pablo el borrador `/creatuvida-borrador-9f2c/` antes de sustituir `/creatuvida/`. Titular, Verónica, orden de precios y contenidos retirados aparecen en la lista de decisiones del YAML.
  - **Contenido:** páginas de serie y artículos evergreen para Ad Grants todavía pendientes.
  - `src/pages/interpretacion-test.astro` enlaza CreaTuVida al `.com` (`https://escueladeeudemonia.com/creatuvida/`) con el comentario "aún no migrado", pero `/creatuvida` **ya existe** en este sitio → actualizar el enlace cuando se decida.
  - `Base.astro` usa `/og-default.jpg` como imagen Open Graph por defecto, pero **ese archivo no existe en `public/`** → las tarjetas OG/Twitter apuntan a un 404. Crear la imagen o cambiar el default.
  - No existe `src/pages/404.astro`, aunque `nginx.conf` declara `error_page 404 /404.html` → se sirve el 404 pelado de nginx. Crear una 404 de marca sería deseable.
  - La página `/estoicismo` hotlinkea el vídeo y el póster desde `escueladeeudemonia.com/wp-content/...` → si el WordPress se apaga algún día, se rompen.
  - README.md tiene secciones desactualizadas (estructura antigua con `/contenidos`, frontmatter de episodios antiguo). No es urgente, pero no fiarse del README para rutas ni esquemas: fiarse de este archivo y del código.

## Stack y estructura

**Stack:** Astro 5 (SSG puro, sin SSR), Tailwind CSS v4 (vía `@tailwindcss/vite`, tokens en CSS con `@theme`), TypeScript, `@fontsource/poppins`, `@astrojs/sitemap`, `@astrojs/rss`. Sin framework JS de UI (nada de React/Vue); la única interactividad es JS vanilla.

```
astro.config.mjs        ← site, trailingSlash "always", build format "directory",
                          redirects de compatibilidad, integración sitemap
Dockerfile              ← multi-stage: node:22-alpine (build) → nginx:alpine (serve)
nginx.conf              ← config de producción (gzip, caché de /_astro/, try_files, feed RSS)
src/
  layouts/Base.astro    ← layout maestro: SEO completo (canonical, OG, Twitter,
                          JSON-LD Organization), Header + Footer. TODAS las páginas lo usan.
  components/
    Header.astro        ← nav principal (Inicio, Fundación, Organizaciones, La Escuela,
                          Podcast, Epístolas, Participa) + menú móvil con <details>
    Footer.astro        ← nav secundaria + legales (aviso-legal, privacidad, cookies, transparencia)
    MailerLiteForm.astro← formulario de suscripción embebido de MailerLite (ver Convenciones)
    CookieConsent.astro ← banner y medición GA4, inyectado desde Base.astro
  content/
    config.ts           ← content collections: "episodes" y "epistolas" (esquemas Zod)
    episodes/           ← 63 .md, ep0…ep62
    epistolas/          ← 21 .md, cartas/artículos de Pablo Tovar
  pages/
    index.astro                 ← home
    fundacion.astro             ← qué es la fundación + equipo
    organizaciones.astro        ← oferta para organizaciones
    la-escuela.astro            ← la comunidad/escuela
    participa.astro             ← cómo participar (mailto a contacto@escueladeeudemonia.com)
    podcast/index.astro         ← listado de episodios
    podcast/[slug].astro        ← detalle de episodio (Simplecast + JSON-LD PodcastEpisode)
    podcast/feed.xml.ts         ← feed RSS del podcast
    epistolas/index.astro       ← listado de epístolas
    epistolas/[slug].astro      ← detalle de epístola (JSON-LD Article)
    libro.astro                 ← landing lead magnet: libro de Pablo Tovar (MailerLite)
    estoicismo.astro            ← landing lead magnet: audio de estoicismo (MailerLite)
    creatuvida.astro            ← página pública CreaTuVida (copy todavía en esta página)
    creatuvida-borrador-9f2c.astro ← borrador corto no listado; lee src/data/creatuvida.yaml
    home-provisional.astro      ← propuesta de home pendiente, no listada
    test.astro                  ← landing Eude-Score con Tally embebido
    descanso.astro              ← panel/selector de los 4 tests de descanso
    gracias.astro               ← gracias post-suscripción newsletter
    gracias-test.astro          ← gracias post-test de Tally (noindex)
    interpretacion-test.astro   ← interpretación del Eude-Score por tramos
    aviso-legal.astro / privacidad.astro / cookies.astro / transparencia.astro
  styles/global.css     ← tokens de marca (@theme) + jerarquía tipográfica base
public/
  brand/                ← logo.svg, isotipo.svg, firma-eudemonia.png
  equipo/               ← retratos .webp (Pablo Tovar, Fran Lledó, Javier Llansó, Toni Fernández)
  libro/                ← portada del libro .webp
  legales/              ← estatutos-fundacion-eudemonia.pdf
  descanso/             ← MÓDULO ESTÁTICO de tests (fuera de Astro, ver Convenciones):
    quiz-engine.js      ← motor genérico de cuestionarios Likert (suma → umbrales → categoría)
    psqi-engine.js      ← motor específico del Pittsburgh (puntuación por componentes)
    quiz.css            ← estilos propios del módulo
    tests/*.js          ← datos de cada test (cronotipo, pittsburgh, epworth, atenas)
    cronotipo|pittsburgh|epworth|atenas/index.html ← una página HTML por test
  cronotipo/index.html  ← redirección legacy → /descanso/cronotipo/ (mantener)
  robots.txt, favicon.svg
```

Directorios que NO se tocan ni se leen a fondo: `node_modules/`, `dist/` (salida de build), `.astro/` (caché generada), `_archive/` (archivos locales no publicados, en .gitignore).

## Cómo ejecutar

```bash
npm install         # instalar dependencias
npm run dev         # servidor de desarrollo → http://localhost:4321
npm run build       # build de producción → ./dist/
npm run preview     # previsualizar el build
npm run check       # astro check (type-check + validación)
```

No hay tests automatizados ni linter configurado. La validación mínima antes de un PR es `npm run check` + `npm run build` sin errores.

**Deploy:** VPS Hetzner con **Coolify**. Cada push a `main` dispara build y deploy automáticos usando el `Dockerfile` (build de Astro + servir `dist/` con nginx y `nginx.conf`). No hay paso manual de deploy.

**Flujo git:** el remoto es `https://github.com/escueladeeudemonia-afk/eudemonia.es` (organización `escueladeeudemonia-afk`). Rama de producción: `main`. **No se hace push directo a `main`**: rama `feat/...` o `fix/...` → PR → revisión → merge → deploy automático. Los mensajes de commit siguen convención tipo conventional commits en español: `feat(podcast): ...`, `fix(brand): ...`.

## Variables de entorno

**No requiere secretos para los embeds.** El sitio es 100% estático y no usa variables de entorno de servidor para MailerLite/Tally (solo `import.meta.env.DEV`, que provee Astro). El `.gitignore` excluye `.env*` por precaución, pero no existe ningún `.env` que configurar. Todos los servicios externos (MailerLite, Simplecast, Tally, Stripe) se integran con IDs/URLs públicos embebidos en el código.

## Convenciones

### Idioma y contenido
- Todo el sitio, los commits y los comentarios de código están en **español**.
- `lang="es"`, fechas formateadas con `Intl.DateTimeFormat("es-ES")`.

### Páginas
- Toda página usa `Base.astro` y le pasa `title`, `description` y `canonical` (ruta relativa sin dominio, ej. `"/fundacion"`). Páginas de gracias/confirmación llevan `noindex={true}`.
- URLs con barra final: `trailingSlash: "always"` y `build.format: "directory"` en `astro.config.mjs`. Los enlaces internos en el código a veces van sin barra final (Astro redirige), pero al crear redirects o canonicals usar la forma con `/` final.
- Las landings de embudo (`/libro`, `/estoicismo`, `/creatuvida`, `/descanso`) **no están en la navegación** del Header/Footer a propósito: se llega por enlace directo (email, redes, test). No añadirlas al nav sin que lo pida el propietario.

### Marca (Manual de Identidad — "240205_Manual de Marca Escuela de Eudemonía.pdf")
- Los tokens viven en `src/styles/global.css` bajo `@theme` y se usan como `var(--color-...)` dentro de clases arbitrarias de Tailwind: `text-[var(--color-granate)]`, `bg-[var(--color-papel)]`, etc. **No introducir colores hex sueltos en las páginas**; si falta un tono, añadir token.
- Paleta: granate principal `#8f023d` (Pantone 208), granate oscuro hover `#6b012e`, marrón secundario `#826d6f`, tinta `#1a1a1a`, cuerpo `#2d2d2d`, papel `#fbfaf7`, papel-soft `#f5f3ee`, secundarios verde `#898e86` / rosa `#c16571` / azul `#7796a2`.
- Tipografía: **Poppins** en todo (cargada por `@fontsource` en `Base.astro`). Jerarquía del manual: H1 Bold 700, H2 Light 300, cuerpo Regular 400, citas Medium Italic 500i. La clase `.eyebrow` es el texto pequeño en granate con tracking previo a un titular.
- Logo: `isotipo.svg` son 7 pilares formando una "E" con un individuo central — hubo commits corrigiendo versiones inventadas del logo; no regenerarlo ni "mejorarlo" con IA.

### Content collections
- **Episodios** (`src/content/episodes/`): nombre de archivo `epNN-titulo-slug.md` (el slug del archivo ES la URL `/podcast/<slug>`). Frontmatter según `src/content/config.ts`: `title`, `description`, `pubDate` obligatorios; opcionales `episodeNumber`, `season`, `duration` ("HH:MM:SS"), `durationSeconds`, `guest`, `guestRole`, `audioUrl`, `simplecastId`, `spotifyEmbedUrl`, `appleUrl`, `youtubeUrl`, `ivooxUrl`, `cover`, `tags`, `draft`. El cuerpo markdown es la descripción larga/transcripción.
- **Epístolas** (`src/content/epistolas/`): usar `N-titulo-slug.md` para nuevas piezas, con guiones `-` (preferencia de Fran, 31-ago). Existen históricos `N_titulo-slug.md` (#13–#20); no renombrarlos sin decisión y redirecciones. Frontmatter: `title`, `description`, `pubDate`; opcionales `number`, `author` (default "Pablo Tovar"), `draft`.
- `draft: true` oculta la pieza en producción pero se ve en `npm run dev` (filtro `isDev || !data.draft` en las páginas de listado y detalle, y filtro `!draft` en el feed RSS).
- El reproductor del episodio usa `simplecastId` → iframe `https://player.simplecast.com/<id>?dark=false`. Hubo una regresión que eliminó el reproductor de los 62 episodios y se restauró (PR #7): **no tocar `simplecastId` en lote sin verificar el render**.

### Formularios MailerLite (`src/components/MailerLiteForm.astro`)
- Componente propio que replica el embed de MailerLite con estilos de marca. Props: `formId` (ID numérico), `code` (código del webform en la URL de submit), `redirectUrl` (normalmente `https://eudemonia.es/gracias`), `submitLabel`, placeholders.
- Usos actuales: `/libro` → formId `6132167` / code `d4r9a4`; `/estoicismo` → formId `6132169` / code `g0r3z2`. Son identificadores públicos (visibles en el HTML servido), no secretos.
- La cuenta de MailerLite es la de **Escuela de Eudemonía (EDE)** — distinta de otras cuentas de MailerLite de Fran. El checkbox de privacidad enlazando a `/privacidad` es obligatorio (RGPD): no quitarlo.
- Los campos van apilados y con borde visible por decisión explícita (commit `578057f`).

### Copy del CreaTuVida (`src/data/creatuvida.yaml`)
- **Todo el texto del borrador** de CreaTuVida vive en `src/data/creatuvida.yaml`, un YAML plano con comentarios por bloque pensado para que lo edite una persona sin tocar código. Hoy lo lee el borrador no listado `src/pages/creatuvida-borrador-9f2c.astro`; cuando Pablo lo apruebe, `creatuvida.astro` pasa a leer el mismo archivo (sin el bloque `borrador`) y el borrador se borra junto con su exclusión del sitemap en `astro.config.mjs`.
- Se importa en bruto (`?raw`) y se parsea con el paquete `yaml` (dependencia directa). No hay content collection: el archivo es plano a propósito.
- Las URL van centralizadas en el bloque `enlaces`. En los campos marcados «admite enlaces» se usa un mini-markdown: `[texto](@clave)` resuelve contra `enlaces`, `[texto](https://…)` es URL directa y `**negrita**`. El HTML se escapa antes de aplicar el markdown. Si una `@clave` no existe, **el build falla a propósito** (mejor que un enlace roto en producción).
- Los enlaces de pago de Stripe siguen siendo los de producción (gotcha 6): están en `enlaces.reservar_particulares` y `enlaces.reservar_empresas`.

### Módulo de descanso (`public/descanso/`)
- Es **HTML + JS vanilla servido tal cual desde `public/`**, deliberadamente fuera del pipeline de Astro (páginas autocontenidas, fáciles de iterar). No convertirlo a componentes Astro sin que se pida.
- Arquitectura: `quiz-engine.js` es un motor genérico (ítems puntuados → suma → segmento por umbrales → categoría) que monta el test definido en `tests/<nombre>.js`; el PSQI usa su motor propio `psqi-engine.js` por su puntuación por componentes. Los resultados se guardan en `localStorage` bajo el namespace `eude:descanso:<testId>` para alimentar el panel de `/descanso`.
- El motor soporta textos en `{es, en}` o string simple. Fuentes científicas de cada test citadas en `src/pages/descanso.astro` — mantener la atribución y el disclaimer psicoeducativo.
- `/cronotipo` (raíz) es una redirección legacy a `/descanso/cronotipo/` — no borrarla, hay enlaces antiguos circulando.

### nginx / infraestructura
- `nginx.conf` tiene decisiones deliberadas: `absolute_redirect off` + `port_in_redirect off` (para no perder https detrás del proxy de Coolify), caché inmutable de `/_astro/` (assets con hash), caché corta (5 min) del feed RSS, y `try_files` compatible con el formato directorio de Astro. Tocar con cuidado.

## Gotchas y decisiones importantes

1. **No hay push directo a `main`** — siempre PR. El deploy es automático al merge (Coolify), así que un merge roto tumba producción.
2. **`/og-default.jpg` no existe** — el default de OG en `Base.astro` apunta a un 404 (pendiente arriba).
3. **No hay página 404 de Astro** — nginx sirve su 404 por defecto.
4. **Dependencia residual del `.com`**: vídeo/póster de `/estoicismo` hotlinkeados desde `escueladeeudemonia.com`, y el enlace a CreaTuVida en `/interpretacion-test` apunta al `.com` aunque `/creatuvida` ya existe aquí.
5. **El README está parcialmente desactualizado** (estructura y frontmatter antiguos). Es para humanos; no lo uses como referencia técnica ni lo borres.
6. Los enlaces de pago de `/creatuvida` son **payment links de Stripe en producción** (`buy.stripe.com/...`, empresas y particulares) — no cambiarlos sin confirmación explícita.
7. `/test/` es una página propia desde el 11-sep. Su listener acepta `Tally.FormSubmitted` solo desde `https://tally.so`, el iframe esperado y el formulario `A7veYN`, y dirige a `/gracias-test/`. Los pasos de email/interpretación siguen pendientes de prueba completa; no reintroducir la redirección externa.
8. Los textos de `/interpretacion-test` (tramos 25–30, 19–24, 13–18, etc.) son **copy de negocio aprobado** — no reescribirlos por estilo.
9. El contenido de los episodios/epístolas es material editorial de Pablo Tovar migrado del `.com` — corregir solo erratas evidentes, nunca reescribir.
10. Ramas remotas antiguas (`feat/...`, `fix/...`) ya fusionadas siguen existiendo en origin; ignorarlas.

## Relación con otros proyectos de Fran

- **escueladeeudemonia.com** — WordPress original de la Escuela de Eudemonía; origen de la migración de contenidos y aún host de algunos assets y páginas (patrocinio, logística de CreaTuVida). Este repo (`eudemonia.es`) es la web nueva de la Fundación.
- **MailerLite EDE** — cuenta de email marketing de Escuela de Eudemonía (la "lista de Pablo"); los formularios de este sitio alimentan esa cuenta. No confundir con las cuentas/listas de Cazatarjetas (proyecto personal de Fran, sin relación con este sitio).
- Fran Lledó (fran@franlledo.com) participa como parte del equipo de la fundación (aparece en `/public/equipo/`) y mantiene técnicamente este repo; el contenido editorial es de Pablo Tovar.

## Publicación editorial y medición — memoria de agosto/septiembre

**WordPress no sincroniza nuevas piezas con Astro.** La Epístola #21 (WP `6708`) devolvió 404 porque la redirección apuntaba a un destino aún inexistente. Se publicó aquí con guiones y 301 de compatibilidad para `_`; cambiar el slug interno de WP quedó pendiente de confirmación. No cambiarlo como parte de una actualización documental.

Toñi/Pablo entregan el texto definitivo; Fran incorpora el Markdown, verifica `check`/`build`, tramita PR y despliegue y comprueba la URL final antes de entregarla para el aviso. Conservar slugs ya compartidos, metadatos y `simplecastId` cuando se revisa solo el texto. El procedimiento operativo ampliado vive en `migracion/podcast/README.md` del repo «Escuela de Eudemonía».

El #62 se publicó el 31-ago con índice/RSS/reproductor comprobados. El 1-sep se aplicó el DOCX revisado: texto, énfasis, libros y enlaces, sin cambiar URL, título, fecha, número ni reproductor. No hay origen equivalente en WP.

**GA4:** instalado desde el 5-ago, propiedad `548845029`, tag `G-6H8PEESGGG`, banner y Consent Mode v2 avanzado. Search Console del `.es` verificada por prefijo URL desde el 6-ago; mantener su meta de verificación en `Base.astro`. El `.com` tiene acceso delegado. API de administración por OAuth documentada en el repo operativo; las credenciales no van en esta web. Faltan eventos reales, vínculo Ads y accesos de agencia. Los tests HTML de `public/descanso/` no pasan por el layout de medición.

**MailerLite:** los embeds de libro/audio están implementados; su existencia no demuestra entrega de recursos. Cuenta EDE Classic API v2 identificada en julio como Apolonio Consulting S.L. El acceso de dashboard y las automatizaciones requieren comprobación específica.

**Eude-Score:** PR #18 eliminó `transparentBackground=1` y adaptó el marco al fondo papel. El tema dentro de Tally quedó pendiente por autenticación. La sesión corrigió la incompatibilidad de Vite y registró `npm run check` y `npm run build` sin errores.

**Campaña CreaTuVida:** 13 correos preparados el 4–5-sep, Docs y Sheet con permiso de edición de Pablo verificado entonces. El índice operativo está en `marketing/CreaTuVida/Lanzamiento Octubre 2026/README.md` del repo «Escuela de Eudemonía»; los estados de envío no se deducen del calendario ni de esta web.
