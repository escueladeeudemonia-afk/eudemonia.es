---
proyecto: eudemonia.es (web)
prefijo: EUW
siguiente_id: 23
estado_proyecto: activo
responsable: Fran
personas: Pablo Tovar (decisor), Toñi (podcast); deploy automático a producción en cada merge
actualizado: 2026-10-19
actualizado_por: PM (limpieza aprobada 2026-10-19)
ultima_sync_pm: 2026-10-19
---

# ESTADO — eudemonia.es (web)

<!-- Interfaz proyecto ⇄ Project Manager. Formato y reglas: ~/Projects/Project Manager/docs/plantilla-estado.md
     No cambies el orden ni el nombre de las columnas. No reutilices IDs. Sin secretos: solo punteros. -->

## Pendientes

| ID | Tarea | P | Deadline | Resp. | Estado | Notion |
|---|---|---|---|---|---|---|
| EUW-020 | Publicar una portada aprobada con datos de contacto correctos | P2 | — | Fran | [!] | [↗](https://www.notion.so/3feb9c50d57c81f78987fd9603b7e2f2) |
| EUW-021 | Que la epístola 21 tenga una dirección coherente sin perder lectores | P3 | — | Fran | [!] | [↗](https://www.notion.so/3feb9c50d57c81df8631d537ab6fbf58) |
| EUW-022 | Decidir: validar la suscripción de epístolas tras comprobar un alta real | P1 | — | Fran | [!] | [↗](https://www.notion.so/3feb9c50d57c81c1b951d96e81208e32) |
| EUW-019 | Comprobar el alta y la recepción real del nuevo correo de epístolas | P1 | 2026-10-31! | Fran | [~] | [↗](https://www.notion.so/3fdb9c50d57c815b93bbed6c318eb551) |

Leyenda Estado: `[ ]` pendiente · `[~]` en curso · `[!]` bloqueada · `[x]` hecha · `[-]` cancelada. Deadline con `!` = duro (externo, no se mueve).

### Detalle

- **EUW-020** — Por qué: completar el resultado «Publicar una portada aprobada con datos de contacto correctos» sin perder condiciones, evidencias ni pasos de las tareas originales. Dur: 60. Nota: Depende de la decisión editorial de Pablo y del buzón confirmado; coordinar con EDE sin duplicar el trabajo. Decisiones relacionadas: 4 de la limpieza; se identifican en Bloqueos. Pasos que quedan, conservando el contexto de cada origen: (EUW-005) Aprobar y publicar la nueva home; retirar los borradores sin romper los enlaces compartidos — estado previo bloqueada; prioridad P2; fecha sin fecha; responsable Fran; tarjeta de origen https://app.notion.com/p/3deb9c50d57c81a59aeced5abac1858d; Por qué previo → la home aprobada reemplazará la propuesta provisional sin perder enlaces previos. Con previo → Pablo. Bloqueada por previo → aprobación editorial de Pablo (EDE-027). Nota previo → CreaTuVida ya está publicada; el borrador conserva una redirección compartida con Pablo, así que mantener el 301 al retirar su archivo. · Paso siguiente: (EUW-006) Confirmar el correo de contacto nuevo y sustituir la dirección antigua en la web — estado previo bloqueada; prioridad P2; fecha sin fecha; responsable Fran; tarjeta de origen https://app.notion.com/p/3deb9c50d57c81bcacced297be950e74; Por qué previo → quien escriba a la dirección vieja puede no llegar a nadie; hay que coordinar web y correo. Necesita previo → Fran confirme la dirección nueva y la redirección del buzón anterior; hay apariciones en participa, gracias, privacidad, aviso legal, transparencia y `creatuvida.yaml`, algunas sujetas a revisión legal o comercial. Dur previo → 30. Bloqueada por previo → decisión de Fran sobre qué direcciones sustituir.
- **EUW-021** — Por qué: completar el resultado «Que la epístola 21 tenga una dirección coherente sin perder lectores» sin perder condiciones, evidencias ni pasos de las tareas originales. Dur: 30. Nota: El enlace público funciona mediante redirección; falta confirmar el cambio de la dirección interna con Toñi. Pasos que quedan, conservando el contexto de cada origen: (EUW-008) Confirmar y corregir el slug interno de la epístola #21 en WordPress — estado previo bloqueada; prioridad P3; fecha sin fecha; responsable Fran; tarjeta de origen https://app.notion.com/p/3deb9c50d57c8113a88dd7fa908601fb; Por qué previo → Toñi sigue viendo el slug con guion bajo en WordPress aunque la URL canónica del .es ya usa guiones; el 301 actual evita el 404. Con previo → Toñi. Bloqueada por previo → confirmación explícita pendiente desde la sesión del 31-ago; ver `Escuela de Eudemonía/docs/wordpress.md` y `migracion/redirecciones.md`. Necesita previo → Fran confirme con Toñi el cambio del slug de WP ID 6708 y el mantenimiento de la redirección anterior.
- **EUW-022** — Por qué: desbloquear una decisión que requiere a Fran y no debe deducirse de avances técnicos. Dur: 15. Bloqueada por: Esperándote: comprobar el alta real, recepción, remitente, confirmación y grupo del nuevo formulario de epístolas; la publicación del ensayo ya está acreditada por la API pública, por lo que no hay que volver a autorizarla. Nota: decisión 6 de la limpieza aprobada. Orígenes relacionados: EUW-019, ENS-024. Objetivos relacionados: EUW-019; la publicación del ensayo ya está acreditada. Esta tarea no absorbe de nuevo los orígenes: solo registra la decisión.
- **EUW-019** — Por qué: la web publicada no demuestra que la persona reciba y confirme correctamente el correo. Dur: 30. Necesita: evidencia de un alta real con el nuevo formulario, recepción, remitente y texto adecuados, enlace de confirmación operativo y pertenencia al grupo correcto. Nota: PR #54 fusionada el 18-oct y sustituida por PR #58 el 19-oct; formulario nuevo MailerLite Classic 6138835 / c2f9e8, GET público HTTP 200 el 19-oct a las 07:54 UTC. El éxito y recepción que Fran confirmó con el formulario anterior no acreditan el nuevo. Fran confirma aviso a Pablo enviado el 19-oct desde fran.lledo@eudemonia.es. No se enviaron altas ni correos en esta revisión. Contexto previo conservado: Nota previo → Fran crea y proporciona el 19-oct el formulario MailerLite Classic `6138835` / `c2f9e8`, destinado según su configuración al grupo Newsletter. Se sustituye el formulario Kadence y se retira su proxy WordPress. La portada pasa de un enlace pequeño al final a un bloque destacado después de la presentación, con botón «Recibir las epístolas» y acceso a las anteriores. Check, pruebas, build y smoke aprobados; Chromium verifica validación, envío al formulario nuevo y redirección con la respuesta interceptada, sin altas ni correos reales. Publicación mediante PR #58; pendiente comprobar la recepción real del correo del formulario nuevo. Detalle y antecedentes: `docs/2026-10-17-suscripcion-epistolas.md`

## Hechas desde la última sincronización

| ID | Tarea | Fecha | Evidencia | Notion |
|---|---|---|---|---|
| EUW-018 | Publicar el episodio #65 a las 00:30 de Madrid y verificar página, reproductor, RSS e índice | 2026-10-15 | PR #49, merge `224ffea` a las 00:30:04; VPS arrancó a las 00:30:00 y verificó página, reproductor, índice, RSS y sitemap a las 00:30:35. Revalidado en producción; programación retirada mediante PR #52 (merge `dc4b3cf`), CI aprobado y logs conservados. | [↗](https://www.notion.so/3feb9c50d57c813f8919c63e684db618) |
| EUW-016 | Mostrar solo 520/780 € en La Escuela | 2026-10-14 | PR #44, commit `2c7d639`, merge `f072916`; check, test, build y smoke aprobados. Curl a /la-escuela/ y /creatuvida/ sin 416 ni 624 a las 09:24:47 UTC. | [↗](https://www.notion.so/3feb9c50d57c8124a2aecdecfd5fbbb2) |
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

| EUW-005 | Aprobar y publicar la nueva home; retirar los borradores sin romper los enlaces compartidos | 2026-10-19 | cancelada: absorbida en EUW-020 (limpieza 2026-10-19) | [↗](https://app.notion.com/p/3deb9c50d57c81a59aeced5abac1858d) |
| EUW-006 | Confirmar el correo de contacto nuevo y sustituir la dirección antigua en la web | 2026-10-19 | cancelada: absorbida en EUW-020 (limpieza 2026-10-19) | [↗](https://app.notion.com/p/3deb9c50d57c81bcacced297be950e74) |
| EUW-008 | Confirmar y corregir el slug interno de la epístola #21 en WordPress | 2026-10-19 | cancelada: absorbida en EUW-021 (limpieza 2026-10-19) | [↗](https://app.notion.com/p/3deb9c50d57c8113a88dd7fa908601fb) |
| EUW-017 | Cerrar las inscripciones de CreaTuVida a las 23:59 de Madrid y verificar el despliegue | 2026-10-19 | Commit 7682d36 del 18-oct a las 23:59:03 de Madrid. GET público del 19-oct a las 07:30:38 UTC: https://eudemonia.es/creatuvida/ HTTP 200, Acceso cerrado y cero enlaces de pago Stripe; sin cambios en Stripe. | [↗](https://www.notion.so/3feb9c50d57c81f4a658df222890d69e) |

## Bloqueos y necesidades

- EUW-005 depende de decisiones en el proyecto EDE. Los enlaces de tarifa plena y la prueba real de pago/reembolso siguen en EDE; EUW-007 solo cierra la sustitución de los enlaces publicada el 25-sep.
- EUW-006 necesita que Fran indique el nuevo buzón y confirme el tratamiento del anterior antes de modificar copy legal, comercial y de contacto.
- EUW-008 espera la confirmación de Fran y Toñi sobre el cambio en WordPress; el 301 actual mantiene la URL pública operativa.

- Limpieza 2026-10-19: los bloqueos previos que citan IDs absorbidos son contexto de sus pasos, conservado en el Detalle del objetivo nuevo; las referencias de las otras secciones siguen siendo antecedentes, no tareas abiertas adicionales.
- EUW-020 bloqueada: todos sus pasos siguen bloqueados; orígenes EUW-005, EUW-006. Las condiciones originales están conservadas en su Detalle.
- EUW-021 bloqueada: todos sus pasos siguen bloqueados; orígenes EUW-008. Las condiciones originales están conservadas en su Detalle.
- Esperándote: comprobar el alta real, recepción, remitente, confirmación y grupo del nuevo formulario de epístolas; la publicación del ensayo ya está acreditada por la API pública, por lo que no hay que volver a autorizarla (EUW-022).

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
- 2026-10-19 · Cierre: corrección de forma, `Nota:` antepuesto al `Detalle` de EUW-017 (texto sin etiqueta); fondo sin tocar.
- 2026-10-19 · Sync: 3 creadas en Notion (EUW-017 abierta; EUW-016 y EUW-018 al diario) · EUW-019 → En proceso · EUW-017 vencida (dura, 18-oct) → 22-oct, 1.er empuje.

- 2026-10-19 · Limpieza aprobada por Fran: 3 filas nuevas de objetivos/decisiones; 4 filas anteriores trasladadas a Hechas con motivo y enlaces. Preparación para aplicar por operador; las nuevas URLs de Notion están pendientes de rellenar.
