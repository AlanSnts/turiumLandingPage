/* Turium — filme 3: O lucro começa quando você enxerga onde está perdendo (59,5 s).
   Cenas 1–3. Tempos em segundos; render(t) recebe o tempo local da cena.
   Telas reais: Dashboard da base de demonstração (Prumo Materiais, qa-homolog).
   Gráfico 3D: porte do Contribution Skyline do Turium (js/skyline-film.js), com DADOS ILUSTRATIVOS. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, IMG = H.IMG;
  var cap = H.cap, place = H.place, attr = H.attr;

  var ICON = {
    pedido: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
    venda: '<path d="M3 4h2l2.4 10.5h10.8L20.5 7H6.3"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    estoque: '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    pag: '<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M3 10h18M7 15h4"/>',
    compra: '<path d="M5 8h14l-1.2 11H6.2z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
    frete: '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    produto: '<path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5z"/><path d="M8 5.8l8 3.5v4"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    chev: '<path d="M6 9l6 6 6-6"/>'
  };
  function icon(n, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>';
  }
  F.p3 = { icon: icon, ICON: ICON };   // compartilhado com scenes-perdas-b.js

  // semente determinística por índice (sem Math.random: o mesmo quadro em toda reprodução)
  function hash(i, k) { var x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); }

  /* ======================================================================
     1 · O PREJUÍZO INVISÍVEL (0 – 9.4)
     Fragmentos da operação; parte dos valores se dissolve em partículas vermelhas
     (símbolo de desperdício — não é perda calculada pelo sistema).
     ====================================================================== */
  var FRAGS = [
    ['pedido', 'Pedido', 1840, 'brl'], ['pag', 'Pagamento', 612.5, 'brl'], ['estoque', 'Estoque', -12, 'un'],
    ['produto', 'Produto', 0, 'Cimento CP-II'], ['compra', 'Compra', 4300, 'brl'], ['frete', 'Frete', 180, 'brl'],
    ['venda', 'Venda', 2356.9, 'brl'], ['estoque', 'Saída', -40, 'un'], ['pag', 'Pix', 940, 'brl'],
    ['pedido', 'Orçamento', 7120, 'brl'], ['compra', 'Reposição', 1250, 'brl'], ['frete', 'Entrega', 95, 'brl']
  ];
  // posição-base (centro), profundidade 0..1, deriva px/s, entrada
  var FPOS = [
    [300, 210, .55, 14, .10], [760, 150, .35, -10, .25], [1250, 200, .7, 12, .18], [1660, 250, .45, -14, .32],
    [180, 500, .9, 10, .40], [620, 460, .6, -12, .50], [1380, 500, .95, 9, .46], [1760, 540, .5, -9, .58],
    [360, 800, .65, 13, .66], [860, 760, .8, -11, .72], [1320, 830, .4, 12, .80], [1700, 870, .75, -10, .88]
  ];
  var WASTE = [{ k: 5, at: 3.0 }, { k: 10, at: 3.45 }, { k: 4, at: 3.9 }, { k: 11, at: 4.3 }];
  var FW = 330, FH = 92, PC = { x: 960, y: 470 };
  function pushAt(t) { return .2 * E.inOut(F.p(t, 0, 8.8)); }
  // retângulo do fragmento no palco no instante t (deriva + aproximação da câmera com paralaxe)
  function fragRect(k, t) {
    var p = FPOS[k], z = p[2];
    var x = p[0] + p[3] * t, y = p[1] + Math.sin(t * .7 + k) * 6;
    var g = 1 + pushAt(t) * (.6 + z * 1.2);
    var sc = (.78 + z * .32) * g;
    return { cx: PC.x + (x - PC.x) * g, cy: PC.y + (y - PC.y) * g, s: sc };
  }
  function fmtFrag(f, v) {
    if (f[3] === 'brl') return F.brl(v);
    if (f[3] === 'un') return (v < 0 ? '−' : '') + Math.abs(Math.round(v)) + ' UN';
    return f[3];
  }

  // partículas: 4 fragmentos × 90
  var NP = 120, PARTS = [];
  WASTE.forEach(function (wv, wi) {
    for (var j = 0; j < NP; j++) {
      var id = wi * NP + j;
      PARTS.push({
        w: wi, k: wv.k, at: wv.at + .25 + hash(id, 1) * .45,
        u: hash(id, 2), v: hash(id, 3),
        vx: (hash(id, 2) - .5) * 300 + (hash(id, 4) - .5) * 80, vy: -40 - hash(id, 5) * 190,
        sz: 4 + hash(id, 6) * 4.5, ph: hash(id, 7) * 6.28
      });
    }
  });
  // posição de uma partícula no tempo GLOBAL T (vale até 9 s; a cena 2 parte de P(i, 9))
  function P(pt, T) {
    var r = fragRect(pt.k, pt.at);
    var x0 = r.cx + (pt.u - .5) * FW * r.s, y0 = r.cy + (pt.v - .5) * FH * r.s;
    var dt = Math.max(0, T - pt.at), kd = 1.4, m = (1 - Math.exp(-kd * dt)) / kd;
    return [x0 + pt.vx * m + Math.sin(T * .9 + pt.ph) * 8 * F.clamp(dt, 0, 1),
            y0 + pt.vy * m + Math.cos(T * .7 + pt.ph) * 6 * F.clamp(dt, 0, 1)];
  }
  F.p3.P = P; F.p3.PARTS = PARTS;

  F.scene({
    name: 'O prejuízo invisível', start: 0, dur: 9.4,
    build: function (el) {
      var h = '<canvas class="fx" data-r="cv" width="1920" height="1080"></canvas>';
      FRAGS.forEach(function (f, k) {
        h += '<div class="frag" data-r="f' + k + '" style="left:0;top:0;width:' + FW + 'px;height:' + FH + 'px;margin:' + (-FH / 2) + 'px 0 0 ' + (-FW / 2) + 'px">' +
          '<div class="ic">' + icon(f[0]) + '</div><div><small>' + f[1] + '</small><b data-r="v' + k + '">' + fmtFrag(f, f[2]) + '</b></div></div>';
      });
      h += '<div class="q3" style="top:372px"><div class="ln" data-r="q1" style="display:inline-block"><span>ONDE SUA EMPRESA ESTÁ</span></div></div>';
      h += '<div class="q3" style="top:500px"><div class="ln" data-r="q2" style="display:inline-block"><span><span class="red">PERDENDO</span> DINHEIRO?</span></div></div>';
      el.innerHTML = h;
      var c = F.refs(el);
      c.ctx = c.cv.getContext('2d');
      return c;
    },
    render: function (t, c) {
      var ask = F.p(t, 5.0, 5.9);                      // a pergunta assume a tela
      FRAGS.forEach(function (f, k) {
        var p = FPOS[k], el = c['f' + k], r = fragRect(k, t);
        var a = E.out(F.p(t, p[4], p[4] + .7));
        var wst = null;
        WASTE.forEach(function (w) { if (w.k === k) wst = w; });
        var red = 0;
        if (wst) {
          red = F.p(t, wst.at - .5, wst.at);
          a *= 1 - E.inOut(F.p(t, wst.at + .1, wst.at + .75));
          F.css(el, 'borderColor', red > 0 ? 'rgba(229,96,90,' + (.35 + .6 * red).toFixed(3) + ')' : '');
          F.css(c['v' + k], 'color', red > 0 ? 'rgb(' + Math.round(244 - 15 * red) + ',' + Math.round(242 - 146 * red) + ',' + Math.round(238 - 148 * red) + ')' : '');
        }
        var dim = 1 - .8 * ask;
        a *= dim * (1 - F.p(t, 8.4, 9.0));
        // números contam ao entrar (valores de exemplo, não somados)
        if (f[3] === 'brl' || f[3] === 'un') F.txt(c['v' + k], fmtFrag(f, f[2] * E.out3(F.p(t, p[4], p[4] + 1.2))));
        F.tf(el, 'translate3d(' + r.cx.toFixed(1) + 'px,' + r.cy.toFixed(1) + 'px,0) scale(' + r.s.toFixed(4) + ')');
        F.op(el, a);
        F.vis(el, a > .002);
      });

      // partículas vermelhas (até 9 s; depois a cena 2 assume)
      var ctx = c.ctx;
      ctx.clearRect(0, 0, 1920, 1080);
      if (t < 9.0) {
        PARTS.forEach(function (pt) {
          if (t < pt.at) return;
          var q = P(pt, t), life = t - pt.at;
          var al = Math.min(1, life * 6) * (1 - .45 * F.p(life, .8, 2.4));
          var g = F.p(life, 0, 1.8);
          ctx.fillStyle = 'rgba(' + Math.round(229 - 40 * g) + ',' + Math.round(96 - 30 * g) + ',' + Math.round(90 - 30 * g) + ',' + al.toFixed(3) + ')';
          var s = pt.sz * (1 - .3 * g);
          ctx.fillRect(q[0] - s / 2, q[1] - s / 2, s, s);
        });
      }
      F.line(c.q1, t, 5.2, 8.3, .8, .55);
      F.line(c.q2, t, 5.45, 8.35, .8, .55);
    }
  });

  /* ======================================================================
     2 · VISÃO PANORÂMICA DO NEGÓCIO (9.0 – 19.4)
     As partículas se organizam nos blocos do Dashboard real (base de demonstração).
     ====================================================================== */
  var DASH = IMG + 'dashboard-dark.webp';
  var FULL = H.FULL;
  var W2 = { // blocos do Dashboard (px nativos 2560×1032)
    k1: [336, 170, 524, 118], k2: [878, 170, 524, 118], k3: [1420, 170, 524, 118], k4: [1962, 170, 524, 118],
    chart: [336, 314, 794, 360], pay: [1148, 314, 660, 360], top: [1826, 314, 660, 360],
    r1: [336, 734, 524, 104], r2: [878, 734, 524, 104], r3: [1420, 734, 524, 104], r4: [1962, 734, 524, 104],
    metas: [336, 868, 1066, 150], ativ: [1420, 868, 1066, 150]
  };
  var TGT = ['k1', 'k2', 'k3', 'k4', 'chart', 'pay', 'top', 'r1', 'r2', 'r3', 'r4', 'metas', 'ativ'];
  var FIT0 = F.fit(FULL);
  var full = { s: FIT0.s, tx: F.BOX.x + F.BOX.w / 2 - FIT0.cx * FIT0.s, ty: F.BOX.y + F.BOX.h / 2 - FIT0.cy * FIT0.s };
  var CIM = [1880, 552, 590, 40];                      // linha "Cimento CP-II 50 kg" em Mais vendidos
  var CAM2 = [FULL,
    [2.3, 3.3, [1400, 150, 1110, 160]],                // Vendas no mês · Últimos 7 dias
    [3.9, 4.9, [1790, 290, 730, 410]],                 // Mais vendidos no mês
    [5.5, 6.5, [320, 700, 1120, 330]],                 // Lucro bruto (margem) · Metas
    [6.9, 7.9, FULL],
    [8.9, 10.2, [1840, 520, 680, 104], E.inOut]        // aproxima do Cimento CP-II 50 kg (ponte para a cena 3)
  ];
  var TAGS2 = [   // at = ponto nativo; dy = deslocamento vertical no palco
    { ref: 'tg1', k: 'Faturamento', v: 'Vendas no mês', at: [1668, 214], dy: -26, a: 2.9, b: 3.8 },
    { ref: 'tg2', k: 'Vendas realizadas', v: '9 vendas no mês', at: [1430, 292], dy: 0, a: 3.05, b: 3.8 },
    { ref: 'tg3', k: 'Produtos vendidos', v: 'Mais vendidos no mês', at: [2000, 344], dy: -27, a: 4.5, b: 5.3 },
    { ref: 'tg4', k: 'Margem bruta', v: 'quando calculada', at: [610, 752], dy: -10, a: 6.0, b: 6.9 },
    { ref: 'tg5', k: 'Metas', v: 'Metas do mês', at: [720, 884], dy: -27, a: 6.15, b: 6.9 }
  ];
  var NODES = ['k3', 'chart', 'top', 'r1', 'metas', 'pay'];
  function ctr(r) { return [r[0] + r[2] / 2, r[1] + r[3] / 2]; }

  F.scene({
    name: 'Visão panorâmica', start: 9.0, dur: 10.4,
    build: function (el) {
      var h = '<div class="layer" data-r="cam">' + F.shotHTML(DASH, 'shot') + '</div>';
      h += '<div class="spot" data-r="spot"></div>';
      h += '<svg class="fx" data-r="net" viewBox="0 0 1920 1080"></svg>';
      h += '<canvas class="fx" data-r="cv" width="1920" height="1080"></canvas>';
      TAGS2.forEach(function (g) { h += H.tag(g.ref, g.k, g.v); });
      h += '<div class="shade-b" data-r="shade"></div>';
      h += cap('c1', 'SUA EMPRESA. <span class="gold">UMA VISÃO MAIS COMPLETA.</span>', 160, 920, 60);
      el.innerHTML = h;
      var c = F.refs(el);
      c.ctx = c.cv.getContext('2d');
      // linhas e nós da rede (desenhados por traço)
      var s = '';
      for (var i = 0; i < NODES.length - 1; i++) s += '<path data-r="ln' + i + '" fill="none" stroke="#F3B61F" stroke-width="2.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 6px rgba(243,182,31,.7))"/>';
      NODES.forEach(function (n, i) { s += '<rect data-r="nd' + i + '" width="16" height="16" fill="#F3B61F" transform="translate(-100 -100)"/>'; });
      c.net.innerHTML = s;
      Object.assign(c, F.refs(c.net));
      // alvos das partículas (no enquadramento cheio)
      c.tg = F.p3.PARTS.map(function (pt, i) {
        var r = W2[TGT[i % TGT.length]];
        var x = r[0] + 18 + hash(i, 11) * (r[2] - 36), y = r[1] + 14 + hash(i, 12) * (r[3] - 28);
        return [full.tx + x * full.s, full.ty + y * full.s];
      });
      c.st = F.p3.PARTS.map(function (pt) { return F.p3.P(pt, 9.0); });
      return c;
    },
    render: function (t, c) {
      var cam = F.camAt(t, CAM2);
      var m = F.applyCam(c.shot, cam);
      var showImg = E.inOut(F.p(t, 1.1, 2.1));
      F.op(c.shot, showImg * (1 - F.p(t, 9.9, 10.4)));
      // foco na linha do Cimento CP-II 50 kg (ponte para a cena 3)
      var sa = F.inout(t, 8.9, .6, 9.9, .4);
      F.applySpot(c.spot, { r: [m.x(CIM[0]), m.y(CIM[1]), CIM[2] * m.s, CIM[3] * m.s], a: sa }, 1, 12);
      F.vis(c.spot, sa > .002);

      // partículas: do resíduo vermelho aos blocos do Dashboard
      var ctx = c.ctx;
      ctx.clearRect(0, 0, 1920, 1080);
      if (t < 2.6) {
        F.p3.PARTS.forEach(function (pt, i) {
          var d = hash(i, 13) * .45;
          var k = E.inOut(F.p(t, .1 + d, 1.5 + d));
          var a = c.st[i], b = c.tg[i];
          // arco suave: sobe um pouco no meio do caminho
          var x = F.lerp(a[0], b[0], k), y = F.lerp(a[1], b[1], k) - Math.sin(k * Math.PI) * 40;
          var al = (.55 + .45 * k) * (1 - E.inOut(F.p(t, 1.6, 2.5)));
          var r = Math.round(F.lerp(189, 243, k)), g = Math.round(F.lerp(66, 182, k)), bb = Math.round(F.lerp(60, 31, k));
          ctx.fillStyle = 'rgba(' + r + ',' + g + ',' + bb + ',' + al.toFixed(3) + ')';
          var s = F.lerp(pt.sz * .7, 3, k);
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        });
      }

      // etiquetas dos indicadores
      TAGS2.forEach(function (g) {
        var a = F.inout(t, g.a, .45, g.b, .35);
        place(c[g.ref], m.x(g.at[0]), m.y(g.at[1]) + g.dy, a);
        F.vis(c[g.ref], a > .002);
      });

      // rede: cada bloco ligado ao seguinte (só no plano geral)
      var netA = F.inout(t, 7.2, .4, 8.7, .5);
      for (var i = 0; i < NODES.length; i++) {
        var p = ctr(W2[NODES[i]]);
        var X = m.x(p[0]), Y = m.y(p[1]);
        var kn = E.out(F.p(t, 7.3 + i * .14, 7.6 + i * .14)) * netA;
        attr(c['nd' + i], 'transform', 'translate(' + X.toFixed(1) + ' ' + Y.toFixed(1) + ') rotate(45) translate(-8 -8)');
        attr(c['nd' + i], 'opacity', kn.toFixed(3));
        if (i < NODES.length - 1) {
          var q = ctr(W2[NODES[i + 1]]);
          var X2 = m.x(q[0]), Y2 = m.y(q[1]);
          attr(c['ln' + i], 'd', 'M' + X.toFixed(1) + ' ' + Y.toFixed(1) + 'C' + ((X + X2) / 2).toFixed(1) + ' ' + Y.toFixed(1) + ' ' + ((X + X2) / 2).toFixed(1) + ' ' + Y2.toFixed(1) + ' ' + X2.toFixed(1) + ' ' + Y2.toFixed(1));
          attr(c['ln' + i], 'stroke-dashoffset', (1 - E.inOut(F.p(t, 7.35 + i * .16, 7.85 + i * .16))).toFixed(3));
          attr(c['ln' + i], 'opacity', netA.toFixed(3));
        }
      }
      F.op(c.shade, F.inout(t, 6.9, .5, 8.7, .4));
      F.line(c.c1, t, 7.1, 8.7, .75, .45);
    }
  });

  /* ======================================================================
     3 · O GRÁFICO 3D COMO PROTAGONISTA (19.0 – 33.4)
     Painel "Produtos mais vendidos" (Dashboard → Movimentação): produto, período e métrica;
     o mapa de calor vira skyline 3D; picos em dourado; histórico → planejamento de reposição.
     ====================================================================== */
  var S = F.sky.stats;
  var PM = { x: 120, y: 56, w: 1680, h: 840 };
  var FR0 = { x: PM.x + 28, y: PM.y + 246, w: PM.w - 56, h: PM.h - 246 - 26 };   // moldura do gráfico no painel
  var FR1 = { x: 40, y: 30, w: 1840, h: 860 };                                       // moldura cinematográfica
  var BG = [20, 24, 29], FG = [244, 242, 238], GOLD = [243, 182, 31];
  var CURSOR = '<svg class="cursor" data-r="cur" viewBox="0 0 34 40" aria-hidden="true"><path d="M3 2v30l8.5-7.5 5.5 12 5-2.2-5.5-11.8H28z" fill="#F4F2EE" stroke="#090B0E" stroke-width="2" stroke-linejoin="round"/></svg>';
  // pontos do cursor (px do palco) e cliques
  var PT = {
    start: [1560, 760], prod: [1070, 140], item: [1010, 236], d365: [470, 140], qtd: [1330, 140], cube: [1745, 263]
  };
  var CUR = [[0, 'start'], [.6, 1.3, 'prod'], [2.3, 2.75, 'item'], [3.0, 3.5, 'd365'], [3.7, 4.1, 'qtd'], [4.35, 4.8, 'cube']];
  var CLICKS = [1.35, 2.85, 3.55, 4.15, 4.85];
  var TYPED = 'Cimento';
  var bestMonthYM = S.bestMonth.month;
  var PEAK_MONTHS = S.months.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 4).map(function (m) { return m.month; }).sort();
  var MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  function mLabel(ym) { return MES[Number(ym.slice(5)) - 1]; }
  var peakSpan = mLabel(PEAK_MONTHS[0]) + ' a ' + mLabel(PEAK_MONTHS[PEAK_MONTHS.length - 1]) + '/' + PEAK_MONTHS[PEAK_MONTHS.length - 1].slice(0, 4);

  function curAt(t) {
    var cur = PT[CUR[0][1]];
    for (var i = 1; i < CUR.length; i++) {
      var k = CUR[i];
      if (t <= k[0]) break;
      var nx = PT[k[2]], p = E.inOut(F.p(t, k[0], k[1]));
      cur = [F.lerp(cur[0], nx[0], p), F.lerp(cur[1], nx[1], p)];
    }
    return cur;
  }
  // pontos do cursor medidos no próprio painel (px do palco), uma vez
  function measure(c) {
    var st = document.getElementById('stage').getBoundingClientRect();
    var sc = st.width / 1920;
    function at(el, fx, fy) {
      var r = el.getBoundingClientRect();
      return [(r.left - st.left) / sc + (r.width / sc) * (fx === undefined ? .5 : fx), (r.top - st.top) / sc + (r.height / sc) * (fy === undefined ? .5 : fy)];
    }
    var keep = c.pm.style.transform; c.pm.style.transform = 'none';
    var pr = at(c.pin, 0, 1);
    F.css(c.dd, 'left', F.px(pr[0] - PM.x)); F.css(c.dd, 'top', F.px(pr[1] - PM.y + 6));
    PT.prod = at(c.pin, .35, .55); PT.d365 = at(c.d365b, .55, .6); PT.qtd = at(c.mq, .5, .6);
    PT.cube = at(c.g3, .55, .6); PT.item = [pr[0] + 150, pr[1] + 44];
    c.pm.style.transform = keep;
    c.meas = true;
  }
  function lerpRect(a, b, k) { return { x: F.lerp(a.x, b.x, k), y: F.lerp(a.y, b.y, k), w: F.lerp(a.w, b.w, k), h: F.lerp(a.h, b.h, k) }; }

  F.scene({
    name: 'Gráfico 3D', start: 19.0, dur: 14.4,
    build: function (el) {
      var cols = F.sky.levelColors(BG, FG, GOLD);
      var lg = cols.map(function (q) { return '<i style="background:rgb(' + q.map(Math.round).join(',') + ')"></i>'; }).join('');
      var h = '<div class="pm" data-r="pm" style="left:' + PM.x + 'px;top:' + PM.y + 'px;width:' + PM.w + 'px;height:' + PM.h + 'px">' +
        '<div class="filters" data-r="flt">' +
          '<div class="fld"><span>Período</span><div class="seg"><b data-r="d30" class="on">30 dias</b><b>90 dias</b><b data-r="d365b">365 dias</b></div></div>' +
          '<div class="fld" style="width:190px"><span>Mês</span><div class="inp">Todos os meses<span class="chev">' + icon('chev', 2) + '</span></div></div>' +
          '<div class="fld" style="width:180px"><span>Dia da semana</span><div class="inp">Todos os dias<span class="chev">' + icon('chev', 2) + '</span></div></div>' +
          '<div class="fld" style="width:300px;position:relative"><span>Produto</span><div class="inp" data-r="pin"><span class="ph" data-r="ph">Todos — nome, SKU ou código</span><span data-r="typed"></span><i class="caret" data-r="caret"></i></div>' +
            '<div class="inp chipsel" data-r="chip" style="position:absolute;left:0;bottom:0;width:300px;visibility:hidden">Cimento CP-II 50 kg <span class="sku">UN</span></div></div>' +
          '<div class="fld"><span>Métrica</span><div class="seg" data-r="mseg"><b class="on" data-r="mq">Quantidade</b><b>Faturamento</b><b>Número de vendas</b></div></div>' +
        '</div>' +
        '<div class="dd" data-r="dd" style="left:0;top:0"><div class="on"><b>Cimento CP-II 50 kg</b><small>UN</small></div></div>' +
        '<div class="defn" data-r="defn">Quantidade vendida na unidade do produto (só soma unidades iguais). Só vendas finalizadas contam.</div>' +
        '<div class="sk-head" data-r="head"><div class="sk-title" data-r="title"><b>' + S.totalText + '</b> de ' + S.product + ' de ' + S.fromBR + ' a ' + S.toBR + '</div>' +
          '<div class="vtog"><i class="knob" data-r="knob"></i><span data-r="g2">' + '<svg viewBox="0 0 16 16"><rect x="1.5" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor"/><rect x="9" y="1.5" width="5.5" height="5.5" rx="1" fill="currentColor"/><rect x="1.5" y="9" width="5.5" height="5.5" rx="1" fill="currentColor"/><rect x="9" y="9" width="5.5" height="5.5" rx="1" fill="currentColor"/></svg>' +
          '</span><span data-r="g3"><svg viewBox="0 0 16 16"><path d="M8 1.2 14.2 4.6v6.8L8 14.8 1.8 11.4V4.6Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M1.8 4.6 8 8l6.2-3.4M8 8v6.8" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg></span></div></div>' +
        '<div class="sk-frame" data-r="frame"></div>' +
        '<div class="hint" data-r="hint">Arraste para girar · clique duplo para restaurar · clique ou Enter num dia para ver o ranking</div>' +
        '<div class="legend" data-r="legend">Menos ' + lg + ' Mais</div>' +
      '</div>';
      h += '<canvas class="fx" data-r="cv" width="1920" height="1080"></canvas>';
      // indicadores do componente (cantos, em 3D) — como productIndicators()
      h += '<div class="st r" data-r="s0"><div class="l">Produto filtrado</div><div class="v" style="font-size:40px">' + S.product + '</div><div class="s">' + S.totalText + ' no período</div></div>';
      h += '<div class="st r" data-r="s1"><div class="l">Dia de maior quantidade</div><div class="v">' + S.bestDay.br + '</div><div class="s">' + S.bestDay.value + ' ' + S.unit + ' · ' + S.bestDay.weekday + '</div></div>';
      h += '<div class="st" data-r="s2"><div class="l">Mês de maior saída (quantidade)</div><div class="v">' + S.bestMonth.label + '</div><div class="s">' + S.bestMonth.value.toLocaleString('pt-BR') + ' ' + S.unit + '</div></div>';
      h += '<div class="st" data-r="s3"><div class="l">Dia da semana com maior quantidade média</div><div class="v">' + S.bestWeekday.label.charAt(0).toUpperCase() + S.bestWeekday.label.slice(1) + '</div><div class="s">' + F.fmt(S.bestWeekday.average, 1) + ' ' + S.unit + ' em média</div></div>';
      h += '<svg class="fx" data-r="ov" viewBox="0 0 1920 1080"><path data-r="lead" fill="none" stroke="#F3B61F" stroke-width="2.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<circle data-r="ring" r="20" fill="none" stroke="#F3B61F" stroke-width="3" opacity="0"/>';
      for (var i = 0; i < 4; i++) h += '<path data-r="pl' + i + '" fill="none" stroke="#F3B61F" stroke-width="2.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 6px rgba(243,182,31,.6))"/>';
      h += '</svg>';
      h += '<div class="hl" data-r="hl1"><i></i>DIAS DE MAIOR SAÍDA</div>';
      h += '<div class="note3" data-r="hlv" style="color:#D7DBDF;font-size:19px;background:rgba(9,11,14,.85);padding:8px 12px;border-radius:6px">' + S.bestDay.br + ' · ' + S.bestDay.value + ' ' + S.unit + ' · ' + S.bestDay.weekday + '</div>';
      h += '<div class="plan" data-r="plan" style="left:1250px;top:170px"><div class="k">Planejar reposição</div><h4>' + S.product + '</h4>' +
        '<div class="row"><span>Mês de maior saída</span><b>' + S.bestMonth.label + ' · ' + S.bestMonth.value.toLocaleString('pt-BR') + ' ' + S.unit + '</b></div>' +
        '<div class="row"><span>Meses mais fortes</span><b>' + peakSpan + '</b></div>' +
        '<div class="row"><span>Dia de maior saída</span><b>' + S.bestDay.br + ' · ' + S.bestDay.value + ' ' + S.unit + '</b></div>' +
        '<div class="row"><span>Próxima compra</span><b class="gold">decisão do gestor</b></div>' +
        '<div class="ft">Com base no histórico de vendas. Não é previsão automática.</div></div>';
      h += '<div class="illus" data-r="illus">Dados ilustrativos · loja fictícia</div>';
      h += '<div class="click" data-r="clk" style="opacity:0"></div>' + CURSOR;
      h += '<div class="shade-b" data-r="shade"></div>';
      h += cap('c1', 'HISTÓRICO QUE AJUDA A <span class="gold">PLANEJAR A REPOSIÇÃO.</span>', 120, 920, 52);
      h += cap('c2', 'ANTECIPE DECISÕES. <span class="gold">REDUZA IMPROVISOS.</span>', 120, 920, 60);
      el.innerHTML = h;
      var c = F.refs(el);
      c.ctx = c.cv.getContext('2d');
      return c;
    },
    render: function (t, c) {
      if (!c.meas) measure(c);
      // ---- painel entra (vindo da linha do Cimento no Dashboard)
      var pin = E.out(F.p(t, 0, .8));
      var chrome = 1 - E.inOut(F.p(t, 5.6, 6.9));          // o painel se recolhe; o gráfico vira protagonista
      var out = 1 - E.inOut(F.p(t, 13.8, 14.4));
      F.op(c.pm, pin * out);
      F.tf(c.pm, 'translate(' + ((1 - pin) * 40).toFixed(1) + 'px,' + ((1 - pin) * 30).toFixed(1) + 'px) scale(' + (.97 + .03 * pin).toFixed(4) + ')');
      F.css(c.pm, 'background', 'rgba(20,24,29,' + chrome.toFixed(3) + ')');
      F.css(c.pm, 'borderColor', 'rgba(43,49,57,' + chrome.toFixed(3) + ')');
      F.css(c.pm, 'boxShadow', chrome > .01 ? '' : 'none');
      ['flt', 'defn', 'head', 'frame', 'hint', 'legend'].forEach(function (k) { F.op(c[k], chrome); });

      // ---- digitação no filtro de produto
      var nt = Math.floor(F.clamp((t - 1.5) / .1, 0, TYPED.length));
      F.txt(c.typed, TYPED.slice(0, nt));
      F.css(c.ph, 'display', t < 1.45 ? '' : 'none');
      F.vis(c.caret, t >= 1.38 && t < 2.9 && Math.floor(t * 3) % 2 === 0);
      var picked = t >= 2.9;
      F.vis(c.pin, !picked); F.vis(c.chip, picked);
      var dd = F.p(t, 2.2, 2.35) * (1 - F.p(t, 2.9, 3.0));
      F.op(c.dd, dd); F.vis(c.dd, dd > .01);
      // período e métrica
      var on365 = t >= 3.55;
      c.d30.classList.toggle('on', !on365); c.d365b.classList.toggle('on', on365);
      // título só depois do produto
      F.op(c.title, E.out(F.p(t, 2.95, 3.4)));

      // ---- cursor e cliques
      var cp = curAt(t), ca = E.out(F.p(t, .5, .8)) * (1 - F.p(t, 5.2, 5.7));
      F.tf(c.cur, 'translate3d(' + cp[0].toFixed(1) + 'px,' + cp[1].toFixed(1) + 'px,0)');
      F.op(c.cur, ca);
      var ck = -1; CLICKS.forEach(function (x) { if (t >= x && t < x + .45) ck = x; });
      if (ck >= 0) {
        var kp = F.p(t, ck, ck + .45);
        F.css(c.clk, 'left', F.px(cp[0] + 4)); F.css(c.clk, 'top', F.px(cp[1] + 4));
        F.tf(c.clk, 'scale(' + (.4 + kp * 1.1).toFixed(3) + ')'); F.op(c.clk, (1 - kp) * ca);
      } else F.op(c.clk, 0);

      // ---- alternância 2D → 3D (mesma variável t do motor: 0 → 1)
      var sk = E.lin(F.p(t, 4.9, 7.3));
      F.tf(c.knob, 'translateX(' + (sk > 0 ? 44 : 0) + 'px)');
      F.css(c.g2, 'color', sk > 0 ? '#858E98' : '#090B0E');
      F.css(c.g3, 'color', sk > 0 ? '#090B0E' : '#858E98');
      var fr = lerpRect(FR0, FR1, E.inOut(F.p(t, 5.6, 7.0)));

      // ---- câmera cinematográfica: percorre o calendário até os picos, depois abre para o plano
      var bw = F.sky.cells[F.sky.bestIdx].week;
      var travel = E.inOut(F.p(t, 7.3, 10.2));
      var back = E.inOut(F.p(t, 10.6, 12.0));
      var zoom = 1 + .36 * travel - .26 * back;
      var yaw = -.16 * Math.sin(Math.PI * F.p(t, 6.8, 10.6)) + .06 * back;
      var focus = [F.lerp(F.sky.weeks / 2, bw + .5, travel), 3.5, F.lerp(0, 1.2, travel * (1 - back))];
      var pull = .45 * travel * (1 - back);
      if (back > 0) {        // abre espaço à direita para o planejamento
        focus = [F.lerp(bw + .5, F.sky.weeks * .62, back), 3.5, 0];
        pull = F.lerp(.45 * travel, 1, back);
      }
      var shiftX = -260 * back;
      var hi = E.inOut(F.p(t, 8.0, 8.9)) * (1 - .35 * back);
      var vis = E.out(F.p(t, 3.4, 4.0));

      var ctx = c.ctx;
      ctx.clearRect(0, 0, 1920, 1080);
      F.sky.draw(ctx, {
        x: fr.x + shiftX, y: fr.y + 110 * travel * (1 - back), w: fr.w, h: fr.h, t: sk, font: 17,
        yaw: yaw, elev: -.04 * travel, zoom: zoom, focus: focus, pull: pull,
        hi: hi, alpha: vis * out, bg: BG, fg: FG, accent: GOLD, labels: 1
      });

      // indicadores nos cantos (como o componente em 3D)
      var stA = F.inout(t, 6.4, .6, 7.6, .45);
      place(c.s0, 1800 - 520, 120, stA); F.css(c.s0, 'width', '520px');
      place(c.s1, 1800 - 520, 250, stA); F.css(c.s1, 'width', '520px');
      place(c.s2, 120, 700, stA);
      place(c.s3, 120, 820, stA);

      // ---- destaque: dias de maior saída
      var top = F.sky.topOf(F.sky.bestIdx);
      var hA = F.inout(t, 8.6, .5, 10.5, .4);
      var lx = top[0] - 30, ly = top[1] - 200;
      place(c.hl1, lx - 330, ly - 54, hA);
      place(c.hlv, lx - 330, ly + 8, hA);
      attr(c.lead, 'd', 'M' + (lx - 4).toFixed(1) + ' ' + (ly - 18).toFixed(1) + 'L' + top[0].toFixed(1) + ' ' + (top[1] - 22).toFixed(1));
      attr(c.lead, 'stroke-dashoffset', (1 - E.inOut(F.p(t, 8.8, 9.3))).toFixed(3));
      attr(c.lead, 'opacity', hA.toFixed(3));
      attr(c.ring, 'cx', top[0].toFixed(1)); attr(c.ring, 'cy', top[1].toFixed(1));
      attr(c.ring, 'opacity', (hA * (.6 + .4 * Math.sin(t * 5))).toFixed(3));

      // ---- histórico → planejamento (decisão do gestor, não previsão)
      var plA = F.inout(t, 11.4, .6, 13.7, .5);
      place(c.plan, 1250, 170, plA);
      PEAK_MONTHS.forEach(function (ym, i) {
        var a = F.sky.monthAnchor(ym);
        var bx = 1250, by = 300 + i * 70;
        attr(c['pl' + i], 'd', 'M' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + 'C' + ((a[0] + bx) / 2).toFixed(1) + ' ' + a[1].toFixed(1) + ' ' + ((a[0] + bx) / 2).toFixed(1) + ' ' + by + ' ' + bx + ' ' + by);
        attr(c['pl' + i], 'stroke-dashoffset', (1 - E.inOut(F.p(t, 11.0 + i * .12, 11.8 + i * .12))).toFixed(3));
        attr(c['pl' + i], 'opacity', (F.inout(t, 11.0, .3, 13.7, .5) * .9).toFixed(3));
      });

      F.op(c.illus, E.out(F.p(t, 3.5, 4.0)) * out);
      F.op(c.shade, F.inout(t, 10.0, .5, 13.8, .5));
      F.line(c.c1, t, 10.2, 12.0, .7, .45);
      F.line(c.c2, t, 12.3, 13.9, .75, .45);
    }
  });
})();
