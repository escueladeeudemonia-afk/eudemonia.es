---
titulo: "Podcast Eudemonía · Guía «Empieza aquí» · instrucciones para Fran"
tipo: interno
temas: [EDE]
estado: activo
fecha: 2026-11-09
origen: "Validado por Pablo el 9-nov-2026 a partir de [[261109_Podcast_Itinerarios_de_escucha]]"
---

# Guía «Empieza aquí» del podcast · instrucciones para montarla

Hola Fran. Esto es una guía para quien llega al podcast y no sabe por dónde empezar entre tantos episodios. Son cuatro cambios en la web, todos en el repo `eudemonia.es`. Abajo tienes el texto completo, listo para pegar.

## 1. Página nueva: `/podcast/empieza-aqui`

- Archivo nuevo `src/pages/podcast/empieza-aqui.astro`, con el layout `Base` y la estética de `/podcast` (tarjetas con borde granate, Poppins, fondo papel). Astro da prioridad a la ruta estática sobre `[slug].astro`, así que no choca con los episodios.
- `title`: «Empieza aquí · Podcast Eudemonía». `description`: «Más de sesenta episodios y una guía para elegir por dónde empezar, según lo que te trae.» `canonical`: `/podcast/empieza-aqui`.
- Te sugiero guardar los itinerarios en un archivo de datos (por ejemplo `src/data/itinerarios-podcast.ts`) para que añadir episodios nuevos sea tocar una lista.

Orden de la página, de arriba abajo:

1. **Cabecera** como la de `/podcast`: antetítulo «Podcast · Empieza aquí» y el título en dos colores, «¿Por dónde» en rosa (`--color-sec-rosa`) y «empiezo?» en granate. Debajo, como entradilla, el primer párrafo de «Por dónde empezar si eres nuevo».
2. **Barra de botones** con los ocho itinerarios, que llevan a su ancla (`#itinerario-1` a `#itinerario-8`). Que se quede fija arriba al hacer scroll y que en el móvil haga salto de línea. Textos de los botones: Presión y emociones · Tu sombra · Carrera y siguiente etapa · Dinero y libertad · Hábitos y carácter · Adversidad · Liderar · Curso de psicología social.
3. **Recuadro destacado en granate** con «Si sólo vas a escuchar uno» (Ep62).
4. **«Si eres nuevo, estos cuatro»**: los cuatro episodios en lista numerada, y la frase final.
5. **Los ocho itinerarios**, cada uno con su `id`, su título, la frase de entrada y los episodios como lista numerada de tarjetas: «Episodio N» pequeño en granate, el título enlazado al episodio y debajo la línea de por qué. Ponles `scroll-margin-top` para que la barra fija no tape el título al saltar.
6. En el 8, después de la lista, el párrafo de Claves del pensamiento humano con sus cuatro enlaces.

## 2. Franja en `/podcast`

En `src/pages/podcast/index.astro`, entre la sección de cabecera (la del buscador) y la rejilla de episodios, una franja de ancho completo con fondo `--color-papel-soft`, centrada:

- Título: «¿Es tu primera vez?»
- Texto: «Hay más de sesenta episodios. Elige lo que te trae y te propongo por dónde empezar.»
- Un botón granate relleno, «Empieza aquí», a `/podcast/empieza-aqui`, y a continuación los ocho botones de los itinerarios (mismos textos que arriba) en estilo contorno, cada uno a `/podcast/empieza-aqui#itinerario-N`.

## 3. Menú

En `src/data/navegacion.ts`, grupo «Empieza», añadir en primer lugar:

```ts
{ label: "Guía del podcast", href: "/podcast/empieza-aqui", nota: "Por dónde empezar" },
```

## 4. Enlace en cada episodio

En `src/pages/podcast/[slug].astro`, justo después del cuerpo del episodio (`<Content />`) y antes de las etiquetas, una línea discreta:

«¿Primera vez en el podcast? [Mira por dónde empezar →](/podcast/empieza-aqui)»

## Antes de publicar

- Comprobar en el móvil la barra de botones y la franja.
- Comprobar que todos los enlaces de episodios abren (son los slugs actuales de la web).
- Cuando esté en staging o publicado, pásale el enlace a Pablo para que lo vea.

Gracias, Fran.

---

## Texto de la página

### Si sólo vas a escuchar uno

[Ep62 · Nadie nos enseña a vivir](/podcast/ep62-nadie-nos-ensena-a-vivir). Empieza con una escena, la de un hombre que va al psicoterapeuta a que le arreglen una pieza y le preguntan por su vida entera, y acaba con una invitación a tratar la propia vida como un oficio. Si te deja con ganas, cualquier itinerario de esta guía es una forma de practicar ese oficio.

### Por dónde empezar si eres nuevo

Llevamos más de sesenta episodios y no hace falta escucharlos en orden. Te propongo cuatro para hacerte una idea de qué es Eudemonía y luego eliges camino.

1. [Ep62 · Nadie nos enseña a vivir](/podcast/ep62-nadie-nos-ensena-a-vivir). La tesis de todo el podcast en media hora: vivir no es un resultado, es un oficio, y se puede aprender.
2. [Ep1 · La fórmula de la felicidad](/podcast/ep1-la-formula-de-la-felicidad). De dónde venimos: la psicología positiva y la primera pregunta de qué depende vivir bien.
3. [Ep2 · La adaptación hedonista. Cómo combatirla](/podcast/ep2-la-adaptacion-hedonista-como-combatirla). Por qué lo que conseguimos deja de hacernos felices tan rápido; es la idea que más vuelve en todo lo que viene después.
4. [Ep13 · 10 preguntas para una buena vida](/podcast/ep13-10-preguntas-para-una-buena-vida). Para terminar con preguntas tuyas, no con respuestas mías.

Después, busca abajo el itinerario que más se parezca a lo que te está pasando ahora.

### 1. Quiero gestionar mejor mis emociones y la presión

Para quien vive con el acelerador puesto y nota que reacciona más de lo que elige.

1. [Ep42 · El estrés no es lo que piensas](/podcast/ep42-el-estres-no-es-lo-que-piensas). Primero cambiar la mirada: el estrés no es una tasa inevitable del éxito.
2. [Ep43 · Cómo dejar de vivir en modo estrés](/podcast/ep43-como-dejar-de-vivir-en-modo-estres). La continuación práctica del anterior; se escuchan juntos.
3. [Ep40 · Reprograma tu diálogo interior](/podcast/ep40-reprograma-tu-dialogo-interior-convierte-a-tu-peor-critico-en-tu-mejor-mentor). De lo que te pasa a lo que te dices sobre lo que te pasa.
4. [Ep41 · La trampa de la co-rumiación](/podcast/ep41-cuando-compartir-el-dolor-perpetua-el-sufrimiento-la-trampa-de-la-co-rumiacion). Cuando desahogarte con otros te deja peor; cierra el círculo de la voz interior hacia fuera.
5. [Ep63 · El cansancio no te quita inteligencia](/podcast/ep63-el-cansancio-no-te-quita-inteligencia). Qué hace la presión extrema con tu juicio: no lo vuelve tonto, lo estrecha.
6. [Ep64 · ¿Actúas tan bien que te pierdes?](/podcast/ep64-actuas-tan-bien-que-te-pierdes). El paso más fino: cuando el papel que cumples tan bien te aleja de lo que sientes.

### 2. Quiero conocer mi sombra

Para quien se ha visto hacer lo que juró que nunca haría, o sospecha que algo le gobierna sin permiso. Es la serie Sombra entera, en su orden.

1. [Ep47 · Jung y el descenso a la sombra](/podcast/ep47-jung-y-el-descenso-a-la-sombra). Qué es la sombra y por qué no es «lo malo» de ti.
2. [Ep50 · Mira, nombra e integra tu sombra](/podcast/ep50-mira-nombra-e-integra-tu-sombra). De la idea al trabajo: tres movimientos para hacerla consciente.
3. [Ep53 · Cuando la sombra ya ha actuado](/podcast/ep53-cuando-la-sombra-ya-ha-actuado). El cabezazo de Zidane: culpa, reparación y vuelta a la confianza.
4. [Ep56 · Cuando el amor se vuelve un juego de poder](/podcast/ep56-cuando-el-amor-se-vuelve-un-juego-de-poder-sombra-4). La sombra en la pareja y la familia, donde más cuesta verla.
5. [Ep59 · La sombra en el comité de dirección](/podcast/ep59-la-sombra-en-el-comite-de-direccion-sombra-5). La misma dinámica en un equipo directivo.
6. [Ep61 · La sombra que gobierna el mundo](/podcast/ep61-la-sombra-que-gobierna-el-mundo-sombra-6). El zoom más amplio, la sombra colectiva; cierra la serie.

### 3. Estoy decidiendo mi carrera o mi siguiente etapa

Para quien siente que su vida profesional funciona pero ya no sabe si es la suya.

1. [Ep62 · Nadie nos enseña a vivir](/podcast/ep62-nadie-nos-ensena-a-vivir). Antes de qué hacer, la pregunta del psicoterapeuta: qué quieres.
2. [Ep17 · ¿Cuán sana es tu relación con el trabajo?](/podcast/ep17-de-vuelta-a-trabajar-cuan-sana-es-tu-relacion-con-el-trabajo). Qué lugar ocupa hoy el trabajo en tu vida y cuál es su lado oscuro.
3. [Ep24 · Plenitud profesional, con David Reyero](/podcast/ep24-david-reyero-plenitud-profesional-como-crear-bienestar-en-el-trabajo). Una conversación sobre cómo se construye bienestar dentro del trabajo, no sólo fuera.
4. [Ep65 · La cifra que nunca llega](/podcast/ep65-la-cifra-que-nunca-llega). La trampa de aplazar el cambio hasta tener «suficiente».
5. [Ep13 · 10 preguntas para una buena vida](/podcast/ep13-10-preguntas-para-una-buena-vida). Preguntas para llevarte a la decisión.
6. [Ep16 · Asume la brevedad y fragilidad de tu vida](/podcast/ep16-asume-la-brevedad-y-fragilidad-de-tu-vida). El episodio en memoria de Liberto; pone cada decisión a la escala correcta.

### 4. Dinero y libertad

Para quien quiere que el dinero le compre tiempo y margen, no más obligaciones.

1. [Ep22 · ¿Cuánto es «suficiente»?](/podcast/ep22-cuanto-es-suficiente-dinero-y-buena-vida-1). La pregunta que ordena todas las demás.
2. [Ep23 · El dinero en el estoicismo](/podcast/ep23-el-dinero-en-el-estoicismo-dinero-y-buena-vida-2). Una filosofía de vida antes que una estrategia financiera.
3. [Ep52 · Tu riqueza es lo que no ves](/podcast/ep52-tu-riqueza-es-lo-que-no-ves-dinero-y-buena-vida-5). La riqueza como lo que no gastas y lo que te deja libre.
4. [Ep25 · La independencia financiera sensata, con Luis Álvarez](/podcast/ep25-buena-vida-con-luis-alvarez-la-independencia-financiera-sensata). Un caso real de alguien que ya no cambia su tiempo por dinero; el episodio más escuchado del podcast.
5. [Ep58 · Libre sin amo](/podcast/ep58-libre-sin-amo-independencia-financiera-2-dinero-y-buena-vida-7). La independencia financiera vista desde la libertad, no desde la cifra.
6. [Ep65 · La cifra que nunca llega](/podcast/ep65-la-cifra-que-nunca-llega). El riesgo del final del camino: que el «suficiente» suba cada vez que te acercas.

### 5. Hábitos y carácter

Para quien sabe lo que quiere cambiar y no consigue sostenerlo.

1. [Ep5 · Crea hábitos, forja tu carácter](/podcast/ep5-crea-habitos-forja-tu-caracter). El porqué: los hábitos son la materia del carácter.
2. [Ep7 · Cómo crear hábitos poderosos (1)](/podcast/ep7-como-crear-habitos-poderosos-1). Las claves prácticas, primera parte.
3. [Ep8 · Cómo crear hábitos poderosos (y 2)](/podcast/ep8-como-crear-habitos-poderosos-y-2). Segunda parte; se escucha seguida de la anterior.
4. [Ep19 · Cómo destruyen nuestra atención](/podcast/ep19-como-destruyen-nuestra-atencion). Ningún hábito aguanta si te roban la atención.
5. [Ep20 · Pelea por tu atención, lucha por tu (buena) vida](/podcast/ep20-pelea-por-tu-atencion-lucha-por-tu-buena-vida). Qué hacer para recuperarla.
6. [Ep66 · Deja de decir «no tengo tiempo»](/podcast/ep66-deja-de-decir-no-tengo-tiempo). El último obstáculo: decidir qué dejas fuera.

### 6. Estoicismo frente a la adversidad

Para quien atraviesa una pérdida, una enfermedad o un golpe que no ha elegido.

1. [Ep26 · Tus noches oscuras del alma](/podcast/ep26-tus-noches-oscuras-del-alma-adversidad-y-buena-vida-1). Dos creencias para mirar la adversidad de otra manera.
2. [Ep32 · El estoicismo frente a la adversidad](/podcast/ep32-el-estoicismo-frente-a-la-adversidad-adversidad-y-buena-vida-2). La estrategia estoica, explicada.
3. [Ep35 · Mi «toolkit» estoico frente a la adversidad](/podcast/ep35-mi-toolkit-estoico-frente-a-la-adversidad-adversidad-y-buena-vida-3). Las prácticas que uso yo; cierra la serie.
4. [Ep27 · Autismo y buena vida, con Marta R. Cogollos](/podcast/ep27-autismo-y-buena-vida-con-marta-r-cogollos-estoicismo-contemporaneo-frente-a-la-adversidad). El estoicismo vivido por alguien concreto.
5. [Ep60 · Vivir bien cuando la vida duele, con Olga Albaladejo](/podcast/ep60-vivir-bien-cuando-la-vida-duele-con-olga-albaladejo). Otra conversación, desde el dolor más reciente.
6. [Ep46 · Aprender a vivir es aprender a morir](/podcast/ep46-aprender-a-vivir-es-aprender-a-morir). La pregunta de fondo, con serenidad.

### 7. Liderar y el comité de dirección

Para quien dirige personas o se sienta en un comité.

1. [Ep63 · El cansancio no te quita inteligencia](/podcast/ep63-el-cansancio-no-te-quita-inteligencia). Cómo decide un directivo bajo presión, y por qué le falta repertorio, no cabeza.
2. [Ep64 · ¿Actúas tan bien que te pierdes?](/podcast/ep64-actuas-tan-bien-que-te-pierdes). El papel de líder competente y lo que cuesta.
3. [Ep54 · Cuando el rol manda, tu conciencia se calla](/podcast/ep54-cuando-el-rol-manda-tu-conciencia-se-calla). Stanford 1971: el poder del rol sobre personas normales.
4. [Ep59 · La sombra en el comité de dirección](/podcast/ep59-la-sombra-en-el-comite-de-direccion-sombra-5). Lo que no se dice en la planta 21.
5. [Ep38 · Soledad, sufrimiento y falso éxito en la alta dirección, con Javier Llansó](/podcast/ep38-soledad-sufrimiento-y-falso-exito-en-la-alta-direccion-con-javier-llanso). El precio personal de llegar arriba, contado desde dentro.

### 8. Mi curso de psicología social

Por qué personas normales hacen cosas que nunca harían solas, y qué tiene que ver eso contigo. Es un curso en episodios: cada lección parte de un experimento o una escena real y acaba en tu vida de todos los días. Se escucha en orden, y sigue creciendo.

1. [Ep48 · El yo social](/podcast/ep48-el-yo-social-los-hilos-invisibles-que-guian-tus-decisiones-psicologia-social-1). La primera lección: no decidimos solos, aunque lo parezca.
2. [Ep51 · Personas normales, decisiones inhumanas](/podcast/ep51-personas-normales-decisiones-inhumanas). Milgram: hasta dónde obedecemos a quien manda.
3. [Ep54 · Cuando el rol manda, tu conciencia se calla](/podcast/ep54-cuando-el-rol-manda-tu-conciencia-se-calla). Stanford, 1971: lo que un papel hace con una persona normal.
4. [Ep57 · El mundo (no) está lleno de imbéciles](/podcast/ep57-el-mundo-no-esta-lleno-de-imbeciles-psicologia-social-4). Por qué juzgamos a los demás con una vara y a nosotros con otra.
5. [Ep64 · ¿Actúas tan bien que te pierdes?](/podcast/ep64-actuas-tan-bien-que-te-pierdes). Goffman y las máscaras: cuando el papel que interpretas se confunde con quien eres.

Si quieres ir antes a la raíz, la serie Claves del pensamiento humano es la antesala del curso, sobre por qué creemos lo que creemos: [Ep30](/podcast/ep30-creencias-que-matan-claves-del-pensamiento-humano-1), [Ep33](/podcast/ep33-cuestiona-tus-creencias-ilumina-tu-vida-claves-del-pensamiento-humano-2), [Ep34](/podcast/ep34-a-quien-sirve-la-razon-claves-del-pensamiento-humano-3) y [Ep37](/podcast/ep37-el-arte-de-juzgar-con-sabiduria-claves-del-pensamiento-humano-4).

