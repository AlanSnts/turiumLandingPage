/* =========================================================
   Turium — interações da página
   ========================================================= */
(function () {
  'use strict';
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: compacta ao rolar + menu mobile (igual ao site original do Turium) ---------- */
  var header = document.getElementById('site-header');
  var toggle = document.getElementById('menu-toggle');
  var menu = document.getElementById('mobile-menu');
  function onHeader() { header.classList.toggle('is-scrolled', window.scrollY > 24); }
  window.addEventListener('scroll', onHeader, { passive: true });
  onHeader();
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    toggle.querySelector('.menu-open').classList.toggle('hidden', open);
    toggle.querySelector('.menu-close').classList.toggle('hidden', !open);
    if (open) menu.querySelector('a').focus();
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Revelação ao entrar na tela ---------- */
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); revealIO.unobserve(e.target); } });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  /* o hero não passa por aqui: entra com animação CSS (.hero .reveal) */
  document.querySelectorAll('.reveal').forEach(function (n) { if (!n.closest('.hero')) revealIO.observe(n); });

  /* ---------- Hero: parallax leve (igual ao site original do Turium) ---------- */
  var layers = document.querySelectorAll('[data-parallax]');
  if (layers.length && !reduced) {
    var pxTick = false;
    var onParallax = function () {
      pxTick = false;
      var y = Math.min(window.scrollY, 900);
      layers.forEach(function (el) { el.style.setProperty('--py', (y * parseFloat(el.dataset.parallax)).toFixed(1) + 'px'); });
    };
    window.addEventListener('scroll', function () { if (!pxTick) { pxTick = true; requestAnimationFrame(onParallax); } }, { passive: true });
    onParallax();
  }

  /* ---------- Como funciona: passo ativo troca o painel fixo ---------- */
  var steps = Array.prototype.slice.call(document.querySelectorAll('.how-step'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.how-visual .panel'));
  var bars = Array.prototype.slice.call(document.querySelectorAll('.how-visual .progress span'));
  /* no celular, cada passo recebe uma cópia do seu painel logo abaixo do texto */
  steps.forEach(function (step, i) {
    var slot = step.querySelector('.how-mobile-panel');
    if (slot && panels[i]) {
      var frame = document.createElement('div');
      frame.className = 'panel-frame';
      var clone = panels[i].cloneNode(true);
      clone.classList.add('is-active');
      frame.appendChild(clone);
      slot.appendChild(frame);
    }
  });
  /* Cartões animados (passo 06): a sequência recomeça sempre que o painel volta a ficar ativo. */
  function playSeq(card, on) {
    if (!card) return;
    card.classList.remove('is-in');
    if (on) { void card.offsetWidth; card.classList.add('is-in'); }
  }
  /* No painel fixo, escala o cartão para caber na altura disponível (sem cortar e sem rolagem). */
  function fitDif() {
    document.querySelectorAll('.how-visual .dif-fit').forEach(function (fit) {
      var panel = fit.parentElement;
      var cs = getComputedStyle(panel);
      var avail = panel.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      fit.style.setProperty('--fit', Math.min(1, avail / fit.offsetHeight).toFixed(3));
    });
  }
  fitDif();
  window.addEventListener('resize', fitDif);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitDif);

  var lastStep = -1;
  function setStep(i) {
    steps.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
    panels.forEach(function (p, k) {
      p.classList.toggle('is-active', k === i);
      if (k === i && k !== lastStep) playSeq(p.querySelector('.dif-card'), true);
      if (k !== i) playSeq(p.querySelector('.dif-card'), false);
    });
    bars.forEach(function (b, k) { b.classList.toggle('is-on', k <= i); });
    lastStep = i;
  }
  /* No celular os cartões clonados animam ao entrar na tela. */
  var seqIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { playSeq(e.target, e.isIntersecting); });
  }, { threshold: 0.35 });
  document.querySelectorAll('.how-mobile-panel .dif-card').forEach(function (c) { seqIO.observe(c); });
  if (steps.length) {
    var stepIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setStep(steps.indexOf(e.target)); });
    }, { rootMargin: '-50% 0px -50% 0px' });
    steps.forEach(function (s) { stepIO.observe(s); });
    setStep(0);
  }

  /* ---------- Do balcão ao banco: linha do tempo guiada pela rolagem (ORAVIA) ---------- */
  var lc = document.getElementById('controle');
  if (lc) {
    var lcHeader = lc.querySelector('.lc-header');
    var lcFill = lc.querySelector('.lc-fill');
    var lcSteps = lc.querySelectorAll('.lc-step');
    var lcTick = false;
    var onLc = function () {
      lcTick = false;
      var rect = lc.getBoundingClientRect();
      var travel = rect.height - window.innerHeight;
      var progress = Math.max(0, Math.min(1, -rect.top / travel));
      lcHeader.style.opacity = progress > 0.02 || rect.top < window.innerHeight * 0.4 ? '1' : '0';
      lcFill.style.height = (progress * 100) + '%';
      /* a etapa acende quando a ponta da linha chega à bolinha dela
         (mesma conta do CSS: topo 16px, altura em % do .lc-body, limite 100% - 32px) */
      var body = lcFill.parentNode.getBoundingClientRect();
      var headY = body.top + 16 + Math.min(progress * body.height, body.height - 32);
      lcFill.classList.toggle('is-end', progress * body.height >= body.height - 32); // fim do trilho: a ponta some
      var last = -1;
      lcSteps.forEach(function (step, i) {
        var n = step.querySelector('.lc-node').getBoundingClientRect();
        if (n.top + n.height / 2 <= headY + 1) last = i;
      });
      lcSteps.forEach(function (step, i) {
        var active = i === last;
        step.classList.toggle('is-active', active);
        step.classList.toggle('is-past', i < last);
        step.style.transform = active && !reduced ? 'scale(1.05)' : 'scale(1)';
      });
    };
    window.addEventListener('scroll', function () { if (!lcTick) { lcTick = true; requestAnimationFrame(onLc); } }, { passive: true });
    window.addEventListener('resize', onLc);
    onLc();
  }

  /* ---------- Local-first: a internet cai, as vendas continuam ---------- */
  var net = document.getElementById('net-state');
  var feed = document.getElementById('sales-feed');
  var count = document.getElementById('sales-count');
  if (net && feed) {
    var items = [
      ['Porcelanato 60x60 · 14 CX', 'R$ 1.701,46'],
      ['Cimento CP-II 50 kg · 20 UN', 'R$ 670,00'],
      ['Vergalhão CA-50 10 mm · 12 BR', 'R$ 1.080,00'],
      ['Caixa d\'Água 1.000 L · 1 UN', 'R$ 1.000,00'],
      ['Areia média lavada · 2 M³', 'R$ 300,00']
    ];
    var n = 0, offline = false, total = 0, running = false, timer = null;
    var addSale = function () {
      var it = items[n++ % items.length];
      var row = document.createElement('div');
      row.className = 'sale';
      row.innerHTML = '<span></span><span><b></b> <span class="ok">✓ salvo</span></span>';
      row.firstChild.textContent = it[0];
      row.querySelector('b').textContent = it[1];
      feed.insertBefore(row, feed.firstChild);
      while (feed.children.length > 4) feed.removeChild(feed.lastChild);
      count.textContent = String(++total);
    };
    var cycle = function () {
      offline = !offline;
      net.classList.toggle('off', offline);
      net.lastChild.textContent = offline ? 'Sem conexão' : 'Conectada';
    };
    var tick = 0;
    var loop = function () {
      tick++;
      if (tick % 3 === 0) cycle();
      addSale();
    };
    new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting && !running) { running = true; if (!total) addSale(); timer = setInterval(loop, reduced ? 4000 : 2200); }
        if (!e.isIntersecting && running) { running = false; clearInterval(timer); }
      });
    }, { threshold: 0.3 }).observe(feed);
  }

  /* ano no rodapé */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
