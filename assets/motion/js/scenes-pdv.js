/* Turium — filme 4: PDV Rápido (59 s). Cenas 1–3 e peças compartilhadas.
   Tempos em segundos; render(t) recebe o tempo local da cena.
   TELAS: só capturas reais do ambiente demo-filme4 (C01–C13). Enquanto não existirem, cada uma aparece
   como ESPAÇO RESERVADO identificado — nenhuma tela do ERP é desenhada como se fosse captura.
   Planta da loja, leitor, impressora e ícones são ilustrações próprias. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, attr = H.attr, place = H.place;

  /* ---------- capturas (preencher src quando as capturas reais forem aprovadas) ---------- */
  var CAPS = {
    C01: { t: 'PDV Rápido inicial · carrinho vazio', w: 'Pedro · Vendedor' },
    C02: { t: 'Busca F3 com “Cimento” digitado e resultados', w: 'Pedro · Vendedor' },
    C03: { t: 'Catálogo por categoria com “Adicionar” (Tubo PVC)', w: 'Pedro · Vendedor' },
    C04: { t: 'Cimento CP-II 50 kg em “Sua venda”', w: 'Pedro · Vendedor' },
    C05: { t: 'Quantidade alterada e total recalculado', w: 'Pedro · Vendedor' },
    C06: { t: 'Código de barras no campo e produto localizado', w: 'Pedro · Vendedor' },
    C07: { t: 'Carrinho com 4 itens e total', w: 'Pedro · Vendedor' },
    C08: { t: 'Diálogo “Enviar ao caixa?” (F8)', w: 'Pedro · Vendedor' },
    C09: { t: 'Confirmação “… enviado ao caixa”', w: 'Pedro · Vendedor' },
    C10: { t: 'Fila “Aguardando caixa” com o pedido', w: 'André · Caixa' },
    C11: { t: 'Pedido aberto no caixa, antes de confirmar', w: 'André · Caixa' },
    C12: { t: 'Venda concluída (pagamento fictício)', w: 'André · Caixa' },
    C13: { t: 'Prévia do comprovante 80 mm “COMPROVANTE NÃO FISCAL”', w: 'André · Caixa' }
  };
  // Quando a captura existir: CAPS.C02.src = 'assets/film/pdv-c02.webp' (2560×1032).
  function slotHTML(ref, id) {
    var c = CAPS[id], inner;
    if (c.src) { F.images.push(c.src); inner = '<img src="' + c.src + '" alt="" decoding="async">'; }
    else {
      inner = '<div class="ph"><span class="corner">Espaço reservado · ' + id + '</span>' +
        '<span class="k">Captura real pendente</span><span class="id">' + id + '</span>' +
        '<span class="t">' + c.t + '</span><span class="w">PDV Rápido · ' + c.w + ' · ambiente demo-filme4</span>' +
        '<span class="dim">2560 × 1032</span></div>';
    }
    return '<div class="slot" data-r="' + ref + '">' + inner + '</div>';
  }
  var SW = 1680, SH = 677, BOX = { x: 120, y: 152, w: 1680, h: 677 };
  // posiciona um espaço de captura pelo retângulo (x, y, largura) do palco
  function slotAt(el, x, y, w, a, extra) {
    F.tf(el, 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + (w / SW).toFixed(5) + ')' + (extra || ''));
    F.op(el, a);
    F.vis(el, a > .002);
  }
  // retângulo cheio com leve empurrão de câmera (k 0..1 → escala 1..1+z), centrado
  function slotFull(el, a, z, k, dx) {
    var s = 1 + (z || .04) * (k || 0);
    var w = BOX.w * s, h = BOX.h * s;
    slotAt(el, BOX.x + (BOX.w - w) / 2 + (dx || 0), BOX.y + (BOX.h - h) / 2, w, a);
  }

  /* ---------- ícones ---------- */
  var ICON = {
    busca: '<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5"/>',
    leitor: '<path d="M4 5h11l3 5-3 2H9l-1 7H5l1-7H4z"/><path d="M18 10h3"/>',
    carrinho: '<path d="M3 4h2l2.4 10.5h10.8L20.5 7H6.3"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    caixa: '<rect x="3" y="10" width="18" height="10" rx="2"/><path d="M6 10V5h12v5M9 14h6"/>',
    impressora: '<path d="M7 9V3h10v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>'
  };
  function icon(n, sw) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (sw || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>';
  }

  /* ---------- guia de locução (prévia) ---------- */
  var GUIA = /[?&]guia=1/.test(location.search);
  var FALAS = [
    [0.8, 4.6, 'Seu cliente não precisa carregar tudo até o balcão para fazer uma compra.'],
    [5.0, 8.4, 'E sua loja não pode perder tempo procurando cada produto.'],
    [9.6, 16.8, 'No PDV Rápido do Turium, você busca o produto pelo nome ou código, informa a quantidade e adiciona direto à compra.'],
    [20.4, 26.4, 'E, quando o produto está no balcão, um leitor de código de barras compatível agiliza o registro.'],
    [30.6, 34.2, 'O vendedor monta o pedido e envia para o caixa.'],
    [34.6, 38.8, 'Tudo organizado para o responsável concluir o pagamento.'],
    [41.6, 45.2, 'Finalize a venda e imprima o comprovante não fiscal.'],
    [45.8, 51.2, 'A emissão de NF-e e NFC-e virá como módulo fiscal opcional, nos planos Pro e Enterprise.'],
    [52.6, 58.4, 'Mais agilidade para a equipe. Mais praticidade para o cliente. Turium: seu balcão preparado para vender.']
  ];

  F.p4 = { CAPS: CAPS, slotHTML: slotHTML, slotAt: slotAt, slotFull: slotFull, BOX: BOX, SW: SW, SH: SH, icon: icon, FALAS: FALAS, GUIA: GUIA };

  /* ======================================================================
     1 · O PROBLEMA (0 – 9)
     Planta isométrica da loja (ilustração própria). Os itens acendem, o caminho longo até o caixa
     aparece e se desfaz; a câmera desce até o balcão e entra no monitor.
     ====================================================================== */
  var A = 38, OX = 846, OY = 190;
  function iso(x, y, z) { return [OX + (x - y) * A, OY + (x + y) * A / 2 - (z || 0) * A * .92]; }
  function pts(list) { return list.map(function (p) { var q = iso(p[0], p[1], p[2]); return q[0].toFixed(1) + ',' + q[1].toFixed(1); }).join(' '); }
  function boxSVG(x, y, z, w, d, h, c, extra) {
    var top = pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]]);
    var fl = pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]]);   // face voltada à esquerda-frente
    var fr = pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]]);   // face voltada à direita-frente
    return '<polygon points="' + fl + '" fill="' + c[1] + '"/><polygon points="' + fr + '" fill="' + c[2] + '"/>' +
      '<polygon points="' + top + '" fill="' + c[0] + '"/>' + (extra || '');
  }
  var C_SHELF = ['#2A3038', '#1D2228', '#171B20'], C_BAG = ['#4A4E52', '#383C40', '#2E3135'], C_CNT = ['#2F363F', '#22272E', '#1A1E23'];
  function shelfLines(x, y, w, d, h) {
    var s = '';
    [0.75, 1.5].forEach(function (z) { var a = iso(x, y + d, z), b = iso(x + w, y + d, z); s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#3A414A" stroke-width="2"/>'; });
    return s;
  }
  var MON = (function () { var c = iso(6, 10.2, 1.1 + 1.25); return { x: c[0] - 62, y: c[1] - 25, w: 124, h: 50 }; })();   // tela 2560×1032 em miniatura
  var POINTS = [
    { ref: 'pc', l: 'Cimento', p: [3.2, 2.3, 1.9] }, { ref: 'pt', l: 'Tubos', p: [11, 2.0, 2.6] },
    { ref: 'po', l: 'Conexões', p: [13.2, 5.4, 2.6] }, { ref: 'pf', l: 'Ferramentas', p: [18.1, 8, 2.3] }
  ];
  var WALK = [[5, 12.8], [7.2, 8.4], [4.8, 6.4], [4, 5.2], [7, 4.0], [11, 3.9], [14, 3.9], [16.6, 4.2], [16.8, 7], [16.9, 9.4], [15.2, 12.6], [14.2, 13.4]];
  // câmera da cena 1: centro (em coordenadas da planta) e escala
  function cam1(t) {
    var s, k;
    if (t < 6.6) { s = 1; k = 0; }
    else if (t < 8.6) { k = E.inOut(F.p(t, 6.6, 8.6)); s = F.lerp(1, 1.6, k); }
    else { k = 1; s = Math.exp(F.lerp(Math.log(1.6), Math.log(6.15), E.in(F.p(t, 8.6, 9.0)))); }
    var mx = MON.x + MON.w / 2, my = MON.y + MON.h / 2;
    var cx = F.lerp(960, mx, k), cy = F.lerp(500, my, k);
    return { s: s, tx: 960 - cx * s, ty: 500 - cy * s };
  }
  F.p4.MONEND = (function () { var c = cam1(9.0); return { x: c.tx + MON.x * c.s, y: c.ty + MON.y * c.s, w: MON.w * c.s }; })();

  F.scene({
    name: 'O problema', start: 0, dur: 9.0,
    build: function (el) {
      var s = '<svg class="fx" data-r="plan" viewBox="0 0 1920 1080" style="transform-origin:0 0">';
      // piso e paredes
      s += '<polygon points="' + pts([[0, 0, 0], [20, 0, 0], [20, 14, 0], [0, 14, 0]]) + '" fill="#101418" stroke="#2B3139" stroke-width="2"/>';
      for (var gx = 2; gx < 20; gx += 2) { var a = iso(gx, 0, 0), b = iso(gx, 14, 0); s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="#171C21" stroke-width="1.5"/>'; }
      for (var gy = 2; gy < 14; gy += 2) { var c = iso(0, gy, 0), d = iso(20, gy, 0); s += '<line x1="' + c[0] + '" y1="' + c[1] + '" x2="' + d[0] + '" y2="' + d[1] + '" stroke="#171C21" stroke-width="1.5"/>'; }
      s += '<polygon points="' + pts([[0, 0, 0], [20, 0, 0], [20, 0, 3.4], [0, 0, 3.4]]) + '" fill="#13171C" stroke="#2B3139" stroke-width="1.5"/>';
      s += '<polygon points="' + pts([[0, 0, 0], [0, 14, 0], [0, 14, 3.4], [0, 0, 3.4]]) + '" fill="#161B20" stroke="#2B3139" stroke-width="1.5"/>';
      // caminho longo (desenhado por máscara e depois dissolvido)
      var path = 'M' + WALK.map(function (p) { var q = iso(p[0], p[1], .02); return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join(' L');
      s += '<defs><mask id="m4walk" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><path data-r="wm" d="' + path + '" fill="none" stroke="#fff" stroke-width="16" stroke-linecap="round" stroke-linejoin="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/></mask></defs>';
      s += '<path data-r="walk" d="' + path + '" fill="none" stroke="#F3B61F" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 13" mask="url(#m4walk)" opacity=".85"/>';
      // depósito: pilhas de sacos de cimento sobre paletes
      [[1.2, 1.2], [3.7, 1.2], [1.2, 3.4]].forEach(function (p) {
        s += boxSVG(p[0], p[1], 0, 2.2, 1.8, .22, ['#3A2F22', '#2C241A', '#231D15']);
        for (var k = 0; k < 4; k++) s += boxSVG(p[0] + .1, p[1] + .1, .22 + k * .38, 2.0, 1.6, .36, C_BAG);
      });
      // gôndolas de tubos e conexões
      s += boxSVG(8, 1.4, 0, 7.8, 1.2, 2.4, C_SHELF, shelfLines(8, 1.4, 7.8, 1.2, 2.4));
      s += boxSVG(8, 4.8, 0, 7.8, 1.2, 2.4, C_SHELF, shelfLines(8, 4.8, 7.8, 1.2, 2.4));
      // expositor de ferramentas
      s += boxSVG(17.6, 5.6, 0, .9, 5.0, 2.9, ['#2A3038', '#20252B', '#1A1E23']);
      // caixa (fundo) e balcão (frente)
      s += boxSVG(12.4, 10.6, 0, 3.4, 1.4, 1.1, C_CNT);
      s += boxSVG(13.2, 10.85, 1.1, 1.2, .9, .55, ['#3A414A', '#2B3139', '#23282E']);
      var lc = iso(14.6, 12.0, 1.1);
      s += '<text x="' + (lc[0] + 40) + '" y="' + (lc[1] + 36) + '" fill="#858E98" style="font:600 16px var(--font-mono);letter-spacing:.16em">CAIXA</text>';
      s += boxSVG(3, 10, 0, 6.4, 1.4, 1.1, C_CNT);
      // monitor do balcão (tela = miniatura 2560×1032)
      var ms = iso(6, 10.2, 1.1);
      s += '<rect x="' + (ms[0] - 6) + '" y="' + (MON.y + MON.h) + '" width="12" height="' + (ms[1] - MON.y - MON.h) + '" fill="#2B3139"/>';
      s += '<rect x="' + (MON.x - 7) + '" y="' + (MON.y - 7) + '" width="' + (MON.w + 14) + '" height="' + (MON.h + 14) + '" rx="5" fill="#1B2027" stroke="#3A414A" stroke-width="2"/>';
      s += '<rect data-r="scr" x="' + MON.x + '" y="' + MON.y + '" width="' + MON.w + '" height="' + MON.h + '" fill="#0D1114" stroke="rgba(243,182,31,.55)" stroke-width="1.5" stroke-dasharray="4 3"/>';
      s += '<text x="' + (MON.x + MON.w / 2) + '" y="' + (MON.y + MON.h / 2 + 6) + '" text-anchor="middle" fill="#D7DBDF" style="font:800 18px var(--font-display)">C01</text>';
      // pessoas (silhuetas simples): vendedor atrás do balcão, cliente na frente
      function person(x, y, col) {
        var p = iso(x, y, 0);
        return '<rect x="' + (p[0] - 13) + '" y="' + (p[1] - 66) + '" width="26" height="54" rx="13" fill="' + col + '"/><circle cx="' + p[0] + '" cy="' + (p[1] - 80) + '" r="12" fill="' + col + '"/>';
      }
      s += person(7, 9.0, '#4A525C');
      s += person(5, 12.8, '#6F7882');
      // pontos dourados dos itens do pedido
      POINTS.forEach(function (pt) {
        var q = iso(pt.p[0], pt.p[1], pt.p[2]);
        s += '<g data-r="' + pt.ref + '" style="transform-box:fill-box;transform-origin:50% 50%"><circle cx="' + q[0] + '" cy="' + q[1] + '" r="26" fill="rgba(243,182,31,.16)"/><circle cx="' + q[0] + '" cy="' + q[1] + '" r="10" fill="#F3B61F"/></g>';
      });
      s += '</svg>';
      var h = s;
      POINTS.forEach(function (pt) { var q = iso(pt.p[0], pt.p[1], pt.p[2]); h += '<div class="pt-lbl" data-r="' + pt.ref + 'l" style="left:' + q[0] + 'px;top:' + (q[1] - 34) + 'px">' + pt.l + '</div>'; });
      h += '<div class="illus" data-r="il" style="right:64px;top:40px">Ilustração · loja fictícia</div>';
      h += H.cap('c1', 'NÃO PRECISA TRAZER <span class="gold">TUDO ATÉ O CAIXA.</span>', 160, 930);
      el.innerHTML = h;
      var c = F.refs(el);
      Object.assign(c, F.refs(c.plan));
      return c;
    },
    render: function (t, c) {
      var cm = cam1(t);
      var rise = E.out(F.p(t, 0, 1.1));
      F.tf(c.plan, 'translate3d(' + cm.tx.toFixed(2) + 'px,' + (cm.ty + (1 - rise) * 40).toFixed(2) + 'px,0) scale(' + cm.s.toFixed(5) + ')');
      F.op(c.plan, rise);
      // itens acendem em sequência (0,25 s entre eles) e pulsam
      POINTS.forEach(function (pt, i) {
        var a = 1.0 + i * .25, k = E.out(F.p(t, a, a + .35));
        var pulse = 1 + .12 * Math.sin((t - a) * 5.2) * F.clamp(t - a, 0, 1);
        var fade = 1 - F.p(t, 6.4, 7.0);
        F.op(c[pt.ref], k * fade);
        F.tf(c[pt.ref], 'scale(' + ((.4 + .6 * k) * pulse).toFixed(3) + ')');
        var q = iso(pt.p[0], pt.p[1], pt.p[2]);
        var X = cm.tx + q[0] * cm.s, Y = cm.ty + q[1] * cm.s + (1 - rise) * 40;
        F.css(c[pt.ref + 'l'], 'left', F.px(X)); F.css(c[pt.ref + 'l'], 'top', F.px(Y - 34));
        F.op(c[pt.ref + 'l'], E.out(F.p(t, a + .15, a + .55)) * fade);
      });
      // caminho longo: desenha 2,0–4,4 s; para; se desfaz 4,6–5,6 s
      attr(c.wm, 'stroke-dashoffset', (1 - E.inOut(F.p(t, 2.0, 4.4))).toFixed(4));
      attr(c.walk, 'opacity', (.85 * (1 - E.inOut(F.p(t, 4.6, 5.6)))).toFixed(3));
      F.op(c.il, (1 - F.p(t, 6.0, 6.6)) * rise);
      F.line(c.c1, t, 1.2, 6.2, .8, .5);
    }
  });

  /* ======================================================================
     2 · ENCONTRE E ADICIONE (9 – 20)
     Entramos pela tela do monitor. Capturas C02 → C04 → C03 → C05; F3, digitação e o item
     indo para "Sua venda" são anotações sobre a tela real.
     ====================================================================== */
  var S2 = [['s2a', 'C02', 0, 4.0], ['s2b', 'C04', 4.0, 6.2], ['s2c', 'C03', 6.2, 8.4], ['s2d', 'C05', 8.4, 11.0]];
  F.scene({
    name: 'Encontre e adicione', start: 9.0, dur: 11.0,
    build: function (el) {
      var h = '';
      S2.forEach(function (s) { h += slotHTML(s[0], s[1]); });
      h += '<div class="who" data-r="who"><i></i>PDV Rápido · Pedro · Vendedor</div>';
      h += '<div class="key" data-r="f3">F3</div>';
      h += '<div class="qry" data-r="q"><small>Busca</small><b data-r="qt"></b><span class="caret" data-r="qc"></span></div>';
      h += '<div class="flyer" data-r="fl1">' + icon('plus', 2.4) + 'Cimento CP-II 50 kg</div>';
      h += '<div class="flyer" data-r="fl2">' + icon('plus', 2.4) + 'Tubo PVC</div>';
      h += '<div class="note4" data-r="n1">→ Sua venda</div>';
      h += '<div class="note4" data-r="n2">Quantidade e total · valores da captura real</div>';
      h += '<div class="cap" style="left:160px;top:930px"><div class="ln" data-r="w1" style="display:inline-block"><span>BUSQUE.</span></div> ' +
        '<div class="ln" data-r="w2" style="display:inline-block"><span>SELECIONE.</span></div> ' +
        '<div class="ln" data-r="w3" style="display:inline-block"><span class="gold">ADICIONE.</span></div></div>';
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var M = F.p4.MONEND;
      // entrada pelo monitor: a miniatura cresce até o quadro
      var g = E.inOut(F.p(t, 0, .75));
      S2.forEach(function (s, i) {
        var el = c[s[0]], a0 = s[2], a1 = s[3];
        var a = i === 0 ? 1 : E.out(F.p(t, a0 - .25, a0 + .2));
        var on = t >= a0 - .25 && t < a1 + .2;
        var k = F.p(t, a0, a1);
        if (i === 0 && t < .75) {
          var w = F.lerp(M.w, BOX.w, g), h = w * SH / SW;
          var cx = F.lerp(M.x + M.w / 2, BOX.x + BOX.w / 2, g), cy = F.lerp(M.y + M.w * SH / SW / 2, BOX.y + BOX.h / 2, g);
          slotAt(el, cx - w / 2, cy - h / 2, w, 1);
        } else slotFull(el, on ? a : 0, .035, k);
      });
      place(c.who, 120, 100, E.out(F.p(t, .7, 1.1)), false);
      // F3 e a digitação
      var kf = F.inout(t, .9, .3, 3.4, .3);
      F.tf(c.f3, 'translateY(' + ((1 - kf) * 16 + (t > 1.0 && t < 1.18 ? 6 : 0)).toFixed(1) + 'px)');
      F.css(c.f3, 'left', '1520px'); F.css(c.f3, 'top', '700px');
      F.op(c.f3, kf); F.vis(c.f3, kf > .002);
      c.f3.classList.toggle('on', t > 1.0 && t < 3.4);
      var word = 'Cimento CP-II', n = Math.round(word.length * F.p(t, 1.4, 2.6));
      F.txt(c.qt, word.slice(0, n));
      var kq = F.inout(t, 1.2, .35, 3.6, .3);
      place(c.q, 1000, 708, kq, false);
      F.op(c.qc, (Math.floor(t * 2.4) % 2) ? 1 : .15);
      // o item "voa" para Sua venda (arco de 0,5 s)
      function fly(el, a, x0, y0, x1, y1) {
        var p = E.inOut(F.p(t, a, a + .5)), x = F.lerp(x0, x1, p), y = F.lerp(y0, y1, p) - Math.sin(p * Math.PI) * 120;
        var al = F.p(t, a - .15, a) * (1 - F.p(t, a + .55, a + .8));
        F.tf(el, 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + (1 - .25 * p).toFixed(3) + ')');
        F.op(el, al); F.vis(el, al > .002);
      }
      fly(c.fl1, 3.4, 640, 470, 1430, 300);
      fly(c.fl2, 6.9, 640, 470, 1430, 330);
      place(c.n1, 1460, 250, F.inout(t, 3.6, .3, 4.6, .3), false);
      place(c.n2, 160, 856, F.inout(t, 8.7, .4, 10.5, .3), false);
      F.line(c.w1, t, 1.2, 10.4, .7, .45);
      F.line(c.w2, t, 2.8, 10.45, .7, .45);
      F.line(c.w3, t, 3.6, 10.5, .7, .45);
    }
  });

  /* ======================================================================
     3 · LEITOR DE CÓDIGO DE BARRAS (20 – 30)
     Ilustração do leitor (equipamento compatível) alternando com o efeito real no PDV (C06, C07).
     ====================================================================== */
  // leitor de mão + etiqueta de uma conexão (ilustração própria, sem marca)
  function scannerSVG() {
    var bars = '', x = 0;
    var W = [3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 1, 2, 2, 1, 3, 1, 1, 2, 1, 1, 3, 2, 1, 2];
    W.forEach(function (w, i) { if (i % 2 === 0) bars += '<rect x="' + (x * 6) + '" y="0" width="' + (w * 6) + '" height="150" fill="#14181D"/>'; x += w; });
    return '<svg class="fx" data-r="sc" viewBox="0 0 1920 1080">' +
      // conexão (joelho de PVC) com etiqueta
      '<g transform="translate(330 330)"><path d="M0 120h240a90 90 0 0 1 90 90v260" fill="none" stroke="#C9CDD2" stroke-width="120" stroke-linecap="butt"/>' +
      '<path d="M0 120h240a90 90 0 0 1 90 90v260" fill="none" stroke="#E4E6E8" stroke-width="84"/>' +
      '<rect x="-30" y="40" width="60" height="160" rx="10" fill="#B9BEC4"/><rect x="270" y="450" width="160" height="60" rx="10" fill="#B9BEC4"/></g>' +
      '<g transform="translate(470 360) rotate(-4)"><rect x="-26" y="-26" width="' + (x * 6 + 52) + '" height="232" rx="12" fill="#F4F2EE"/>' +
      '<g data-r="bars">' + bars + '</g><rect x="0" y="160" width="' + (x * 6) + '" height="14" rx="4" fill="#C9CDD2"/></g>' +
      // feixe vermelho estilizado
      '<polygon data-r="beam" points="1290,520 760,430 760,560" fill="rgba(229,96,90,.22)"/>' +
      '<line data-r="ray" x1="440" y1="0" x2="900" y2="0" stroke="#FF5A50" stroke-width="5" style="filter:drop-shadow(0 0 10px rgba(255,90,80,.9))"/>' +
      // leitor de mão
      '<g data-r="gun" transform="translate(1250 400)"><path d="M0 60 L320 0 Q380 -8 392 50 L404 140 Q408 176 372 182 L210 196 L250 470 Q256 506 220 512 L160 518 Q126 520 120 486 L80 210 L20 214 Q-14 214 -10 180 Z" fill="#2B3139" stroke="#4A525C" stroke-width="4"/>' +
      '<path d="M-8 72 L40 66 L56 200 L8 206 Z" fill="#E5605A" opacity=".9"/><rect x="200" y="40" width="120" height="16" rx="8" fill="#F3B61F"/></g>' +
      '</svg>';
  }
  var CUTS3 = [  // [início, fim, tipo] em tempo local
    [0, 1.8, 'L'], [1.8, 4.0, 'C06'], [4.0, 4.8, 'L'], [4.8, 6.6, 'C07'], [6.6, 7.4, 'L'], [7.4, 10.0, 'C07']
  ];
  var BEEPS3 = [.9, 4.35, 6.95];
  F.scene({
    name: 'Leitor de código de barras', start: 20.0, dur: 10.0,
    build: function (el) {
      var h = '<div class="fill" data-r="L">' + scannerSVG() + '<div class="illus" style="right:64px;top:40px">Ilustração · leitor de código de barras compatível</div></div>';
      h += slotHTML('c6', 'C06') + slotHTML('c7', 'C07');
      h += '<div class="who" data-r="who"><i></i>PDV Rápido · Pedro · Vendedor</div>';
      h += '<div class="flyer" data-r="fl">' + icon('plus', 2.4) + 'Conexão</div>';
      h += H.cap('c1', 'DIGITE <span class="muted">OU</span> <span class="gold">ESCANEIE.</span>', 160, 930);
      el.innerHTML = h;
      var c = F.refs(el);
      Object.assign(c, F.refs(c.sc));
      return c;
    },
    render: function (t, c) {
      var cur = CUTS3[0];
      CUTS3.forEach(function (k) { if (t >= k[0]) cur = k; });
      var isL = cur[2] === 'L';
      F.op(c.L, isL ? 1 : 0); F.vis(c.L, isL);
      var lt = t - cur[0];
      // leitor: leve aproximação a cada corte; feixe varre a etiqueta em 0,4 s
      F.tf(c.gun, 'translate(' + (1250 - lt * 14).toFixed(1) + 'px,' + (400 + Math.sin(lt * 3) * 4).toFixed(1) + 'px)');
      var b = null; BEEPS3.forEach(function (x) { if (t >= x - .3 && t < x + .5) b = x; });
      var sweep = b === null ? -1 : F.p(t, b - .3, b + .1);
      attr(c.ray, 'transform', 'translate(0 ' + (360 + 150 * (sweep < 0 ? 0 : sweep)).toFixed(1) + ') rotate(-4 470 0)');
      attr(c.ray, 'opacity', sweep < 0 || sweep >= 1 ? '0' : '1');
      attr(c.beam, 'opacity', b === null ? '0' : (1 - F.p(t, b + .1, b + .5)).toFixed(3));
      attr(c.bars, 'opacity', b !== null && t > b - .05 && t < b + .25 ? '.55' : '1');
      // telas reais (C06, C07) com empurrão suave; a última puxa a tela para a cena 4
      F.op(c.c6, 0); F.vis(c.c6, false); F.op(c.c7, 0); F.vis(c.c7, false);
      if (!isL) {
        var el = cur[2] === 'C06' ? c.c6 : c.c7;
        slotFull(el, 1, .03, F.p(t, cur[0], cur[1]));
      }
      place(c.who, 120, 100, isL ? 0 : 1, false);
      // item escaneado cai no carrinho com um leve salto
      var drop = (t >= 4.8 && t < 5.8) ? 4.85 : (t >= 7.4 && t < 8.4 ? 7.45 : null);
      if (drop !== null) {
        var p = E.out(F.p(t, drop, drop + .45)), y = F.lerp(220, 330, p) - Math.sin(F.p(t, drop + .3, drop + .6) * Math.PI) * 18;
        var al = F.p(t, drop, drop + .1) * (1 - F.p(t, drop + .7, drop + .95));
        F.tf(c.fl, 'translate3d(1420px,' + y.toFixed(1) + 'px,0)'); F.op(c.fl, al); F.vis(c.fl, al > .002);
      } else { F.op(c.fl, 0); F.vis(c.fl, false); }
      F.line(c.c1, t, .4, 9.3, .7, .45);
    }
  });
})();
