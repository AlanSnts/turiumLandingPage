/* Turium — as 12 cenas do filme.
   Uma venda real da base de demonstração (Prumo Materiais, 08/10/2026):
   18 m² → 8 CX → PED-000011 → estoque → VEN-000011 no cartão → bruto, taxa, líquido → fluxo de caixa.
   Tempos em segundos. Cada render(t) recebe o tempo local da cena. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, IMG = 'assets/film/';
  var FULL = [0, 0, 2560, 1032];
  var CX = F.BOX.x + F.BOX.w / 2, CY = F.BOX.y + F.BOX.h / 2;   // 960, 491

  /* ---------- auxiliares ---------- */
  function attr(el, k, v) { var c = el.__a || (el.__a = {}); if (c[k] !== v) { el.setAttribute(k, v); c[k] = v; } }
  function cap(ref, text, x, y, size) {
    return '<div class="cap" style="left:' + (x || 160) + 'px;top:' + (y || 912) + 'px' + (size ? ';font-size:' + size + 'px' : '') + '">' +
      '<div class="ln" data-r="' + ref + '"><span>' + text + '</span></div></div>';
  }
  function tag(ref, k, v) {
    return '<div class="tag" data-r="' + ref + '"><span class="mono">' + k + '</span><span>' + v + '</span></div>';
  }
  // posiciona uma etiqueta no palco (ancorada pelo topo-esquerdo ou pelo centro)
  function place(el, x, y, a, center) {
    F.css(el, 'left', F.px(x));
    F.css(el, 'top', F.px(y));
    F.op(el, a);
    F.tf(el, (center ? 'translateX(-50%) ' : '') + 'translateY(' + ((1 - a) * 10).toFixed(1) + 'px)');
    F.vis(el, a > .001);
  }
  function box(el, x, y, w, h) {
    F.css(el, 'left', F.px(x)); F.css(el, 'top', F.px(y));
    F.css(el, 'width', F.px(w)); F.css(el, 'height', F.px(h));
  }
  // recorte de um retângulo do palco (x, y, w, h) — o resto fica invisível
  function insetRect(el, x, y, w, h, r) {
    F.clip(el, 'inset(' + F.px(y) + ' ' + F.px(1920 - x - w) + ' ' + F.px(1080 - y - h) + ' ' + F.px(x) + (r ? ' round ' + r + 'px' : '') + ')');
  }

  /* logo do Turium desenhado traço a traço */
  var LETTERS = [
    ['translate(7 0)', 'M0 7H95M47.5 7V100'], ['translate(177 0)', 'M7 0V55A38 38 0 0 0 83 55V0'],
    ['translate(342 0)', 'M0 7H31A23 23 0 0 1 31 53H6L51 93'], ['translate(478 0)', 'M7 0V100'],
    ['translate(567 0)', 'M7 0V55A38 38 0 0 0 83 55V0'], ['translate(732 0)', 'M7 100V0L59 68L111 0V100']
  ];
  function logoSVG(p) {
    var s = '<svg viewBox="0 0 1052 176" width="100%" aria-hidden="true" style="overflow:visible">' +
      '<rect data-r="' + p + 'sq" x="0" y="0" width="43" height="43" fill="#F3B61F" style="transform-box:fill-box;transform-origin:50% 50%"/>' +
      '<rect data-r="' + p + 'bar" x="66" y="0" width="39" height="176" fill="#F4F2EE" style="transform-box:fill-box;transform-origin:50% 100%"/>' +
      '<g transform="translate(195 41)" fill="none" stroke="#F4F2EE" stroke-width="14">';
    LETTERS.forEach(function (l, i) {
      s += '<path data-r="' + p + 'L' + i + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" transform="' + l[0] + '" d="' + l[1] + '"/>';
    });
    return s + '</g></svg>';
  }
  function drawLogo(c, p, t, a) {
    var kb = E.out(F.p(t, a, a + .7));
    F.tf(c[p + 'bar'], 'scaleY(' + kb.toFixed(3) + ')');
    var ks = E.out(F.p(t, a + .55, a + .95));
    F.op(c[p + 'sq'], ks);
    F.tf(c[p + 'sq'], 'scale(' + (.4 + .6 * ks).toFixed(3) + ')');
    for (var i = 0; i < 6; i++) {
      var k = E.out3(F.p(t, a + .25 + i * .09, a + .95 + i * .09));
      attr(c[p + 'L' + i], 'stroke-dashoffset', (1 - k).toFixed(3));
    }
  }

  /* ======================================================================
     1 · ABERTURA (0 – 5)
     ====================================================================== */
  F.scene({
    name: 'Abertura', start: 0, dur: 5,
    build: function (el) {
      el.innerHTML =
        '<div class="fill" data-r="cover" style="background:#090B0E"></div>' +
        '<div class="vline" data-r="pip" style="left:958.5px;top:584px;height:32px"></div>' +
        '<div class="hline" data-r="line" style="top:598.5px"></div>' +
        '<div class="tick" data-r="tl" style="top:600px"></div><div class="tick" data-r="tr" style="top:600px"></div>' +
        '<div class="layer" style="left:640px;top:420px;width:640px;height:160px;overflow:hidden">' +
          '<div class="logo" data-r="logo" style="position:absolute;left:0;bottom:12px;width:640px">' + logoSVG('a') + '</div></div>' +
        '<div class="layer mono" data-r="sub" style="left:0;top:640px;width:1920px;text-align:center;font-size:22px;color:#AAB1B9">ERP para lojas de materiais de construção</div>';
      return F.refs(el);
    },
    render: function (t, c) {
      // pino central pisca, a cota se abre para os lados
      F.op(c.pip, F.p(t, .2, .35) * (1 - F.p(t, .7, .9)));
      var w = F.tw(t, .5, 1.6, 0, 1200, E.inOut);
      var ext = F.tw(t, 4.1, 4.9, 0, 1, E.inOut);              // no fim a linha toma a largura toda
      var L = 960 - w / 2 - ext * 360, W = w + ext * 720;
      F.css(c.line, 'left', F.px(L)); F.css(c.line, 'width', F.px(W));
      var kt = F.p(t, 1.5, 1.7) * (1 - F.p(t, 4.1, 4.4));
      F.op(c.tl, kt); F.op(c.tr, kt);
      F.css(c.tl, 'left', F.px(360)); F.css(c.tr, 'left', F.px(1557));
      // logo sobe de dentro da linha e volta para ela
      var up = t < 4 ? F.tw(t, 1.3, 2.2, 1, 0, E.out) : F.tw(t, 4, 4.6, 0, 1, E.inOut);
      F.tf(c.logo, 'translateY(' + (up * 150).toFixed(1) + 'px)');
      drawLogo(c, 'a', t, 1.4);
      var ks = F.inout(t, 2.3, .8, 3.9, .4);
      F.op(c.sub, ks);
      F.css(c.sub, 'letterSpacing', (.16 + (1 - F.p(t, 2.3, 3.1)) * .14).toFixed(3) + 'em');
      // o grid aparece por trás no fim
      F.op(c.cover, 1 - F.p(t, 4.2, 5));
    }
  });

  /* ======================================================================
     2 · A LOJA INTEIRA (5 – 10.5)
     ====================================================================== */
  // posição dos 4 cards do Dashboard no enquadramento inicial da cena 3
  var full = F.fit(FULL), FS = full.s;
  var FTX = CX - full.cx * FS, FTY = CY - full.cy * FS;
  var CARDS = [[336, 171, 523, 116], [877, 171, 525, 116], [1419, 171, 525, 116], [1961, 171, 524, 116]].map(function (r) {
    return [FTX + r[0] * FS, FTY + r[1] * FS, r[2] * FS, r[3] * FS];
  });
  var SCAT = [[250, 230], [1330, 180], [430, 610], [1250, 590]];
  var WORDS = ['Balcão', 'Estoque', 'Caixa', 'Financeiro'];

  F.scene({
    name: 'A loja inteira', start: 5, dur: 5.5,
    build: function (el) {
      var h = '<div class="hline" data-r="line" style="left:0;width:1920px;top:598.5px"></div>' +
        '<svg class="layer" width="1920" height="1080" style="overflow:visible" aria-hidden="true">';
      var order = [0, 1, 3, 2, 0];
      for (var i = 0; i < 4; i++) {
        h += '<path data-r="k' + i + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="#F3B61F" stroke-width="2" stroke-opacity=".7"/>';
      }
      h += '</svg>';
      for (var j = 0; j < 4; j++) {
        h += '<div class="tbox" data-r="b' + j + '"><span class="idx" data-r="i' + j + '">0' + (j + 1) + '</span><span class="lbl" data-r="l' + j + '">' + WORDS[j] + '</span></div>';
      }
      h += cap('c1', 'Toda a sua loja.', 160, 890, 80) + cap('c2', 'Uma única operação.', 160, 890, 80);
      el.innerHTML = h;
      var c = F.refs(el);
      c.order = order;
      return c;
    },
    render: function (t, c) {
      F.op(c.line, 1 - F.p(t, .2, 1));
      var rects = [];
      for (var i = 0; i < 4; i++) {
        var a = E.out(F.p(t, .3 + i * .18, .9 + i * .18));
        var g = F.tw(t, 2.6 + i * .06, 3.8 + i * .06, 0, 1, E.inOut);      // alinham em fileira
        var m = F.tw(t, 4.3, 5.3, 0, 1, E.inOut);                           // viram os cards
        var cr = CARDS[i];
        var x = F.lerp(F.lerp(SCAT[i][0], cr[0], g), cr[0], m);
        var y = F.lerp(F.lerp(SCAT[i][1], cr[1] - 40, g), cr[1], m);
        var w = F.lerp(F.lerp(340, cr[2], g), cr[2], m);
        var hh = F.lerp(150, cr[3], m);
        box(c['b' + i], x, y, w, hh);
        var sc = .94 + .06 * a;
        F.tf(c['b' + i], 'scale(' + sc.toFixed(3) + ')');
        F.op(c['b' + i], a * (1 - F.p(t, 4.9, 5.5)));
        F.op(c['l' + i], 1 - F.p(t, 4.3, 4.8));
        F.op(c['i' + i], 1 - F.p(t, 4.3, 4.8));
        F.css(c['b' + i], 'background', 'rgba(243,182,31,' + (.07 * (1 - m)).toFixed(3) + ')');
        rects.push([x + w / 2, y + hh / 2]);
      }
      // cotas ligando as quatro áreas (somem quando elas se alinham)
      for (var k = 0; k < 4; k++) {
        var p0 = rects[c.order[k]], p1 = rects[c.order[k + 1]];
        attr(c['k' + k], 'd', 'M' + p0[0].toFixed(1) + ' ' + p0[1].toFixed(1) + 'L' + p1[0].toFixed(1) + ' ' + p1[1].toFixed(1));
        var kd = E.inOut(F.p(t, 1.3 + k * .22, 1.9 + k * .22));
        attr(c['k' + k], 'stroke-dashoffset', (1 - kd).toFixed(3));
        attr(c['k' + k], 'stroke-opacity', (.7 * (1 - F.p(t, 2.6, 3.2))).toFixed(3));
      }
      F.line(c.c1, t, .7, 2.5);
      F.line(c.c2, t, 2.9, 4.6);
    }
  });

  /* ======================================================================
     3 · DASHBOARD (10 – 20)
     ====================================================================== */
  var D = {
    card1: [336, 171, 523, 116], donut: [1166, 392, 610, 260], row1: [1840, 362, 645, 50]
  };
  F.scene({
    name: 'Dashboard', start: 10, dur: 10,
    build: function (el) {
      el.innerHTML =
        '<div class="fill" style="perspective:2400px"><div class="fill" data-r="tilt" style="transform-origin:50% 40%">' +
        F.shotHTML(IMG + 'dashboard-dark.webp', 'shot', '<div class="spot" data-r="spot"></div>') + '</div></div>' +
        '<div class="shade-b"></div>' +
        tag('t1', 'Vendas hoje', 'R$ 3.056,46 · 2 vendas') +
        tag('t2', 'Formas de pagamento', 'Pix, cartão e dinheiro') +
        tag('t3', 'Mais vendido no mês', 'Porcelanato 60x60 · 32 CX') +
        '<div class="layer" data-r="pname" style="left:0;width:1920px;top:452px;text-align:center;font:700 64px/1.2 var(--font-display);letter-spacing:-0.03em">Porcelanato Acetinado 60x60 cm</div>' +
        cap('c1', 'Toda a loja em uma tela.');
      return F.refs(el);
    },
    keys: [FULL,
      [2.0, 3.2, [300, 120, 1180, 360]],
      [4.4, 5.6, [1120, 300, 720, 390]],
      [6.6, 7.8, [1810, 300, 700, 390]],
      [8.6, 10, [1932, 366, 336, 24], E.in]],
    render: function (t, c) {
      var cam = F.camAt(t, this.keys);
      var m = F.applyCam(c.shot, cam);
      F.op(c.shot, F.p(t, 0, .6) * (1 - F.p(t, 9.3, 9.9)));
      F.tf(c.tilt, 'rotateX(' + F.tw(t, 0, 1.6, 7, 0, E.out).toFixed(2) + 'deg) translateZ(0)');
      var sp = F.spotAt(t, [[D.card1, 0], [2.4, 3.2, D.card1, 1], [4.4, 5.4, D.donut, 1], [6.6, 7.6, D.row1, 1], [8.6, 9.2, D.row1, 0]]);
      F.applySpot(c.spot, sp, cam.s, 12);
      place(c.t1, m.x(D.card1[0]), m.y(D.card1[1] + D.card1[3]) + 30, F.inout(t, 3.1, .4, 4.3, .3));
      place(c.t2, m.x(D.donut[0]), m.y(D.donut[1] + D.donut[3]) + 30, F.inout(t, 5.5, .4, 6.5, .3));
      place(c.t3, m.x(D.row1[0]), m.y(D.row1[1] + D.row1[3]) + 30, F.inout(t, 7.7, .4, 8.6, .3));
      F.line(c.c1, t, .9, 2.1);
      F.op(c.pname, F.p(t, 9.1, 9.6));
      F.vis(c.pname, t > 9.05);
    }
  });

  /* ======================================================================
     4 · MEDIDA CERTA (19.6 – 32.2)
     18 m² · 2,52 m²/CX · 7,14 → 8 CX · 20,16 m² · sobra 2,16 m²
     ====================================================================== */
  var X0 = 160, UNIT = 1600 / 20.16, X18 = X0 + 18 * UNIT, XE = X0 + 1600;
  var WIN = { x: 360, y: 470, w: 1200, h: 400 };   // janela do clipe V2 (1392×464 nativos)
  var MONO = 'font-family:var(--font-mono);letter-spacing:.12em;text-transform:uppercase;';

  F.scene({
    name: 'Medida certa', start: 19.6, dur: 12.6,
    build: function (el) {
      var h = '<div class="layer" data-r="title" style="left:0;top:452px;width:1920px;text-align:center;font:700 64px/1.2 var(--font-display);letter-spacing:-0.03em">' +
        '<span data-r="titleS" style="display:inline-block;transform-origin:0 0">Porcelanato Acetinado 60x60 cm</span></div>' +
        '<div class="fill" data-r="draw" style="transform-origin:960px 100px">';
      var RO = [
        ['r1', 160, 'Cliente pediu', '18<small>m²</small><span data-r="q" class="gold">?</span>', 'área da obra'],
        ['r2', 600, 'Embalagem', '2,52<small>m² / CX</small>', 'Porcelanato Acetinado 60x60'],
        ['r3', 1040, 'A fornecer', '<span class="ln" data-r="v3a" style="position:absolute;left:0;top:0"><span class="muted">7,14<small>CX</small></span></span><span class="ln" data-r="v3b"><span>8<small>CX</small></span></span>', '7,14 caixas → arredonda para cima'],
        ['r4', 1440, 'Sobra estimada', '<span class="gold">2,16</span><small>m²</small>', '20,16 m² fornecidos']
      ];
      RO.forEach(function (r) {
        h += '<div class="readout" data-r="' + r[0] + '" style="left:' + r[1] + 'px;top:190px;width:380px">' +
          '<div class="bar"><i data-r="' + r[0] + 'b"></i></div><div class="k" data-r="' + r[0] + 'k">' + r[2] + '</div>' +
          '<div class="v" data-r="' + r[0] + 'v" style="position:relative;transform-origin:0 0">' + r[3] + '</div>' +
          '<div data-r="' + r[0] + 'n" style="margin-top:14px;font:400 19px/1.3 var(--font-body);color:#858E98">' + r[4] + '</div></div>';
      });
      h += '<div class="hline" data-r="top" style="left:' + X0 + 'px;top:540px;width:' + (X18 - X0).toFixed(2) + 'px"></div>' +
        '<div class="tick" data-r="ta" style="left:' + (X0 - 1.5) + 'px;top:541px"></div>' +
        '<div class="tick" data-r="tb" style="left:' + (X18 - 1.5).toFixed(2) + 'px;top:541px"></div>' +
        '<div class="layer" data-r="lt" style="left:' + ((X0 + X18) / 2).toFixed(1) + 'px;top:500px;transform:translateX(-50%);font-size:20px;color:#F3B61F;' + MONO + '">18 m² solicitados</div>';
      for (var i = 0; i < 8; i++) {
        h += '<div class="box" data-r="x' + i + '" style="left:' + (X0 + i * 200 + 4) + 'px;top:590px;width:192px;height:120px"><b>CX ' + (i + 1) + '</b></div>';
      }
      h += '<div class="hatch" data-r="hatch" style="left:' + X18.toFixed(2) + 'px;top:590px;width:' + (XE - X18 - 4).toFixed(2) + 'px;height:120px"></div>' +
        '<div class="dash-v" data-r="d18" style="left:' + (X18 - 1.5).toFixed(2) + 'px;top:520px;height:250px"></div>' +
        '<div class="layer" data-r="lsobra" style="left:' + ((X18 + XE) / 2).toFixed(1) + 'px;top:500px;transform:translateX(-50%);font-size:20px;color:#F3B61F;' + MONO + '">sobra 2,16 m²</div>' +
        '<div class="hline" data-r="bot" style="left:' + X0 + 'px;top:760px;width:1600px;background:#858E98"></div>' +
        '<div class="tick" data-r="tc" style="left:' + (X0 - 1.5) + 'px;top:761px;background:#858E98"></div>' +
        '<div class="tick" data-r="td" style="left:' + (XE - 1.5) + 'px;top:761px;background:#858E98"></div>' +
        '<div class="layer" data-r="lb" style="left:960px;top:782px;transform:translateX(-50%);font-size:20px;color:#AAB1B9;' + MONO + '">8 CX × 2,52 m² = 20,16 m²</div>' +
        '</div>';
      // a tela real entra por baixo do desenho
      h += '<div class="clipwin" data-r="win" style="left:' + WIN.x + 'px;top:' + WIN.y + 'px;width:' + WIN.w + 'px;height:' + WIN.h + 'px">' +
        '<video data-r="vid" muted playsinline preload="auto"><source src="' + IMG + 'v2-calculo.webm" type="video/webm"><source src="' + IMG + 'v2-calculo.mp4" type="video/mp4"></video>' +
        '<div class="ring" data-r="ring" style="left:' + (24 * WIN.w / 1392 - 6).toFixed(1) + 'px;top:' + (304 * WIN.h / 464 - 6).toFixed(1) + 'px;width:' + (141 * WIN.w / 1392 + 12).toFixed(1) + 'px;height:' + (35 * WIN.h / 464 + 12).toFixed(1) + 'px"></div></div>' +
        '<div class="layer" data-r="wlbl" style="left:1760px;top:936px;transform:translateX(-100%);white-space:nowrap;font-size:17px;color:#858E98;' + MONO + '">Tela real · calculadora de m² · base de demonstração</div>' +
        '<div class="hline" data-r="exit"></div>' +
        cap('c1', '8 caixas.') + cap('c2', 'Sem conta de cabeça.');
      el.innerHTML = h;
      var c = F.refs(el);
      F.addClip(c.vid, this.start + 8.8, 2.5);
      return c;
    },
    render: function (t, c) {
      // título do produto: do centro (fim do Dashboard) para o canto
      if (!c.tw) c.tw = c.titleS.offsetWidth || 980;
      var k = E.inOut(F.p(t, .3, 1.2));
      var x0 = (1920 - c.tw) / 2;
      F.tf(c.titleS, 'translate(' + ((160 - x0) * k).toFixed(1) + 'px,' + ((104 - 452) * k).toFixed(1) + 'px) scale(' + (1 - .62 * k).toFixed(3) + ')');
      F.op(c.title, (1 - .25 * k) * (1 - F.p(t, 11.2, 11.7)));

      // 18 m²? grande, depois vira a primeira leitura
      var big = 1 - E.inOut(F.p(t, 2.3, 3.1));
      var rise = 1 - E.out(F.p(t, .7, 1.4));
      F.tf(c.r1v, 'translate(0,' + (70 * big + 40 * rise).toFixed(1) + 'px) scale(' + (1 + 1.6 * big).toFixed(3) + ')');
      F.op(c.r1v, F.p(t, .7, 1.2));
      F.op(c.q, 1 - F.p(t, 2.1, 2.5));
      F.op(c.r1k, F.p(t, 2.9, 3.3)); F.op(c.r1n, F.p(t, 3.0, 3.4));
      F.tf(c.r1b, 'scaleX(' + E.out(F.p(t, 2.9, 3.6)).toFixed(3) + ')');
      // leituras 2, 3 e 4
      [['r2', 3.0], ['r3', 4.5], ['r4', 6.9]].forEach(function (r) {
        var a = E.out(F.p(t, r[1], r[1] + .6));
        F.op(c[r[0]], a);
        F.tf(c[r[0]], 'translateY(' + ((1 - a) * 18).toFixed(1) + 'px)');
        F.tf(c[r[0] + 'b'], 'scaleX(' + E.out(F.p(t, r[1] + .2, r[1] + .9)).toFixed(3) + ')');
      });
      F.line(c.v3a, t, 4.5, 5.3, .5, .35);
      F.line(c.v3b, t, 5.45, 99, .55);
      // cota de cima: os 18 m²
      F.tf(c.top, 'scaleX(' + E.inOut(F.p(t, 1.6, 2.6)).toFixed(4) + ')');
      F.op(c.ta, F.p(t, 1.55, 1.7)); F.op(c.tb, F.p(t, 2.5, 2.65));
      F.op(c.lt, F.p(t, 2.4, 2.9));
      // as caixas assentam
      for (var i = 0; i < 8; i++) {
        var b = E.out(F.p(t, 3.6 + i * .14, 4.15 + i * .14));
        F.op(c['x' + i], b);
        F.tf(c['x' + i], 'translateY(' + ((1 - b) * -70).toFixed(1) + 'px)');
      }
      F.tf(c.d18, 'scaleY(' + E.inOut(F.p(t, 4.9, 5.4)).toFixed(3) + ')');
      // cota de baixo: 8 CX = 20,16 m²
      F.tf(c.bot, 'scaleX(' + E.inOut(F.p(t, 5.8, 6.8)).toFixed(4) + ')');
      F.op(c.tc, F.p(t, 5.75, 5.9)); F.op(c.td, F.p(t, 6.7, 6.85));
      F.op(c.lb, F.p(t, 6.5, 7) * (1 - F.p(t, 8.2, 8.6)));
      // a sobra ganha hachura
      F.op(c.hatch, F.p(t, 6.8, 7.3));
      var pulse = Math.sin(Math.PI * F.p(t, 7.3, 8.3));
      F.css(c.hatch, 'boxShadow', '0 0 ' + (40 * pulse).toFixed(1) + 'px rgba(243,182,31,' + (.55 * pulse).toFixed(3) + ')');
      F.op(c.lsobra, F.p(t, 7.0, 7.4));
      // a câmera abre: o desenho sobe e a tela real entra
      var o = E.inOut(F.p(t, 8.3, 9.3));
      F.tf(c.draw, 'translateY(' + (-6 * o).toFixed(1) + 'px) scale(' + (1 - .45 * o).toFixed(4) + ')');
      F.op(c.draw, 1 - F.p(t, 11.2, 11.6));
      var wv = E.out(F.p(t, 8.6, 9.4)) * (1 - E.inOut(F.p(t, 11.2, 11.6)));
      var ins = (WIN.h / 2 * (1 - wv)).toFixed(1);
      F.clip(c.win, 'inset(' + ins + 'px 0px ' + ins + 'px 0px round 18px)');
      F.vis(c.win, wv > .002);
      F.op(c.wlbl, F.inout(t, 9.2, .4, 11.0, .3));
      var rp = F.p(t, 10.7, 11.3);
      F.op(c.ring, Math.sin(Math.PI * rp));
      // o que sobra da janela vira a linha que abre o pedido
      var e1 = F.p(t, 11.45, 11.6), e2 = E.inOut(F.p(t, 11.6, 12.2));
      F.op(c.exit, e1 * (1 - F.p(t, 12.25, 12.5)));
      F.css(c.exit, 'top', F.px(F.lerp(WIN.y + WIN.h / 2 - 1.5, CY - 1.5, e2)));
      F.css(c.exit, 'left', F.px(F.lerp(WIN.x, F.BOX.x, e2)));
      F.css(c.exit, 'width', F.px(F.lerp(WIN.w, F.BOX.w, e2)));
      F.line(c.c1, t, 5.5, 7.6);
      F.line(c.c2, t, 7.9, 11.0);
    }
  });

  F.h = { attr: attr, cap: cap, tag: tag, place: place, box: box, insetRect: insetRect, logoSVG: logoSVG, drawLogo: drawLogo, FULL: FULL, CX: CX, CY: CY, IMG: IMG, MONO: MONO };
})();
