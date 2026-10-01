---
proyecto: eudemonia.es (web)
prefijo: EUW
siguiente_id: 16
estado_proyecto: activo
responsable: Fran
personas: Pablo Tovar (decisor), Toñi (podcast); deploy automático a producción en cada merge
actualizado: 2026-10-01
actualizado_por: Codex
ultima_sync_pm: 2026-09-30
---

# ESTADO — eudemonia.es (web)

<!-- Interfaz proyecto ⇄ Project Manager. Formato y reglas: ~/Projects/Project Manager/docs/plantilla-estado.md
     No cambies el orden ni el nombre de las columnas. No reutilices IDs. Sin secretos: solo punteros. -->

## Pendientes

| ID | Tarea | P | Deadline | Resp. | Estado | Notion |
|---|---|---|---|---|---|---|
| EUW-001 | Crear /og-default.jpg en public/ (todas las tarjetas OG/Twitter apuntan a un 404) | P2 | 2026-09-30 | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c810babe9d7aea0bb36bb) |
| EUW-002 | Crear la página de error de la web de Eudemonía, que ahora sale sin diseño | P3 | — | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c816d874ccba831d4e9eb) |
| EUW-003 | Desenganchar /estoicismo del .com: vídeo y póster hotlinkeados desde escueladeeudemonia.com (se rompen si se apaga el WP) | P2 | 2026-10-15 | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c81a1a569db3c78d330ea) |
| EUW-004 | Integrar los 4 tests de descanso en la plantilla de la web: hoy van sin analítica ni aviso de cookies | P2 | 2026-10-31 | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c8108a7ccee8ec53b91fa) |
| EUW-005 | Al aprobarse home y CreaTuVida: volcar los borradores /home-provisional/ y /creatuvida-borrador-9f2c/, borrarlos y quitar su exclusión del sitemap | P2 | — | Fran | [!] | [↗](https://app.notion.com/p/3deb9c50d57c81a59aeced5abac1858d) |
| EUW-006 | Cambiar el correo de contacto antiguo por el nuevo en las cuatro páginas donde sigue apareciendo | P2 | 2026-09-30 | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c81bcacced297be950e74) |
| EUW-008 | Cambiar el slug interno en WordPress de la epístola #21 (ID 6708); hoy lo resuelve un 301 | P3 | — | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c8113a88dd7fa908601fb) |
| EUW-009 | Actualizar la documentación de la web de Eudemonía, que marca como pendiente algo ya terminado | P3 | — | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c81a39eb5d69b11520586) |
| EUW-010 | Añadir tests o linter mínimos antes de PR (hoy validación manual; un merge roto tumba producción) | P3 | — | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c81fc8a45f3d02d92a59a) |
| EUW-011 | Limpiar ramas remotas antiguas ya fusionadas en origin | P3 | — | Fran | [ ] | [↗](https://app.notion.com/p/3deb9c50d57c81fa9b96f408f9c4f577) |

Leyenda Estado: `[ ]` pendiente · `[~]` en curso · `[!]` bloqueada · `[x]` hecha · `[-]` cancelada. Deadline con `!` = duro (externo, no se mueve).

### Detalle

- **EUW-001** — Nota: AGENTS.md:27; src/layouts/Base.astro:27.
- **EUW-002** — Por qué: quien llega a un enlace roto ve una pantalla vacía en vez de una página de la escuela que le devuelva al sitio. Nota: AGENTS.md:28; nginx.conf:62.
- **EUW-003** — Nota: AGENTS.md:29; estoicismo.astro:28,31; antes de EDE-010.
- **EUW-004** — Por qué: al estar fuera de la plantilla no miden visitas y no piden consentimiento de cookies, que es obligatorio. Nota: AGENTS.md:185; junto a EDE-004.
- **EUW-005** — Con: Pablo. Nota: astro.config.mjs:24-28; AGENTS.md:68-69; bloqueada por EDE-027.
- **EUW-006** — Por qué: quien escriba a la dirección vieja puede no llegar a nadie; hay que hacerlo junto con la redirección del correo. Nota: participa.astro:31,46; gracias.astro:5; privacidad.astro:31; creatuvida.yaml:27,196.
- **EUW-008** — Con: Toñi. Nota: AGENTS.md:179.
- **EUW-009** — Por qué: quien la lea creerá que falta trabajo que ya está hecho y puede repetirlo. Nota: AGENTS.md:26,30; README.md:46-52,79.
- **EUW-010** — Nota: AGENTS.md:104,160.
- **EUW-011** — Nota: AGENTS.md:169.

## Hechas desde la última sincronización

| ID | Tarea | Fecha | Evidencia | Notion |
|---|---|---|---|---|
| EUW-015 | Publicar el episodio #64 a las 00:30 de Madrid y verificar página, reproductor, RSS e índice | 2026-10-01 | PR #34, merge `8889a19` a las 00:31:08; página, reproductor, índice, RSS y sitemap verificados HTTP 200 a las 00:32:22. Respaldo local `launchd` completado y retirado. | [↗](https://www.notion.so/3ebb9c50d57c814e83dff6a75e7340bf) |
| EUW-014 | Publicar la epístola #22 «No quiero aprovecharlo todo» en la URL indicada por Toñi | 2026-09-30 | PR #31, merge `42d0c30`; `npm run check` y `npm run build` correctos; URL e índice HTTP 200, título y enlaces verificados. | [↗](https://www.notion.so/3ebb9c50d57c81ffbe2ee0eb7aab93c6) |
| EUW-013 | Publicar el destino de los ingresos en las páginas con precio para la revisión de Ad Grants | 2026-09-28 | PR #30, merge `fc4bf71`; siete páginas HTTP 200 y copy nuevo verificados a las 16:45 de Madrid. Fuente funcional: EDE-039. | [↗](https://www.notion.so/3eab9c50d57c8133b0fdea32bcc754dd) |
| EUW-007 | Actualizar los enlaces de pago de CreaTuVida a Stripe de la Fundación | 2026-09-25 | PR #27, merge `59da6e0`; enlaces centralizados en src/data/creatuvida.yaml. Ambos checkouts identifican a la Fundación, verificados el 25-sep. Sin cargo real ni reembolso; detalle en el runbook de EDE. | [↗](https://app.notion.com/p/3deb9c50d57c81e7a840f07e8637563a) |
| EUW-012 | Eude-Score integrado en la web (/test/ con Tally) y podcast con 64 piezas, RSS y sitemap verificados | 2026-09-15 | commits 0704a91, 60efb8f, 3a40c89 | [↗](https://www.notion.so/3e3b9c50d57c811fb6fed3f492591fb5) |

## Bloqueos y necesidades

- EUW-005 depende de decisiones en el proyecto EDE. Los enlaces de tarifa plena y la prueba real de pago/reembolso siguen en EDE; EUW-007 solo cierra la sustitución de los enlaces publicada el 25-sep.

## Para el PM

- 2026-09-28 · Publicado el último cambio pedido por Peter: explicación de los ingresos junto a la oferta y detalle en Transparencia. EUW-013 cerrada. Fran confirma al cierre «Correo enviado»: aviso a Peter con las URL y la petición de revisión final y reenvío. EDE-036 espera la actuación de AboveX y la decisión de Google; no consta aún reenvío ni aprobación.
- 2026-09-28 · Conciliado el estado de pagos: EUW-007 cerrada con el PR #27 del 25-sep, ya documentado como EDE-017. No implica migración de suscripciones ni prueba real de pago/reembolso. La tarifa sin early bird sigue en EDE-038.
- Las tareas de negocio, Ad Grants y migración viven en el ESTADO.md de Escuela de Eudemonía (mismo select en Notion); aquí solo lo técnico de la web Astro.

## Del PM

- 2026-09-17 · creado por el PM en el bootstrap desde AGENTS.md de eudemonia.es; confirmar filas.
