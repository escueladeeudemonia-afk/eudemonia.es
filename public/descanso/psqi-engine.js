/*
  Motor del PSQI (calidad de sueño). Familia distinta al cuestionario simple:
  formulario con inputs mixtos (hora, minutos, horas, escalas) y cálculo por
  componentes mediante test.compute(answers). Guarda el resultado en
  localStorage para el panel de /descanso.
*/

export const PANEL_NS = 'eude:descanso';

function L(x, lang) {
  if (x == null) return '';
  if (typeof x === 'string') return x;
  return x[lang] != null ? x[lang] : (x.es != null ? x.es : '');
}

export function mountPSQI(test, opts = {}) {
  const root = opts.root || document.getElementById('app');
  if (!root) throw new Error('mountPSQI: no root');
  const state = { lang: opts.lang || 'es', answers: {}, result: null };

  root.innerHTML = `
    <div class="wrap">
      <header>
        ${test.brandLogo ? `<img class="logo" src="${test.brandLogo}" alt="Eudemonía">` : ''}
        <span class="lang"><b data-lang="es" class="act">ES</b><span>·</span><b data-lang="en">EN</b></span>
      </header>
      <div class="crumb"><a data-back href="${test.backHref || '/descanso'}"></a></div>

      <section class="screen on" data-screen="form">
        <h1 data-title></h1>
        <p class="lead" data-lead></p>
        <div data-questions></div>
        <div class="submit-wrap">
          <button class="btn" data-submit></button>
          <span class="err" data-err hidden></span>
        </div>
      </section>

      <section class="screen" data-screen="result">
        <div class="res-kicker" data-r-kicker></div>
        <div class="res-name" data-r-name></div>
        <div class="res-score" data-r-score></div>
        <div class="res-desc" data-r-desc></div>
        <div class="breakdown" data-r-breakdown></div>
        <div class="res-actions">
          <button class="btn" data-r-again></button>
          <a class="btn btn-ghost" data-r-module href="${test.backHref || '/descanso'}"></a>
        </div>
      </section>

      <footer data-footer></footer>
    </div>`;

  const $ = (s) => root.querySelector(s);
  const screens = root.querySelectorAll('.screen');
  const showScreen = (name) => { screens.forEach((s) => s.classList.toggle('on', s.dataset.screen === name)); window.scrollTo(0, 0); };

  root.querySelectorAll('[data-lang]').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  function setLang(l) {
    state.lang = l;
    document.documentElement.lang = l;
    root.querySelectorAll('[data-lang]').forEach((b) => b.classList.toggle('act', b.dataset.lang === l));
    paint();
    if ($('[data-screen="result"]').classList.contains('on')) renderResult();
  }

  function paint() {
    const u = test.ui[state.lang];
    $('[data-back]').textContent = u.backToModule;
    $('[data-title]').textContent = u.title;
    $('[data-lead]').textContent = u.lead;
    $('[data-submit]').textContent = u.submit;
    $('[data-r-kicker]').textContent = u.kicker;
    $('[data-r-again]').textContent = u.again;
    $('[data-r-module]').textContent = u.backToModule;
    $('[data-footer]').textContent = u.footer;
    renderQuestions();
  }

  function renderQuestions() {
    const box = $('[data-questions]');
    box.innerHTML = '';
    test.questions.forEach((item, i) => {
      const wrap = document.createElement('div');
      wrap.className = 'psqi-q';
      const q = document.createElement('div');
      q.className = 'q';
      q.textContent = (i + 1) + '. ' + L(item.q, state.lang);
      wrap.appendChild(q);

      if (item.type === 'choice') {
        const opts = document.createElement('div');
        opts.className = 'opts';
        const labels = item.opts[state.lang];
        labels.forEach((lab, val) => {
          const b = document.createElement('button');
          b.className = 'opt' + (state.answers[item.key] === val ? ' sel' : '');
          b.textContent = lab;
          b.addEventListener('click', () => {
            state.answers[item.key] = val;
            opts.querySelectorAll('.opt').forEach((o) => o.classList.remove('sel'));
            b.classList.add('sel');
          });
          opts.appendChild(b);
        });
        wrap.appendChild(opts);
      } else {
        const field = document.createElement('div');
        field.className = 'field';
        const input = document.createElement('input');
        if (item.type === 'time') { input.type = 'time'; }
        else if (item.type === 'minutes') { input.type = 'number'; input.min = '0'; input.placeholder = 'min'; }
        else if (item.type === 'hours') { input.type = 'number'; input.min = '0'; input.max = '24'; input.step = '0.25'; input.placeholder = 'h'; }
        if (state.answers[item.key] != null) input.value = state.answers[item.key];
        input.addEventListener('input', () => {
          if (item.type === 'time') state.answers[item.key] = input.value;
          else state.answers[item.key] = input.value === '' ? undefined : Number(input.value);
        });
        field.appendChild(input);
        wrap.appendChild(field);
      }
      box.appendChild(wrap);
    });
  }

  function complete() {
    return test.questions.every((item) => {
      const v = state.answers[item.key];
      if (item.type === 'choice') return typeof v === 'number';
      if (item.type === 'time') return typeof v === 'string' && v.indexOf(':') > 0;
      return typeof v === 'number' && !isNaN(v);
    });
  }

  $('[data-submit]').addEventListener('click', () => {
    const err = $('[data-err]');
    if (!complete()) { err.hidden = false; err.textContent = test.ui[state.lang].incomplete; return; }
    err.hidden = true;
    const r = test.compute(state.answers);
    state.result = r;
    const cat = test.categories[r.segment];
    const tone = typeof test.panelTone === 'function' ? test.panelTone(r.segment) : 'info';
    try {
      localStorage.setItem(PANEL_NS + ':' + test.id, JSON.stringify({
        id: test.id, panelKey: test.panelKey || test.id,
        total: r.global, max: 21, segment: r.segment,
        category: cat.name, tone, components: r.components, ts: Date.now(),
      }));
    } catch (e) {}
    renderResult();
    showScreen('result');
  });

  $('[data-r-again]').addEventListener('click', () => location.reload());

  function renderResult() {
    if (!state.result) return;
    const u = test.ui[state.lang];
    const r = state.result;
    const cat = test.categories[r.segment];
    $('[data-r-name]').textContent = L(cat.name, state.lang);
    $('[data-r-score]').textContent = u.scoreLbl + r.global + (u.scoreSuffix || '');
    $('[data-r-desc]').textContent = L(cat.desc, state.lang);

    const order = ['c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7'];
    const bd = $('[data-r-breakdown]');
    bd.innerHTML = '<h4>' + u.breakdownTitle + '</h4>' + order.map((k, i) => {
      const val = r.components[k];
      let dots = '';
      for (let d = 0; d < 4; d++) dots += '<i class="' + (d <= val ? 'on' : '') + '"></i>';
      return '<div class="brow"><span>' + u.components[i] + '</span><span class="bdots">' + dots + '</span></div>';
    }).join('');
  }

  setLang(state.lang);
  showScreen('form');
}
