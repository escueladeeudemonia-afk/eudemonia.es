/*
  Índice de Calidad de Sueño de Pittsburgh (PSQI).
  Instrumento: Buysse et al., 1989. Texto en español del cuestionario cedido
  por Mª José (Sociedad Española de Sueño · Laboratorio de Cronobiología, UMU).

  El PSQI NO es una suma simple: se calcula por 7 componentes (0–3 cada uno),
  y la puntuación global (0–21) es su suma. Algoritmo estándar de Buysse.

  Interpretación: punto de corte OFICIAL de Buysse → global > 5 = mala calidad
  de sueño (≤ 5 buena). El desglose por componentes aporta el matiz.
*/

const FREQ = {
  es: ['No en el último mes', 'Menos de 1 vez/semana', '1–2 veces/semana', '3+ veces/semana'],
  en: ['Not in the past month', 'Less than once a week', 'Once or twice a week', 'Three or more times a week'],
};
const QUALITY = {
  es: ['Muy buena', 'Bastante buena', 'Bastante mala', 'Muy mala'],
  en: ['Very good', 'Fairly good', 'Fairly bad', 'Very bad'],
};

function toMin(t) {
  if (!t || typeof t !== 'string' || t.indexOf(':') < 0) return null;
  const [h, m] = t.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return ((h % 24) * 60) + m;
}

export function computePSQI(a) {
  // Componente 1 — calidad subjetiva
  const c1 = a.q16;
  // Componente 2 — latencia (minutos en dormirse + ítem 5a)
  const lat = a.latency <= 15 ? 0 : a.latency <= 30 ? 1 : a.latency <= 60 ? 2 : 3;
  const c2sum = lat + a.d5a;
  const c2 = c2sum === 0 ? 0 : c2sum <= 2 ? 1 : c2sum <= 4 ? 2 : 3;
  // Componente 3 — duración del sueño
  const h = a.hours;
  const c3 = h > 7 ? 0 : h >= 6 ? 1 : h >= 5 ? 2 : 3;
  // Componente 4 — eficiencia habitual (horas dormidas / horas en cama)
  let inBed = toMin(a.risetime) - toMin(a.bedtime);
  if (inBed <= 0) inBed += 1440; // cruce de medianoche
  const eff = inBed > 0 ? (a.hours * 60 / inBed) * 100 : 0;
  const c4 = eff >= 85 ? 0 : eff >= 75 ? 1 : eff >= 65 ? 2 : 3;
  // Componente 5 — perturbaciones del sueño (ítems 5b–5j)
  const c5sum = a.d5b + a.d5c + a.d5d + a.d5e + a.d5f + a.d5g + a.d5h + a.d5i + a.d5j;
  const c5 = c5sum === 0 ? 0 : c5sum <= 9 ? 1 : c5sum <= 18 ? 2 : 3;
  // Componente 6 — uso de medicación para dormir
  const c6 = a.q17;
  // Componente 7 — disfunción diurna (somnolencia + ánimo)
  const c7sum = a.q18 + a.q19;
  const c7 = c7sum === 0 ? 0 : c7sum <= 2 ? 1 : c7sum <= 4 ? 2 : 3;

  const components = { c1, c2, c3, c4, c5, c6, c7 };
  const global = c1 + c2 + c3 + c4 + c5 + c6 + c7;
  const segment = global <= 5 ? 0 : 1; // corte oficial Buysse: > 5 = mala calidad
  return { components, global, segment, efficiency: Math.round(eff), hoursInBed: +(inBed / 60).toFixed(1) };
}

export default {
  id: 'pittsburgh',
  panelKey: 'pittsburgh',
  brandLogo: 'https://eudemonia.es/brand/firma-eudemonia.png',
  backHref: '/descanso',
  compute: computePSQI,
  panelTone: (seg) => (seg === 0 ? 'ok' : 'warn'),

  ui: {
    es: {
      title: 'Test de calidad del sueño',
      lead: 'Estas preguntas se refieren solo a tus hábitos de sueño durante el último mes. Responde según lo que haya sido habitual en la mayoría de días y noches.',
      startCta: 'Empezar el test',
      submit: 'Ver resultado',
      back: '← Atrás',
      backToModule: '← Módulo de descanso',
      kicker: 'Tu calidad de sueño',
      again: 'Hacer otro test',
      scoreLbl: 'Índice PSQI: ',
      scoreSuffix: ' / 21',
      breakdownTitle: 'Desglose por componentes',
      components: ['Calidad subjetiva', 'Latencia', 'Duración', 'Eficiencia', 'Perturbaciones', 'Medicación', 'Disfunción diurna'],
      incomplete: 'Por favor, responde a todas las preguntas para ver tu resultado.',
      footer: 'Índice de Calidad de Sueño de Pittsburgh (Buysse et al., 1989). Cuestionario cedido por Mª José (Sociedad Española de Sueño · Laboratorio de Cronobiología, Universidad de Murcia). Herramienta orientativa, no diagnóstica. Para la Escuela de Eudemonía.',
    },
    en: {
      title: 'Sleep quality test',
      lead: 'These questions refer only to your sleep habits during the past month. Answer based on what was usual for most days and nights.',
      startCta: 'Start the test',
      submit: 'See result',
      back: '← Back',
      backToModule: '← Rest module',
      kicker: 'Your sleep quality',
      again: 'Take another test',
      scoreLbl: 'PSQI index: ',
      scoreSuffix: ' / 21',
      breakdownTitle: 'Component breakdown',
      components: ['Subjective quality', 'Latency', 'Duration', 'Efficiency', 'Disturbances', 'Medication', 'Daytime dysfunction'],
      incomplete: 'Please answer every question to see your result.',
      footer: 'Pittsburgh Sleep Quality Index (Buysse et al., 1989). Questionnaire shared by Mª José (Spanish Sleep Society · Chronobiology Lab, University of Murcia). An orientation tool, not a diagnosis. For the Escuela de Eudemonía.',
    },
  },

  categories: [
    { name: { es: 'Buena calidad de sueño', en: 'Good sleep quality' },
      desc: { es: 'Tu sueño del último mes apunta a una buena calidad de descanso (índice ≤ 5). Mantén la regularidad de horarios y tus rutinas de sueño.',
              en: 'Your sleep over the past month points to good quality rest (index ≤ 5). Keep your regular schedule and sleep routines.' } },
    { name: { es: 'Mala calidad de sueño', en: 'Poor sleep quality' },
      desc: { es: 'Tu índice supera el umbral de buena calidad (> 5). Mira el desglose para ver qué componente pesa más (latencia, perturbaciones, eficiencia…); si se mantiene, conviene una valoración profesional del sueño.',
              en: 'Your index is above the good-quality threshold (> 5). Check the breakdown to see which component weighs most (latency, disturbances, efficiency…); if it persists, a professional sleep assessment is advisable.' } },
  ],

  // Preguntas para la interfaz. type: time | minutes | hours | choice
  questions: [
    { key: 'bedtime', type: 'time', q: { es: '¿Cuál ha sido normalmente tu hora de acostarte?', en: 'What time have you usually gone to bed?' } },
    { key: 'latency', type: 'minutes', q: { es: '¿Cuántos minutos has tardado en dormirte, normalmente?', en: 'How many minutes has it usually taken you to fall asleep?' } },
    { key: 'risetime', type: 'time', q: { es: '¿A qué hora te has levantado habitualmente por la mañana?', en: 'What time have you usually gotten up in the morning?' } },
    { key: 'hours', type: 'hours', q: { es: '¿Cuántas horas de sueño real has dormido por noche? (puede diferir de las horas en la cama)', en: 'How many hours of actual sleep did you get per night? (may differ from time in bed)' } },
    { key: 'd5a', type: 'choice', opts: FREQ, q: { es: 'Problemas para dormir por: no conciliar el sueño en la primera media hora', en: 'Trouble sleeping because: cannot get to sleep within 30 minutes' } },
    { key: 'd5b', type: 'choice', opts: FREQ, q: { es: '…despertarte en mitad de la noche o de madrugada', en: '…waking up in the middle of the night or early morning' } },
    { key: 'd5c', type: 'choice', opts: FREQ, q: { es: '…tener que levantarte para ir al baño', en: '…having to get up to use the bathroom' } },
    { key: 'd5d', type: 'choice', opts: FREQ, q: { es: '…no poder respirar bien', en: '…cannot breathe comfortably' } },
    { key: 'd5e', type: 'choice', opts: FREQ, q: { es: '…toser o roncar ruidosamente', en: '…coughing or snoring loudly' } },
    { key: 'd5f', type: 'choice', opts: FREQ, q: { es: '…sentir frío', en: '…feeling too cold' } },
    { key: 'd5g', type: 'choice', opts: FREQ, q: { es: '…sentir demasiado calor', en: '…feeling too hot' } },
    { key: 'd5h', type: 'choice', opts: FREQ, q: { es: '…tener pesadillas o malos sueños', en: '…having bad dreams' } },
    { key: 'd5i', type: 'choice', opts: FREQ, q: { es: '…sufrir dolores', en: '…having pain' } },
    { key: 'd5j', type: 'choice', opts: FREQ, q: { es: '…otras causas', en: '…other reasons' } },
    { key: 'q16', type: 'choice', opts: QUALITY, q: { es: '¿Cómo valorarías en conjunto la calidad de tu sueño?', en: 'Overall, how would you rate your sleep quality?' } },
    { key: 'q17', type: 'choice', opts: FREQ, q: { es: '¿Con qué frecuencia has tomado medicinas para dormir (recetadas o por tu cuenta)?', en: 'How often have you taken medicine to help you sleep (prescribed or otherwise)?' } },
    { key: 'q18', type: 'choice', opts: FREQ, q: { es: '¿Con qué frecuencia has sentido somnolencia mientras conducías, comías o en otra actividad?', en: 'How often have you had trouble staying awake while driving, eating or in activity?' } },
    { key: 'q19', type: 'choice', opts: FREQ, q: { es: '¿Cuánto problema te ha supuesto tener ánimos para hacer esas actividades?', en: 'How much of a problem has it been to keep up enthusiasm to get things done?' } },
  ],
};
