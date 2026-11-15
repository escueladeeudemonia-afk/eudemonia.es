# Evaluación de la relación de pareja

## Publicación y trabajo en curso

La versión local está publicada en /evaluacion-pareja/ mediante PR #91, sin analítica, fuera del menú y del sitemap. Título y publicación autorizados por Pablo. Conserva el logo original de la Fundación, uso individual o en pareja y módulo sexual opcional.

La rama codex/evaluacion-pareja-cloud prepara la versión 0.2.0: escala de 1 a 5, Supabase, comparación por consentimiento, plan compartido y PDF generado en el navegador. No está publicada. Pablo interrumpe la sesión el 15-nov-2026 a las 13:03 y continúa más tarde. No desplegar esta rama como proceso terminado mientras falten las comprobaciones siguientes.

## Decisiones de Pablo

- Escala de 1 a 5, también importancia y contexto; omisiones excluidas, al menos cuatro de seis para una media.
- Acceso individual y pareja. Sin ChatGPT. Gratuito por ahora. No introducir Stripe en esta fase.
- Proyecto nuevo Eudemonía Parejas en ptovar13's Org, Frankfurt. Referencia y URL públicas en cloud-config.json.
- Piloto limitado a las cuentas de Pablo y Vero. Cada uno mantiene un borrador privado y elige qué comparte.
- Remitente institucional privado: direccion@eudemonia.es, sin tilde. Acceso al buzón sólo Pablo y Vero. No utilizar contacto@ ni Addventure.

## Datos y permisos

El código del cuestionario está en tools/evaluacion-pareja. La base de datos vive en Supabase, esquema relationship_private, RLS y sin permisos directos de tablas para clientes. La única entrada pública es relationship_api, con autenticación, correo confirmado, lista privada del piloto y comprobación de pertenencia en cada operación. La clave del cliente es publicable; nunca incluir service_role ni claves secretas.

Cada evaluación tiene como máximo dos miembros. Los borradores son de su titular. La publicación crea una proyección calculada por el servidor, que por defecto incluye resúmenes generales y contexto. Intimidad, ítems y textos requieren opciones adicionales. Comparación y plan sólo utilizan áreas compartidas por ambos. Retirar impide nuevas consultas; no borra archivos ya descargados. Los administradores de Supabase pueden acceder al almacenamiento; auditar aparte sus permisos.

Invitaciones aleatorias de un solo uso, almacenadas sólo como hash y válidas siete días. Guardados y planes con revisión para evitar sobreescrituras. Sesión del navegador en sessionStorage; las respuestas no se guardan allí. Los PDF se crean en el dispositivo con pdf-lib y Poppins, sin subirlos a terceros ni usar IA externa. La copia sin conexión no incorpora Supabase y conserva connect-src none. Exportaciones .eudemonia cifradas con AES-GCM/PBKDF2; el lector convierte 0.1.0 a 0.2.0 sumando uno y preserva omisiones.

Las migraciones se generan con Supabase CLI y se conservan con las versiones reales aplicadas en supabase/migrations. backend/authorization-test.sql se ejecuta en una transacción que revierte usuarios, permisos temporales y respuestas ficticias. No es una puerta de acceso de prueba.

## Verificación al interrumpir

- Astro check: sin errores; avisos existentes y de APIs obsoletas.
- npm test: 68/68 aprobadas, incluyendo 17 comprobaciones del motor y PDF con datos parciales, opcionales y textos largos.
- Build de 119 páginas aprobado.
- Smoke pendiente: falla la comprobación de secretos de scripts/comprobar-build.mjs:105. Inspeccionar si service_role es una cadena de la biblioteca empaquetada y sustituir la detección por una prueba que detecte claves reales sin falsos positivos. No retirar la protección sin revisar.
- SQL: comprobados aislamiento, pertenencia, permisos de lectura, exclusión sexual, retirada, revisiones, escala 1-5 y token de un solo uso. Tras rollback: cero usuarios y cero borradores; sólo dos entradas autorizadas del piloto.
- Asesor de seguridad: sin avisos de nivel warning/error. Siete INFO por RLS sin políticas en esquema privado sin acceso directo; patrón intencionado.
- PDF de prueba generado: 22 páginas. Falta inspección visual, descarga en navegador y contraste de contenido/redacción con permisos.
- Faltan pruebas en navegador, incluidos restaurar, compartir, retirar, conflictos y generación del PDF.

## Retomar: correo y recorrido completo

La pestaña de Google se cerró antes de completar la verificación del titular. El buzón direccion@ no está creado ni el SMTP configurado. Las contraseñas y contraseñas de aplicación debe introducirlas Pablo directamente en el proveedor, nunca en el chat o repositorio.

1. Crear el buzón privado en Google Workspace; comprobar acceso y que no tenga delegación a otros.
2. Configurar el envío en Supabase con ese remitente. Verificar documentación actual de Google y Supabase, política de verificación en dos pasos, límites y permisos. No dar por preparado el acceso con el SMTP de prueba.
3. Configurar URL de sitio y redirección exacta /evaluacion-pareja/aplicacion.html; plantilla con enlace/código según la interfaz implementada. No enviar pruebas reales desde el agente.
4. Revisar administradores del proyecto/organización. La lista del piloto sólo limita a usuarios de la aplicación.
5. Completar smoke, PDF visual y pruebas de recorrido con datos ficticios; después prueba personal de Pablo y Vero desde sus cuentas.
6. Revisar diff, PR, controles, merge autorizado y Coolify. Verificar HTTPS, login propio, comparación y descarga antes de declarar disponible el proceso.

## Reversión

No se ha fusionado la rama. La web publicada conserva su funcionamiento local. Para revertir una publicación futura, PR de reversión de cliente y build; no borrar datos privados automáticamente. Las migraciones ya aplicadas están en un proyecto separado, sin respuestas reales.
