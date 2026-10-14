/* Turium — cenas 5 a 8: pedido, estoque, bruto → líquido, fluxo de caixa. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, IMG = H.IMG, CX = H.CX, CY = H.CY;
  var cap = H.cap, tag = H.tag, place = H.place, insetRect = H.insetRect, attr = H.attr;

  /* ======================================================================
     5 · PEDIDO PED-000011 (31.8 – 40.2)
     O desenho da Medida certa vira a linha 1 do pedido real.
     ====================================================================== */
  var P = {
    row1: [555, 362, 1375, 76], rows: [555, 362, 1375, 180], total: [1947, 638, 320, 40],
    badges: [762, 182, 236, 36], h1: [555, 756, 1711, 26], h2: [555, 788, 1711, 26], h3: [555, 820, 1711, 26],
    hora: [636, 758, 46, 22]
  };
  F.scene({
    name: 'Pedido', start: 31.8, dur: 8.4,
    keys: [[555, 350, 1375, 100],
      [1.9, 3.1, [540, 170, 1740, 540]],
      [3.9, 4.9, [550, 170, 760, 90]],
      [5.4, 6.4, [545, 700, 1730, 170]],
      [6.9, 7.5, [540, 740, 900, 120]]],
    build: function (el) {
      el.innerHTML =
        '<div class="fill" data-r="slide"><div class="fill" data-r="win">' +
        F.shotHTML(IMG + 'pedido.webp', 'shot', '<div class="spot" data-r="spot"></div>') + '</div>' +
        '<div class="shade-b"></div></div>' +
        '<div class="hline" data-r="line" style="left:' + F.BOX.x + 'px;width:' + F.BOX.w + 'px;top:' + (CY - 1.5) + 'px"></div>' +
        tag('hora', '08/10/2026', '06:48') +
        cap('c1', 'Pedido PED-000011.') + cap('c2', 'Do pedido à venda.');
      return F.refs(el);
    },
    render: function (t, c) {
      var cam = F.camAt(t, this.keys);
      var m = F.applyCam(c.shot, cam);
      // revelação a partir da linha dourada
      var half = F.tw(t, 0, .7, 2, 560, E.out);
      if (half >= 559) F.clip(c.win, 'none');
      else insetRect(c.win, 0, CY - half, 1920, half * 2);
      F.op(c.line, 1 - F.p(t, .3, .6));
      var sp = F.spotAt(t, [[P.row1, 1], [2.0, 2.8, P.rows, 1], [3.0, 3.6, P.total, 1], [3.9, 4.7, P.badges, 1],
        [5.4, 6.0, P.h3, 1], [6.0, 6.4, P.h2, 1], [6.4, 6.8, P.h1, 1], [6.9, 7.3, P.hora, 1]]);
      F.applySpot(c.spot, sp, cam.s, 10);
      // a hora da venda se solta e voa para a próxima tela
      var fly = E.inOut(F.p(t, 7.6, 8.4));
      var hx = F.lerp(m.x(P.hora[0] + P.hora[2] / 2), 1576, fly);
      var hy = F.lerp(m.y(P.hora[1] + P.hora[3]) + 22, CY + 34, fly);
      place(c.hora, hx, hy, F.p(t, 7.2, 7.5), true);
      F.tf(c.slide, 'translateX(' + (-1920 * E.in(F.p(t, 7.6, 8.4))).toFixed(1) + 'px)');
      F.line(c.c1, t, .7, 3.6);
      F.line(c.c2, t, 4.0, 7.2);
    }
  });

  /* ======================================================================
     6 · ESTOQUE E COMPRAS (39.6 – 48.0)
     ====================================================================== */
  var S = {
    row: [336, 585, 2150, 37], qty: [1600, 585, 130, 37], mov: [2150, 585, 170, 37],
    b1: [1890, 332, 100, 26], b2: [1890, 628, 100, 26]
  };
  var R = { row: [555, 410, 1720, 32], qty: [1260, 410, 80, 32], after: [2180, 410, 90, 32] };
  var REC_CAM = [555, 401, 1720, 50];
  F.scene({
    name: 'Estoque', start: 39.6, dur: 8.4,
    keys: [[336, 560, 2150, 90], [2.6, 3.4, [336, 180, 2150, 640]]],
    build: function (el) {
      el.innerHTML =
        '<div class="fill" data-r="slide"><div class="fill" data-r="wa">' +
        F.shotHTML(IMG + 'estoque.webp', 'shot', '<div class="spot" data-r="spot"></div><div class="ring" data-r="g1"></div><div class="ring" data-r="g2"></div>') + '</div></div>' +
        '<div class="fill" data-r="wb">' + F.shotHTML(IMG + 'recebimento.webp', 'shot2', '<div class="spot" data-r="spot2"></div>') + '</div>' +
        '<div class="vline" data-r="wipe" style="top:0;height:1080px;width:4px;box-shadow:0 0 30px rgba(243,182,31,.5)"></div>' +
        '<div class="shade-b"></div>' +
        tag('hora', '08/10/2026', '06:48') +
        tag('q1', 'Entrada', '+24 CX') + tag('q2', 'Estoque após', '28 CX') +
        '<div class="hline" data-r="under"></div>' +
        cap('c1', 'Estoque atualizado.') + cap('c2', 'Compra recebida, estoque somado.');
      var c = F.refs(el);
      [['g1', S.b1], ['g2', S.b2]].forEach(function (g) {
        var r = g[1];
        F.css(c[g[0]], 'left', (r[0] - 8) + 'px'); F.css(c[g[0]], 'top', (r[1] - 8) + 'px');
        F.css(c[g[0]], 'width', (r[2] + 16) + 'px'); F.css(c[g[0]], 'height', (r[3] + 16) + 'px');
        F.css(c[g[0]], 'borderWidth', '4px');
      });
      return c;
    },
    render: function (t, c) {
      F.tf(c.slide, 'translateX(' + (1920 * (1 - E.out(F.p(t, 0, .8)))).toFixed(1) + 'px)');
      var cam = F.camAt(t, this.keys);
      F.applyCam(c.shot, cam);
      var sp = F.spotAt(t, [[S.row, 0], [.8, 1.3, S.row, 1], [1.9, 2.4, S.qty, 1], [2.6, 3.2, S.qty, 0]]);
      F.applySpot(c.spot, sp, cam.s, 8);
      var gp = Math.sin(Math.PI * F.p(t, 2.9, 3.9));
      F.op(c.g1, gp); F.op(c.g2, gp);
      place(c.hora, 1576, CY + 34, 1 - F.p(t, 1.3, 1.8), true);

      // cortina vertical: estoque → recebimento
      var X = F.tw(t, 3.8, 4.5, -10, 1930, E.inOut);
      F.clip(c.wa, t < 3.8 ? 'none' : 'inset(0px 0px 0px ' + F.px(Math.max(0, X)) + ')');
      F.clip(c.wb, 'inset(0px ' + F.px(Math.max(0, 1920 - X)) + ' 0px 0px)');
      F.vis(c.wb, t > 3.8);
      F.vis(c.wa, t < 4.55);
      F.css(c.wipe, 'left', F.px(X - 2));
      F.op(c.wipe, F.p(t, 3.75, 3.85) * (1 - F.p(t, 4.45, 4.55)));

      var cam2 = F.camAt(t, [REC_CAM]);
      var m2 = F.applyCam(c.shot2, cam2);
      var sp2 = F.spotAt(t, [[R.row, 0], [4.6, 5.1, R.row, 1], [7.0, 7.5, R.row, 0]]);
      F.applySpot(c.spot2, sp2, cam2.s, 8);
      place(c.q1, m2.x(R.qty[0] + R.qty[2] / 2), m2.y(R.qty[1]) - 84, F.inout(t, 5.0, .4, 7.0, .3), true);
      place(c.q2, m2.x(R.after[0] + R.after[2] / 2), m2.y(R.after[1]) - 84, F.inout(t, 5.5, .4, 7.0, .3), true);
      F.op(c.shot2, 1 - F.p(t, 7.4, 8.0));

      // o sublinhado da compra vira a barra do bruto
      var uy = m2.y(R.row[1] + R.row[3]) + 8;
      var d1 = E.inOut(F.p(t, 7.0, 7.5)), d2 = E.inOut(F.p(t, 7.5, 8.0));
      var L = F.lerp(m2.x(R.row[0]), 0, d2), Rr = F.lerp(m2.x(R.row[0]) + (m2.x(R.row[0] + R.row[2]) - m2.x(R.row[0])) * d1, 1920, d2);
      F.css(c.under, 'top', F.px(uy)); F.css(c.under, 'left', F.px(L)); F.css(c.under, 'width', F.px(Math.max(0, Rr - L)));
      F.op(c.under, F.p(t, 6.95, 7.05));
      F.line(c.c1, t, 1.2, 3.5);
      F.line(c.c2, t, 4.8, 7.0);
    }
  });
  // altura da linha que passa para a cena 7 (enquadramento fixo do recebimento)
  var recFit = F.fit(REC_CAM);
  var LINE_Y7 = CY + (R.row[1] + R.row[3] - recFit.cy) * recFit.s + 8;

  /* ======================================================================
     7 · DO BRUTO AO LÍQUIDO (47.6 – 59.8)
     VEN-000011 · cartão de crédito · R$ 1.701,46 − R$ 50,87 (2,99%) = R$ 1.650,59
     ====================================================================== */
  var BAR = { x: 160, y: 560, w: 1600, h: 56 };
  var FEE = BAR.w * 50.87 / 1701.46;                 // proporção real da taxa
  var VW = { x: 160, y: 220, w: 1600, h: 1600 * 480 / 1760 }; // janela do clipe V4
  var V4S = VW.w / 2200, V4TX = VW.x - 320 * V4S, V4TY = VW.y - 120 * V4S;  // recorte nativo (320,120,2200,600)
  var L = {
    bruto: [334, 291, 421, 53], taxas: [1202, 291, 417, 53], liq: [1632, 291, 421, 53],
    tabs: [300, 110, 700, 70], tabConc: [548, 128, 76, 34]
  };
  // câmera que reproduz exatamente o enquadramento do clipe
  var STILL0 = (function () {
    var w = F.BOX.w / V4S, h = F.BOX.h / V4S;
    var cx = (CX - V4TX) / V4S, cy = (CY - V4TY) / V4S;
    return [cx - w / 2, cy - h / 2, w, h];
  })();

  F.scene({
    name: 'Bruto → líquido', start: 47.6, dur: 12.2,
    keys: [STILL0, [9.6, 10.6, [334, 240, 2151, 180]], [11.2, 11.9, L.tabs]],
    build: function (el) {
      var MONO = H.MONO;
      el.innerHTML =
        '<div class="layer" data-r="kick" style="left:160px;top:236px;font-size:22px;color:#858E98;' + MONO + '">VEN-000011 · Cartão de crédito · Construtora Vila Verde</div>' +
        '<div class="layer" style="left:160px;top:300px;height:34px;width:600px">' +
          '<div class="layer" data-r="lab1" style="font-size:24px;color:#F3B61F;' + MONO + '">Bruto</div>' +
          '<div class="layer" data-r="lab2" style="font-size:24px;color:#F3B61F;' + MONO + '">Líquido</div></div>' +
        '<div class="layer money" data-r="money" style="left:160px;top:350px"><small>R$</small><span data-r="mv">0,00</span></div>' +
        '<div class="layer" data-r="sub" style="left:160px;top:652px;font-size:20px;color:#AAB1B9;' + MONO + '">No banco · Banco Horizonte · 08/10/2026</div>' +
        '<div class="layer" data-r="bar" style="background:#F3B61F;border-radius:3px"></div>' +
        '<div class="layer" data-r="fee" style="left:' + (BAR.x + BAR.w - FEE).toFixed(2) + 'px;top:' + BAR.y + 'px;width:' + FEE.toFixed(2) + 'px;height:' + BAR.h + 'px;background:#D65353;border-radius:3px;transform-origin:50% 0"></div>' +
        '<div class="layer" data-r="feeL" style="left:' + (BAR.x + BAR.w) + 'px;top:790px;transform:translateX(-100%);text-align:right;white-space:nowrap">' +
          '<div style="font:700 56px/1 var(--font-display);letter-spacing:-0.03em;color:#E58A8A">− R$ 50,87</div>' +
          '<div style="margin-top:12px;font-size:20px;color:#AAB1B9;' + MONO + '">Taxa da adquirente · 2,99%</div></div>' +
        '<div class="clipwin" data-r="win" style="left:' + VW.x + 'px;top:' + VW.y + 'px;width:' + VW.w + 'px;height:' + VW.h.toFixed(1) + 'px">' +
          '<video data-r="vid" muted playsinline preload="auto"><source src="' + IMG + 'v4-liquidacao.webm" type="video/webm"><source src="' + IMG + 'v4-liquidacao.mp4" type="video/mp4"></video></div>' +
        '<div class="fill" data-r="sw">' + F.shotHTML(IMG + 'liquidacao.webp', 'shot',
          '<div class="spot" data-r="spot"></div><div class="layer" data-r="ul" style="top:158px;height:3px;background:#F3B61F"></div>') + '</div>' +
        '<div class="shade-b" data-r="shade"></div>' +
        cap('c1', 'Do bruto ao líquido.');
      var c = F.refs(el);
      F.addClip(c.vid, this.start + 6.0, 3.2);
      return c;
    },
    render: function (t, c) {
      // a linha do recebimento desce e engrossa: vira a barra do bruto
      var b = E.inOut(F.p(t, 0, .9));
      var split = t >= 2.6;
      var bw = F.lerp(1920, BAR.w, b) - (split ? FEE : 0);
      F.css(c.bar, 'left', F.px(F.lerp(0, BAR.x, b)));
      F.css(c.bar, 'top', F.px(F.lerp(LINE_Y7, BAR.y, b)));
      F.css(c.bar, 'width', F.px(bw));
      F.css(c.bar, 'height', F.px(F.lerp(3, BAR.h, b)));
      // a taxa se solta e cai
      var fall = E.in(F.p(t, 2.8, 3.6));
      F.vis(c.fee, split);
      F.tf(c.fee, 'translateY(' + (150 * fall).toFixed(1) + 'px) rotate(' + (10 * fall).toFixed(2) + 'deg)');
      F.op(c.fee, (1 - .25 * fall) * (1 - F.p(t, 5.8, 6.2)));
      var fl = F.inout(t, 3.2, .5, 5.8, .4);
      F.op(c.feeL, fl); F.tf(c.feeL, 'translateX(-100%) translateY(' + ((1 - fl) * 12).toFixed(1) + 'px)');
      // números
      var v = t < 3.7 ? 1701.46 * E.out(F.p(t, .9, 2.1)) : F.lerp(1701.46, 1650.59, E.inOut(F.p(t, 3.7, 4.7)));
      F.txt(c.mv, F.fmt(v, 2));
      F.css(c.money, 'color', t >= 4.6 ? '#F3B61F' : '#F4F2EE');
      var top = 1 - F.p(t, 5.8, 6.3);
      F.op(c.money, F.p(t, .8, 1.1) * top);
      F.op(c.kick, F.p(t, .6, 1.1) * top);
      F.op(c.lab1, F.p(t, .9, 1.2) * (1 - F.p(t, 3.7, 4.0)));
      F.op(c.lab2, F.p(t, 4.0, 4.3) * top);
      F.op(c.sub, F.p(t, 4.6, 5.1) * top);
      F.op(c.bar, 1 - F.p(t, 6.1, 6.5));
      // a barra se abre numa janela: o clipe real da conciliação
      var wv = E.inOut(F.p(t, 5.9, 6.6));
      var it = F.lerp(BAR.y - VW.y, 0, wv), ib = F.lerp(VW.y + VW.h - BAR.y - BAR.h, 0, wv);
      F.clip(c.win, 'inset(' + F.px(it) + ' 0px ' + F.px(ib) + ' 0px round 18px)');
      F.vis(c.win, t > 5.85 && t < 9.7);
      // a tela parada assume no mesmo enquadramento e a câmera revela o resto
      var cam = F.camAt(t, this.keys);
      F.applyCam(c.shot, cam);
      F.op(c.sw, F.p(t, 9.2, 9.5));
      F.vis(c.sw, t > 9.15);
      var ex = E.inOut(F.p(t, 9.6, 10.4));
      if (ex >= 1) F.clip(c.sw, 'none');
      else insetRect(c.sw, F.lerp(VW.x, 0, ex), F.lerp(VW.y, 0, ex), F.lerp(VW.w, 1920, ex), F.lerp(VW.h, 1080, ex), 18 * (1 - ex));
      var sp = F.spotAt(t, [[L.bruto, 0], [10.2, 10.5, L.bruto, 1], [10.6, 10.9, L.taxas, 1], [11.0, 11.3, L.liq, 1], [11.3, 11.7, L.tabConc, .8]]);
      F.applySpot(c.spot, sp, cam.s, 8);
      // sublinhado da aba desliza de Conciliação para Fluxo de caixa
      var u = E.inOut(F.p(t, 11.7, 12.1));
      F.css(c.ul, 'left', F.px(F.lerp(548, 436, u)));
      F.css(c.ul, 'width', F.px(F.lerp(76, 92, u)));
      F.op(c.ul, F.p(t, 11.5, 11.7));
      F.line(c.c1, t, 4.8, 7.0);
    }
  });

  /* ======================================================================
     8 · FLUXO DE CAIXA (59.4 – 67.4)
     ====================================================================== */
  var FX = {
    saldo: [334, 320, 528, 93], entr: [877, 320, 526, 93], said: [1418, 320, 526, 93],
    real: [[360, 941], [429, 941], [499, 941], [570, 941], [640, 941], [710, 870], [779, 800], [850, 741]]
  };
  F.scene({
    name: 'Fluxo de caixa', start: 59.4, dur: 8.0,
    keys: [L.tabs,
      [0.6, 1.6, [334, 310, 2151, 113]],
      [3.7, 4.7, [334, 640, 2151, 352]],
      [6.6, 7.6, [1200, 691, 1300, 100]]],
    build: function (el) {
      var pts = FX.real.map(function (p) { return p.join(','); }).join(' ');
      el.innerHTML = '<div class="fill" data-r="sw">' + F.shotHTML(IMG + 'fluxo.webp', 'shot',
        '<div class="spot" data-r="spot"></div>' +
        '<svg class="layer" width="2560" height="1032" style="overflow:visible"><polyline data-r="real" points="' + pts + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="#F4F2EE" stroke-width="5" stroke-linejoin="round"/></svg>' +
        '<div class="dash-h" data-r="proj" style="left:850px;top:739px;width:1614px;height:4px"></div>') + '</div>' +
        '<div class="hline" data-r="cur" style="left:0;width:1920px"></div>' +
        '<div class="hline" data-r="out" style="top:' + (CY - 1.5) + 'px"></div>' +
        '<div class="shade-b"></div>' +
        cap('c1', 'Realizado e previsto.') + cap('c2', 'Na mesma linha.');
      return F.refs(el);
    },
    render: function (t, c) {
      var cam = F.camAt(t, this.keys);
      var m = F.applyCam(c.shot, cam);
      F.op(c.shot, 1 - F.p(t, 7.2, 7.8));
      // a aba muda e o conteúdo do Fluxo de caixa desce como uma cortina, abaixo da barra de abas
      var wy = F.tw(t, 0, .7, m.y(162), 1080, E.inOut);
      if (t >= .7) F.clip(c.sw, 'none');
      else F.clip(c.sw, 'polygon(0px 0px, 1920px 0px, 1920px ' + F.px(wy) + ', 0px ' + F.px(wy) + ')');
      F.css(c.cur, 'top', F.px(wy - 1.5));
      F.op(c.cur, F.p(t, 0, .05) * (1 - F.p(t, .6, .75)));
      var sp = F.spotAt(t, [[FX.saldo, 0], [1.6, 2.0, FX.saldo, 1], [2.3, 2.7, FX.entr, 1], [3.0, 3.4, FX.said, 1], [3.7, 4.2, FX.said, 0]]);
      F.applySpot(c.spot, sp, cam.s, 8);
      attr(c.real, 'stroke-dashoffset', (1 - E.inOut(F.p(t, 4.7, 5.5))).toFixed(3));
      F.tf(c.proj, 'scaleX(' + E.inOut(F.p(t, 5.5, 6.4)).toFixed(4) + ')');
      // a linha projetada passa da borda e vira o divisor da próxima cena
      var x0 = m.x(850);
      var e = E.inOut(F.p(t, 7.2, 7.8));
      F.css(c.out, 'left', F.px(F.lerp(x0, 0, e)));
      F.css(c.out, 'width', F.px(F.lerp(1920 - x0, 1920, e)));
      F.op(c.out, F.p(t, 6.9, 7.2));
      F.line(c.c1, t, 1.0, 3.6);
      F.line(c.c2, t, 5.0, 7.0);
    }
  });
})();
