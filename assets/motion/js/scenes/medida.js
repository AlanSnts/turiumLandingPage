/* Turium Motion — cena "Medida certa": 18 m² → 8 CX → 20,16 m² → sobra 2,16 m².
   Passos (data-step): 0 vazio · 1 pedido · 2 embalagem · 3 caixas · 4 sobra. */
(function () {
  'use strict';
  var stage = document.querySelector('[data-scene="medida"]');
  if (!stage) return;

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var readouts = stage.querySelectorAll('[data-readout]');
  var btnReplay = stage.querySelector('[data-medida="replay"]');
  var btnStep = stage.querySelector('[data-medida="step"]');
  var status = stage.querySelector('[data-medida="status"]');
  var sobra = stage.querySelector('.sobra-g');
  var timers = [];
  var played = false;
  var gen = 0;

  var STATUS = [
    '',
    'Passo 1 de 4: o cliente pediu 18 metros quadrados.',
    'Passo 2 de 4: cada caixa tem 2,52 metros quadrados.',
    'Passo 3 de 4: 7,14 caixas, arredondadas para 8 caixas, que cobrem 20,16 metros quadrados.',
    'Passo 4 de 4: sobra estimada de 2,16 metros quadrados.'
  ];

  function fmt(n, dec) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  }

  function countEl(i) { return readouts[i - 1] && readouts[i - 1].querySelector('[data-count]'); }

  function setValue(el, final) {
    if (!el) return;
    var v = final ? parseFloat(el.getAttribute('data-count')) : 0;
    el.textContent = fmt(v, parseInt(el.getAttribute('data-dec'), 10) || 0);
  }

  function countUp(el) {
    if (!el) return;
    var to = parseFloat(el.getAttribute('data-count'));
    var dec = parseInt(el.getAttribute('data-dec'), 10) || 0;
    var dur = 900, t0 = null, done = false, g = gen;
    function frame(t) {
      if (done || g !== gen) return;
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(to * e, dec);
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    /* Garante o valor exato mesmo se a aba ficar em segundo plano. */
    timers.push(setTimeout(function () { done = true; el.textContent = fmt(to, dec); }, dur + 60));
  }

  function setStep(n, animate) {
    stage.setAttribute('data-step', String(n));
    for (var i = 1; i <= 4; i++) {
      var r = readouts[i - 1];
      if (!r) continue;
      r.classList.toggle('is-on', i <= n);
      if (i < n || (i === n && !animate)) setValue(countEl(i), true);
      else if (i > n) setValue(countEl(i), false);
    }
    if (animate && n >= 1) countUp(countEl(n));
    if (n === 4 && animate && sobra) {
      sobra.classList.remove('sobra-pulse');
      void sobra.getBoundingClientRect();
      setTimeout(function () { sobra.classList.add('sobra-pulse'); }, 380);
    }
  }

  function clearTimers() { timers.forEach(clearTimeout); timers = []; }

  function reset() {
    gen++;
    clearTimers();
    stage.classList.add('is-reset');
    setStep(0, false);
    void stage.offsetWidth;
    stage.classList.remove('is-reset');
  }

  function play() {
    reset();
    if (btnReplay) btnReplay.hidden = true;
    var plan = [[1, 80], [2, 720], [3, 1380], [4, 2500]];
    plan.forEach(function (p) {
      timers.push(setTimeout(function () { setStep(p[0], true); }, p[1]));
    });
    timers.push(setTimeout(function () { if (btnReplay) btnReplay.hidden = false; }, 3400));
    played = true;
  }

  if (reduce) {
    /* Movimento reduzido: estado final direto; passo a passo sob demanda. */
    setStep(4, false);
    var cur = 4;
    if (btnStep) {
      btnStep.hidden = false;
      btnStep.addEventListener('click', function () {
        cur = cur >= 4 ? 1 : cur + 1;
        setStep(cur, false);
        if (status) status.textContent = STATUS[cur];
        btnStep.textContent = cur === 4 ? 'Mostrar passo a passo' : 'Próximo passo (' + (cur + 1) + ' de 4)';
      });
    }
  } else {
    setStep(0, false);
    var start = function () { if (!played) play(); };
    if (stage.classList.contains('is-in')) start();
    else stage.addEventListener('turium:in', function () { setTimeout(start, 250); });
    if (btnReplay) btnReplay.addEventListener('click', play);
  }

  /* ---------- Tela real ⇄ vídeo sob demanda ---------- */
  var toggle = document.querySelector('[data-proof-toggle]');
  var video = document.querySelector('[data-proof-video]');
  var imgs = document.querySelectorAll('[data-proof-img]');
  if (toggle && video) {
    var label = toggle.querySelector('span');
    toggle.addEventListener('click', function () {
      var on = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
      Array.prototype.forEach.call(imgs, function (p) { p.hidden = on; });
      video.hidden = !on;
      if (label) label.textContent = on ? 'Voltar para a tela' : 'Ver no sistema (20 s)';
      if (on) {
        try { video.currentTime = 0; } catch (e) {}
        var pr = video.play();
        if (pr && pr.catch) pr.catch(function () {});
      } else {
        video.pause();
      }
    });
  }
})();
