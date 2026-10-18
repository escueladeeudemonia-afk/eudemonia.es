---
proyecto: eudemonia.es (web)
prefijo: EUW
siguiente_id: 20
estado_proyecto: activo
responsable: Fran
personas: Pablo Tovar (decisor), Toñi (podcast); deploy automático a producción en cada merge
actualizado: 2026-10-18
actualizado_por: Codex
ultima_sync_pm: 2026-10-18
---

# ESTADO — eudemonia.es (web)

<!-- Interfaz proyecto ⇄ Project Manager. Formato y reglas: ~/Projects/Project Manager/docs/plantilla-estado.md
     No cambies el orden ni el nombre de las columnas. No reutilices IDs. Sin secretos: solo punteros. -->

## Pendientes

| ID | Tarea | P | Deadline | Resp. | Estado | Notion |
|---|---|---|---|---|---|---|
| EUW-005 | Aprobar y publicar la nueva home; retirar los borradores sin romper los enlaces compartidos | P2 | — | Fran | [!] | [↗](https://app.notion.com/p/3deb9c50d57c81a59aeced5abac1858d) |
| EUW-006 | Confirmar el correo de contacto nuevo y sustituir la dirección antigua en la web | P2 | — | Fran | [!] | [↗](https://app.notion.com/p/3deb9c50d57c81bcacced297be950e74) |
| EUW-008 | Confirmar y corregir el slug interno de la epístola #21 en WordPress | P3 | — | Fran | [!] | [↗](https://app.notion.com/p/3deb9c50d57c8113a88dd7fa908601fb) |
| EUW-019 | Activar la suscripción mensual en epístolas y el acceso desde la home | P1 | 2026-10-31! | Fran | [~] | [↗](https://www.notion.so/3fdb9c50d57c815b93bbed6c318eb551) |
| EUW-017 | Cerrar las inscripciones de CreaTuVida a las 23:59 de Madrid y verificar el despliegue | P1 | 2026-10-18! | Fran | [~] | — |

Leyenda Estado: `[ ]` pendiente · `[~]` en curso · `[!]` bloqueada · `[x]` hecha · `[-]` cancelada. Deadline con `!` = duro (externo, no se mueve).

### Detalle

- **EUW-019** — Nota: Cajetín y acceso desde la home publicados el 18-oct mediante PR #54 y corrección TLS #55 (merge `578e3a5`), ambas con CI aprobado. Se reutiliza por petición de Fran el formulario WordPress de Sobre ti: bloque Kadence 2860, formulario `2860_e87fbc-60`, grupo Newsletter Eudemonía (112697386); configuración pública en `src/data/suscripcion.mjs`. Producción verificada a las 11:47:40 de Madrid: home, epístolas y contexto original HTTP 200, ancla, frase, formulario y token correctos, ruta POST rechaza GET con 405. Check, 34 pruebas, build de 113 páginas, smoke de 66 episodios, nginx simulado, GET directo y GET mediante nginx real aprobados localmente y en CI. Fran verificó por captura el doble opt-in API/integraciones ON y remitente `contacto@escueladeeudemonia.com`; asunto y texto visible genéricos en inglés, con indicación para traducir el asunto. La autorización de publicación data del 17-oct. Pendiente solo la prueba humana de alta y confirmación (y comprobar el grupo final); solicitada a Fran tras desplegar. No se han hecho altas ni envíos desde el agente. Estado y cambios locales anteriores conservados en el stash del 18-oct; sincronización del PM incorporada sin alterar su contenido. Evidencia y detalle: `docs/2026-10-17-suscripcion-epistolas.md` y `docs/2026-10-18-suscripcion-epistolas-produccion.json`.

- **EUW-017** — Fran autoriza el cierre web el 18-oct-2026 a las 23:59 de Madrid (21:59 UTC). PR #45, SHA `e802c3b81ce7d2a88600d5d42243265325a7c841`, pendiente hasta esa hora. Programador derivado del early bird, con GitHub Actions y timer persistente independiente en el VPS. Vista cerrada y CI verificados. Calendario publicado en PR #46 (`6a43dbf`); dry-run de GitHub aprobado (run 38543127260), timer del VPS habilitado y disparo real de prueba correcto. No tocar Stripe ni sus enlaces. Cerrar la tarea solo al verificar «Acceso cerrado» y ausencia de botones de pago en producción. Runbook: `docs/2026-10-14-cierre-creatuvida.md`.

- **EUW-005** — Por qué: la home aprobada reemplazará la propuesta provisional sin perder enlaces previos. Con: Pablo. Bloqueada por: aprobación editorial de Pablo (EDE-027). Nota: CreaTuVida ya está publicada; el borrador conserva una redirección compartida con Pablo, así que mantener el 301 al retirar su archivo.
- **EUW-006** — Por qué: quien escriba a la dirección vieja puede no llegar a nadie; hay que coordinar web y correo. Necesita: Fran confirme la dirección nueva y la redirección del buzón anterior; hay apariciones en participa, gracias, privacidad, aviso legal, transparencia y `creatuvida.yaml`, algunas sujetas a revisión legal o comercial. Dur: 30. Bloqueada por: decisión de Fran sobre qué direcciones sustituir.
- **EUW-008** — Por qué: Toñi sigue viendo el slug con guion bajo en WordPress aunque la URL canónica del .es ya usa guiones; el 301 actual evita el 404. Con: Toñi. Bloqueada por: confirmación explícita pendiente desde la sesión del 31-ago; ver `Escuela de Eudemonía/docs/wordpress.md` y `migracion/redirecciones.md`. Necesita: Fran confirme con Toñi el cambio del slug de WP ID 6708 y el mantenimiento de la redirección anterior.

## Hechas desde la última sincronización

| ID | Tarea | Fecha | Evidencia | Notion |
|---|---|---|---|---|
| EUW-018 | Publicar el episodio #65 a las 00:30 de Madrid y verificar página, reproductor, RSS e índice | 2026-10-15 | PR #49, merge `224ffea` a las 00:30:04; VPS arrancó a las 00:30:00 y verificó página, reproductor, índice, RSS y sitemap a las 00:30:35. Revalidado en producción; programación retirada mediante PR #52 (merge `dc4b3cf`), CI aprobado y logs conservados. | — |
| EUW-016 | Mostrar solo 520/780 € en La Escuela | 2026-10-14 | PR #44, commit `2c7d639`, merge `f072916`; check, test, build y smoke aprobados. Curl a /la-escuela/ y /creatuvida/ sin 416 ni 624 a las 09:24:47 UTC. | — |
| EUW-001 | Crear la imagen social predeterminada | 2026-10-01 | PR #40, merge `7f13291`; `/og-default.jpg` HTTP 200, JPEG de 1200 × 630. | [↗](https://app.notion.com/p/3deb9c50d57c810babe9d7aea0bb36bb) |
| EUW-002 | Crear una página de error con diseño de la Fundación | 2026-10-01 | PR #40; ruta inexistente HTTP 404 con diseño y noindex en producción. | [↗](https://app.notion.com/p/3deb9c50d57c816d874ccba831d4e9eb) |
| EUW-003 | Servir el vídeo y póster de estoicismo desde la web propia | 2026-10-01 | PR #40; `/estoicismo/` usa rutas locales, póster HTTP 200 y vídeo HTTP 206 con petición parcial. | [↗](https://app.notion.com/p/3deb9c50d57c81a1a569db3c78d330ea) |
| EUW-004 | Integrar los cuatro tests de descanso en la plantilla | 2026-10-01 | PR #40; cuatro rutas HTTP 200 con cookies/GA4; cronotipo funcional en Chrome local y producción. | [↗](https://app.notion.com/p/3deb9c50d57c8108a7ccee8ec53b91fa) |
| EUW-009 | Actualizar la documentación técnica de la web | 2026-10-01 | PR #40; `README.md` y `AGENTS.md` reflejan rutas y flujo actuales. | [↗](https://app.notion.com/p/3deb9c50d57c81a39eb5d69b11520586) |
| EUW-010 | Ejecutar validaciones automáticas antes de fusionar una PR | 2026-10-01 | PR #40: workflow `validar` aprobado; check, 7 pruebas, build y smoke (65 reproductores/RSS). | [↗](https://app.notion.com/p/3deb9c50d57c81fc8a45f3d02d92a59a) |
| EUW-011 | Retirar ramas remotas ya fusionadas | 2026-10-01 | 34 ramas borradas de origin tras comprobar que sus SHA eran ancestros de `main`; se conservaron main y las dos ramas no fusionadas. | [↗](https://app.notion.com/p/3deb9c50d57c81fa9b96f408f9c4f577) |
| EUW-015 | Publicar el episodio #64 a las 00:30 de Madrid y verificar página, reproductor, RSS e índice | 2026-10-01 | PR #34, merge `8889a19` a las 00:31:08; página, reproductor, índice, RSS y sitemap verificados HTTP 200 a las 00:32:22. Respaldo local `launchd` completado y retirado. | [↗](https://www.notion.so/3ebb9c50d57c814e83dff6a75e7340bf) |
| EUW-014 | Publicar la epístola #22 «No quiero aprovecharlo todo» en la URL indicada por Toñi | 2026-09-30 | PR #31, merge `42d0c30`; `npm run check` y `npm run build` correctos; URL e índice HTTP 200, título y enlaces verificados. | [↗](https://www.notion.so/3ebb9c50d57c81ffbe2ee0eb7aab93c6) |
| EUW-013 | Publicar el destino de los ingresos en las páginas con precio para la revisión de Ad Grants | 2026-09-28 | PR #30, merge `fc4bf71`; siete páginas HTTP 200 y copy nuevo verificados a las 16:45 de Madrid. Fuente funcional: EDE-039. | [↗](https://www.notion.so/3eab9c50d57c8133b0fdea32bcc754dd) |
| EUW-007 | Actualizar los enlaces de pago de CreaTuVida a Stripe de la Fundación | 2026-09-25 | PR #27, merge `59da6e0`; enlaces centralizados en src/data/creatuvida.yaml. Ambos checkouts identifican a la Fundación, verificados el 25-sep. Sin cargo real ni reembolso; detalle en el runbook de EDE. | [↗](https://app.notion.com/p/3deb9c50d57c81e7a840f07e8637563a) |
| EUW-012 | Eude-Score integrado en la web (/test/ con Tally) y podcast con 64 piezas, RSS y sitemap verificados | 2026-09-15 | commits 0704a91, 60efb8f, 3a40c89 | [↗](https://www.notion.so/3e3b9c50d57c811fb6fed3f492591fb5) |

## Bloqueos y necesidades

- EUW-005 depende de decisiones en el proyecto EDE. Los enlaces de tarifa plena y la prueba real de pago/reembolso siguen en EDE; EUW-007 solo cierra la sustitución de los enlaces publicada el 25-sep.
- EUW-006 necesita que Fran indique el nuevo buzón y confirme el tratamiento del anterior antes de modificar copy legal, comercial y de contacto.
- EUW-008 espera la confirmación de Fran y Toñi sobre el cambio en WordPress; el 301 actual mantiene la URL pública operativa.

## Para el PM

- 2026-10-15 · Episodio 65 publicado y verificado: el timer del VPS arrancó a las 00:30:00 de Madrid, fusionó la PR #49 a las 00:30:04 y confirmó producción a las 00:30:35. GitHub llegó después, a las 02:31 y 02:48. EUW-018 cerrada; retirada publicada mediante PR #52, CI aprobado y verificación pública repetida tras fusionar el cierre. Sesión final documentada; evidencias en `docs/publicacion-episodio-65.md`. Mantener un disparador independiente en futuras publicaciones.

- 2026-10-14 · Sesión del episodio 65 documentada y cerrada: contenido en PR #49 pendiente hasta el 15-oct a las 00:30 de Madrid; programación publicada y activa mediante PR #50. Validaciones locales y CI, dry-run de GitHub y calendario real del VPS aprobados. Fran da conformidad tras aclarar que ambos disparadores dependen de GitHub/Coolify y que la web aparece al completar el despliegue. EUW-018 sigue en curso hasta verificar la publicación real y retirar la programación temporal. Evidencias y recuperación en `docs/publicacion-episodio-65.md`.

- 2026-10-14 · Sesión CreaTuVida documentada en `docs/2026-10-14-cierre-creatuvida.md`: auditoría de enlaces, corrección publicada (#44), cierre preparado (#45), calendario y respaldo instalados (#46) y evidencias (#47). Fran confirma el plan tras aclarar que los disparadores comparten GitHub/Coolify y que el estado público cambia al completar el despliegue. EUW-016 hecha; EUW-017 en curso hasta verificar el cierre del 18-oct. Stripe y la rama antigua permanecen intactos.

- 2026-09-28 · Publicado el último cambio pedido por Peter: explicación de los ingresos junto a la oferta y detalle en Transparencia. EUW-013 cerrada. Fran confirma al cierre «Correo enviado»: aviso a Peter con las URL y la petición de revisión final y reenvío. EDE-036 espera la actuación de AboveX y la decisión de Google; no consta aún reenvío ni aprobación.
- 2026-09-28 · Conciliado el estado de pagos: EUW-007 cerrada con el PR #27 del 25-sep, ya documentado como EDE-017. No implica migración de suscripciones ni prueba real de pago/reembolso. La tarifa sin early bird sigue en EDE-038.
- Las tareas de negocio, Ad Grants y migración viven en el ESTADO.md de Escuela de Eudemonía (mismo select en Notion); aquí solo lo técnico de la web Astro.

## Del PM

- 2026-09-17 · creado por el PM en el bootstrap desde AGENTS.md de eudemonia.es; confirmar filas.
- 2026-10-01 · Sync: EUW-001, 002, 003, 004, 009, 010 y 011 cerradas en Notion desde «Hechas» (PR #40), con `Hecha el` 1-oct. EUW-005, EUW-006 y EUW-008 llevan a Notion su nombre nuevo; EUW-006 y EUW-008 En pausa. EUW-006 queda sin fecha por la regla de vencidas (bloqueada, 1.er empuje).
- 2026-10-18 · Cierre: corrección de forma, `Nota:` antepuesto al `Detalle` de EUW-019 (texto sin etiqueta); fondo sin tocar.
- 2026-10-18 · Sync: 1 creada en Notion (EUW-019, En pausa) con su URL en la columna Notion.
