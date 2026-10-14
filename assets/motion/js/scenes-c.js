/* Turium — cenas 9 a 12: equipe, claro ou escuro, gestão integrada, encerramento. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, IMG = H.IMG, CX = H.CX, CY = H.CY;
  var cap = H.cap, place = H.place, insetRect = H.insetRect;

  /* ======================================================================
     9 · EQUIPE (67.2 – 74.2)
     Fatias da tela real de Usuários: só Nome e Perfil (a coluna de login fica fora).
     ====================================================================== */
  var PEOPLE = [468, 388, 348, 308, 508, 268, 428];   // topo nativo de cada linha: Ricardo, Patrícia, Juliana, Fernanda, Rodrigo, Carlos, Rafael
  var RS = 1.8, ROW0 = 336, STEP = 82;
  F.scene({
    name: 'Equipe', start: 67.2, dur: 7.0,
    build: function (el) {
      var src = IMG + 'usuarios.webp';
      F.images.push(src);
      var h = '<div class="hline" data-r="line"></div>' +
        cap('c1', 'Cada funcionário no lugar certo.', 160, 168);
      PEOPLE.forEach(function (y, i) {
        h += '<div class="prow" data-r="p' + i + '" style="left:160px;top:' + (ROW0 + i * STEP) + 'px;height:' + (40 * RS) + 'px">' +
          '<i class="pin" data-r="pin' + i + '"></i>' +
          '<div class="slice" style="left:0;top:0;' + F.sliceStyle(src, 340, y, 440, 40, RS) + '"></div>' +
          '<div class="slice" style="left:900px;top:0;' + F.sliceStyle(src, 1150, y, 300, 40, RS) + '"></div>' +
          '<div class="sep" data-r="s' + i + '" style="transform-origin:0 50%"></div></div>';
      });
      h += '<div class="layer" data-r="dot" style="left:' + (CX - 7) + 'px;top:' + (CY - 7) + 'px;width:14px;height:14px;background:#F3B61F"></div>';
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      // a linha do fluxo sobe e vira o divisor da lista
      var a = E.inOut(F.p(t, 0, .8));
      var z = E.inOut(F.p(t, 5.9, 6.6));     // no fim tudo se fecha num ponto
      var top = t < 5.9 ? F.lerp(CY, 300, a) : F.lerp(300, CY, z);
      var left = t < 5.9 ? F.lerp(0, 160, a) : F.lerp(160, CX, z);
      var wid = t < 5.9 ? F.lerp(1920, 1600, a) : F.lerp(1600, 0, z);
      F.css(c.line, 'top', F.px(top - 1.5)); F.css(c.line, 'left', F.px(left)); F.css(c.line, 'width', F.px(wid));
      for (var i = 0; i < PEOPLE.length; i++) {
        var k = E.out(F.p(t, 1.0 + i * .3, 1.6 + i * .3));
        var q = E.inOut(F.p(t, 5.5 + i * .04, 6.2 + i * .04));
        var rowC = ROW0 + i * STEP + 36;
        F.op(c['p' + i], k * (1 - q));
        F.tf(c['p' + i], 'translate(' + ((1 - k) * -40).toFixed(1) + 'px,' + ((CY - rowC) * q).toFixed(1) + 'px) scaleY(' + (1 - .9 * q).toFixed(3) + ')');
        F.tf(c['s' + i], 'scaleX(' + E.inOut(F.p(t, 1.2 + i * .3, 1.9 + i * .3)).toFixed(3) + ')');
      }
      F.line(c.c1, t, .6, 5.3);
      F.op(c.dot, F.p(t, 6.5, 6.6));
      F.tf(c.dot, 'scale(' + (.4 + .6 * F.p(t, 6.5, 6.7)).toFixed(3) + ')');
    }
  });

  /* ======================================================================
     10 · CLARO OU ESCURO (74.0 – 81.2)
     Mesma tela, mesmos números. Uma máscara diagonal cruza do claro para o escuro.
     ====================================================================== */
  var TILE = { s: .140625, x: 150, y: 230 };   // onde o Dashboard vira o primeiro ladrilho da cena 11
  var TILE_CAM = (function () {
    var w = F.BOX.w / TILE.s, h = F.BOX.h / TILE.s;
    var cx = (CX - TILE.x) / TILE.s, cy = (CY - TILE.y) / TILE.s;
    return [cx - w / 2, cy - h / 2, w, h];
  })();
  F.scene({
    name: 'Claro ou escuro', start: 74.0, dur: 7.2,
    keys: [H.FULL, [0, 6.0, [60, 25, 2440, 982], E.lin], [6.0, 7.2, TILE_CAM]],
    build: function (el) {
      el.innerHTML =
        '<div class="fill" data-r="frame">' +
          '<div class="fill">' + F.shotHTML(IMG + 'dashboard-light.webp', 'light') + '</div>' +
          '<div class="fill" data-r="dw">' + F.shotHTML(IMG + 'dashboard-dark.webp', 'dark') + '</div>' +
        '</div>' +
        '<div class="wipe-edge" data-r="edge"></div>' +
        '<div class="shade-b" data-r="shade"></div>' +
        cap('c1', 'Claro ou escuro.') + cap('c2', 'Trabalhe do seu jeito.');
      return F.refs(el);
    },
    render: function (t, c) {
      var cam = F.camAt(t, this.keys);
      var m = F.applyCam(c.light, cam);
      F.applyCam(c.dark, cam);
      // abre do ponto deixado pela cena anterior
      var o = E.out(F.p(t, .1, 1.0));
      if (o >= 1) F.clip(c.frame, 'none');
      else {
        var x0 = m.x(0), y0 = m.y(0), x1 = m.x(2560), y1 = m.y(1032);
        insetRect(c.frame, F.lerp(CX, x0, o), F.lerp(CY, y0, o), F.lerp(0, x1 - x0, o), F.lerp(0, y1 - y0, o), 12);
      }
      // a máscara diagonal: claro → escuro
      var X = F.tw(t, 2.4, 3.8, -320, 2240, E.inOut);
      var slant = 150;
      F.clip(c.dw, 'polygon(0px 0px, ' + F.px(X + slant) + ' 0px, ' + F.px(X - slant) + ' 1080px, 0px 1080px)');
      F.css(c.edge, 'left', F.px(X - 3));
      F.css(c.edge, 'top', F.px(-560));
      F.tf(c.edge, 'rotate(' + (Math.atan2(2 * slant, 1080) * 180 / Math.PI).toFixed(2) + 'deg)');
      F.op(c.edge, F.p(t, 2.35, 2.5) * (1 - F.p(t, 3.7, 3.85)));
      F.op(c.shade, 1 - F.p(t, 6.0, 6.6));
      F.line(c.c1, t, .9, 3.0);
      F.line(c.c2, t, 4.0, 5.9);
    }
  });

  /* ======================================================================
     11 · GESTÃO INTEGRADA (80.8 – 87.2)
     As telas do filme viram ladrilhos ligados por cotas, na ordem da história.
     ====================================================================== */
  var TW = 2560 * TILE.s, TH = 1032 * TILE.s;
  var TILES = [
    ['dashboard-dark', 'Dashboard', 150, 230], ['calculadora', 'Medida certa', 600, 230], ['pedido', 'Pedido', 1050, 230], ['estoque', 'Estoque', 1500, 230],
    ['liquidacao', 'Liquidação', 1275, 520], ['fluxo', 'Fluxo de caixa', 825, 520], ['usuarios', 'Equipe', 375, 520]
  ];
  var STATUS = [300, 955, 1150, 90], STATUS_TXT = [520, 1004, 214, 22];
  F.scene({
    name: 'Gestão integrada', start: 80.8, dur: 6.4,
    keys: [TILE_CAM, [3.0, 4.2, STATUS]],
    build: function (el) {
      var MONO = H.MONO;
      var h = '<div class="fill" data-r="plane">';
      var mid1 = 230 + TH / 2, mid2 = 520 + TH / 2;
      var paths = [
        'M' + (150 + TW) + ' ' + mid1 + 'H600', 'M' + (600 + TW) + ' ' + mid1 + 'H1050', 'M' + (1050 + TW) + ' ' + mid1 + 'H1500',
        'M' + (1500 + TW / 2) + ' ' + (230 + TH) + 'V' + ((230 + TH + 520) / 2) + 'H' + (1275 + TW / 2) + 'V520',
        'M1275 ' + mid2 + 'H' + (825 + TW), 'M825 ' + mid2 + 'H' + (375 + TW)
      ];
      h += '<svg class="layer" width="1920" height="1080" style="overflow:visible">';
      paths.forEach(function (d, i) {
        h += '<path data-r="k' + i + '" d="' + d + '" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" fill="none" stroke="#F3B61F" stroke-width="3"/>';
      });
      h += '</svg>';
      TILES.forEach(function (tl, i) {
        var src = IMG + tl[0] + '.webp';
        F.images.push(src);
        h += '<div class="layer" data-r="t' + i + '" style="left:' + tl[2] + 'px;top:' + tl[3] + 'px;width:' + TW + 'px;height:' + TH.toFixed(2) + 'px;' +
          'background:url(' + src + ') 0 0/100% 100%;border-radius:4px;box-shadow:0 0 0 1px rgba(244,242,238,.14),0 20px 50px -20px rgba(0,0,0,.9)"></div>' +
          '<div class="layer" data-r="n' + i + '" style="left:' + tl[2] + 'px;top:' + (tl[3] + TH + 14).toFixed(1) + 'px;font-size:15px;color:#AAB1B9;' + MONO + '">' +
          '<span style="color:#F3B61F">0' + (i + 1) + '</span>&nbsp;&nbsp;' + tl[1] + '</div>';
      });
      h += '</div>' +
        '<div class="fill" data-r="hw">' + F.shotHTML(IMG + 'dashboard-dark.webp', 'hd', '<div class="spot" data-r="spot"></div>') + '</div>' +
        '<div class="hline" data-r="line" style="left:0;width:1920px;top:598.5px"></div>' +
        '<div class="shade-b" data-r="shade"></div>' +
        cap('c1', 'Do balcão à gestão.') + cap('c2', 'Dados no computador da loja.');
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      for (var i = 0; i < TILES.length; i++) {
        var a = i === 0 ? 1 : E.out(F.p(t, .2 + i * .12, .8 + i * .12));
        F.op(c['t' + i], a);
        F.tf(c['t' + i], 'scale(' + (.92 + .08 * a).toFixed(3) + ')');
        F.op(c['n' + i], F.p(t, .5 + i * .12, .9 + i * .12));
      }
      for (var k = 0; k < 6; k++) {
        H.attr(c['k' + k], 'stroke-dashoffset', (1 - E.inOut(F.p(t, .9 + k * .22, 1.3 + k * .22))).toFixed(3));
      }
      F.op(c.plane, 1 - F.p(t, 3.1, 3.6));
      // o primeiro ladrilho vira a tela em alta e a câmera vai até a barra de status
      var cam = F.camAt(t, this.keys);
      F.applyCam(c.hd, cam);
      F.op(c.hw, F.p(t, 2.9, 3.1));
      F.vis(c.hw, t > 2.85);
      var sp = F.spotAt(t, [[STATUS_TXT, 0], [4.2, 4.6, STATUS_TXT, 1]]);
      F.applySpot(c.spot, sp, cam.s, 8);
      // fecha numa linha: a mesma da abertura
      var half = F.tw(t, 5.5, 6.1, 560, 1.5, E.inOut);
      if (t < 5.5) F.clip(c.hw, 'none');
      else insetRect(c.hw, 0, 600 - half, 1920, half * 2);
      F.op(c.line, F.p(t, 5.95, 6.1));
      F.op(c.shade, 1 - F.p(t, 5.4, 5.8));
      F.line(c.c1, t, 1.2, 2.9);
      F.line(c.c2, t, 4.3, 5.5);
    }
  });

  /* ======================================================================
     12 · ENCERRAMENTO (87.0 – 93.0)
     ====================================================================== */
  F.scene({
    name: 'Encerramento', start: 87.0, dur: 6.0,
    build: function (el) {
      el.innerHTML =
        '<div class="hline" data-r="line" style="top:598.5px"></div>' +
        '<div class="tick" data-r="tl" style="left:358.5px;top:600px"></div><div class="tick" data-r="tr" style="left:1558.5px;top:600px"></div>' +
        '<div class="layer" style="left:640px;top:420px;width:640px;height:160px;overflow:hidden">' +
          '<div class="logo" data-r="logo" style="position:absolute;left:0;bottom:12px;width:640px">' + H.logoSVG('z') + '</div></div>' +
        '<div class="layer" style="left:0;top:640px;width:1920px;text-align:center"><div class="ln" data-r="tag" style="display:inline-block"><span style="font:600 46px/1.15 var(--font-display);letter-spacing:-0.025em;color:#AAB1B9">Do balcão à gestão.</span></div></div>' +
        '<a class="cta" data-r="cta" data-cta aria-label="Conheça o Turium" style="left:960px;top:770px">Conheça o Turium' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>';
      return F.refs(el);
    },
    render: function (t, c) {
      var k = E.inOut(F.p(t, 0, .8));
      F.css(c.line, 'left', F.px(F.lerp(0, 360, k)));
      F.css(c.line, 'width', F.px(F.lerp(1920, 1200, k)));
      F.op(c.tl, F.p(t, .7, .85)); F.op(c.tr, F.p(t, .7, .85));
      F.tf(c.logo, 'translateY(' + (150 * F.tw(t, .6, 1.5, 1, 0, E.out)).toFixed(1) + 'px)');
      H.drawLogo(c, 'z', t, .7);
      F.line(c.tag, t, 1.9, 99, .8);
      var a = E.out(F.p(t, 2.7, 3.3));
      F.op(c.cta, a);
      F.tf(c.cta, 'translateX(-50%) translateY(' + ((1 - a) * 16).toFixed(1) + 'px)');
    }
  });
})();
