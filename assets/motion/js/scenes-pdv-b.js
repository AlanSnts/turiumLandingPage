/* Turium — filme 4: PDV Rápido. Cenas 4–6, guia de locução e marca de prévia. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, attr = H.attr, place = H.place, P = F.p4;
  var R = P.R, slotHTML = P.slotHTML, slotAt = P.slotAt, slotFull = P.slotFull, BOX = P.BOX, SW = P.SW, SH = P.SH, icon = P.icon;

  /* ======================================================================
     4 · DO VENDEDOR AO CAIXA (30 – 41)
     C07 (câmera aproxima o carrinho e o "Enviar ao caixa (F8)"); o pedido vira um cartão que corre pela linha
     dourada até a fila "Aguardando caixa" (ILUSTRAÇÃO identificada: não há captura dessa tela) e o caixa conclui
     (C08 → C09, reais, com o mouse indo a "Ir para pagamento" e a "Imprimir comprovante").
     ====================================================================== */
  var HALF = 780, LX = 120, RX = 1020, HY = 300;            // telas lado a lado
  F.scene({
    name: 'Do vendedor ao caixa', start: 30.0, dur: 11.0,
    build: function (el) {
      var h = slotHTML('v7', 'C07', true) + slotHTML('k8', 'C08', true) + slotHTML('k9', 'C09', true);

      h += '<svg class="fx" viewBox="0 0 1920 1080"><path data-r="ln" d="M510 470 Q 960 170 1410 400" fill="none" stroke="#F3B61F" stroke-width="5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 10px rgba(243,182,31,.8))"/></svg>';
      // fila do caixa: ilustração própria (sem imitar a tela do ERP), com rótulo
      h += '<div class="queue" data-r="q"><div class="qh">' + icon('caixa', 2) + 'Aguardando caixa</div>' +
        '<div class="qr" data-r="qhit"><b>PED-001524</b><span>Pedro · 4 itens</span><em>R$ 124,82</em></div>' +
        '<div class="qr dim"><i style="width:46%"></i></div><div class="qr dim"><i style="width:34%"></i></div></div>' +
        '<div class="illus" data-r="qil">Ilustração · fila do caixa</div>';
      h += '<div class="who" data-r="wv"><i></i>Pedro · Vendedor</div><div class="who" data-r="wc"><i></i>Ricardo · Caixa</div>';
      h += '<div class="key on" data-r="f8">F8</div>';
      h += '<div class="step" data-r="sp1"><i></i>Pagamento no caixa</div><div class="step done" data-r="sp2"><i></i>Venda concluída</div>';
      h += '<div class="note4" data-r="nf8">Enviar ao caixa (F8)</div>';
      h += '<div class="order" data-r="card"><div class="k">Pedido do balcão</div><h5>Aguardando caixa</h5>' + '<p>PED-001524 · 4 itens · R$ 124,82</p>' + '<div class="bars"><i style="width:92%"></i><i style="width:74%"></i><i style="width:83%"></i><i style="width:58%"></i></div></div>';
      h += '<div class="cap" style="left:160px;top:930px"><div class="ln" data-r="c1" style="display:inline-block"><span>DO BALCÃO AO CAIXA.</span></div> ' +
        '<div class="ln" data-r="c2" style="display:inline-block"><span class="gold">SEM CONFUSÃO.</span></div></div>';
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var split = E.inOut(F.p(t, 5.0, 5.6)), join = E.inOut(F.p(t, 7.0, 7.8));
      // lado do vendedor: C07 com a câmera aproximando o carrinho e o botão "Enviar ao caixa (F8)"
      var zk = E.inOut(F.p(t, .4, 4.2)), zs = 1 + .3 * zk, AX = 2350 * R, AY = 1014 * R;
      var zx = BOX.x + AX - AX * zs, zy = BOX.y + AY - AY * zs, zw = BOX.w * zs;
      var va = 1 - join;
      slotAt(c.v7, F.lerp(zx, LX, split), F.lerp(zy, HY, split), F.lerp(zw, HALF, split), va);
      P.mouse(c.m_v7, t, [[0, 860, 423]], [], va);
      // lado do caixa: a fila (ilustração) entra à direita; o pedido chega nela; depois C11 e C12 ocupam o quadro
      var kIn = E.out(F.p(t, 5.3, 5.9)), qa = kIn * (1 - E.inOut(F.p(t, 7.3, 7.7)));
      F.tf(c.q, 'translate3d(' + (RX + (1 - kIn) * 60).toFixed(1) + 'px,' + HY + 'px,0)');
      F.op(c.q, qa); F.vis(c.q, qa > .002);
      var hit = E.out(F.p(t, 6.75, 7.1));
      F.op(c.qhit, hit); F.tf(c.qhit, 'translateY(' + ((1 - hit) * -18).toFixed(1) + 'px)');
      place(c.qil, RX, HY + 346, qa, false);
      // C08 (carrinho no caixa) fica 2,2 s inteira ANTES da venda finalizada (C09)
      slotFull(c.k8, (t >= 7.4 && t < 10.0) ? E.out(F.p(t, 7.45, 7.75)) : 0, .03, F.p(t, 7.6, 9.8));
      slotFull(c.k9, t >= 9.65 ? E.out(F.p(t, 9.7, 10.0)) : 0, .03, F.p(t, 9.8, 11.0));
      // mouse do caixa (estas capturas não têm ponteiro gravado): "Ir para pagamento (F8)" → "Imprimir comprovante (F9)"
      var PAG = [2330, 966], IMP = [1040, 352];
      P.mouse(c.m_k8, t, [[7.4, 1500, 760], [8.5, PAG[0], PAG[1]]], [8.85]);
      P.mouse(c.m_k9, t, [[9.65, PAG[0], PAG[1]], [10.35, IMP[0], IMP[1]]], [10.6]);
      place(c.sp1, 1450, 100, F.inout(t, 7.7, .35, 9.6, .25), false);
      place(c.sp2, 1450, 100, E.out(F.p(t, 9.9, 10.25)), false);
      place(c.wv, 120, 100, F.inout(t, .2, .4, 7.0, .4), false);
      place(c.wc, RX, HY - 56, F.inout(t, 5.6, .4, 7.1, .3), false);
      if (t > 7.3) place(c.wc, 120, 100, E.out(F.p(t, 7.5, 7.9)), false);
      // F8
      var kf = F.inout(t, .8, .3, 4.6, .3);
      F.css(c.f8, 'left', '1180px'); F.css(c.f8, 'top', '760px');
      F.tf(c.f8, 'translateY(' + ((1 - kf) * 16 + (t > 1.0 && t < 1.18 ? 6 : 0)).toFixed(1) + 'px)');
      F.op(c.f8, kf); F.vis(c.f8, kf > .002);
      place(c.nf8, 1000, 860, F.inout(t, .9, .3, 4.6, .3), false);
      // linha dourada e o cartão do pedido
      attr(c.ln, 'stroke-dashoffset', (1 - E.inOut(F.p(t, 5.2, 5.8))).toFixed(3));
      attr(c.ln, 'opacity', (1 - F.p(t, 7.2, 7.7)).toFixed(3));
      var run = E.inOut(F.p(t, 5.4, 6.9));
      var cx = F.lerp(510, 1410, run), cy = F.lerp(470, 400, run) - Math.sin(run * Math.PI) * 150;
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
  var PX = 440, PH = 528;  // centro da impressora; altura do papel = prévia real (680×1056 a 340 px)
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
        '<img src="' + P.CAPS.C13.src + '" alt="" decoding="async"></div>';
      F.images.push(P.CAPS.C13.src);
      h += '<div class="illus real" data-r="rl" style="left:' + (PX + 200) + 'px;top:470px">Prévia real do comprovante<small>Venda de demonstração</small></div>';
      h += '<div class="stamp" data-r="st">NÃO FISCAL<small>Documento sem valor fiscal</small></div>';
      h += '<div class="illus" data-r="il" style="left:' + (PX - 230) + 'px;top:200px">Ilustração · impressora térmica compatível</div>';
      h += '<div class="divider" data-r="dv" style="left:1010px;top:150px;height:740px"></div>';
      h += '<div class="fut-hero" data-r="fb"><i></i>Recurso futuro</div>';
      h += '<div class="futdoc" data-r="fd" style="left:1290px;top:290px">' +
        [60, 100, 140, 200, 236, 272, 308].map(function (y, i) { return '<i style="top:' + y + 'px;width:' + [200, 250, 220, 260, 230, 250, 150][i] + 'px"></i>'; }).join('') + '</div>';
      h += '<div class="fut-k" data-r="fk">NF-e / NFC-e</div>';
      h += '<div class="fut-s" data-r="fs">Módulo fiscal opcional</div>';
      h += '<div class="fut-s" data-r="fp">Planos Pro e Enterprise</div>';
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
      var ph = PH * E.out3(F.p(t, .8, 2.2));
      F.css(c.pp, 'height', F.px(ph));
      F.tf(c.pp, 'skewX(' + (Math.sin(t * 9) * .8 * (1 - F.p(t, 1.8, 2.4))).toFixed(2) + 'deg)');
      F.op(c.pp, (ph > 1 ? 1 : 0) * out);
      // selo NÃO FISCAL carimba 1,2 → 1,0, no fim de "não fiscal" (43,2 s)
      var ks = F.p(t, 2.2, 2.45);
      F.css(c.st, 'left', F.px(PX - 200)); F.css(c.st, 'top', F.px(830));
      F.tf(c.st, 'rotate(-6deg) scale(' + F.lerp(1.2, 1, E.out(ks)).toFixed(3) + ')');
      F.op(c.st, (ks > 0 ? Math.min(1, ks * 3) : 0) * out); F.vis(c.st, ks > 0);
      F.op(c.il, E.out(F.p(t, .6, 1.2)) * (1 - F.p(t, 3.8, 4.2)));
      F.op(c.rl, E.out(F.p(t, 1.6, 2.0)) * (1 - F.p(t, 3.8, 4.2))); F.vis(c.rl, t > 1.6 && t < 4.2);
      F.vis(c.il, t < 4.2);
      // divisória e o lado futuro (cinza, sem dados), junto de "NF-e e NFC-e" na fala 8
      var dv = E.inOut(F.p(t, 4.2, 4.8));
      F.tf(c.dv, 'scaleY(' + dv.toFixed(3) + ')'); F.op(c.dv, out);
      var fd = E.out(F.p(t, 4.6, 5.4));
      F.op(c.fd, fd * out); F.tf(c.fd, 'translateY(' + ((1 - fd) * 24).toFixed(1) + 'px)');
      // RECURSO FUTURO em destaque: primeiro elemento do lado fiscal, com contorno pulsando
      var kb = E.out(F.p(t, 4.7, 5.2));
      place(c.fb, 1100, 140, kb * out, false);
      F.css(c.fb, 'boxShadow', '0 0 0 ' + (6 + 6 * Math.max(0, Math.sin((t - 5.2) * 3))).toFixed(1) + 'px rgba(156,195,230,' + (.10 * kb).toFixed(3) + ')');
      place(c.fk, 1100, 730, E.out(F.p(t, 5.2, 5.8)) * out, false);
      place(c.fs, 1102, 814, E.out(F.p(t, 5.5, 6.0)) * out, false);
      place(c.fp, 1102, 870, E.out(F.p(t, 5.8, 6.3)) * out, false);
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
      h += '<div class="slogan" style="top:686px"><div class="ln" data-r="s2" style="display:inline-block"><span class="gold">MAIS TEMPO PARA VENDER.</span></div></div>';
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
      F.op(c.black, E.inOut(F.p(t, 6.6, 7.0)));  // a voz termina em 58,5 s
    }
  });

  /* ---------- guia de locução e marca de prévia (sobre todas as cenas) ---------- */
  var pend = Object.keys(P.CAPS).filter(function (k) { return !P.CAPS[k].src && !P.CAPS[k].illus; }).length;
  var ov = null;
  var render0 = F.render;
  F.render = function () {
    render0();
    if (!ov) {
      var st = document.getElementById('stage');
      ov = F.el('<div class="fill" style="pointer-events:none;z-index:30"><div class="guia" data-r="g"><b data-r="gk"></b><span data-r="gt"></span></div>' +
        (pend && P.REV ? '<div class="wm">Prévia de revisão · ' + pend + ' capturas pendentes</div>' : '') + '</div>');
      st.appendChild(ov);
      ov.c = F.refs(ov);
      if (!P.GUIA) F.css(ov.c.g, 'display', 'none');
    }
    if (!P.GUIA) return;
    var T = F.T, cur = null, idx = 0;
    P.FALAS.forEach(function (f, i) { if (T >= f[0] - .05 && T <= f[1] + .15) { cur = f; idx = i; } });
    F.op(ov.c.g, cur ? 1 : 0);
    if (cur) { F.txt(ov.c.gk, 'Locução · fala ' + (idx + 1) + ' de 9'); F.txt(ov.c.gt, cur[2]); }
  };
})();
