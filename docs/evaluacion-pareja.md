# Evaluación de la relación de pareja

## Versión 0.2.0 y publicación

Pablo autoriza el título «Evaluación de la relación de pareja», /evaluacion-pareja/, uso individual o en pareja y publicación gratuita. La versión local inicial se publicó mediante PR #91. La ampliación se revisa en PR #92; aún no se declara verificado el recorrido autenticado ni la recepción de correo.

Incluye 54 preguntas originales inspiradas en Beck, nueve dimensiones y módulo sexual opcional. La escala es 1-5 en conductas, importancia y contexto; las omisiones no puntúan. Cada media exige al menos cuatro respuestas válidas de seis. Los archivos 0.1.0 se convierten sumando uno y conservando omisiones. No hay nota global ni diagnóstico clínico ni validación psicométrica.

La evaluación conserva el logo original autorizado de la Fundación, no incorpora analítica y permanece fuera del menú y del sitemap. La copia descargable funciona sin cuenta ni red. Stripe queda fuera de esta fase.

## Acceso y guardado

Proyecto separado Eudemonía Parejas en ptovar13's Org, región eu-central-1 (Frankfurt), referencia y URL públicas en cloud-config.json. Se usa sólo una clave publicable en el cliente.

La base vive en el esquema no expuesto relationship_private. Todas sus tablas tienen RLS y sin acceso directo de anon/authenticated. El wrapper relationship_api sólo se puede ejecutar con sesión; la función interna comprueba UID, usuario existente, correo confirmado, ausencia de bloqueo, lista privada del piloto y pertenencia a la evaluación. No autoriza a partir de metadatos editables del usuario. La lista contiene únicamente las cuentas verificadas de Pablo y Vero.

Cada evaluación admite como máximo dos miembros. La invitación tiene 32 bytes aleatorios, se almacena como hash, caduca a los siete días y se utiliza una vez. Borradores y planes usan revisiones para detectar cambios de otro dispositivo. Las elecciones privadas de participación y seguridad se confirman en cada acceso y no se guardan ni exportan.

La sesión usa sessionStorage y no contiene respuestas. El borrador propio se guarda en Supabase únicamente tras elegir esa modalidad y confirmar la participación. La modalidad local conserva las respuestas en memoria, con exportación voluntaria cifrada AES-GCM/PBKDF2.

## Compartir, comparar e informes

Compartir crea una versión calculada por el servidor a partir del borrador propio. Por defecto incluye alias, periodo, contexto y resúmenes generales. Intimidad sexual, ítems y textos requieren elecciones adicionales. La pareja nunca recibe el borrador privado.

El informe conjunto y el plan sólo consideran dimensiones compartidas por ambos. Si se retira una versión, las nuevas consultas dejan de incluirla y se oculta el plan correspondiente. Los PDF descargados no se borran de otros dispositivos. La eliminación de datos propios exige una acción explícita del titular.

Los PDF se generan en el navegador con pdf-lib y Poppins, sin subir informes a terceros ni usar IA externa. Conservan cuatro perspectivas, coberturas n/6, omisiones y plan de catorce días. Los campos no acordados siguen pendientes. El anexo utiliza una dimensión por página para evitar tablas partidas.

## Correo institucional y administración

Remitente: direccion@eudemonia.es, Escuela de Eudemonía. Buzón creado por Pablo y primer inicio de sesión completado. Verificación en dos pasos confirmada en Google. El titular genera y conserva la clave de aplicación; no se copia al chat, bóveda o repositorio.

SMTP de Supabase activado y comprobado tras recargar: smtp.gmail.com, puerto 465, usuario/remitente direccion@eudemonia.es, contraseña almacenada oculta. Pablo confirma haber introducido la clave de aplicación y guardado. La recepción real aún no está comprobada: guardar la configuración no acredita entrega.

Plantillas de confirmación de alta y magic link guardadas en Supabase con asunto «Tu acceso privado a Eudemonía» y contenido de supabase/templates/private-access.html: código y enlace de un solo uso, sin respuestas ni informes. Site URL guardada y verificada tras recarga: https://eudemonia.es/evaluacion-pareja/aplicacion.html. Coincide con el retorno del cliente; no se utilizan comodines.

Los permisos del buzón se limitan por decisión de Pablo a Pablo y Vero; no utilizar contacto@ ni credenciales de Addventure. No se han añadido delegaciones desde el agente. La organización Supabase muestra un único miembro, ptovar@gmail.com, Owner. La lista del piloto regula a los usuarios de la aplicación; los administradores técnicos pueden acceder al almacenamiento y sus permisos se gestionan aparte.

## Código, migraciones y verificación

Fuentes en tools/evaluacion-pareja; npm run build empaqueta PDF y cliente Supabase con esbuild y genera la aplicación en línea y la copia local. El CSP de la aplicación sólo admite su origen y el proyecto Supabase. La copia local conserva connect-src none y no incluye configuración ni cliente Supabase.

Migraciones en supabase/migrations, con versiones reales del historial remoto. Las copias de backend se conservan como referencia; para reconstruir, aplicar las tres migraciones en orden, incluida la restricción de acceso del piloto y el código de pareja compatible. No ejecutar sólo schema.sql como instalación completa.

Comprobado:
- Astro check sin errores; 68 pruebas, build de 119 páginas y smoke aprobados.
- Control de secretos: detecta valores de claves privadas y JWT service_role, sin confundir el prefijo literal presente en la biblioteca.
- Pruebas SQL de aislamiento, pertenencia, acceso directo, escala 1-5, revisión, invitación de un solo uso, proyección sexual y retirada. authorization-test.sql revierte íntegramente sus usuarios y datos ficticios.
- Tras rollback no quedaron usuarios ni borradores de prueba; sólo las dos entradas del piloto.
- Asesor de seguridad sin warning/error; INFO de RLS sin políticas en tablas privadas sin acceso directo, patrón intencionado.
- Comparación y descarga PDF en navegador con datos ficticios. Revisión visual de gráficos y anexo.

Pendiente antes de declarar probado el recorrido real: recepción del acceso solicitada por el titular, sesión propia, guardar/recuperar borrador, invitación, dos versiones autorizadas, retirada y descarga con el plan. No enviar correos reales de prueba desde el agente.

## Publicación y reversión

Rama codex/evaluacion-pareja-cloud → PR #92 → controles → merge autorizado → Coolify automático. Confirmar HTTPS, aplicación nueva, copia local y ausencia de analítica después del despliegue. No hacer push directo a main.

Si hay un fallo, revertir el cliente mediante PR; no borrar datos privados automáticamente. Las migraciones están en un proyecto separado. La publicación del piloto no sustituye a la revisión profesional de Vero ni acredita validación del instrumento.
