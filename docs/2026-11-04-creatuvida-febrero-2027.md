# CreaTuVida vuelve al 26, 27 y 28 de febrero de 2027

Fran comunica el 4-nov la confirmación de Pablo y autoriza actualizar producción y únicamente los textos de producto/enlaces en Stripe. Continúa siendo la 13.ª edición. Seguimiento: EUW-026 y EDE-044; la programación comercial sigue en EUW-027.

## Alcance publicado

Nueve fuentes: `src/data/creatuvida.yaml`, las páginas `index`, `la-escuela`, `fundacion`, `participa`, `transparencia`, `home-provisional`, la epístola 23 y el episodio 66. Se cambia 29–31 enero por 26–28 febrero. El YAML cubre SEO, OG/Twitter, etiqueta, franja de datos, los tres días y cierre, incluido el mensaje de inscripción cerrada que ahora no se muestra. Las FAQs y formularios no contienen fechas propias de esta edición. No se modifican fechas de ediciones pasadas ni otras actividades de 2027.

Rutas: `/creatuvida/`, `/`, `/la-escuela/`, `/fundacion/`, `/participa/`, `/transparencia/`, `/home-provisional/`, `/epistolas/23_dale-oxigeno-a-tu-mente/`, `/podcast/ep66-deja-de-decir-no-tengo-tiempo/`. La portada provisional redirige a `/` en producción; también se corrige su fuente para una futura publicación. Canonical y redirección de la epístola conservados. No hay automatizaciones de correo de CTV en el repositorio; no se envían emails ni se cambian MailerLite, WordPress o Simplecast.

## Copia y base

Base revisada: `d5a4e5e` de producción, mismo árbol que el cierre local `470406c`. Rama `fix/creatuvida-febrero-2027`, worktree `webs/eudemonia.es/worktrees/ctv-febrero-20261104`. Canónico en `ea1e866` y sus cambios PM conservados, sin pull ni reset.

Antes de escribir: `/home/fran/projects/escuela-de-eudemonia/evidencias/creatuvida-fechas-20261104/antes/`: `astro-fuentes.tar`, patch y estado del canónico, diez respuestas públicas y `stripe.json` con producto, cuatro precios y cuatro enlaces completos. Sin credenciales ni datos de clientes. Archivo tar SHA256 `54269b040b22d4754aa53d1eaa96a58687f5f8641cb275ecc0bec4dd77110812`.

## Stripe

Cuenta real de la Fundación `acct_1UJX36DSZpK2mD7f`. Producto `prod_VWwNh7gtKVT05T`: nombre «CreaTuVida Febrero 2027 · 13.ª edición» y descripción con 26, 27 y 28 de febrero. En cada uno de los cuatro Payment Links se actualiza solo `payment_intent_data.description`, que describe futuras operaciones generadas por el enlace; no se accede ni se escribe sobre cobros existentes. Precios y todos los demás campos comparados antes/después, sin cambios. Registro completo en el repo operativo: `docs/2026-11-04-creatuvida-febrero-2027.md` y `docs/evidencias/creatuvida-fechas-20261104/stripe-cambios.json`.

## Condiciones y dependencias conservadas

- Horarios: viernes/sábado 09:30–19:00, domingo 09:30–14:30, check-in viernes 09:00. Lugar: Residencia Salesiana, calle Bernat Metge 8, El Campello. Proceden de la edición publicada; no se ha recibido nueva confirmación de horarios, reserva del lugar ni alojamiento.
- Fin de anticipada: **17-ene-2027 a las 23:59 Madrid**, general desde 18-ene 00:00. Importes 416/624 y 520/780 €, enlaces, descuentos y estado abierto conservados. No se deduce un nuevo plazo comercial del traslado de la formación.
- Los metadatos de Stripe `ede_event_id`, `event_start_date` y `event_end_date` conservan enero porque la autorización solo permite nombre/descripciones. No deben usarse como nueva confirmación del calendario.
- Simulación local de fusión de la PR #71 con este cambio: **conflicto en `src/pages/index.astro`**. El validador del programador exige fusión limpia y detendrá la publicación; hay que resolver esa PR y actualizar su SHA en el script versionado y en la copia instalada antes del corte. No se modifica ahora una PR de precios ni su autorización temporal.
- Programación de enero sin ejecutar ni modificar: PR #71, workflow, timer y copia instalada. Sus verificaciones esperan `CreaTuVida Enero 2027` y `enero de 2027`; necesitan revisión antes del corte para evitar falsos fallos tras el cambio de textos. El ID técnico de enero sigue siendo el que valida el programador. No cambiarlo aisladamente. La copia de `~/.local/lib/eudemonia-ctv-fin-anticipada-20270118/` coincide con el script versionado; el estado del timer no pudo reconsultarse por falta de acceso al bus de usuario desde esta sesión.
- Logística y gracias en `.com` devolvieron 403 al GET sin sesión de esta revisión: no se certifica su contenido ni la entrega de correos. El encargo no autoriza modificar WordPress ni servicios externos de correo.

## Validación y reversión

`check`: 0 errores/advertencias (5 sugerencias previas). 47 pruebas aprobadas. Build y smoke correctos, 67 episodios en RSS y reproductores. Búsqueda del build completo sin la antigua fecha de esta edición. Chromium comprueba nueve rutas a 390/1440 px y CreaTuVida adicionalmente a 320/768/1024 px: fecha, metadatos, días, precios, enlaces, FAQ y ausencia de desbordamiento; terceros y envíos bloqueados. Verificación pública y capturas finales en la evidencia del repo operativo.

Revertir solo el commit de contenido mediante una rama nueva y PR, validar y fusionar; no restaurar todo el tar sobre cambios posteriores. Para Stripe, restaurar únicamente los seis campos registrados (nombre y descripción del producto; descripción de cada enlace), usando la comparación previa del script de reversión y el snapshot. No cambiar precios, metadatos, clientes, suscripciones, cobros ni reembolsos. El informe operativo recoge SHA/PR de despliegue y evidencia final.
