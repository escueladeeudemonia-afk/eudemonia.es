/*
  Motor de cuestionario reutilizable para el módulo de descanso.
  Familia "ítems con puntuación → suma → segmento por umbrales → categoría".
  Sirve para el cronotipo (MEQ/rMEQ) y, con su archivo de datos, para
  otros cuestionarios tipo Likert (p.ej. Epworth). Guarda el resultado en
  localStorage para alimentar el panel de /descanso.

  Uso:
    import { mountQuiz } from '/descanso/quiz-engine.js';
    import test from '/descanso/tests/cronotipo.js';
    mountQuiz(test, { root: document.getElementById('app') });
*/

export const PANEL_NS = 'eude:descanso';

export function loadResult(testId) {
  try {
    const v = localStorage.getItem(PANEL_NS + ':' + testId);
    return v ? JSON.parse(v) : null;
  } catch (e) { return null; }
}

function saveResult(testId, data) {
  try { localStorage.setItem(PANEL_NS + ':' + testId, JSON.stringify(data)); } catch (e) {}
}

// Devuelve el valor del idioma actual; admite string (igual en ambos) u {es,en}.
function L(x, lang) {
  if (x == null) return '';
  if (typeof x === 'string') return x;
  return x[lang] != null ? x[lang] : (x.es != null ? x.es : '');
}

export function mountQuiz(test, opts = {}) {
  const root = opts.root || document.getElementById('app');
  if (!root) throw new Error('mountQuiz: no root element');

  const state = { lang: opts.lang || 'es', variant: null, idx: 0, answers: [] };

  // ---- Estructura base (una sola vez) ----
  root.innerHTML = `
    <div class="wrap">
      <header>
        ${test.brandLogo ? `<img class="logo" src="${test.brandLogo}" alt="Eudemonía">` : ''}
        <span class="lang"><b data-lang="es" class="act">ES</b><span>·</span><b data-lang="en">EN</b></span>
      </header>
      <div class="crumb"><a data-back href="${test.backHref || '/descanso'}"></a></div>

      <section class="screen on" data-screen="start">
        <h1 data-start-title></h1>
        <p class="lead" data-start-lead></p>
        <div class="cards" data-start-cards></div>
      </section>

      <section class="screen" data-screen="quiz">
        <div class="top"><div class="bar"><i data-prog></i></div><div class="count" data-count></div></div>
        <div class="q" data-qtext></div>
        <div class="opts" data-opts></div>
        <div class="nav"><button class="back" data-backbtn></button></div>
      </section>

      <section class="screen" data-screen="result">
        <div class="res-kicker" data-r-kicker></div>
        <div class="res-name" data-r-name></div>
        <div class="res-score" data-r-score></div>
        <div class="scale" data-r-scale hidden></div>
        <div class="scale-lbl" data-r-scalelbl hidden></div>
        <div class="res-desc" data-r-desc></div>
        <div class="ref" data-r-ref hidden></div>
        <div class="res-actions">
          <button class="btn" data-r-again></button>
          <a class="btn btn-ghost" data-r-module href="${test.backHref || '/descanso'}"></a>
        </div>
      </section>

      <footer data-footer></footer>
    </div>`;

  const $ = (sel) => root.querySelector(sel);
  const screens = root.querySelectorAll('.screen');
  const showScreen = (name) => {
    screens.forEach((s) => s.classList.toggle('on', s.dataset.screen === name));
    window.scrollTo(0, 0);
  };

  // ---- Idioma ----
  root.querySelectorAll('[data-lang]').forEach((b) => {
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
  function setLang(l) {
    state.lang = l;
    document.documentElement.lang = l;
    root.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('act', b.dataset.lang === l));
    paintStatic();
    if ($('[data-screen="quiz"]').classList.contains('on')) renderQuestion();
    if ($('[data-screen="result"]').classList.contains('on')) renderResult();
  }

  function paintStatic() {
    const u = test.ui[state.lang];
    $('[data-back]').textContent = u.backToModule || (state.lang === 'es' ? '← Módulo de descanso' : '← Rest module');
    $('[data-start-title]').textContent = u.title;
    $('[data-start-lead]').textContent = u.lead;
    $('[data-backbtn]').textContent = u.back;
    $('[data-r-kicker]').textContent = u.kicker;
    $('[data-r-again]').textContent = u.again;
    $('[data-r-module]').textContent = u.backToModule || (state.lang === 'es' ? 'Volver al módulo' : 'Back to module');
    $('[data-footer]').textContent = u.footer;
    renderStartCards();
  }

  // ---- Pantalla de inicio ----
  function renderStartCards() {
    const box = $('[data-start-cards]');
    box.innerHTML = '';
    test.variants.forEach((v) => {
      const btn = document.createElement('button');
      btn.className = 'card';
      const single = test.variants.length === 1;
      const title = single ? (test.ui[state.lang].startCta || (state.lang === 'es' ? 'Empezar el test' : 'Start the test')) : L(v.card.title, state.lang);
      const sub = v.card && v.card.sub ? L(v.card.sub, state.lang) : '';
      btn.innerHTML = `<b>${title}</b>${sub ? `<span>${sub}</span>` : ''}`;
      btn.addEventListener('click', () => begin(v));
      box.appendChild(btn);
    });
  }

  // ---- Flujo del cuestionario ----
  function begin(variant) {
    state.variant = variant;
    state.idx = 0;
    state.answers = [];
    showScreen('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    const v = state.variant;
    const item = v.questions[state.idx];
    $('[data-qtext]').textContent = (state.idx + 1) + '. ' + L(item.q, state.lang);
    $('[data-count]').textContent = (state.idx + 1) + ' / ' + v.questions.length;
    $('[data-prog]').style.width = Math.round((state.idx) / v.questions.length * 100) + '%';
    $('[data-backbtn]').style.visibility = state.idx === 0 ? 'hidden' : 'visible';
    const box = $('[data-opts]');
    box.innerHTML = '';
    item.o.forEach((op) => {
      const b = document.createElement('button');
      b.className = 'opt';
      b.textContent = L(op[0], state.lang);
      b.addEventListener('click', () => choose(op[1]));
      box.appendChild(b);
    });
  }

  function choose(points) {
    state.answers[state.idx] = points;
    if (state.idx < state.variant.questions.length - 1) { state.idx++; renderQuestion(); }
    else finish();
  }

  $('[data-backbtn]').addEventListener('click', () => {
    if (state.idx > 0) { state.idx--; renderQuestion(); }
  });
  $('[data-r-again]').addEventListener('click', () => location.reload());

  function segmentFor(total, thresholds) {
    return thresholds.filter((t) => total > t).length;
  }

  function finish() {
    const v = state.variant;
    const total = state.answers.reduce((a, b) => a + b, 0);
    const seg = segmentFor(total, v.thresholds);
    const cat = test.categories[seg];
    const tone = typeof test.panelTone === 'function' ? test.panelTone(seg) : 'info';

    state.result = { total, seg };
    $('[data-prog]').style.width = '100%';

    saveResult(test.id, {
      id: test.id,
      panelKey: test.panelKey || test.id,
      variant: v.id,
      total,
      max: v.max != null ? v.max : null,
      segment: seg,
      category: cat.name,
      tone,
      ts: Date.now(),
    });

    renderResult();
    showScreen('result');
  }

  function renderResult() {
    if (!state.result) return;
    const u = test.ui[state.lang];
    const { total, seg } = state.result;
    const cat = test.categories[seg];

    $('[data-r-name]').textContent = L(cat.name, state.lang);
    const suffix = state.variant && state.variant.scoreSuffix ? L(state.variant.scoreSuffix, state.lang) : '';
    $('[data-r-score]').textContent = u.scoreLbl + total + suffix;
    $('[data-r-desc]').textContent = L(cat.desc, state.lang);

    // Escala visual (opcional)
    const showScale = test.result && test.result.showScale;
    const scaleEl = $('[data-r-scale]');
    const scaleLblEl = $('[data-r-scalelbl]');
    if (showScale) {
      scaleEl.hidden = false; scaleLblEl.hidden = false;
      scaleEl.innerHTML = '';
      const n = test.categories.length;
      for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        if (i === seg) d.className = 'act';
        scaleEl.appendChild(d);
      }
      const labels = (u.scale || []);
      scaleLblEl.innerHTML = labels.map((lab) => `<span>${lab}</span>`).join('');
    } else {
      scaleEl.hidden = true; scaleLblEl.hidden = true;
    }

    // Referencia (opcional, p.ej. horario natural del cronotipo)
    const refEl = $('[data-r-ref]');
    const showRef = test.result && test.result.showRef && cat.ref;
    if (showRef && typeof u.refTxt === 'function') {
      refEl.hidden = false;
      refEl.innerHTML = u.refTxt(cat.ref[0], cat.ref[1]);
    } else {
      refEl.hidden = true;
    }
  }

  // ---- Arranque ----
  setLang(state.lang);
  showScreen('start');
}
