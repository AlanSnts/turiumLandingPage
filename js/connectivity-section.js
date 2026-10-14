/* =========================================================
   Seção "Conectividade" — monta e anima a ilustração a partir
   de js/connectivity.js (+ js/plans.js para limites e app).
   ========================================================= */
(function () {
  'use strict';
  var C = window.TURIUM_CONNECTIVITY, P = window.TURIUM_PLANS;
  var section = document.getElementById('conectividade');
  if (!C || !P || !section) return;

  var stage = document.getElementById('net-stage');
  var svg = stage.querySelector('.net-links');
  var tabsEl = document.getElementById('net-tabs');
  var legendEl = document.getElementById('net-legend');
  var benefitsEl = document.getElementById('net-benefits');
  var info = {
    devices: section.querySelector('.net-devices'),
    title: section.querySelector('.net-title'),
    text: section.querySelector('.net-text'),
    list: section.querySelector('.net-highlights')
  };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var SVGNS = 'http://www.w3.org/2000/svg';
  var MORPH_MS = 650;
  var PLAN_IDS = ['basico', 'pro', 'enterprise'];
  var current = null, visible = false, drawTimer = null, logTimer = null;

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var ICON = {
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    db: '<svg viewBox="0 0 24 24" aria-hidden="true"><ellipse cx="12" cy="5.5" rx="7.5" ry="2.8" fill="currentColor" opacity=".9"/><path d="M4.5 5.5v6.2c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8V5.5" fill="currentColor" opacity=".6"/><path d="M4.5 11.7v6.2c0 1.6 3.4 2.8 7.5 2.8s7.5-1.2 7.5-2.8v-6.2" fill="currentColor" opacity=".4"/></svg>',
    wifiOff: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 8.5a15 15 0 0 1 20 0M5 12a10.5 10.5 0 0 1 14 0M8.5 15.5a5.5 5.5 0 0 1 7 0M12 19h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    icons: [
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19H2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 4h12v16H6zM9 8h6M9 12h6M9 16h3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="3" y="14" width="18" height="6" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M7 7h.01M7 17h.01" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/></svg>',
      '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8 20h8M12 16v4" stroke="currentColor" stroke-width="1.8"/></svg>'
    ]
  };

  /* ---------- Montagem ---------- */
  function nodeHTML(id, d) {
    var cap = '<div class="net-cap"><b>' + esc(d.label) + '</b><span>' + esc(d.desc) + '</span></div>';
    switch (d.type) {
      case 'laptop':
        return '<div class="net-dev lap"><div class="lap-screen"><img alt="" loading="lazy" decoding="async" src="' + d.screen + '" style="object-position:' + (d.screenPos || 'left top') + '"><i class="lap-glare"></i></div><div class="lap-base"></div></div>' + cap;
      case 'server':
        return '<div class="net-dev srv"><span class="srv-led"></span><span class="srv-led"></span><span class="srv-led"></span><span class="srv-grill"></span><span class="srv-brand">TURIUM</span></div>' + cap;
      case 'phone':
        return '<div class="net-dev ph"><img alt="" loading="lazy" decoding="async" src="img/turium-mobile.webp"></div><div class="net-cap"><b>' + esc(d.label) + '</b><span>' + esc(d.desc) + '</span><em class="net-tag" data-owner></em></div>';
      case 'db':
        return '<div class="net-dev net-pill"><span class="net-pill-ico">' + ICON.db + '</span><span><b>' + esc(d.label) + '</b><small>' + esc(d.desc) + '</small></span></div>';
      case 'badge':
        return '<div class="net-dev net-pill net-pill-muted"><span class="net-pill-ico">' + ICON.wifiOff + '</span><span><b>' + esc(d.label) + '</b><small>' + esc(d.desc) + '</small></span></div>';
      case 'ghost':
        return '<div class="net-dev lap ghost"><div class="lap-screen">' + ICON.plus + '</div><div class="lap-base"></div></div>' + cap;
      case 'log':
        return '<div class="net-dev log"><p class="log-head"><span class="live" aria-hidden="true"></span>' + esc(d.label) + '</p><ul class="log-list"></ul></div>';
    }
    return '';
  }

  var nodes = {};
  Object.keys(C.DEVICES).forEach(function (id) {
    var d = C.DEVICES[id];
    var el = document.createElement('div');
    el.className = 'net-node nt-' + d.type;
    el.dataset.id = id;
    el.style.setProperty('--m-order', d.order);
    el.innerHTML = nodeHTML(id, d);
    stage.appendChild(el);
    nodes[id] = el;
    el.addEventListener('mouseenter', function () { highlight(id); });
    el.addEventListener('mouseleave', function () { highlight(null); });
  });

  function shortName(id) { return C.planById(P, id).name.replace(/^Turium\s+/, ''); }
  tabsEl.innerHTML = PLAN_IDS.map(function (id) {
    return '<button type="button" role="tab" id="net-tab-' + id + '" data-plan="' + id + '" aria-controls="net-panel" aria-selected="false" tabindex="-1">' + esc(shortName(id)) + '</button>';
  }).join('') + '<span class="net-tabs-ind" aria-hidden="true"></span>';
  var tabs = Array.prototype.slice.call(tabsEl.querySelectorAll('[role="tab"]'));

  benefitsEl.innerHTML = C.BENEFITS.map(function (b, i) {
    return '<div class="net-benefit"><span class="nb-ico">' + ICON.icons[i] + '</span><h3>' + esc(b.title) + '</h3><p>' + esc(b.text) + '</p></div>';
  }).join('');

  /* ---------- Ligações (SVG) ---------- */
  function rel(el) {
    var s = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return { l: r.left - s.left, t: r.top - s.top, r: r.right - s.left, b: r.bottom - s.top, cx: (r.left + r.right) / 2 - s.left, cy: (r.top + r.bottom) / 2 - s.top };
  }
  /* Caminho entre dois nós: vertical quando um está acima do outro, horizontal quando estão lado a lado. */
  function pathBetween(a, b) {
    var A = rel(nodes[a].querySelector('.net-dev')), B = rel(nodes[b]);
    if (nodes[b].classList.contains('nt-db')) B = rel(nodes[b].querySelector('.net-dev'));
    var ax, ay, bx, by, k;
    if (B.b < A.t) { ax = A.cx; ay = A.t; bx = B.cx; by = B.b + 4; k = (ay - by) / 2; return 'M' + ax + ' ' + ay + 'C' + ax + ' ' + (ay - k) + ' ' + bx + ' ' + (by + k) + ' ' + bx + ' ' + by; }
    if (B.t > A.b) { A = rel(nodes[a]); ax = A.cx; ay = A.b + 2; bx = B.cx; by = B.t - 4; k = (by - ay) / 2; return 'M' + ax + ' ' + ay + 'C' + ax + ' ' + (ay + k) + ' ' + bx + ' ' + (by - k) + ' ' + bx + ' ' + by; }
    var Bd = rel(nodes[b].querySelector('.net-dev'));
    if (Bd.r < A.l) { ax = A.l; ay = A.cy; bx = Bd.r + 6; by = Bd.cy; } else { ax = A.r; ay = A.cy; bx = Bd.l - 6; by = Bd.cy; }
    k = (bx - ax) / 2;
    return 'M' + ax + ' ' + ay + 'C' + (ax + k) + ' ' + ay + ' ' + (bx - k) + ' ' + by + ' ' + bx + ' ' + by;
  }
  function svgEl(tag, attrs) {
    var e = document.createElementNS(SVGNS, tag);
    Object.keys(attrs).forEach(function (k) { e.setAttribute(k, attrs[k]); });
    return e;
  }
  function pulse(pathId, dur, begin, reverse) {
    var c = svgEl('circle', { r: 3.2, class: 'net-pulse' });
    var m = svgEl('animateMotion', { dur: dur + 's', begin: begin + 's', repeatCount: 'indefinite', rotate: 'auto' });
    if (reverse) { m.setAttribute('keyPoints', '1;0'); m.setAttribute('keyTimes', '0;1'); m.setAttribute('calcMode', 'linear'); }
    var mp = svgEl('mpath', {}); mp.setAttributeNS('http://www.w3.org/1999/xlink', 'href', '#' + pathId); mp.setAttribute('href', '#' + pathId);
    m.appendChild(mp); c.appendChild(m);
    return c;
  }

  function drawLinks() {
    if (!current || window.innerWidth < 720) { svg.innerHTML = ''; return; }
    var s = stage.getBoundingClientRect();
    svg.setAttribute('viewBox', '0 0 ' + Math.round(s.width) + ' ' + Math.round(s.height));
    var layout = C.LAYOUTS[current];
    var frag = document.createDocumentFragment();
    layout.links.forEach(function (lk, i) {
      var id = 'net-path-' + current + '-' + i, kind = lk[2];
      if (kind === 'future' && lk[1] === 'phone' && C.ownerStatus(P, current).kind === 'none') return;
      var g = svgEl('g', { class: 'net-link k-' + kind, 'data-to': lk[1], style: '--i:' + i });
      var d = pathBetween(lk[0], lk[1]);
      g.appendChild(svgEl('path', { d: d, class: 'net-track' }));
      g.appendChild(svgEl('path', { d: d, id: id, class: 'net-line', pathLength: 1 }));
      if (!reduced.matches) {
        if (kind === 'lan' || kind === 'local') {
          g.appendChild(pulse(id, 2.6, -(i * 0.7), false));
          g.appendChild(pulse(id, 2.6, -(i * 0.7) - 1.3, true));
        } else if (kind === 'ghost') {
          g.appendChild(pulse(id, 4.2, -i * 0.5, false));
        }
      }
      frag.appendChild(g);
    });
    svg.innerHTML = '';
    svg.appendChild(frag);
    if (!visible) svg.pauseAnimations && svg.pauseAnimations();
    requestAnimationFrame(function () { svg.classList.add('is-drawn'); });
  }

  /* ---------- Destaque de dispositivo ---------- */
  function highlight(id) {
    stage.classList.toggle('has-focus', !!id);
    Object.keys(nodes).forEach(function (k) { nodes[k].classList.toggle('is-focus', k === id); });
    svg.querySelectorAll('.net-link').forEach(function (g) {
      var on = id && (g.dataset.to === id || id === 'server' || id === 'gestao' && current === 'basico');
      g.classList.toggle('is-focus', !!on);
    });
    legendEl.querySelectorAll('button').forEach(function (b) { b.classList.toggle('is-focus', b.dataset.id === id); });
  }

  /* ---------- Log de sincronização (Pro) ---------- */
  var EVENTS = [
    ['pdv', 'PDV Rápido', 'Venda finalizada · R$ 39,90'],
    ['caixa', 'Caixa', 'Recebimento via Pix confirmado'],
    ['gestao', 'Gestão', 'Estoque atualizado · Cimento −1 UN'],
    ['pdv', 'PDV Rápido', 'Venda finalizada · R$ 12,50'],
    ['caixa', 'Caixa', 'Suprimento registrado']
  ];
  var evIndex = 0;
  var logList = nodes.sync.querySelector('.log-list');
  function pushEvent(animate) {
    var e = EVENTS[evIndex++ % EVENTS.length];
    var li = document.createElement('li');
    li.innerHTML = '<span class="ev-src"></span><span class="ev-msg"></span><span class="ev-ok">' + ICON.check + '</span>';
    li.querySelector('.ev-src').textContent = e[1];
    li.querySelector('.ev-msg').textContent = e[2];
    if (animate) li.className = 'is-new';
    logList.insertBefore(li, logList.firstChild);
    while (logList.children.length > 3) logList.removeChild(logList.lastChild);
    if (animate) {
      [e[0], 'server'].forEach(function (id) {
        var n = nodes[id]; n.classList.remove('is-ping'); void n.offsetWidth; n.classList.add('is-ping');
      });
    }
  }
  for (var i = 0; i < 3; i++) pushEvent(false);
  function runLog() {
    clearInterval(logTimer); logTimer = null;
    if (visible && current === 'pro' && !reduced.matches) logTimer = setInterval(function () { pushEvent(true); }, 2400);
  }

  /* ---------- Troca de plano ---------- */
  function setPlan(id, focusTab) {
    if (id === current) return;
    var first = current === null;
    current = id;
    var layout = C.LAYOUTS[id];
    var plan = C.planById(P, id);

    tabs.forEach(function (t) {
      var on = t.dataset.plan === id;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      if (on && focusTab) t.focus();
    });
    tabsEl.style.setProperty('--ind', PLAN_IDS.indexOf(id));
    document.getElementById('net-panel').setAttribute('aria-labelledby', 'net-tab-' + id);

    info.devices.textContent = plan.deviceLimit.label;
    info.title.textContent = layout.title;
    info.text.textContent = layout.text;
    var owner = C.ownerStatus(P, id);
    info.list.innerHTML = layout.highlights.concat(['App do proprietário: ' + owner.label.toLowerCase()]).map(function (h, i, arr) {
      var muted = i === arr.length - 1 && owner.kind !== 'active';
      return '<li' + (muted ? ' class="is-muted"' : '') + '>' + ICON.check + esc(h) + '</li>';
    }).join('');
    stage.setAttribute('aria-label', layout.a11y);
    section.querySelector('.net-panel').dataset.plan = id;

    Object.keys(nodes).forEach(function (nid) {
      var n = nodes[nid], pos = layout.nodes[nid];
      var appearing = pos && !n.classList.contains('is-on');
      if (pos) {
        /* quem já estava na tela desliza para a nova posição; quem está surgindo nasce no lugar certo */
        if (appearing) n.classList.add('no-move');
        n.style.left = (pos.x / 10) + '%';
        n.style.top = (pos.y / 540 * 100) + '%';
        n.style.width = (pos.w / 10) + '%';
        n.classList.toggle('is-dim', !!pos.dim);
        if (appearing) { void n.offsetWidth; n.classList.remove('no-move'); }
      }
      n.classList.toggle('is-on', !!pos);
      n.setAttribute('aria-hidden', String(!pos));
    });
    nodes.phone.querySelector('[data-owner]').textContent = owner.label;
    nodes.phone.classList.toggle('is-off', owner.kind === 'none');

    legendEl.innerHTML = Object.keys(layout.nodes).filter(function (nid) {
      return ['laptop', 'server', 'phone', 'db', 'ghost'].indexOf(C.DEVICES[nid].type) > -1;
    }).map(function (nid) {
      return '<button type="button" data-id="' + nid + '">' + esc(C.DEVICES[nid].label) + '</button>';
    }).join('');

    svg.classList.remove('is-drawn');
    highlight(null);
    clearTimeout(drawTimer);
    drawTimer = setTimeout(drawLinks, first || reduced.matches ? 30 : MORPH_MS + 120);
    runLog();
  }

  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { setPlan(t.dataset.plan); });
    t.addEventListener('keydown', function (e) {
      var k = e.key, n = null;
      if (k === 'ArrowRight') n = (i + 1) % tabs.length;
      if (k === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
      if (k === 'Home') n = 0;
      if (k === 'End') n = tabs.length - 1;
      if (n !== null) { e.preventDefault(); setPlan(tabs[n].dataset.plan, true); }
    });
  });
  ['mouseover', 'focusin'].forEach(function (ev) {
    legendEl.addEventListener(ev, function (e) { var b = e.target.closest('button'); if (b) highlight(b.dataset.id); });
  });
  ['mouseleave', 'focusout'].forEach(function (ev) {
    legendEl.addEventListener(ev, function () { highlight(null); });
  });
  legendEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    highlight(b.classList.contains('is-focus') && e.detail === 0 ? null : b.dataset.id);
  });

  /* ---------- Desempenho: tudo para fora da tela ---------- */
  function setVisible(v) {
    visible = v;
    section.classList.toggle('is-paused', !v);
    if (svg.pauseAnimations) { if (v && !reduced.matches) svg.unpauseAnimations(); else svg.pauseAnimations(); }
    runLog();
  }
  new IntersectionObserver(function (entries) { setVisible(entries[0].isIntersecting); }, { rootMargin: '120px 0px' }).observe(stage);
  document.addEventListener('visibilitychange', function () { if (document.hidden) setVisible(false); });

  var rTimer = null;
  /* Garantia: ao terminar o deslizamento de um dispositivo, redesenha as ligações na posição final. */
  stage.addEventListener('transitionend', function (e) {
    if (e.target.classList.contains('net-node') && (e.propertyName === 'left' || e.propertyName === 'top' || e.propertyName === 'width')) {
      clearTimeout(rTimer); rTimer = setTimeout(drawLinks, 40);
    }
  });
  window.addEventListener('resize', function () { clearTimeout(rTimer); rTimer = setTimeout(drawLinks, 120); });
  reduced.addEventListener && reduced.addEventListener('change', drawLinks);
  /* As capturas carregam sob demanda: recalcula as ligações quando a altura dos nós muda. */
  stage.querySelectorAll('img').forEach(function (img) { img.addEventListener('load', function () { clearTimeout(rTimer); rTimer = setTimeout(drawLinks, 60); }); });

  setPlan('pro');
})();
