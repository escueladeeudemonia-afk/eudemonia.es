// Textos y orden aprobados por Pablo el 9-nov-2026.
// Fuente: docs/fuentes/261109-podcast-empieza-aqui.md.
export type EpisodioItinerario = {
  numero: number;
  titulo: string;
  slug: string;
  motivo: string;
};

export type ItinerarioPodcast = {
  id: string;
  etiqueta: string;
  titulo: string;
  introduccion: string;
  episodios: EpisodioItinerario[];
};

export const guiaPodcastHref = "/podcast/empieza-aqui/";

export const episodiosParaEmpezar: EpisodioItinerario[] = [
  {
    "numero": 62,
    "titulo": "Nadie nos enseña a vivir",
    "slug": "ep62-nadie-nos-ensena-a-vivir",
    "motivo": "La tesis de todo el podcast en media hora: vivir no es un resultado, es un oficio, y se puede aprender."
  },
  {
    "numero": 1,
    "titulo": "La fórmula de la felicidad",
    "slug": "ep1-la-formula-de-la-felicidad",
    "motivo": "De dónde venimos: la psicología positiva y la primera pregunta de qué depende vivir bien."
  },
  {
    "numero": 2,
    "titulo": "La adaptación hedonista. Cómo combatirla",
    "slug": "ep2-la-adaptacion-hedonista-como-combatirla",
    "motivo": "Por qué lo que conseguimos deja de hacernos felices tan rápido; es la idea que más vuelve en todo lo que viene después."
  },
  {
    "numero": 13,
    "titulo": "10 preguntas para una buena vida",
    "slug": "ep13-10-preguntas-para-una-buena-vida",
    "motivo": "Para terminar con preguntas tuyas, no con respuestas mías."
  }
];

export const itinerariosPodcast: ItinerarioPodcast[] = [
  {
    "id": "itinerario-1",
    "etiqueta": "Presión y emociones",
    "titulo": "Quiero gestionar mejor mis emociones y la presión",
    "introduccion": "Para quien vive con el acelerador puesto y nota que reacciona más de lo que elige.",
    "episodios": [
      {
        "numero": 42,
        "titulo": "El estrés no es lo que piensas",
        "slug": "ep42-el-estres-no-es-lo-que-piensas",
        "motivo": "Primero cambiar la mirada: el estrés no es una tasa inevitable del éxito."
      },
      {
        "numero": 43,
        "titulo": "Cómo dejar de vivir en modo estrés",
        "slug": "ep43-como-dejar-de-vivir-en-modo-estres",
        "motivo": "La continuación práctica del anterior; se escuchan juntos."
      },
      {
        "numero": 40,
        "titulo": "Reprograma tu diálogo interior",
        "slug": "ep40-reprograma-tu-dialogo-interior-convierte-a-tu-peor-critico-en-tu-mejor-mentor",
        "motivo": "De lo que te pasa a lo que te dices sobre lo que te pasa."
      },
      {
        "numero": 41,
        "titulo": "La trampa de la co-rumiación",
        "slug": "ep41-cuando-compartir-el-dolor-perpetua-el-sufrimiento-la-trampa-de-la-co-rumiacion",
        "motivo": "Cuando desahogarte con otros te deja peor; cierra el círculo de la voz interior hacia fuera."
      },
      {
        "numero": 63,
        "titulo": "El cansancio no te quita inteligencia",
        "slug": "ep63-el-cansancio-no-te-quita-inteligencia",
        "motivo": "Qué hace la presión extrema con tu juicio: no lo vuelve tonto, lo estrecha."
      },
      {
        "numero": 64,
        "titulo": "¿Actúas tan bien que te pierdes?",
        "slug": "ep64-actuas-tan-bien-que-te-pierdes",
        "motivo": "El paso más fino: cuando el papel que cumples tan bien te aleja de lo que sientes."
      }
    ]
  },
  {
    "id": "itinerario-2",
    "etiqueta": "Tu sombra",
    "titulo": "Quiero conocer mi sombra",
    "introduccion": "Para quien se ha visto hacer lo que juró que nunca haría, o sospecha que algo le gobierna sin permiso. Es la serie Sombra entera, en su orden.",
    "episodios": [
      {
        "numero": 47,
        "titulo": "Jung y el descenso a la sombra",
        "slug": "ep47-jung-y-el-descenso-a-la-sombra",
        "motivo": "Qué es la sombra y por qué no es «lo malo» de ti."
      },
      {
        "numero": 50,
        "titulo": "Mira, nombra e integra tu sombra",
        "slug": "ep50-mira-nombra-e-integra-tu-sombra",
        "motivo": "De la idea al trabajo: tres movimientos para hacerla consciente."
      },
      {
        "numero": 53,
        "titulo": "Cuando la sombra ya ha actuado",
        "slug": "ep53-cuando-la-sombra-ya-ha-actuado",
        "motivo": "El cabezazo de Zidane: culpa, reparación y vuelta a la confianza."
      },
      {
        "numero": 56,
        "titulo": "Cuando el amor se vuelve un juego de poder",
        "slug": "ep56-cuando-el-amor-se-vuelve-un-juego-de-poder-sombra-4",
        "motivo": "La sombra en la pareja y la familia, donde más cuesta verla."
      },
      {
        "numero": 59,
        "titulo": "La sombra en el comité de dirección",
        "slug": "ep59-la-sombra-en-el-comite-de-direccion-sombra-5",
        "motivo": "La misma dinámica en un equipo directivo."
      },
      {
        "numero": 61,
        "titulo": "La sombra que gobierna el mundo",
        "slug": "ep61-la-sombra-que-gobierna-el-mundo-sombra-6",
        "motivo": "El zoom más amplio, la sombra colectiva; cierra la serie."
      }
    ]
  },
  {
    "id": "itinerario-3",
    "etiqueta": "Carrera y siguiente etapa",
    "titulo": "Estoy decidiendo mi carrera o mi siguiente etapa",
    "introduccion": "Para quien siente que su vida profesional funciona pero ya no sabe si es la suya.",
    "episodios": [
      {
        "numero": 62,
        "titulo": "Nadie nos enseña a vivir",
        "slug": "ep62-nadie-nos-ensena-a-vivir",
        "motivo": "Antes de qué hacer, la pregunta del psicoterapeuta: qué quieres."
      },
      {
        "numero": 17,
        "titulo": "¿Cuán sana es tu relación con el trabajo?",
        "slug": "ep17-de-vuelta-a-trabajar-cuan-sana-es-tu-relacion-con-el-trabajo",
        "motivo": "Qué lugar ocupa hoy el trabajo en tu vida y cuál es su lado oscuro."
      },
      {
        "numero": 24,
        "titulo": "Plenitud profesional, con David Reyero",
        "slug": "ep24-david-reyero-plenitud-profesional-como-crear-bienestar-en-el-trabajo",
        "motivo": "Una conversación sobre cómo se construye bienestar dentro del trabajo, no sólo fuera."
      },
      {
        "numero": 65,
        "titulo": "La cifra que nunca llega",
        "slug": "ep65-la-cifra-que-nunca-llega",
        "motivo": "La trampa de aplazar el cambio hasta tener «suficiente»."
      },
      {
        "numero": 13,
        "titulo": "10 preguntas para una buena vida",
        "slug": "ep13-10-preguntas-para-una-buena-vida",
        "motivo": "Preguntas para llevarte a la decisión."
      },
      {
        "numero": 16,
        "titulo": "Asume la brevedad y fragilidad de tu vida",
        "slug": "ep16-asume-la-brevedad-y-fragilidad-de-tu-vida",
        "motivo": "El episodio en memoria de Liberto; pone cada decisión a la escala correcta."
      }
    ]
  },
  {
    "id": "itinerario-4",
    "etiqueta": "Dinero y libertad",
    "titulo": "Dinero y libertad",
    "introduccion": "Para quien quiere que el dinero le compre tiempo y margen, no más obligaciones.",
    "episodios": [
      {
        "numero": 22,
        "titulo": "¿Cuánto es «suficiente»?",
        "slug": "ep22-cuanto-es-suficiente-dinero-y-buena-vida-1",
        "motivo": "La pregunta que ordena todas las demás."
      },
      {
        "numero": 23,
        "titulo": "El dinero en el estoicismo",
        "slug": "ep23-el-dinero-en-el-estoicismo-dinero-y-buena-vida-2",
        "motivo": "Una filosofía de vida antes que una estrategia financiera."
      },
      {
        "numero": 52,
        "titulo": "Tu riqueza es lo que no ves",
        "slug": "ep52-tu-riqueza-es-lo-que-no-ves-dinero-y-buena-vida-5",
        "motivo": "La riqueza como lo que no gastas y lo que te deja libre."
      },
      {
        "numero": 25,
        "titulo": "La independencia financiera sensata, con Luis Álvarez",
        "slug": "ep25-buena-vida-con-luis-alvarez-la-independencia-financiera-sensata",
        "motivo": "Un caso real de alguien que ya no cambia su tiempo por dinero; el episodio más escuchado del podcast."
      },
      {
        "numero": 58,
        "titulo": "Libre sin amo",
        "slug": "ep58-libre-sin-amo-independencia-financiera-2-dinero-y-buena-vida-7",
        "motivo": "La independencia financiera vista desde la libertad, no desde la cifra."
      },
      {
        "numero": 65,
        "titulo": "La cifra que nunca llega",
        "slug": "ep65-la-cifra-que-nunca-llega",
        "motivo": "El riesgo del final del camino: que el «suficiente» suba cada vez que te acercas."
      }
    ]
  },
  {
    "id": "itinerario-5",
    "etiqueta": "Hábitos y carácter",
    "titulo": "Hábitos y carácter",
    "introduccion": "Para quien sabe lo que quiere cambiar y no consigue sostenerlo.",
    "episodios": [
      {
        "numero": 5,
        "titulo": "Crea hábitos, forja tu carácter",
        "slug": "ep5-crea-habitos-forja-tu-caracter",
        "motivo": "El porqué: los hábitos son la materia del carácter."
      },
      {
        "numero": 7,
        "titulo": "Cómo crear hábitos poderosos (1)",
        "slug": "ep7-como-crear-habitos-poderosos-1",
        "motivo": "Las claves prácticas, primera parte."
      },
      {
        "numero": 8,
        "titulo": "Cómo crear hábitos poderosos (y 2)",
        "slug": "ep8-como-crear-habitos-poderosos-y-2",
        "motivo": "Segunda parte; se escucha seguida de la anterior."
      },
      {
        "numero": 19,
        "titulo": "Cómo destruyen nuestra atención",
        "slug": "ep19-como-destruyen-nuestra-atencion",
        "motivo": "Ningún hábito aguanta si te roban la atención."
      },
      {
        "numero": 20,
        "titulo": "Pelea por tu atención, lucha por tu (buena) vida",
        "slug": "ep20-pelea-por-tu-atencion-lucha-por-tu-buena-vida",
        "motivo": "Qué hacer para recuperarla."
      },
      {
        "numero": 66,
        "titulo": "Deja de decir «no tengo tiempo»",
        "slug": "ep66-deja-de-decir-no-tengo-tiempo",
        "motivo": "El último obstáculo: decidir qué dejas fuera."
      }
    ]
  },
  {
    "id": "itinerario-6",
    "etiqueta": "Adversidad",
    "titulo": "Estoicismo frente a la adversidad",
    "introduccion": "Para quien atraviesa una pérdida, una enfermedad o un golpe que no ha elegido.",
    "episodios": [
      {
        "numero": 26,
        "titulo": "Tus noches oscuras del alma",
        "slug": "ep26-tus-noches-oscuras-del-alma-adversidad-y-buena-vida-1",
        "motivo": "Dos creencias para mirar la adversidad de otra manera."
      },
      {
        "numero": 32,
        "titulo": "El estoicismo frente a la adversidad",
        "slug": "ep32-el-estoicismo-frente-a-la-adversidad-adversidad-y-buena-vida-2",
        "motivo": "La estrategia estoica, explicada."
      },
      {
        "numero": 35,
        "titulo": "Mi «toolkit» estoico frente a la adversidad",
        "slug": "ep35-mi-toolkit-estoico-frente-a-la-adversidad-adversidad-y-buena-vida-3",
        "motivo": "Las prácticas que uso yo; cierra la serie."
      },
      {
        "numero": 27,
        "titulo": "Autismo y buena vida, con Marta R. Cogollos",
        "slug": "ep27-autismo-y-buena-vida-con-marta-r-cogollos-estoicismo-contemporaneo-frente-a-la-adversidad",
        "motivo": "El estoicismo vivido por alguien concreto."
      },
      {
        "numero": 60,
        "titulo": "Vivir bien cuando la vida duele, con Olga Albaladejo",
        "slug": "ep60-vivir-bien-cuando-la-vida-duele-con-olga-albaladejo",
        "motivo": "Otra conversación, desde el dolor más reciente."
      },
      {
        "numero": 46,
        "titulo": "Aprender a vivir es aprender a morir",
        "slug": "ep46-aprender-a-vivir-es-aprender-a-morir",
        "motivo": "La pregunta de fondo, con serenidad."
      }
    ]
  },
  {
    "id": "itinerario-7",
    "etiqueta": "Liderar",
    "titulo": "Liderar y el comité de dirección",
    "introduccion": "Para quien dirige personas o se sienta en un comité.",
    "episodios": [
      {
        "numero": 63,
        "titulo": "El cansancio no te quita inteligencia",
        "slug": "ep63-el-cansancio-no-te-quita-inteligencia",
        "motivo": "Cómo decide un directivo bajo presión, y por qué le falta repertorio, no cabeza."
      },
      {
        "numero": 64,
        "titulo": "¿Actúas tan bien que te pierdes?",
        "slug": "ep64-actuas-tan-bien-que-te-pierdes",
        "motivo": "El papel de líder competente y lo que cuesta."
      },
      {
        "numero": 54,
        "titulo": "Cuando el rol manda, tu conciencia se calla",
        "slug": "ep54-cuando-el-rol-manda-tu-conciencia-se-calla",
        "motivo": "Stanford 1971: el poder del rol sobre personas normales."
      },
      {
        "numero": 59,
        "titulo": "La sombra en el comité de dirección",
        "slug": "ep59-la-sombra-en-el-comite-de-direccion-sombra-5",
        "motivo": "Lo que no se dice en la planta 21."
      },
      {
        "numero": 38,
        "titulo": "Soledad, sufrimiento y falso éxito en la alta dirección, con Javier Llansó",
        "slug": "ep38-soledad-sufrimiento-y-falso-exito-en-la-alta-direccion-con-javier-llanso",
        "motivo": "El precio personal de llegar arriba, contado desde dentro."
      }
    ]
  },
  {
    "id": "itinerario-8",
    "etiqueta": "Curso de psicología social",
    "titulo": "Mi curso de psicología social",
    "introduccion": "Por qué personas normales hacen cosas que nunca harían solas, y qué tiene que ver eso contigo. Es un curso en episodios: cada lección parte de un experimento o una escena real y acaba en tu vida de todos los días. Se escucha en orden, y sigue creciendo.",
    "episodios": [
      {
        "numero": 48,
        "titulo": "El yo social",
        "slug": "ep48-el-yo-social-los-hilos-invisibles-que-guian-tus-decisiones-psicologia-social-1",
        "motivo": "La primera lección: no decidimos solos, aunque lo parezca."
      },
      {
        "numero": 51,
        "titulo": "Personas normales, decisiones inhumanas",
        "slug": "ep51-personas-normales-decisiones-inhumanas",
        "motivo": "Milgram: hasta dónde obedecemos a quien manda."
      },
      {
        "numero": 54,
        "titulo": "Cuando el rol manda, tu conciencia se calla",
        "slug": "ep54-cuando-el-rol-manda-tu-conciencia-se-calla",
        "motivo": "Stanford, 1971: lo que un papel hace con una persona normal."
      },
      {
        "numero": 57,
        "titulo": "El mundo (no) está lleno de imbéciles",
        "slug": "ep57-el-mundo-no-esta-lleno-de-imbeciles-psicologia-social-4",
        "motivo": "Por qué juzgamos a los demás con una vara y a nosotros con otra."
      },
      {
        "numero": 64,
        "titulo": "¿Actúas tan bien que te pierdes?",
        "slug": "ep64-actuas-tan-bien-que-te-pierdes",
        "motivo": "Goffman y las máscaras: cuando el papel que interpretas se confunde con quien eres."
      }
    ]
  }
];
