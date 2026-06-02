/*
  Escala de Insomnio de Atenas (AIS — Athens Insomnia Scale).
  Instrumento: Soldatos, Dikeos & Paparrigopoulos (2000), basado en criterios CIE-10.
  Ítems y etiquetas según la versión oficial (8 ítems, 0–3 cada uno; total 0–24).
  Usada con permiso de los autores.

  Punto de corte OFICIAL de los autores: ≥ 6 (distingue insomnio de controles
  en el 90 % de los casos). Existe versión corta (los 5 primeros ítems).
  Interpretación por tramos (0–5 / 6–9 / 10–24) anclada al corte oficial de 6,
  con gradación pedagógica. Textos de resultado en tono pedagógico, no clínico.
*/

export default {
  id: 'atenas',
  panelKey: 'atenas',
  brandLogo: 'https://eudemonia.es/brand/firma-eudemonia.png',
  backHref: '/descanso',
  result: { showScale: false, showRef: false },
  panelTone: (seg) => (seg === 0 ? 'ok' : seg === 1 ? 'warn' : 'alert'),

  ui: {
    es: {
      title: 'Test de insomnio',
      lead: 'Valora cualquier dificultad de sueño que hayas tenido, siempre que se haya dado al menos tres veces por semana durante el último mes. Elige la opción que mejor describa tu caso.',
      startCta: 'Empezar el test',
      back: '← Atrás',
      backToModule: '← Módulo de descanso',
      kicker: 'Tu nivel de insomnio',
      again: 'Hacer otro test',
      scoreLbl: 'Puntuación: ',
      footer: 'Escala de Insomnio de Atenas (AIS · Soldatos, Dikeos & Paparrigopoulos, 2000; criterios CIE-10). Punto de corte oficial ≥ 6. Usada con permiso de los autores. Herramienta orientativa, no diagnóstica. Para la Escuela de Eudemonía.',
    },
    en: {
      title: 'Insomnia test',
      lead: 'Rate any sleep difficulty you have had, provided it occurred at least three times a week during the last month. Choose the option that best fits your case.',
      startCta: 'Start the test',
      back: '← Back',
      backToModule: '← Rest module',
      kicker: 'Your insomnia level',
      again: 'Take another test',
      scoreLbl: 'Score: ',
      footer: 'Athens Insomnia Scale (AIS · Soldatos, Dikeos & Paparrigopoulos, 2000; ICD-10 criteria). Official cutoff ≥ 6. Used with the authors\' permission. An orientation tool, not a diagnosis. For the Escuela de Eudemonía.',
    },
  },

  // 0 = sin indicios … 2 = insomnio marcado (ancladas al corte oficial de 6)
  categories: [
    { name: { es: 'Sin indicios de insomnio', en: 'No signs of insomnia' },
      desc: { es: 'Tus respuestas quedan por debajo del umbral asociado al insomnio. Tu descanso parece estar funcionando; cuida tus rutinas y horarios para mantenerlo.',
              en: 'Your answers fall below the threshold associated with insomnia. Your rest seems to be working; look after your routines and schedule to keep it.' } },
    { name: { es: 'Indicios de insomnio', en: 'Signs of insomnia' },
      desc: { es: 'Tus respuestas alcanzan el umbral que suele asociarse al insomnio. Conviene cuidar tu sueño de forma activa y, si la situación se mantiene, valorar apoyo profesional.',
              en: 'Your answers reach the threshold usually associated with insomnia. It is worth actively caring for your sleep and, if it persists, considering professional support.' } },
    { name: { es: 'Insomnio marcado', en: 'Marked insomnia' },
      desc: { es: 'Tus respuestas apuntan a un insomnio importante que está afectando a tu día a día. Te recomendamos buscar apoyo profesional para abordarlo; cuanto antes, mejor.',
              en: 'Your answers point to significant insomnia affecting your daily life. We recommend seeking professional support to address it; the sooner, the better.' } },
  ],

  variants: [
    {
      id: 'ais',
      card: { sub: { es: '8 ítems · ≈ 3–5 minutos', en: '8 items · ≈ 3–5 minutes' } },
      max: 24,
      scoreSuffix: { es: ' / 24', en: ' / 24' },
      thresholds: [5, 9],
      questions: [
        { q: { es: 'Inducción del sueño (tiempo que tardas en dormirte tras apagar la luz)', en: 'Sleep induction (time it takes you to fall asleep after turning off the lights)' },
          o: [[{ es: 'Sin problema', en: 'No problem' }, 0], [{ es: 'Ligeramente retrasado', en: 'Slightly delayed' }, 1], [{ es: 'Marcadamente retrasado', en: 'Markedly delayed' }, 2], [{ es: 'Muy retrasado o no dormí nada', en: 'Very delayed or did not sleep at all' }, 3]] },
        { q: { es: 'Despertares durante la noche', en: 'Awakenings during the night' },
          o: [[{ es: 'Sin problema', en: 'No problem' }, 0], [{ es: 'Problema leve', en: 'Minor problem' }, 1], [{ es: 'Problema considerable', en: 'Considerable problem' }, 2], [{ es: 'Problema grave o no dormí nada', en: 'Serious problem or did not sleep at all' }, 3]] },
        { q: { es: 'Despertar final más temprano de lo deseado', en: 'Final awakening earlier than desired' },
          o: [[{ es: 'No más temprano', en: 'Not earlier' }, 0], [{ es: 'Un poco más temprano', en: 'A little earlier' }, 1], [{ es: 'Marcadamente más temprano', en: 'Markedly earlier' }, 2], [{ es: 'Mucho más temprano o no dormí nada', en: 'Much earlier or did not sleep at all' }, 3]] },
        { q: { es: 'Duración total del sueño', en: 'Total sleep duration' },
          o: [[{ es: 'Suficiente', en: 'Sufficient' }, 0], [{ es: 'Ligeramente insuficiente', en: 'Slightly insufficient' }, 1], [{ es: 'Marcadamente insuficiente', en: 'Markedly insufficient' }, 2], [{ es: 'Muy insuficiente o no dormí nada', en: 'Very insufficient or did not sleep at all' }, 3]] },
        { q: { es: 'Calidad general del sueño (independientemente de cuánto durmieras)', en: 'Overall quality of sleep (no matter how long you slept)' },
          o: [[{ es: 'Satisfactoria', en: 'Satisfactory' }, 0], [{ es: 'Ligeramente insatisfactoria', en: 'Slightly unsatisfactory' }, 1], [{ es: 'Marcadamente insatisfactoria', en: 'Markedly unsatisfactory' }, 2], [{ es: 'Muy insatisfactoria o no dormí nada', en: 'Very unsatisfactory or did not sleep at all' }, 3]] },
        { q: { es: 'Sensación de bienestar durante el día', en: 'Sense of well-being during the day' },
          o: [[{ es: 'Normal', en: 'Normal' }, 0], [{ es: 'Ligeramente disminuida', en: 'Slightly decreased' }, 1], [{ es: 'Marcadamente disminuida', en: 'Markedly decreased' }, 2], [{ es: 'Muy disminuida', en: 'Very decreased' }, 3]] },
        { q: { es: 'Funcionamiento (físico y mental) durante el día', en: 'Functioning (physical and mental) during the day' },
          o: [[{ es: 'Normal', en: 'Normal' }, 0], [{ es: 'Ligeramente disminuido', en: 'Slightly decreased' }, 1], [{ es: 'Marcadamente disminuido', en: 'Markedly decreased' }, 2], [{ es: 'Muy disminuido', en: 'Very decreased' }, 3]] },
        { q: { es: 'Somnolencia durante el día', en: 'Sleepiness during the day' },
          o: [[{ es: 'Ninguna', en: 'None' }, 0], [{ es: 'Leve', en: 'Mild' }, 1], [{ es: 'Considerable', en: 'Considerable' }, 2], [{ es: 'Intensa', en: 'Intense' }, 3]] },
      ],
    },
  ],
};
