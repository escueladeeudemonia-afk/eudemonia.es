# Fin de la tarifa anticipada de CreaTuVida · 17 enero 2027

Fran confirma **17 de enero de 2027 incluido**. La oferta de 416/624 € termina a las 23:59 de Madrid; la tarifa general de **520/780 €** comienza el **18-ene a las 00:00 Europe/Madrid**, equivalente a **17-ene a las 23:00 UTC**. No es el cierre de inscripciones del curso.

## Fecha publicada y cambio preparado

- Fecha publicada en CreaTuVida, portada y La Escuela mediante [PR #70](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/70), merge `254ce29`. Los dos checkouts anticipados muestran también el límite, conservando su importe y estado activo.
- [PR #71](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/71) **abierta, sin fusionar hasta el corte**. Rama `fix/creatuvida-tarifa-general-20270118`, SHA `4736e3e2e91f25ba5b4414942c3c07a6989d4d4f`. Cambia únicamente `src/data/creatuvida.yaml`, `src/pages/index.astro` y `src/pages/la-escuela.astro`: 520/780 €, enlaces generales de enero y retirada del copy anticipado. Check, test, build, smoke y HTML futuro aprobados; CI aprobada, ejecución `40876248681`.
- Producto, cuenta, cuatro precios y enlaces: `docs/evidencias/ctv-enero-2027/stripe-catalogo.json`. El inventario registra las fechas como datos públicos; la caducidad se ejecuta mediante el programador, no por esos metadatos.

## Ejecución

`scripts/finish-creatuvida-early-bird-2027.mjs` admite dos ejecuciones simultáneas e idempotentes:

1. **VPS, principal:** timer persistente `eudemonia-ctv-fin-anticipada-20270118.timer`, activado para `2027-01-17 23:00:00 UTC`, precisión 1 segundo y usuario con linger. Copia instalada en `~/.local/lib/eudemonia-ctv-fin-anticipada-20270118/`. La autenticación de GitHub procede de `gh`; la clave restringida de Stripe se inyecta mediante el `ai-op run` y la referencia de 1Password existentes. No se guarda en las unidades ni en la web. Reintenta cada 60 segundos ante fallos.
2. **GitHub, respaldo de la web y comprobación pública:** `.github/workflows/creatuvida-fin-anticipada-17-ene-2027.yml`, cron 17-ene a las 22:43 UTC con espera hasta las 23:00 y reintentos a las 23:07, 23:17 y 23:27. Usa `WEB_ONLY=true`: fusiona/verifica la web y después abre ambos enlaces de Stripe en Chromium, sin credenciales, para comprobar que muestran el aviso de oferta terminada. Si el servidor no los cerró, falla el workflow y deja aviso en su resumen, además del estado fallido de Actions y sus notificaciones según la configuración de GitHub del usuario.

La revisión automática rechazó transferir la clave de Stripe a GitHub por no existir autorización expresa para ese destino. Se adoptó el respaldo público descrito: **no se copió ninguna clave ni se creó un secreto de Stripe en GitHub**. La escritura en Stripe depende del VPS y de 1Password; GitHub la comprueba desde fuera. Ambos disparadores de publicación dependen de GitHub y Coolify.

El programador valida repositorio, rama, SHA, lista exacta de archivos, conflictos y CI antes de fusionar. Stripe se trata de forma independiente: un fallo de GitHub no prolonga el descuento si Stripe está disponible, y viceversa. Antes de escribir valida cuenta, entorno real, edición, precios, producto e importes de los cuatro enlaces y que las tarifas generales sigan activas. Solo desactiva los dos enlaces anticipados de enero, con mensaje hacia `/creatuvida/`; después caduca sus sesiones Checkout abiertas para que una sesión ya iniciada no conserve el descuento. Nunca modifica pagos completados. Las carreras con otra ejecución o con un pago se vuelven a consultar.

El modo real no opera antes del corte y caduca el 20-ene a las 23:00 UTC. El calendario de Actions no fija año, pero esta barrera hace inocuos los disparos posteriores. La web cambia cuando Coolify termina el despliegue: la hora del timer no garantiza HTML nuevo instantáneo. Las verificaciones posteriores comprueban precios y enlaces en las tres páginas, ausencia de oferta y estado de Stripe.

## Comprobaciones realizadas

- Dieciséis pruebas del programador: huso horario, ensayo sin escrituras, bloqueo antes de fecha, SHA/archivos/CI, identidad e importes de Stripe, reintentos, cierre de sesiones, independencia de fallos y respaldo sin clave.
- Ensayo contra GitHub y Stripe reales: PR #71 sin fusionar; cuatro precios/enlaces y permisos de lectura de sesiones comprobados; sin escrituras.
- Disparo real de un timer de prueba el 29-oct a las **13:53:27 de Madrid**, terminado a las **13:53:31**, `Result=success`, código 0. Ejecutó el mismo script instalado con `DRY_RUN=true`; GitHub y Stripe respondieron `dry-run`. No fusionó ni cerró enlaces. Journal en `docs/evidencias/ctv-enero-2027/timer-ensayo.log`.
- Fecha pública del 17-ene verificada; las dos tarifas anticipadas siguen vigentes. Check, test, build y smoke del programador aprobados.
- Programador publicado mediante [PR #72](https://github.com/escueladeeudemonia-afk/eudemonia.es/pull/72), CI completa aprobada. Ensayo de GitHub en `main` [40878163898](https://github.com/escueladeeudemonia-afk/eudemonia.es/actions/runs/40878163898) terminado con éxito: barreras, PR sin fusionar y ambos checkouts públicos activos verificados, sin credenciales de Stripe. Evidencia en `docs/evidencias/ctv-enero-2027/github-ensayo.json`.
- Comprobación final: PR #71 sigue abierta con el SHA previsto; timer de enero habilitado y activo, próxima ejecución 18-ene-2027 a las 00:00 CET. Timer transitorio de prueba detenido.

Estas pruebas acreditan la instalación y el ensayo. La fusión, desactivación y verificación reales de enero quedan pendientes hasta la fecha autorizada.

## Comprobar, recuperar y cancelar

```bash
systemctl --user status eudemonia-ctv-fin-anticipada-20270118.timer
journalctl --user -u eudemonia-ctv-fin-anticipada-20270118.service --no-pager
gh run list --repo escueladeeudemonia-afk/eudemonia.es --workflow creatuvida-fin-anticipada-17-ene-2027.yml
```

Ensayo manual seguro en el VPS, sin escrituras:

```bash
DRY_RUN=true /home/fran/.local/bin/ai-op run \
  --env-file=/home/fran/projects/escuela-de-eudemonia/repo/config/stripe.1password.env \
  -- /usr/bin/node /home/fran/.local/lib/eudemonia-ctv-fin-anticipada-20270118/finish-creatuvida-early-bird-2027.mjs
```

Después del corte, dentro de la ventana de recuperación, `systemctl --user start eudemonia-ctv-fin-anticipada-20270118.service` repite el trabajo pendiente sin duplicar la fusión ni afectar a otros enlaces. Si GitHub publica pero detecta los enlaces aún activos, recuperar esta unidad del VPS; el respaldo de GitHub no tiene la clave de Stripe.

Para cancelar por decisión de Fran: deshabilitar el timer, detener el servicio si está ejecutándose y deshabilitar el workflow; conservar la PR #71 abierta hasta acordar su nueva fecha o cerrarla si se cancela. No modificar la PR programada sin revisar y actualizar su SHA en el script versionado y en la copia instalada. Tras la ejecución real, conservar evidencias y retirar los disparadores.
