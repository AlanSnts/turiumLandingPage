/* Turium — filme 3, cenas 4–6.
   Cenas 4 e 5 mostram um CONCEITO DE FUNCIONALIDADE FUTURA (vínculo pedido → funcionário → veículo,
   registro de saída e apoio à investigação de ocorrências). Ficam marcadas assim na tela o tempo todo.
   Nomes, pedidos e veículos dessas cenas são fictícios. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, IMG = H.IMG;
  var cap = H.cap, place = H.place, attr = H.attr;
  var icon = F.p3.icon, ICON = F.p3.ICON;

  ICON.user = '<circle cx="12" cy="8" r="3.6"/><path d="M5 20c.8-3.6 3.6-5.6 7-5.6s6.2 2 7 5.6"/>';
  ICON.alert = '<path d="M12 3.5 21 19H3z"/><path d="M12 10v4.2M12 16.8v.01"/>';
  ICON.van = '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7z"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>';

  var VAN = '<svg viewBox="0 0 150 96" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' +
    '<path d="M8 72V22h82v50M90 36h26l22 20v16H90"/><path d="M98 42h14l12 12H98z"/><path d="M8 72h12M48 72h50M126 72h12"/>' +
    '<circle cx="34" cy="74" r="11"/><circle cx="112" cy="74" r="11"/></svg>';
  var MOTO = '<svg viewBox="0 0 150 96" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" aria-hidden="true">' +
    '<circle cx="30" cy="68" r="17"/><circle cx="120" cy="68" r="17"/><path d="M30 68l28-26h34l28 26"/><path d="M92 42l-10-18H68M58 42l-8-10H36M58 68h44"/></svg>';
  var FUT = '<div class="future" data-r="fut"><i></i>Conceito de funcionalidade futura</div>';

  function crit(ref, rows, x, y) {
    return '<div class="crit" data-r="' + ref + '" style="left:' + x + 'px;top:' + y + 'px">' + rows.map(function (r, i) {
      return '<div class="' + (r[1] ? 'y' : 'n') + '" data-r="' + ref + i + '"><i>' + icon(r[1] ? 'check' : 'cross', 2.4) + '</i>' + r[0] + '</div>';
    }).join('') + '</div>';
  }
  function curve(x1, y1, x2, y2) {
    var mx = (x1 + x2) / 2;
    return 'M' + x1 + ' ' + y1 + 'C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2;
  }
  function drawPath(el, t, a, b, op) {
    attr(el, 'stroke-dashoffset', (1 - E.inOut(F.p(t, a, b))).toFixed(3));
    attr(el, 'opacity', op.toFixed(3));
  }

  /* ======================================================================
     4 · PROCESSOS E LOGÍSTICA (33.0 – 45.4) — conceito
     ====================================================================== */
  F.scene({
    name: 'Logística (conceito)', start: 33.0, dur: 12.4,
    build: function (el) {
      var h = FUT + '<div class="zw">';
      h += '<svg class="fx" data-r="ov" viewBox="0 0 1920 1080">' +
        '<path data-r="la" d="' + curve(770, 330, 950, 300) + '" fill="none" stroke="#5CC98A" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<path data-r="lb" d="' + curve(770, 330, 950, 600) + '" fill="none" stroke="#E5605A" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<path data-r="lc" d="' + curve(770, 680, 950, 600) + '" fill="none" stroke="#5CC98A" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<path data-r="n1" d="M700 380H860" fill="none" stroke="#F3B61F" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<path data-r="n2" d="M1060 380H1220" fill="none" stroke="#F3B61F" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<path data-r="n3" d="M960 436V470" fill="none" stroke="#F3B61F" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '</svg>';
      h += '<div class="lcard" data-r="oa" style="left:320px;top:230px;width:450px"><div class="k">Pedido de entrega</div><h5>PED-000014</h5>' +
        '<p>Cimento CP-II 50 kg × 20</p><div class="meta"><span class="pill">1.000 kg</span><span class="pill">6,2 km</span></div></div>';
      h += '<div class="lcard" data-r="ob" style="left:320px;top:580px;width:450px"><div class="k">Pedido de entrega</div><h5>PED-000015</h5>' +
        '<p>Registro de esfera + 2 conexões</p><div class="meta"><span class="pill">3 kg</span><span class="pill">2,1 km</span></div></div>';
      h += '<div class="veh" data-r="va" style="left:950px;top:185px">' + VAN + '<b>Utilitário</b><small>Carga até 1.500 kg</small></div>';
      h += '<div class="veh" data-r="vm" style="left:950px;top:485px">' + MOTO + '<b>Motocicleta</b><small>Volumes pequenos</small></div>';
      h += crit('ca', [['Carga: 1.000 kg', 1], ['Percurso: 6,2 km', 1], ['Viável para o pedido', 1]], 1300, 215);
      h += crit('cm', [['PED-000014: carga incompatível', 0], ['PED-000015: 3 kg · 2,1 km', 1], ['Viável para o pedido pequeno', 1]], 1300, 515);
      h += '<div class="note3" data-r="nt" style="left:320px;top:820px;font-size:19px">O veículo depende da carga, do percurso e da viabilidade de cada entrega.</div>';
      // corrente PEDIDO → FUNCIONÁRIO → VEÍCULO
      h += '<div class="node3" data-r="nd0" style="left:600px;top:300px"><div class="ic">' + icon('pedido', 1.6) + '</div><b>Pedido</b><span>PED-000014</span></div>';
      h += '<div class="node3" data-r="nd1" style="left:960px;top:300px"><div class="ic">' + icon('user', 1.6) + '</div><b>Funcionário</b><span>Carlos Souza</span></div>';
      h += '<div class="node3" data-r="nd2" style="left:1320px;top:300px"><div class="ic">' + icon('van', 1.6) + '</div><b>Veículo</b><span>Utilitário 01</span></div>';
      h += '<div class="reg" data-r="reg" style="left:640px;top:470px"><div class="k">Registro de saída</div>' +
        '<div class="row"><span>Pedido</span><b>PED-000014</b></div><div class="row"><span>Responsável</span><b>Carlos Souza · entregador</b></div>' +
        '<div class="row"><span>Veículo</span><b>Utilitário 01</b></div><div class="row"><span>Data e horário</span><b>08/10/2026 · 08:12</b></div></div>';
      h += '</div><div class="shade-b" data-r="shade"></div>';
      h += cap('c1', 'CADA OPERAÇÃO. <span class="gold">MAIS CONTROLE.</span>', 160, 920, 60);
      el.innerHTML = h;
      var c = F.refs(el);
      Object.assign(c, F.refs(c.ov));
      return c;
    },
    render: function (t, c) {
      var out = 1 - E.inOut(F.p(t, 11.9, 12.4));
      F.op(c.fut, E.out(F.p(t, .2, .7)) * out);
      // fase 1–2: escolha do veículo
      var p1 = 1 - E.inOut(F.p(t, 6.2, 6.9));
      place(c.oa, 320, 230, E.out(F.p(t, .3, .9)) * p1);
      place(c.va, 950, 185, E.out(F.p(t, 1.1, 1.6)) * p1);
      c.va.classList.toggle('sel', t > 2.3);
      drawPath(c.la, t, 1.5, 2.1, p1);
      [0, 1, 2].forEach(function (i) { F.op(c['ca' + i], E.out(F.p(t, 2.0 + i * .18, 2.4 + i * .18)) * p1); });
      place(c.vm, 950, 485, E.out(F.p(t, 3.0, 3.5)) * p1);
      drawPath(c.lb, t, 3.3, 3.9, p1 * (1 - .6 * F.p(t, 4.4, 4.8)));
      F.op(c.cm0, E.out(F.p(t, 3.8, 4.2)) * p1);
      place(c.ob, 320, 580, E.out(F.p(t, 4.4, 5.0)) * p1);
      drawPath(c.lc, t, 4.9, 5.5, p1);
      c.vm.classList.toggle('sel', t > 5.5);
      F.op(c.cm1, E.out(F.p(t, 5.3, 5.7)) * p1);
      F.op(c.cm2, E.out(F.p(t, 5.5, 5.9)) * p1);
      place(c.nt, 320, 820, F.inout(t, 4.6, .5, 6.2, .5));
      // fase 3: corrente
      [0, 1, 2].forEach(function (i) { place(c['nd' + i], [600, 960, 1320][i], 250, E.out(F.p(t, 6.9 + i * .35, 7.5 + i * .35)) * out, true); });
      drawPath(c.n1, t, 7.3, 7.8, out);
      drawPath(c.n2, t, 7.65, 8.15, out);
      // fase 4: registro de saída
      drawPath(c.n3, t, 8.5, 8.8, out);
      place(c.reg, 640, 470, E.out(F.p(t, 8.7, 9.3)) * out);
      F.op(c.shade, F.inout(t, 9.4, .5, 11.9, .5));
      F.line(c.c1, t, 9.6, 11.9, .75, .45);
    }
  });

  /* ======================================================================
     5 · RESPONSABILIDADE E RASTREABILIDADE (45.0 – 52.4) — conceito
     ====================================================================== */
  var TL = { x0: 260, x1: 1660, y: 400, h0: 8, h1: 10 };   // 08:00 → 10:00
  function tx(hh, mm) { return TL.x0 + ((hh - TL.h0) * 60 + mm) / ((TL.h1 - TL.h0) * 60) * (TL.x1 - TL.x0); }
  var EVS = [
    { ref: 'e0', h: 8, m: 12, tm: '08:12', ev: 'Saída registrada', by: 'Carlos Souza · Utilitário 01' },
    { ref: 'e1', h: 9, m: 5, tm: '09:05', ev: 'Entrega concluída', by: 'PED-000014' },
    { ref: 'e2', h: 9, m: 40, tm: '09:40', ev: 'Retorno registrado', by: 'Utilitário 01' }
  ];
  F.scene({
    name: 'Rastreabilidade (conceito)', start: 45.0, dur: 7.4,
    build: function (el) {
      var h = FUT + '<div class="zw">';
      h += '<svg class="fx" data-r="ov" viewBox="0 0 1920 1080">' +
        '<path data-r="axis" d="M' + TL.x0 + ' ' + TL.y + 'H' + TL.x1 + '" stroke="#3A414A" stroke-width="3" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1"/>' +
        '<path data-r="fl" d="' + 'M560 650C560 560 ' + tx(8, 57) + ' 520 ' + tx(8, 57) + ' ' + (TL.y + 14) + '" fill="none" stroke="#E5605A" stroke-width="3" stroke-dasharray="8 8" opacity="0"/>' +
        '<rect data-r="fm" x="-11" y="-11" width="22" height="22" fill="#E5605A" opacity="0" transform="translate(' + tx(8, 57) + ' ' + TL.y + ') rotate(45)"/>' +
        '</svg>';
      h += '<div class="note3" style="left:' + (TL.x0 - 20) + 'px;top:' + (TL.y + 24) + 'px" data-r="h8">08:00</div>';
      h += '<div class="note3" style="left:' + (TL.x1 - 40) + 'px;top:' + (TL.y + 24) + 'px" data-r="h10">10:00</div>';
      EVS.forEach(function (e) {
        h += '<div class="tl-ev" data-r="' + e.ref + '" style="left:' + tx(e.h, e.m) + 'px;top:' + (TL.y - 206) + 'px">' +
          '<div class="tm">' + e.tm + '</div><div class="ev">' + e.ev + '</div><div class="by">' + e.by + '</div><div style="height:26px"></div><div class="dot"></div></div>';
      });
      h += '<div class="span3" data-r="sp" style="left:' + tx(8, 12) + 'px;top:' + (TL.y + 6) + 'px;width:' + (tx(9, 40) - tx(8, 12)) + 'px"><b>Período da saída: 08:12 – 09:40</b></div>';
      h += '<div class="fine" data-r="fine" style="left:300px;top:640px"><div class="k">' + icon('alert', 2) + 'Notificação de multa</div>' +
        '<h5>Utilitário 01</h5><p>08/10/2026 às 08:57 · ocorrência ilustrativa</p></div>';
      h += '<div class="lcard" data-r="rel" style="left:1000px;top:640px;width:620px;padding:22px 26px"><div class="k">Relação registrada</div>' +
        '<p style="margin-top:12px;color:#F4F2EE">Utilitário 01 · PED-000014 · Carlos Souza · saída 08:12–09:40</p>' +
        '<p style="font-size:16px">Apoio à investigação: o registro não é prova automática de autoria.</p></div>';
      h += '</div><div class="shade-b" data-r="shade"></div>';
      h += '<div class="slogan" style="top:532px;font-size:46px"><div class="ln" data-r="c1" style="display:inline-block"><span>INFORMAÇÃO QUE AJUDA A <span class="gold">IDENTIFICAR RESPONSABILIDADES.</span></span></div></div>';
      el.innerHTML = h;
      var c = F.refs(el);
      Object.assign(c, F.refs(c.ov));
      return c;
    },
    render: function (t, c) {
      var out = 1 - E.inOut(F.p(t, 6.9, 7.4));
      F.op(c.fut, out);
      drawPath(c.axis, t, .1, .9, out);
      F.op(c.h8, E.out(F.p(t, .3, .7)) * out); F.op(c.h10, E.out(F.p(t, .6, 1.0)) * out);
      EVS.forEach(function (e, i) { place(c[e.ref], tx(e.h, e.m), TL.y - 206, E.out(F.p(t, .5 + i * .3, 1.0 + i * .3)) * out, true); });
      // ocorrência (multa) chega depois e é ligada ao período da saída
      var fa = E.out(F.p(t, 1.9, 2.4)) * out;
      place(c.fine, 300, 650, fa);
      attr(c.fl, 'opacity', (F.inout(t, 2.4, .4, 3.7, .3) * out).toFixed(3));
      attr(c.fm, 'opacity', (E.out(F.p(t, 2.5, 2.8)) * out).toFixed(3));
      var sp = E.out(F.p(t, 2.9, 3.5)) * out;
      F.op(c.sp, sp);
      F.tf(c.sp, 'scaleX(' + (.2 + .8 * sp).toFixed(3) + ')');
      place(c.rel, 1000, 650, E.out(F.p(t, 3.4, 3.9)) * out);
      F.op(c.shade, 0);
      F.line(c.c1, t, 4.0, 6.9, .7, .45);
    }
  });

  /* ======================================================================
     6 · ENCERRAMENTO (52.0 – 59.5)
     Os elementos do filme se reorganizam; as linhas viram o logotipo.
     ====================================================================== */
  var TW = 440, TH = 270, GX = 260, GY = 190, GAP = 40;
  var TILES = [
    { ref: 't0', lbl: 'Dashboard', kind: 'dash' },
    { ref: 't1', lbl: 'Gráfico 3D', kind: 'sky' },
    { ref: 't2', lbl: 'Indicadores', kind: 'kpi' },
    { ref: 't3', lbl: 'Estoque', kind: 'stock' },
    { ref: 't4', lbl: 'Processos <em>· conceito</em>', kind: 'proc' },
    { ref: 't5', lbl: 'Responsabilidades <em>· conceito</em>', kind: 'resp' }
  ];
  function tilePos(i) { return [GX + (i % 3) * (TW + GAP), GY + Math.floor(i / 3) * (TH + GAP)]; }
  var FROM = [[-500, 120], [960, -420], [2300, 200], [-480, 700], [960, 1400], [2300, 760]];

  F.scene({
    name: 'Encerramento', start: 52.0, dur: 7.5,
    build: function (el) {
      var h = '<div class="layer3" data-r="grid">';
      TILES.forEach(function (tl, i) {
        var art = '';
        if (tl.kind === 'dash') art = '<div class="art" style="background:url(' + IMG + 'dashboard-dark.webp) no-repeat;background-size:' + (2560 * .2) + 'px ' + (1032 * .2) + 'px;background-position:-60px -28px"></div>';
        if (tl.kind === 'stock') art = '<div class="art" style="background:url(' + IMG + 'estoque.webp) no-repeat;background-size:' + (2560 * .2) + 'px ' + (1032 * .2) + 'px;background-position:-70px -40px"></div>';
        if (tl.kind === 'sky') art = '<canvas class="art" data-r="skc" width="440" height="222" style="width:440px;height:222px"></canvas>';
        if (tl.kind === 'kpi') art = '<div class="big">R$ 9.665,84</div><div class="sm">Vendas no mês · 9 vendas<br>Margem bruta 68,90%</div>';
        if (tl.kind === 'proc') art = '<div class="art" style="display:flex;align-items:center;justify-content:center;gap:18px;color:#F3B61F">' +
          ['pedido', 'user', 'van'].map(function (n, k) { return (k ? '<span style="width:34px;height:2px;background:#F3B61F"></span>' : '') + '<span style="width:64px;height:64px;display:grid;place-items:center;border:1.5px solid rgba(243,182,31,.55);border-radius:14px">' + icon(n, 1.6).replace('<svg ', '<svg style="width:32px;height:32px" ') + '</span>'; }).join('') + '</div>';
        if (tl.kind === 'resp') art = '<div class="art"><div style="position:absolute;left:30px;right:30px;top:110px;height:3px;background:#3A414A"></div>' +
          [70, 190, 300].map(function (x) { return '<i style="position:absolute;left:' + x + 'px;top:101px;width:20px;height:20px;background:#F3B61F;transform:rotate(45deg)"></i>'; }).join('') +
          '<i style="position:absolute;left:150px;top:150px;width:18px;height:18px;background:#E5605A;transform:rotate(45deg)"></i></div>';
        h += '<div class="tile" data-r="' + tl.ref + '">' + art + '<div class="tl">' + tl.lbl + '</div></div>';
      });
      h += '</div>';
      h += '<svg class="fx" data-r="ov" viewBox="0 0 1920 1080">';
      for (var i = 0; i < 6; i++) h += '<path data-r="gl' + i + '" fill="none" stroke="#F3B61F" stroke-width="2.5" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="filter:drop-shadow(0 0 8px rgba(243,182,31,.8))"/>';
      h += '</svg>';
      h += '<div class="logo" data-r="lg" style="position:absolute;left:560px;top:300px;width:800px">' + H.logoSVG('k') + '</div>';
      h += '<div class="sig" data-r="erp" style="top:470px;letter-spacing:.6em;font-size:26px">ERP</div>';
      h += '<div class="slogan" style="top:600px"><div class="ln" data-r="s1" style="display:inline-block"><span>O LUCRO COMEÇA QUANDO VOCÊ</span></div></div>';
      h += '<div class="slogan" style="top:670px"><div class="ln" data-r="s2" style="display:inline-block"><span><span class="gold">ENXERGA ONDE ESTÁ PERDENDO.</span></span></div></div>';
      h += '<div class="sig" data-r="sig" style="top:800px">Inteligência de negócios — Pro e Enterprise</div>';
      h += '<div class="fill" data-r="black" style="background:#000;opacity:0"></div>';
      el.innerHTML = h;
      var c = F.refs(el);
      Object.assign(c, F.refs(c.ov), F.refs(c.lg));
      // miniatura estática do skyline (mesmo motor, vista 3D)
      var sx = c.skc.getContext('2d');
      F.sky.draw(sx, { x: 6, y: 4, w: 428, h: 214, t: 1, font: 9, gutter: 0, bg: [20, 24, 29], fg: [244, 242, 238], accent: [243, 182, 31], labels: 0 });
      return c;
    },
    render: function (t, c) {
      // os blocos chegam das bordas e se organizam; a câmera se afasta
      var cam = F.lerp(1.1, .9, E.inOut(F.p(t, 0, 3.0)));
      F.tf(c.grid, 'scale(' + cam.toFixed(4) + ')');
      var gone = E.inOut(F.p(t, 2.3, 3.2));
      TILES.forEach(function (tl, i) {
        var p = tilePos(i), k = E.out(F.p(t, .05 + i * .1, 1.0 + i * .1));
        var x = F.lerp(FROM[i][0], p[0], k), y = F.lerp(FROM[i][1], p[1], k);
        // ao sair, cada bloco encolhe em direção ao logotipo
        x = F.lerp(x, 960 - TW / 2, gone * .55); y = F.lerp(y, 380 - TH / 2, gone * .55);
        F.tf(c[tl.ref], 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + (1 - .5 * gone).toFixed(3) + ')');
        F.op(c[tl.ref], Math.min(1, k * 1.4) * (1 - gone));
        // linhas de luz de cada bloco até o logotipo
        var cx = 960 + (p[0] + TW / 2 - 960) * cam, cy = 491 + (p[1] + TH / 2 - 491) * cam;
        attr(c['gl' + i], 'd', 'M' + cx.toFixed(1) + ' ' + cy.toFixed(1) + 'Q' + ((cx + 960) / 2).toFixed(1) + ' ' + (cy - 60).toFixed(1) + ' 960 380');
        attr(c['gl' + i], 'stroke-dashoffset', (1 - E.inOut(F.p(t, 1.9 + i * .05, 2.8 + i * .05))).toFixed(3));
        attr(c['gl' + i], 'opacity', (1 - E.inOut(F.p(t, 3.0, 3.6))).toFixed(3));
      });
      F.op(c.lg, 1);
      H.drawLogo(c, 'k', t, 2.9);
      F.op(c.erp, E.out(F.p(t, 3.8, 4.4)));
      F.line(c.s1, t, 4.2, 9.0, .8);
      F.line(c.s2, t, 4.4, 9.0, .8);
      F.op(c.sig, E.out(F.p(t, 5.2, 5.8)));
      F.op(c.black, E.inOut(F.p(t, 6.9, 7.5)));
    }
  });
})();
