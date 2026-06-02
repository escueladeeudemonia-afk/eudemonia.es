/*
  Test de Somnolencia Diurna de Epworth (Epworth Sleepiness Scale, ESS).
  Autor del instrumento: M. W. Johns (1991).
  Texto de los ítems: versión en español del formulario del Laboratorio de
  Cronobiología (Universidad de Murcia) / Kronohealth.

  Escala oficial por ítem: a=0, b=1, c=2, d=3 (total 0–24).

  UMBRALES: corte oficial de Johns → > 10 = somnolencia diurna excesiva.
  Estratificación estándar de severidad: 0–10 normal · 11–14 leve ·
  15–17 moderada · 18–24 grave (thresholds [10, 14, 17]).
*/

const OPCIONES = [
  [{ es: 'Nunca tengo sueño', en: 'Would never doze' }, 0],
  [{ es: 'Ligera probabilidad de tener sueño', en: 'Slight chance of dozing' }, 1],
  [{ es: 'Moderada probabilidad de tener sueño', en: 'Moderate chance of dozing' }, 2],
  [{ es: 'Alta probabilidad de tener sueño', en: 'High chance of dozing' }, 3],
];

export default {
  id: 'epworth',
  panelKey: 'epworth',
  brandLogo: 'https://eudemonia.es/brand/firma-eudemonia.png',
  backHref: '/descanso',
  result: { showScale: false, showRef: false },
  panelTone: (seg) => (seg === 0 ? 'ok' : seg === 3 ? 'alert' : 'warn'),

  ui: {
    es: {
      title: 'Test de somnolencia diurna',
      lead: 'Valora la facilidad para amodorrarte o quedarte dormido en distintas situaciones cotidianas. Aunque no hayas vivido alguna recientemente, imagina cómo te habría afectado.',
      startCta: 'Empezar el test',
      back: '← Atrás',
      backToModule: '← Módulo de descanso',
      kicker: 'Tu somnolencia diurna',
      again: 'Hacer otro test',
      scoreLbl: 'Puntuación: ',
      footer: 'Escala de Somnolencia de Epworth (M. W. Johns, 1991). Cuestionario cedido por Mª José (Sociedad Española de Sueño · Laboratorio de Cronobiología, Universidad de Murcia). Herramienta orientativa, no diagnóstica. Para la Escuela de Eudemonía.',
    },
    en: {
      title: 'Daytime sleepiness test',
      lead: "Rate how likely you are to doze off in everyday situations. Even if you haven't done some of them recently, imagine how they would have affected you.",
      startCta: 'Start the test',
      back: '← Back',
      backToModule: '← Rest module',
      kicker: 'Your daytime sleepiness',
      again: 'Take another test',
      scoreLbl: 'Score: ',
      footer: 'Epworth Sleepiness Scale (M. W. Johns, 1991). Spanish wording from the Chronobiology Lab (University of Murcia) / Kronohealth. An orientation tool, not a diagnosis. For the Escuela de Eudemonía.',
    },
  },

  // 0 = normal … 3 = grave
  categories: [
    { name: { es: 'Somnolencia diurna normal', en: 'Normal daytime sleepiness' },
      desc: { es: 'Tu nivel de somnolencia durante el día está dentro de lo esperable. Te mantienes despierto y atento en las situaciones cotidianas. Cuida la regularidad de tus horarios para conservarlo.',
              en: 'Your daytime sleepiness is within the expected range. You stay awake and alert in everyday situations. Keep regular hours to maintain it.' } },
    { name: { es: 'Somnolencia diurna leve', en: 'Mild excessive daytime sleepiness' },
      desc: { es: 'Apareces algo más somnoliento de lo habitual durante el día. Conviene revisar cuánto y cómo duermes, tus horarios y tu exposición a la luz. Si se mantiene, merece atención.',
              en: 'You appear somewhat sleepier than usual during the day. Worth reviewing how much and how well you sleep, your schedule and your light exposure. If it persists, it deserves attention.' } },
    { name: { es: 'Somnolencia diurna moderada', en: 'Moderate excessive daytime sleepiness' },
      desc: { es: 'Tu somnolencia diurna es notable y puede estar afectando tu día a día. Revisa tus hábitos de sueño y, si persiste, valora una consulta profesional del sueño.',
              en: 'Your daytime sleepiness is noticeable and may be affecting your daily life. Review your sleep habits and, if it persists, consider a professional sleep consultation.' } },
    { name: { es: 'Somnolencia diurna grave', en: 'Severe excessive daytime sleepiness' },
      desc: { es: 'Tu nivel de somnolencia durante el día es alto. Es recomendable una valoración profesional del sueño, ya que puede asociarse a trastornos como la apnea. No lo dejes pasar.',
              en: 'Your daytime sleepiness is high. A professional sleep assessment is advisable, as it can be linked to disorders such as apnea. Don\'t let it slide.' } },
  ],

  variants: [
    {
      id: 'ess',
      card: { sub: { es: '8 situaciones · ≈ 1 minuto', en: '8 situations · ≈ 1 minute' } },
      max: 24,
      scoreSuffix: { es: ' / 24', en: ' / 24' },
      thresholds: [10, 14, 17],
      questions: [
        { q: { es: 'Sentado y leyendo', en: 'Sitting and reading' }, o: OPCIONES },
        { q: { es: 'Viendo la televisión', en: 'Watching TV' }, o: OPCIONES },
        { q: { es: 'Sentado, inactivo, en un lugar público (cine, teatro, una conferencia…)', en: 'Sitting inactive in a public place (cinema, theatre, a meeting…)' }, o: OPCIONES },
        { q: { es: 'Como pasajero de un coche en un viaje de 1 hora sin paradas', en: 'As a passenger in a car for an hour without a break' }, o: OPCIONES },
        { q: { es: 'Estirado para descansar al mediodía cuando las circunstancias lo permiten', en: 'Lying down to rest in the afternoon when circumstances permit' }, o: OPCIONES },
        { q: { es: 'Sentado y hablando con otra persona', en: 'Sitting and talking to someone' }, o: OPCIONES },
        { q: { es: 'Sentado tranquilamente después de una comida sin alcohol', en: 'Sitting quietly after a lunch without alcohol' }, o: OPCIONES },
        { q: { es: 'En un coche, parado por el tráfico unos minutos (semáforo, retención…)', en: 'In a car, stopped in traffic for a few minutes (lights, a jam…)' }, o: OPCIONES },
      ],
    },
  ],
};
