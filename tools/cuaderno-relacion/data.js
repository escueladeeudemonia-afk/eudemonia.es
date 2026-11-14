/* Cuaderno de relación. Instrumento exploratorio original, versión 0.1.0. */
var PAIR_DATA = {
 version:'0.1.0', schema:'eudemonia-pareja-1',
 dimensions:[
 {id:'interpretaciones',title:'Interpretaciones',subtitle:'Lo que ocurre y el significado que le damos',source:'Caps. 1-3, 8 y 13; pp. 25-81, 176-193 y 284-306.',items:[
 'Pregunto qué ha ocurrido antes de atribuir una intención negativa a mi pareja.',
 'Distingo los hechos que he observado de la explicación que me he dado sobre ellos.',
 'Reviso mi primera interpretación cuando mi pareja aporta información diferente.',
 'Considero explicaciones alternativas a la que primero me viene a la cabeza.',
 'Después de una decepción, sigo reconociendo cualidades positivas de mi pareja.',
 'Cuando me equivoco al interpretar a mi pareja, se lo reconozco.'
 ],practice:{name:'Separar hechos e interpretaciones',steps:['Elegid un incidente reciente de intensidad manejable. Cada uno anota por separado el hecho observable, su interpretación y lo que sintió.','Compartid las interpretaciones como hipótesis y preguntad qué ocurrió para la otra persona. Contrastadlas con los hechos disponibles.','Redactad una explicación más ajustada y una petición concreta sobre la conducta que necesita cambiar.'],experiment:'Usar este registro en dos incidentes durante los próximos catorce días.',signal:'Podemos describir el hecho sin atribuir una intención y formular una petición específica.'}},
 {id:'expectativas',title:'Expectativas y acuerdos',subtitle:'Lo que esperamos, pedimos y negociamos',source:'Cap. 4; pp. 82-103. Caps. 15 y 16.',items:[
 'Expreso lo que espero de mi pareja con palabras concretas.',
 'Compruebo si una expectativa importante ha sido realmente acordada entre ambos.',
 'Acepto una manera de hacer las cosas diferente de la mía cuando también atiende la necesidad planteada.',
 'Cuando una expectativa no se cumple, la convierto en una petición que podemos hablar.',
 'Reviso nuestros acuerdos cuando cambian nuestras circunstancias.',
 'Puedo escuchar un desacuerdo sin interpretarlo por sí solo como falta de cariño.'
 ],practice:{name:'De la expectativa al acuerdo',steps:['Cada uno escribe una expectativa importante que quizá no haya expresado claramente.','Explicad qué necesidad hay detrás y haced una petición concreta. La otra persona explica qué puede asumir y qué necesita negociar.','Acordad una conducta, quién la hará, en qué situación y cuándo la revisaréis.'],experiment:'Probar un acuerdo pequeño durante catorce días.',signal:'Los dos podemos explicar el mismo acuerdo y sabemos cuándo se ha cumplido.'}},
 {id:'empatia',title:'Emoción y empatía',subtitle:'Mostrar lo que sentimos y comprender al otro',source:'Caps. 7 y 12; pp. 159-175 y 266-273.',items:[
 'Explico qué me ha dolido o preocupado cuando me enfado.',
 'Cuando mi pareja comparte un problema, pregunto qué tipo de apoyo desea.',
 'Reconozco que el sentimiento de mi pareja es importante, aunque mi interpretación sea distinta.',
 'Tengo en cuenta los temas que mi pareja me ha explicado que son especialmente sensibles para ella.',
 'Muestro interés por cómo vive mi pareja una situación que nos afecta.',
 'Puedo decir que estoy triste, preocupado o inseguro sin convertirlo en una acusación.'
 ],practice:{name:'Escuchar la necesidad',steps:['Cada uno dispone de cinco minutos para contar una preocupación concreta.','Quien escucha pregunta si la otra persona quiere escucha, compañía o ayuda para buscar soluciones.','Antes de responder, resume qué sentimiento y qué necesidad ha entendido. La otra persona puede corregirlo.'],experiment:'Reservar dos conversaciones de diez minutos esta semana.',signal:'Quien ha hablado puede decir qué parte se ha sentido comprendida y qué ha faltado.'}},
 {id:'comunicacion',title:'Comunicación y escucha',subtitle:'Entendernos antes de responder',source:'Caps. 5 y 14; pp. 104-129 y 307-327.',items:[
 'Dejo que mi pareja termine de explicar su punto de vista antes de responder.',
 'Compruebo con mis palabras si he entendido lo que mi pareja quería decir.',
 'Expreso una petición de forma directa, sin esperar que se entienda por una indirecta.',
 'Elijo un momento en el que ambos podemos prestar atención para hablar de un tema importante.',
 'Pregunto por lo que no entiendo antes de defender mi posición.',
 'Cuando escucho, doy señales de atención que mi pareja puede reconocer.'
 ],practice:{name:'Una conversación con turnos',steps:['Elegid un tema y un momento con pocas interrupciones.','Una persona habla durante tres minutos; la otra escucha y después resume. Quien habló confirma o matiza.','Intercambiad los papeles. Buscad una petición que ambos hayáis comprendido antes de proponer soluciones.'],experiment:'Practicar dos conversaciones con turnos durante catorce días.',signal:'Cada uno reconoce su punto de vista en el resumen que hace el otro.'}},
 {id:'conflicto',title:'Conflicto y recuperación',subtitle:'Frenar la escalada y volver a hablar',source:'Caps. 9, 16 y 17; pp. 194-220, 349-369 y 370-396.',items:[
 'Reconozco las primeras señales de que estoy perdiendo la calma.',
 'Freno un comentario hiriente antes de decirlo cuando estoy enfadado.',
 'Si necesito una pausa, explico que quiero retomar la conversación y acordamos cuándo hacerlo.',
 'Después de una pausa, vuelvo al asunto pendiente en el momento acordado.',
 'Después de una discusión, reconozco concretamente algo que hice y que pudo hacer daño.',
 'Tras un desacuerdo, doy algún paso para recuperar un trato cercano.'
 ],practice:{name:'Pausa con regreso acordado',steps:['En un momento tranquilo, elegid una frase para pedir una pausa y cómo acordaréis la vuelta.','Durante la pausa, cada uno identifica qué ocurrió, qué interpretó y qué necesita pedir.','Retomad un solo asunto cuando ambos podáis hablar con calma. Si no es posible, acordad otra ocasión y buscad apoyo si se repite.'],experiment:'Preparar el acuerdo ahora y usarlo si aparece una discusión.',signal:'La pausa reduce la escalada y el asunto se retoma. Sin ocasiones de conflicto, no se puntúa como fracaso.'}},
 {id:'cooperacion',title:'Cooperación',subtitle:'Decisiones y responsabilidades compartidas',source:'Caps. 6, 15 y 16; pp. 130-158 y 328-369. Cap. 18; pp. 417-427.',items:[
 'Defino un problema mediante una situación concreta que podemos cambiar.',
 'Busco comprender qué necesita mi pareja para que una solución también le resulte aceptable.',
 'En las decisiones que afectan a ambos, doy espacio real a la opinión de mi pareja.',
 'Hago explícita la parte de responsabilidad que asumiré en un acuerdo.',
 'Reviso con mi pareja si el reparto de responsabilidades nos resulta aceptable a ambos.',
 'Propongo alternativas cuando nuestra primera solución no funciona.'
 ],practice:{name:'Resolver un problema pequeño',steps:['Elegid un asunto acotado, como una tarea o una franja de tiempo. Definid qué ocurre y qué necesita cada uno.','Proponed al menos tres alternativas antes de elegir una.','Precisad quién se encarga de qué, cuándo y con qué criterio sabréis si ha funcionado.'],experiment:'Probar una solución durante catorce días y revisarla juntos.',signal:'Ambos podemos describir nuestra responsabilidad y decir si el reparto es sostenible.'}},
 {id:'afecto',title:'Afecto y disfrute',subtitle:'Cuidar lo que nos hace bien',source:'Cap. 12; pp. 263-283, especialmente 274-283.',items:[
 'Expreso cariño mediante gestos que mi pareja me ha dicho que valora.',
 'Agradezco de forma concreta algo que mi pareja ha hecho.',
 'Tomo la iniciativa para compartir un momento agradable juntos.',
 'Muestro interés por algo que ilusiona a mi pareja.',
 'Dedico atención a mi pareja en situaciones cotidianas.',
 'Reconozco algo positivo de mi pareja incluso cuando tenemos un asunto pendiente.'
 ],practice:{name:'Reconocer y cultivar lo agradable',steps:['Cada uno cuenta dos gestos recientes del otro que le hayan hecho bien.','Cada uno propone un gesto sencillo que le gustaría recibir, sin convertirlo en una obligación.','Elegid un momento agradable para compartir y registrad qué habéis disfrutado.'],experiment:'Reconocer un gesto real cada día y compartir dos momentos elegidos durante catorce días.',signal:'Cada uno puede describir gestos recibidos que tuvieron significado para él o ella.'}},
 {id:'confianza',title:'Confianza y responsabilidad',subtitle:'Coherencia, apoyo y voluntad de aprender',source:'Caps. 10 y 11; pp. 221-262.',items:[
 'Cumplo los acuerdos que he asumido con mi pareja.',
 'Si no puedo cumplir algo acordado, lo comunico y propongo cómo atenderlo.',
 'Reconozco alguna conducta propia que puedo cambiar cuando surge una dificultad.',
 'Ofrezco apoyo concreto cuando mi pareja atraviesa una situación difícil.',
 'Trato con cuidado algo personal que mi pareja me ha confiado.',
 'Llevo a la práctica un cambio que he dicho que quiero hacer en la relación.'
 ],practice:{name:'Construir confianza con un compromiso pequeño',steps:['Cada uno elige un compromiso propio, pequeño y verificable.','Acordad cómo comunicar un obstáculo antes de que se convierta en un incumplimiento silencioso.','En la revisión, reconoced lo realizado y ajustad lo que no haya sido viable.'],experiment:'Cumplir un compromiso propio durante catorce días.',signal:'Lo prometido coincide con lo hecho o se renegocia de forma explícita.'}},
 {id:'intimidad',title:'Intimidad sexual',subtitle:'Deseos, límites y experiencias satisfactorias',source:'Cap. 18; pp. 397-405. Límites, consentimiento y formulación inclusiva: ampliación de diseño.',optional:true,items:[
 'Abro espacio para hablar de mis deseos sexuales con mi pareja.',
 'Escucho qué experiencias sexuales resultan agradables para mi pareja.',
 'Respeto que mi pareja no desee una actividad sexual, sin insistir ni expresar reproches.',
 'Expreso mis preferencias y límites sexuales con claridad.',
 'Cuando nuestros deseos o ritmos difieren, busco una forma de hablar que tenga en cuenta a ambos.',
 'Pregunto por lo que podemos ajustar para que la intimidad sea más satisfactoria para ambos.'
 ],practice:{name:'Conversar sobre intimidad sin exigencias',steps:['Elegid un momento fuera de una interacción sexual. Cada uno decide qué desea compartir.','Hablad de lo que os resulta agradable, de lo que no deseáis y de las condiciones que ayudan a sentiros cómodos.','Elegid, sólo si ambos lo deseáis, una forma de cercanía. Hablar o tener contacto afectuoso no compromete a mantener actividad sexual.'],experiment:'Tener una conversación voluntaria y revisar después si os habéis sentido escuchados y libres.',signal:'Cada uno puede expresar un deseo o un límite y la otra persona lo respeta. No hay una frecuencia sexual objetivo.'}}
 ],
 context:[
 {id:'carga',text:'¿Cuánto han pesado el trabajo, los cuidados u otras responsabilidades durante este periodo?'},
 {id:'cansancio',text:'¿Cuánto ha limitado el cansancio vuestra posibilidad de compartir tiempo?'},
 {id:'estres',text:'¿Cuánto ha interferido el estrés externo en vuestra forma de trataros?'}
 ],
 open:[
 {id:'fortalezas',text:'Dos cosas que funcionan bien entre nosotros y quiero conservar.'},
 {id:'episodio',text:'Un episodio reciente: qué ocurrió, qué interpreté, qué sentí y qué hice. Puedes omitir detalles identificativos.'},
 {id:'gesto',text:'Un gesto reciente de mi pareja que me hizo sentir querido o acompañado.'},
 {id:'cambio',text:'Un cambio pequeño que estoy dispuesto a probar yo.'},
 {id:'sexualSatisfaccion',text:'Si has elegido el módulo sexual: ¿qué te gustaría conservar o mejorar de vuestra intimidad? Puedes dejarlo en blanco.'}
 ]
};
/* Prácticas individuales. Pueden hacerse sin que la pareja responda o participe. */
const SOLO_PRACTICES = {
 interpretaciones:{name:'Examinar mi interpretación',steps:['Elige un incidente reciente y anota sólo lo que pudiste observar.','Escribe el significado que le diste, qué sentiste y qué hiciste. Separa lo que sabes de lo que supones.','Busca información a favor y en contra de tu explicación. Elige una respuesta propia más ajustada, manteniendo cualquier límite que necesites.'],experiment:'Completar dos registros personales durante catorce días.',signal:'Distingo mejor hechos e interpretaciones y puedo elegir cómo responder.'},
 expectativas:{name:'Hacer explícito lo que espero',steps:['Escribe una expectativa importante que tienes sobre tu relación.','Comprueba si la has expresado y si hubo un acuerdo real. Distingue un deseo, una petición y un límite propio.','Redacta una petición concreta que puedas plantear si lo deseas. Decide qué cambio depende de ti aunque tu pareja no responda.'],experiment:'Preparar y, si decides hacerlo, expresar una petición clara esta semana.',signal:'Sé qué estoy pidiendo, qué límite necesito y qué parte de la decisión es mía.'},
 empatia:{name:'Poner nombre a lo que necesito',steps:['Recuerda una situación que te afectó. Anota el sentimiento y la necesidad que reconoces ahora.','Redacta cómo lo expresarías en primera persona, sin atribuir intenciones a tu pareja.','Elige una forma propia de cuidar esa necesidad y, si lo deseas, una petición de apoyo.'],experiment:'Hacer dos registros personales y probar una acción de cuidado propio.',signal:'Puedo nombrar lo que siento y necesito sin depender de que mi pareja lo adivine.'},
 comunicacion:{name:'Practicar mi forma de comunicar',steps:['Elige una conversación cotidiana en la que quieras escuchar o expresarte mejor.','Prepara una petición concreta o una pregunta para comprobar que has entendido. Puedes ensayarla por escrito.','Si tienes esa conversación, observa tu conducta. Anota qué pudiste hacer y qué ajustarías, sin evaluar el resultado como prueba de tu valor.'],experiment:'Practicar una habilidad propia en dos conversaciones, si hay ocasión.',signal:'Puedo describir qué hice de forma diferente al hablar o escuchar.'},
 conflicto:{name:'Reconocer mi activación',steps:['Anota tus primeras señales de tensión y los pensamientos que suelen acompañarlas.','Prepara una frase propia para pedir una pausa sin amenazar ni castigar. Piensa en una propuesta de regreso a la conversación.','Ensaya una forma de calmarte y de revisar lo ocurrido antes de responder. Si no hay una conversación segura, busca apoyo individual.'],experiment:'Preparar tu pauta de pausa y usarla si aparece una ocasión adecuada.',signal:'Reconozco antes mi activación y puedo escoger una respuesta propia menos hiriente.'},
 cooperacion:{name:'Concretar un problema y mi parte',steps:['Describe un problema mediante hechos concretos, evitando etiquetas sobre la personalidad.','Distingue lo que puedes cambiar tú, lo que requiere un acuerdo y lo que no está bajo tu control.','Elige una acción propia sostenible y redacta una propuesta que podrías plantear a tu pareja. No asumas por tu cuenta todas las responsabilidades.'],experiment:'Probar una acción propia acotada durante catorce días.',signal:'Tengo clara mi parte y puedo formular una propuesta concreta sin dar por hecho el acuerdo del otro.'},
 afecto:{name:'Reconocer lo que me hace bien',steps:['Anota dos momentos de la relación que hayan sido agradables para ti.','Identifica qué tuvo valor en ellos y elige un gesto propio de aprecio que sea sincero y libre.','Observa cómo te sientes al expresarlo, sin convertirlo en un intercambio obligatorio ni usarlo para pasar por alto un problema real.'],experiment:'Registrar momentos agradables durante una semana y expresar un aprecio si lo deseas.',signal:'Reconozco qué valoro y qué formas de expresar afecto puedo elegir.'},
 confianza:{name:'Elegir un compromiso propio',steps:['Elige una conducta tuya, pequeña y verificable, que quieras cuidar en la relación.','Precisa cuándo puedes cumplirla y cómo comunicarías un obstáculo.','Revisa si la has realizado y ajusta lo necesario. Tu responsabilidad sobre tu conducta no te hace responsable de la conducta de tu pareja.'],experiment:'Llevar a la práctica un compromiso propio durante catorce días.',signal:'Puedo comprobar si he cumplido o comunicado de forma clara lo que me había comprometido a hacer.'},
 intimidad:{name:'Reconocer mis deseos y límites',steps:['Reflexiona en privado sobre qué formas de intimidad te resultan agradables y cuáles no deseas. No tienes que compartirlo.','Anota qué condiciones te ayudan a sentir comodidad y libertad para expresar un sí o un no.','Si lo deseas y es seguro, prepara una conversación sobre una preferencia o un límite. La práctica no exige contacto ni actividad sexual.'],experiment:'Completar una reflexión privada y elegir si quieres comunicar alguna parte.',signal:'Puedo identificar una preferencia o un límite propios y decidir libremente qué compartir.'}
};
for (const d of PAIR_DATA.dimensions) d.individual = SOLO_PRACTICES[d.id];
