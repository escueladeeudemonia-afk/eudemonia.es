# CreaTuVida: fin de anticipada el domingo 7 de febrero de 2027

Confirmación expresa de Fran el 4-nov-2026. Formación **26, 27 y 28 de febrero de 2027**; horarios, lugar y demás condiciones conservados. Anticipada válida durante todo el **domingo 7-feb**, general desde **lunes 8-feb 00:00 Europe/Madrid**, equivalente a **2027-02-07T23:00:00Z**. No se envían emails ni se realizan pagos.

## Cambio actual y copia

Cambian el texto de plazo y el inicio de tarifa general en `src/data/creatuvida.yaml`, y el plazo en `src/pages/index.astro` y `src/pages/la-escuela.astro`. URLs: https://eudemonia.es/, https://eudemonia.es/la-escuela/ y https://eudemonia.es/creatuvida/. No hay cuenta atrás ni automatismo de correo con este plazo en las fuentes publicables; metadatos SEO/social conservan la fecha correcta del curso y no contienen el plazo antiguo. La búsqueda abarca `src/`, `public/`, scripts y workflows. Se conservan importes actuales 416/624 €, futuros 520/780 €, IDs y URLs de Stripe.

Rama `fix/creatuvida-fin-anticipada-febrero`, base `5c283a80989b2ff14c705f2e5866bddcd9704099`; texto en `df194ea822ccec3613c760c33def4199b661515b`. Copia anterior a escrituras en `/home/fran/projects/escuela-de-eudemonia/evidencias/ctv-fin-anticipada-20270207/antes/`: archivo de fuentes, HTML público, catálogo Stripe completo, PR #71, unidades/script instalados y parche PM del canónico. La rama local `backup/ctv-pr71-antes-20261104` conserva el SHA anterior `4736e3e`. El árbol canónico y sus cambios PM no se modifican.

## PR futura y ejecución

[PR #71](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/71) conserva su nombre histórico de rama `fix/creatuvida-tarifa-general-20270118`, pero su contenido y título corresponden a febrero. **SHA autorizado `f96959b52cfa59d4638823cc05d2527768c62f9a`**. Conflicto resuelto conservando las fechas nuevas y las modificaciones de producción. Solo difieren YAML, portada y La Escuela: precios generales, enlaces generales y retirada del copy anticipado. CI [41836890205](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/41836890205) aprobada. **No fusionar antes del corte.**

`scripts/finish-creatuvida-early-bird-2027.mjs`:

- Ventana de preparación desde 7-feb 22:30 UTC; espera al corte, operaciones permitidas hasta 10-feb 23:00 UTC. Enero y años posteriores quedan bloqueados.
- Valida PR/SHA/archivos/CI y, por separado, cuenta real, producto, cuatro precios/importes, fechas en metadatos y enlaces generales activos. Cuenta `acct_1UJX36DSZpK2mD7f`, producto `prod_VWwNh7gtKVT05T`.
- Conserva la independencia entre publicación y Stripe: un fallo web no prolonga el descuento. Al corte solo cierra los dos enlaces anticipados y caduca sus sesiones Checkout **abiertas**; nunca pagos completados, clientes, suscripciones, precios o reembolsos. Los generales ya están activos y permanecen activos. No se ha ejecutado este cierre durante la preparación.
- Comprueba las tres páginas tras desplegar: febrero, 520/780 €, enlaces generales y ausencia de anticipada. La comprobación pública de Stripe cubre los cuatro enlaces; en ensayo deben estar activos y en ejecución los anticipados deben mostrar el aviso finalizado y los generales seguir disponibles.

Workflow `.github/workflows/creatuvida-fin-anticipada-7-feb-2027.yml`: preparación 7-feb 22:43 UTC, reintentos 23:07/17/27 UTC. Retirado el calendario de enero. `WEB_ONLY=true`; no contiene clave de Stripe. Respalda la web y detecta que Stripe no se haya cerrado, pero no puede cerrarlo. El HTML cambia al terminar Coolify; el horario de los disparadores no garantiza puntualidad instantánea de API o despliegue.

## Instalación del VPS pendiente

Se han preparado `ops/eudemonia-ctv-fin-anticipada-20270208.{timer,service}` e instalador. El timer fija `OnCalendar=2027-02-07 23:00:00 UTC`, persistencia y precisión de un segundo. **No está instalado ni habilitado desde esta sesión:** el entorno no permite escribir en `~/.config/systemd/user` o `~/.local/lib` y no accede al bus del usuario (`No data available`). No se ha alterado el timer antiguo del host.

Ejecutar como Fran, sin sudo, en una terminal normal del VPS:

```bash
bash /home/fran/projects/escuela-de-eudemonia/webs/eudemonia.es/worktrees/ctv-fin-anticipada-20270207/ops/instalar-fin-anticipada-20270208.sh
```

El instalador comprueba acceso, pruebas, fecha/SHA y ensayo real de lectura; guarda copia, deshabilita enero, instala febrero, dispara un timer transitorio con `DRY_RUN=true` y solo habilita el calendario real tras comprobar `Result=success`. Deja journal, estado y hash en `evidencias/ctv-fin-anticipada-20270207/instalacion-<fecha>/`. No inicia el servicio real. Revisar que `NextElapseUSecRealtime` sea **8-feb-2027 00:00 CET** y que enero quede deshabilitado.

El ensayo del script instalado antiguo falla por **dos barreras independientes**: espera el SHA anterior de #71 y metadatos de enero. Por tanto no puede publicar ni cerrar los enlaces con su estado actual. Esto no sustituye retirar ese timer ni instalar febrero. La preparación permanece abierta en EUW-027 hasta completar la instalación y, después del corte, verificar el resultado real.

## Stripe y comprobaciones

Actualizados 43 campos en nueve objetos: 41 metadatos con fechas antiguas (producto, cuatro objetos Price y cuatro Payment Links, incluidos metadatos de PaymentIntent) y dos mensajes descriptivos del plazo en checkouts anticipados. Se compararon objetos completos antes/después: importes, moneda, estados activos y demás configuración intactos. Producto y descripciones del evento ya estaban en febrero por el encargo previo. Los metadatos no ejecutan la caducidad por sí solos.

| Modalidad | Importe conservado | Enlace |
|---|---:|---|
| Particulares anticipada | 416 € | https://book.stripe.com/28EbJ15tD6Qd6yy75gdEs07 |
| Empresas anticipada | 624 € | https://book.stripe.com/4gMeVd3lv1vT1eeahsdEs08 |
| Particulares general | 520 € | https://book.stripe.com/7sYcN57BLb6t4qq4X8dEs09 |
| Empresas general | 780 € | https://book.stripe.com/aFa14n6xH5M9aOO4X8dEs0a |

Registro campo a campo, copias, comandos de reversión, resultados de producción y capturas en el repositorio común: `repo/docs/2026-11-04-fin-anticipada-febrero-2027.md` y `repo/docs/evidencias/ctv-fin-anticipada-20270207/`.

Check, **52 pruebas** (21 del programador), build y smoke aprobados. Ensayo real de GitHub/Stripe con `DRY_RUN=true` aprobado, sin escrituras. Validación de unidades y sintaxis del instalador aprobadas; no equivalen al disparo real del timer del VPS. Builds actual y futuro comprobados en Chromium a 320/390/768/1280/1440 px, tres rutas cada uno, sin desbordamiento; horarios y metadatos comprobados. El registro operativo incorpora la comprobación de producción después del merge y el ensayo de Actions desde `main`.

## Recuperación y reversión

Tras el corte y antes de caducidad, repetir el servicio nuevo permite recuperar fallos sin duplicar merge ni operar otros enlaces:

```bash
systemctl --user status eudemonia-ctv-fin-anticipada-20270208.timer
journalctl --user -u eudemonia-ctv-fin-anticipada-20270208.service --no-pager
# Solo después del corte:
systemctl --user start eudemonia-ctv-fin-anticipada-20270208.service
```

Para cancelar el automatismo por una nueva instrucción: deshabilitar timer nuevo, detener servicio y deshabilitar el workflow correspondiente. No reactivar enero. Si cambia #71, revisar contenido/CI y sincronizar SHA en código y copia instalada. Tras verificar la ejecución futura, retirar los disparadores temporales.

Para revertir solo el texto publicado, revertir `df194ea` mediante nueva rama/PR con check/test/build/smoke; esto devuelve un plazo que Fran ha sustituido, por lo que no debe ejecutarse sin decisión expresa. Para revertir programación, cancelar primero los disparadores: restaurar simplemente el código anterior reintroduciría enero. Para Stripe usar el registro antes/después del repo operativo y restaurar únicamente los campos enumerados, con lectura previa para detectar modificaciones posteriores. No restaurar objetos completos ni importes/estados. La restauración de metadatos de PaymentIntent debe conservar su mapa completo (Stripe reemplaza el mapa anidado).
