# Continuidad de voz con ElevenLabs — 27-nov-2026

Fran pide convertir el aprendizaje del [tutorial editorial](2026-11-26-panel-editorial.md) en una instrucción común para futuras locuciones de cualquier proyecto. Pide expresamente conservar el vídeo ya entregado. Esta revisión documenta e instala la preferencia; no genera audio ni modifica servicios o envíos.

## Diagnóstico y alcance de la evidencia

Fran percibe que su voz cambia después de los primeros 15–20 segundos. Se revisan `voice/*.intent.json` y `montaje.json` del directorio `/home/fran/archivos/escuela-de-eudemonia/tutorial-editorial-20261126/`, sin leer ni copiar credenciales.

| Comprobación | Resultado |
|---|---|
| Peticiones de generación | 12 independientes |
| Voces utilizadas | Una misma voz profesional, «Fran Lledó · SOLO» |
| Modelo | `eleven_v4` en las 12 peticiones |
| Contexto de la generación anterior | Ninguna petición contiene `previous_request_ids` o `previous_text` |
| Ajustes explícitos de voz | Ninguna petición contiene `settings` o `voice_settings`; no se deducen los valores efectivos del proveedor |
| Primer cambio de fragmento | 15,833 segundos desde el inicio del vídeo |

La coincidencia temporal y la falta de continuidad entre peticiones apuntan al empalme de generaciones independientes como causa más probable del cambio. Es una inferencia a partir de los registros y de la escucha de Fran, no una medición del timbre ni una escucha independiente realizada por el agente. La revisión original comprobó texto, decodificación y aspectos técnicos, pero no acreditó continuidad perceptiva.

ElevenLabs explica que cada generación puede variar incluso con la misma entrada. Su API permite aportar contexto para continuidad entre peticiones, con compatibilidad dependiente del modelo; una semilla no garantiza determinismo. Fuentes oficiales consultadas el 27-nov: [variación entre generaciones](https://elevenlabs.io/docs/help-center/technical/why-does-my-voice-sound-different-in-the-api-compared-to-the-website) y [parámetros de continuidad](https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps).

El rótulo de demostración también resultó confuso para Fran: el acceso real ya estaba operativo, las capturas eran locales y lo pendiente era activar publicación/programación. La revisión no cambia el estado del servicio ni cierra EDE-045.

## Instalación y comprobación

La regla del apartado siguiente se añadió, conservando el resto del contenido, a:

- `/home/fran/.codex/AGENTS.md`: instrucciones generales de Codex.
- `/home/fran/projects/AGENTS.md`: instrucciones comunes de los proyectos del VPS. `/home/fran/projects/CLAUDE.md` ya importa este archivo.

Ambos archivos se volvieron a leer después de la escritura; el bloque coincide en los dos y se incorporó al contexto de instrucciones de esta sesión. Estos archivos están fuera del repositorio Astro: este documento conserva la copia versionada de la regla y sus ubicaciones. No se ha creado una skill ni modificado los scripts históricos; al reutilizarlos hay que aplicar la preferencia. No se afirma que otros hosts, perfiles o sesiones ya abiertas hayan recargado estas instrucciones.

SHA-256 de los archivos completos después de instalar la regla, como evidencia fechada:

- Codex: `fc1d0ec8f202ef965f0a1f423eb722783e180852aec9ff3fba164f78e35154a8`.
- Proyectos VPS: `2d2b34384d8cc6d9cc25a6b2b3b6083878b5b10f9146edec900676938f3cf7fa`.

El MP4 conserva el SHA-256 `b24df76009377be5c7fcb051ab542c056a1a2983bad33bfcc8a5322dd87421e4`, comprobado de nuevo al documentar. No hay nuevos consumos de ElevenLabs ni correos reenviados. El respaldo en Git incluye documentación; los medios y las credenciales conservan sus ubicaciones anteriores.

## Locuciones con ElevenLabs — preferencia de Fran, 27-nov-2026

Aplicar en cualquier proyecto que genere voz con ElevenLabs, especialmente con la voz clonada de Fran. Priorizar que la identidad de la voz se mantenga durante toda la pieza.

- Generar primero la locución completa como un audio continuo y montar después las imágenes, escenas y subtítulos sobre ese audio. No generar por defecto una petición independiente por diapositiva o escena, ni reutilizar `--independent-scenes` para una narración continua.
- Si un límite real del servicio obliga a dividir el guion, usar el menor número de fragmentos coherentes posible. Conservar voz, modelo y ajustes; enlazar el contexto de audio/texto entre peticiones con los mecanismos compatibles con el modelo y la API vigentes. Si no admiten continuidad, revisar otra vía de generación antes de concatenar fragmentos independientes. Las recetas antiguas por escenas deben adaptarse a esta preferencia.
- Antes de entregar, escuchar la locución completa y comprobar especialmente las uniones, comparando inicio, mitad y final: identidad, timbre, acento, ritmo y entonación. Corregir los saltos detectados antes de darla por terminada. Transcripción correcta, volumen normalizado y decodificación sin errores no acreditan continuidad de voz. Si no se puede escuchar o evaluar el audio, indicar esa revisión como pendiente; no afirmar que se ha comprobado.
- Mantener trazabilidad de modelo, voz, ajustes y fragmentos sin guardar secretos. Usar la misma voz o una semilla fija no garantiza por sí solo continuidad; no prometer ausencia total de variación.

Origen: Fran detectó un cambio alrededor de los 15–20 segundos en el tutorial editorial de Eudemonía, generado en 12 peticiones independientes y con el primer empalme a los 15,8 segundos. Fran pide conservar aquel vídeo y aplicar este aprendizaje a las siguientes locuciones de cualquier proyecto.
