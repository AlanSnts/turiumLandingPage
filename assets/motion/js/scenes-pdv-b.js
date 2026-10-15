/* Turium — filme 4: PDV Rápido. Cenas 4–6, guia de locução e marca de prévia. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, attr = H.attr, place = H.place, P = F.p4;
  var slotHTML = P.slotHTML, slotAt = P.slotAt, slotFull = P.slotFull, BOX = P.BOX, SW = P.SW, SH = P.SH, icon = P.icon;

  /* ======================================================================
     4 · DO VENDEDOR AO CAIXA (30 – 41)
     C07 → F8 → C08 → C09; o pedido vira um cartão que corre pela linha dourada até a fila
     "Aguardando caixa" (C10) e o caixa conclui (C11 → C12).
     ====================================================================== */
  var HALF = 780, LX = 120, RX = 1020, HY = 300;            // telas lado a lado
  F.scene({
    name: 'Do vendedor ao caixa', start: 30.0, dur: 11.0,
    build: function (el) {
      var h = slotHTML('v7', 'C07') + slotHTML('v8', 'C08') + slotHTML('v9', 'C09') +
        slotHTML('k10', 'C10') + slotHTML('k11', 'C11') + slotHTML('k12', 'C12');
      h += '<svg class="fx" viewBox="0 0 1920 1080"><path data-r="ln" d="M510 470 Q 960 170 1410 470" fill="none" stroke="#F3B61F" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 10px rgba(243,182,31,.8))"/></svg>';
      h += '<div class="who" data-r="wv"><i></i>Pedro · Vendedor</div><div class="who" data-r="wc"><i></i>André · Caixa</div>';
      h += '<div class="key on" data-r="f8">F8</div>';
      h += '<div class="note4" data-r="nf8">Enviar ao caixa (F8)</div>';
      h += '<div class="order" data-r="card"><div class="k">Pedido do balcão</div><h5>Aguardando caixa</h5><p>Itens e total da captura real</p><div class="bars"><i style="width:92%"></i><i style="width:74%"></i><i style="width:83%"></i><i style="width:58%"></i></div></div>';
      h += '<div class="cap" style="left:160px;top:930px"><div class="ln" data-r="c1" style="display:inline-block"><span>DO BALCÃO AO CAIXA.</span></div> ' +
        '<div class="ln" data-r="c2" style="display:inline-block"><span class="gold">SEM CONFUSÃO.</span></div></div>';
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var split = E.inOut(F.p(t, 5.0, 5.6)), join = E.inOut(F.p(t, 7.0, 7.8));
      // lado do vendedor: C07 → C08 → C09, depois encolhe para a esquerda
      function vend(el, a0, a1) {
        var on = t >= a0 - .2 && t < (a1 >= 5 ? 7.9 : a1 + .2);
        var a = (a0 === 0 ? 1 : E.out(F.p(t, a0 - .2, a0 + .2))) * (1 - join);
        if (!on) { F.op(el, 0); F.vis(el, false); return; }
        var s = 1 + .03 * F.p(t, a0, Math.min(a1, 5));
        var wFull = BOX.w * s, w = F.lerp(wFull, HALF, split);
        var x = F.lerp(BOX.x + (BOX.w - wFull) / 2, LX, split), y = F.lerp(BOX.y + (BOX.h - wFull * SH / SW) / 2, HY, split);
        slotAt(el, x, y, w, a);
      }
      vend(c.v7, 0, 2.0); vend(c.v8, 2.0, 4.0); vend(c.v9, 4.0, 5.2);
      // lado do caixa: C10 entra à direita, depois ocupa o quadro; C11 e C12 em seguida
      var kIn = E.out(F.p(t, 5.3, 5.9));
      if (t < 8.2) {
        var w = F.lerp(HALF, BOX.w, join), x = F.lerp(RX + (1 - kIn) * 60, BOX.x, join), y = F.lerp(HY, BOX.y, join);
        slotAt(c.k10, x, y, w, kIn);
      } else { F.op(c.k10, 0); F.vis(c.k10, false); }
      slotFull(c.k11, (t >= 7.8 && t < 9.8) ? E.out(F.p(t, 8.0, 8.4)) : 0, .03, F.p(t, 8.0, 9.6));
      slotFull(c.k12, t >= 9.4 ? E.out(F.p(t, 9.6, 10.0)) : 0, .03, F.p(t, 9.6, 11.0));
      place(c.wv, 120, 100, F.inout(t, .2, .4, 7.0, .4), false);
      place(c.wc, RX, HY - 56, F.inout(t, 5.6, .4, 7.1, .3), false);
      if (t > 7.6) place(c.wc, 120, 100, E.out(F.p(t, 7.8, 8.2)), false);
      // F8
      var kf = F.inout(t, .8, .3, 2.4, .3);
      F.css(c.f8, 'left', '1580px'); F.css(c.f8, 'top', '700px');
      F.tf(c.f8, 'translateY(' + ((1 - kf) * 16 + (t > 1.0 && t < 1.18 ? 6 : 0)).toFixed(1) + 'px)');
      F.op(c.f8, kf); F.vis(c.f8, kf > .002);
      place(c.nf8, 1360, 814, F.inout(t, .9, .3, 2.4, .3), false);
      // linha dourada e o cartão do pedido
      attr(c.ln, 'stroke-dashoffset', (1 - E.inOut(F.p(t, 5.2, 5.8))).toFixed(3));
      attr(c.ln, 'opacity', (1 - F.p(t, 7.2, 7.7)).toFixed(3));
      var run = E.inOut(F.p(t, 5.4, 6.9));
      var cx = F.lerp(510, 1410, run), cy = F.lerp(470, 470, run) - Math.sin(run * Math.PI) * 150;
      var compact = E.out(F.p(t, 5.0, 5.4));
      var ca = compact * (1 - E.inOut(F.p(t, 7.0, 7.4)));
      F.tf(c.card, 'translate3d(' + (cx - 190).toFixed(1) + 'px,' + (cy - 100).toFixed(1) + 'px,0) scale(' + (F.lerp(1.6, 1, compact) * (1 - .35 * E.in(F.p(t, 6.8, 7.2)))).toFixed(3) + ')');
      F.op(c.card, ca); F.vis(c.card, ca > .002);
      F.line(c.c1, t, .8, 10.3, .7, .45);
      F.line(c.c2, t, 1.3, 10.35, .7, .45);
    }
  });

  /* ======================================================================
     5 · COMPROVANTE E FUTURO FISCAL (41 – 52)
     A linha vira o papel da impressora térmica ilustrada; o conteúdo do papel é a prévia real (C13).
     O lado fiscal é FUTURO: cinza, tracejado, sem dados e sem dourado de "concluído".
     ====================================================================== */
  var PX = 440;  // centro da impressora
  F.scene({
    name: 'Comprovante e futuro fiscal', start: 41.0, dur: 11.0,
    build: function (el) {
      var h = '<svg class="fx" viewBox="0 0 1920 1080">' +
        '<line data-r="dl" x1="' + PX + '" y1="0" x2="' + PX + '" y2="250" stroke="#F3B61F" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 10px rgba(243,182,31,.8))"/>' +
        // impressora térmica (ilustração própria, sem marca)
        '<g data-r="pr"><rect x="' + (PX - 230) + '" y="250" width="460" height="190" rx="28" fill="#2B3139" stroke="#4A525C" stroke-width="4"/>' +
        '<rect x="' + (PX - 230) + '" y="250" width="460" height="64" rx="28" fill="#353C45"/>' +
        '<rect x="' + (PX - 190) + '" y="400" width="380" height="16" rx="8" fill="#0D1114"/>' +
        '<circle cx="' + (PX + 180) + '" cy="282" r="9" fill="#3FA66A"/></g></svg>';
      h += '<div class="paper" data-r="pp" style="left:' + (PX - 170) + 'px;top:408px;height:0">' +
        '<div class="ph2" style="height:520px"><span class="k">Captura real pendente</span><span class="id">C13</span><span class="t">Prévia do comprovante 80 mm “COMPROVANTE NÃO FISCAL”</span></div></div>';
      h += '<div class="stamp" data-r="st">NÃO FISCAL<small>Documento sem valor fiscal</small></div>';
      h += '<div class="illus" data-r="il" style="left:' + (PX - 230) + 'px;top:200px">Ilustração · impressora térmica compatível</div>';
      h += '<div class="divider" data-r="dv" style="left:1010px;top:150px;height:740px"></div>';
      h += '<div class="futdoc" data-r="fd" style="left:1180px;top:170px">' +
        [70, 120, 170, 250, 290, 330, 370, 440].map(function (y, i) { return '<i style="top:' + y + 'px;width:' + [220, 300, 260, 320, 280, 300, 240, 160][i] + 'px"></i>'; }).join('') + '</div>';
      h += '<div class="fut-k" data-r="fk" style="left:1110px;top:730px">NF-e / NFC-e</div>';
      h += '<div class="fut-s" data-r="fs" style="left:1112px;top:800px">Módulo fiscal</div>';
      h += '<div class="fut-badge" data-r="fb" style="left:1460px;top:120px"><i></i>Recurso futuro</div>';
      h += '<div class="fut-s" data-r="fp" style="left:1112px;top:848px">Pro e Enterprise · módulo opcional</div>';
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var out = 1 - E.inOut(F.p(t, 10.4, 11.0));
      attr(c.dl, 'stroke-dashoffset', (1 - E.inOut(F.p(t, 0, .6))).toFixed(3));
      attr(c.dl, 'opacity', (1 - F.p(t, 1.0, 1.6)).toFixed(3));
      var pa = E.out(F.p(t, .3, .8));
      attr(c.pr, 'opacity', (pa * out).toFixed(3));
      // papel sai em 1,4 s com leve ondulação
      var ph = 520 * E.out3(F.p(t, .8, 2.2));
      F.css(c.pp, 'height', F.px(ph));
      F.tf(c.pp, 'skewX(' + (Math.sin(t * 9) * .8 * (1 - F.p(t, 1.8, 2.4))).toFixed(2) + 'deg)');
      F.op(c.pp, (ph > 1 ? 1 : 0) * out);
      // selo NÃO FISCAL carimba 1,2 → 1,0
      var ks = F.p(t, 3.0, 3.25);
      F.css(c.st, 'left', F.px(PX + 150)); F.css(c.st, 'top', F.px(560));
      F.tf(c.st, 'rotate(-6deg) scale(' + F.lerp(1.2, 1, E.out(ks)).toFixed(3) + ')');
      F.op(c.st, (ks > 0 ? Math.min(1, ks * 3) : 0) * out); F.vis(c.st, ks > 0);
      F.op(c.il, E.out(F.p(t, .6, 1.2)) * (1 - F.p(t, 4.6, 5.0)));
      F.vis(c.il, t < 5.0);
      // divisória e o lado futuro (cinza, sem dados)
      var dv = E.inOut(F.p(t, 5.0, 5.6));
      F.tf(c.dv, 'scaleY(' + dv.toFixed(3) + ')'); F.op(c.dv, out);
      var fd = E.out(F.p(t, 5.4, 6.2));
      F.op(c.fd, fd * out); F.tf(c.fd, 'translateY(' + ((1 - fd) * 24).toFixed(1) + 'px)');
      place(c.fb, 1460, 120, E.out(F.p(t, 5.8, 6.3)) * out, false);
      place(c.fk, 1110, 730, E.out(F.p(t, 6.0, 6.6)) * out, false);
      place(c.fs, 1112, 800, E.out(F.p(t, 6.3, 6.8)) * out, false);
      place(c.fp, 1112, 848, E.out(F.p(t, 6.6, 7.1)) * out, false);
    }
  });

  /* ======================================================================
     6 · ENCERRAMENTO (52 – 59)
     A tela do PDV gira e recua; busca, leitor, carrinho, caixa e impressora viram ícones ligados
     ao logotipo, desenhado traço a traço.
     ====================================================================== */
  var NODES = [['busca', 'Busca', 360, 300], ['leitor', 'Leitor', 560, 690], ['carrinho', 'Carrinho', 960, 800], ['caixa', 'Caixa', 1360, 690], ['impressora', 'Comprovante', 1560, 300]];
  F.scene({
    name: 'Encerramento', start: 52.0, dur: 7.0,
    build: function (el) {
      var h = slotHTML('sl', 'C01');
      h += '<svg class="fx" viewBox="0 0 1920 1080">';
      NODES.forEach(function (n, i) { h += '<path data-r="g' + i + '" d="M' + n[2] + ' ' + n[3] + ' Q ' + ((n[2] + 960) / 2) + ' ' + (n[3] - 80) + ' 960 430" fill="none" stroke="#F3B61F" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 8px rgba(243,182,31,.8))"/>'; });
      h += '</svg>';
      NODES.forEach(function (n, i) { h += '<div class="node4" data-r="n' + i + '" style="left:' + n[2] + 'px;top:' + n[3] + 'px"><div class="ic">' + icon(n[0], 1.6) + '</div><b>' + n[1] + '</b></div>'; });
      h += '<div class="logo" data-r="lg" style="position:absolute;left:560px;top:300px;width:800px">' + H.logoSVG('k') + '</div>';
      h += '<div class="sig" data-r="erp" style="top:478px">ERP</div>';
      h += '<div class="slogan" style="top:600px"><div class="ln" data-r="s1" style="display:inline-block"><span>MENOS TEMPO NO BALCÃO.</span></div></div>';
      h += '<div class="slogan" style="top:672px"><div class="ln" data-r="s2" style="display:inline-block"><span class="gold">MAIS TEMPO PARA VENDER.</span></div></div>';
      h += '<div class="fill" data-r="black" style="background:#000;opacity:0"></div>';
      el.innerHTML = h;
      var c = F.refs(el);
      Object.assign(c, F.refs(c.lg));
      return c;
    },
    render: function (t, c) {
      // a tela do PDV gira 12° em perspectiva e recua
      var r = E.inOut(F.p(t, 0, 1.6)), w = F.lerp(BOX.w, 900, r);
      var a = 1 - E.inOut(F.p(t, 1.4, 2.1));
      slotAt(c.sl, 960 - w / 2, F.lerp(BOX.y, 260, r), w, a, ' perspective(2400px) rotateY(' + (-12 * r).toFixed(2) + 'deg)');
      NODES.forEach(function (n, i) {
        var k = E.out(F.p(t, .8 + i * .12, 1.4 + i * .12)), gone = E.inOut(F.p(t, 3.0, 3.6));
        F.op(c['n' + i], k * (1 - gone));
        F.tf(c['n' + i], 'translate(-50%,-50%) scale(' + ((.6 + .4 * k) * (1 - .4 * gone)).toFixed(3) + ')');
        attr(c['g' + i], 'stroke-dashoffset', (1 - E.inOut(F.p(t, 2.0 + i * .05, 2.9 + i * .05))).toFixed(3));
        attr(c['g' + i], 'opacity', (1 - E.inOut(F.p(t, 3.1, 3.7))).toFixed(3));
      });
      H.drawLogo(c, 'k', t, 2.9);
      F.op(c.erp, E.out(F.p(t, 3.8, 4.4)));
      F.line(c.s1, t, 4.1, 9.0, .8);
      F.line(c.s2, t, 4.35, 9.0, .8);
      F.op(c.black, E.inOut(F.p(t, 6.5, 7.0)));
    }
  });

  /* ---------- guia de locução e marca de prévia (sobre todas as cenas) ---------- */
  var pend = Object.keys(P.CAPS).filter(function (k) { return !P.CAPS[k].src; }).length;
  var ov = null;
  var render0 = F.render;
  F.render = function () {
    render0();
    if (!ov) {
      var st = document.getElementById('stage');
      ov = F.el('<div class="fill" style="pointer-events:none;z-index:30"><div class="guia" data-r="g"><b data-r="gk"></b><span data-r="gt"></span></div>' +
        (pend ? '<div class="wm">Prévia · ' + pend + ' capturas e locução pendentes</div>' : '') + '</div>');
      st.appendChild(ov);
      ov.c = F.refs(ov);
      if (!P.GUIA) F.css(ov.c.g, 'display', 'none');
    }
    if (!P.GUIA) return;
    var T = F.T, cur = null, idx = 0;
    P.FALAS.forEach(function (f, i) { if (T >= f[0] - .15 && T <= f[1] + .25) { cur = f; idx = i; } });
    F.op(ov.c.g, cur ? 1 : 0);
    if (cur) { F.txt(ov.c.gk, 'Guia de locução · fala ' + (idx + 1) + ' de 9 · voz pendente'); F.txt(ov.c.gt, cur[2]); }
  };
})();
