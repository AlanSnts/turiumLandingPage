/* Turium — filme 2: Cada função tem um responsável (58 s).
   Telas reais da base de demonstração (Prumo Materiais). Permissões conforme a matriz de perfis do Turium
   (docs/architecture.md → "Perfis e matriz de permissões"). Tempos em segundos; render(t) recebe o tempo local. */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, H = F.h, IMG = H.IMG, CX = H.CX, CY = H.CY;
  var cap = H.cap, place = H.place, box = H.box, insetRect = H.insetRect, attr = H.attr, MONO = H.MONO;

  var ICON = {
    pedido: '<path d="M7 3h8l4 4v14H7z"/><path d="M15 3v4h4M10 12h6M10 16h6"/>',
    venda: '<path d="M3 4h2l2.4 10.5h10.8L20.5 7H6.3"/><circle cx="9.5" cy="19" r="1.4"/><circle cx="17" cy="19" r="1.4"/>',
    estoque: '<path d="M3.5 7.5 12 3.5l8.5 4v9L12 20.5l-8.5-4z"/><path d="M3.5 7.5 12 11.5l8.5-4M12 11.5v9"/>',
    caixa: '<rect x="3" y="6" width="18" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6.5 9.5v.01M17.5 14.5v.01"/>',
    vendedor: '<path d="M3.5 12.5V4h8.5l9 9-8.5 8.5z"/><circle cx="8" cy="8.5" r="1.3"/>',
    gerente: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V5h6v2.5M3.5 12.5h17"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    cross: '<path d="M6.5 6.5l11 11M17.5 6.5l-11 11"/>',
    lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>'
  };
  function icon(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[n] + '</svg>';
  }

  // Equipe fictícia da base de demonstração (Configurações → Usuários)
  var TEAM = [
    { nome: 'Rodrigo Alves', perfil: 'Vendedor', icon: 'vendedor', row: 508 },
    { nome: 'Juliana Costa', perfil: 'Caixa', icon: 'caixa', row: 348 },
    { nome: 'Patrícia Moura', perfil: 'Gerente', icon: 'gerente', row: 388 },
    { nome: 'Fernanda Lima', perfil: 'Estoque', icon: 'estoque', row: 308 }
  ];
  function ecardHTML(ref, p) {
    return '<div class="ecard" data-r="' + ref + '"><div class="in" data-r="' + ref + 'in">' +
      '<div class="ic">' + icon(p.icon) + '</div><div class="nm">' + p.nome + '</div><div class="rl">' + p.perfil + '</div>' +
      '<i class="ul" data-r="' + ref + 'ul"></i></div></div>';
  }

  /* ======================================================================
     1 · O DESAFIO (0 – 7.4)
     ====================================================================== */
  var OPS = [['pedido', 'Pedido', 'criado'], ['venda', 'Venda', 'finalizada'], ['estoque', 'Estoque', 'saída'], ['caixa', 'Caixa', 'aberto']];
  var LANES = [150, 300, 450, 600, 750];
  var MOVERS = [];
  for (var i = 0; i < 10; i++) {
    MOVERS.push({ op: OPS[i % 4], y: LANES[i % 5], x0: (i * 613) % 2300 - 340, dir: (i % 5) % 2 ? -1 : 1, v: 260 + (i * 47) % 170 });
  }
  F.scene({
    name: 'O desafio', start: 0, dur: 7.4,
    build: function (el) {
      var h = '';
      MOVERS.forEach(function (mv, k) {
        h += '<div class="opcard" data-r="m' + k + '" style="top:' + mv.y + 'px"><div class="ic">' + icon(mv.op[0]) + '</div>' +
          '<div><b>' + mv.op[1] + '</b><small>' + mv.op[2] + '</small></div><i class="who">?</i></div>';
      });
      h += '<div class="bigq"><div class="ln" data-r="q" style="display:inline-block"><span>QUEM FEZ O QUÊ<span class="gold">?</span></span></div></div>';
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      // muito movimento, depois tudo para de uma vez
      var mt = t < 4 ? t : 4 + .32 * E.out3(F.p(t, 4, 4.7));
      MOVERS.forEach(function (mv, k) {
        var x = mv.x0 + mv.dir * mv.v * mt;
        x = ((x + 340) % 2300 + 2300) % 2300 - 340;
        var a = E.out(F.p(t, .1 + k * .06, .6 + k * .06));
        var dim = 1 - .62 * F.p(t, 4.4, 5.0);
        F.tf(c['m' + k], 'translate3d(' + x.toFixed(1) + 'px,0,0)');
        F.op(c['m' + k], a * dim * (1 - F.p(t, 6.6, 7.2)));
      });
      F.line(c.q, t, 4.7, 6.7, .8, .5);
    }
  });

  /* ======================================================================
     2 · CADA FUNCIONÁRIO, SEU PERFIL (7.0 – 17.4)
     ====================================================================== */
  var USR_CAM = [334, 179, 2151, 370];
  var CARD = { y: 330, w: 360, h: 300, gap: 66, x0: 160 };
  var SLOT3 = { x: 160, y: 150, w: 360, h: 300 };      // onde o cartão do Rodrigo fica na cena 3
  F.scene({
    name: 'Cada funcionário', start: 7.0, dur: 10.4,
    build: function (el) {
      var h = '<div class="fill" data-r="sw">' + F.shotHTML(IMG + 'usuarios.webp', 'shot') + '</div>';
      TEAM.forEach(function (p, i) { h += ecardHTML('e' + i, p); });
      h += '<div class="shade-b"></div>' + cap('c1', 'Cada usuário. Seu perfil. Suas permissões.', 160, 912, 56);
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var cam = F.fit(USR_CAM);
      var m = F.applyCam(c.shot, cam);
      F.op(c.sw, F.p(t, 0, .8) * (1 - .8 * F.p(t, 2.4, 3.2)) * (1 - F.p(t, 9.4, 10.0)));
      TEAM.forEach(function (p, i) {
        var el = c['e' + i];
        var a = F.p(t, .9 + i * .2, 1.2 + i * .2);
        var g = E.inOut(F.p(t, 2.4 + i * .08, 3.5 + i * .08));
        var rx = m.x(334), ry = m.y(p.row), rw = 2151 * cam.s, rh = 40 * cam.s;
        var cx = CARD.x0 + i * (CARD.w + CARD.gap);
        var x = F.lerp(rx, cx, g), y = F.lerp(ry, CARD.y, g), w = F.lerp(rw, CARD.w, g), hh = F.lerp(rh, CARD.h, g);
        // o cartão do Rodrigo segue para a cena 3; os outros saem
        if (i === 0) {
          var s3 = E.inOut(F.p(t, 9.4, 10.4));
          x = F.lerp(x, SLOT3.x, s3); y = F.lerp(y, SLOT3.y, s3);
        }
        box(el, x, y, w, hh);
        F.css(el, 'background', 'rgba(20,24,29,' + (.92 * g).toFixed(3) + ')');
        var out = i === 0 ? 0 : E.inOut(F.p(t, 9.3 + i * .06, 9.9 + i * .06));
        F.op(el, a * (1 - out));
        F.tf(el, 'translateY(' + (40 * out).toFixed(1) + 'px)');
        F.op(c['e' + i + 'in'], F.p(t, 3.3 + i * .1, 3.9 + i * .1));
        F.tf(c['e' + i + 'ul'], 'scaleX(' + E.inOut(F.p(t, 3.8 + i * .12, 4.5 + i * .12)).toFixed(3) + ')');
      });
      F.line(c.c1, t, 4.4, 9.2);
    }
  });

  /* ======================================================================
     3 · VOCÊ DECIDE O QUE DELEGAR (17.0 – 28.4)
     Perfil Vendedor, conforme a matriz do Turium: orders.create ✓ · products.view ✓ · sales.create ✕ · cash.move ✕
     ====================================================================== */
  var PERMS = [
    ['yes', 'Criar pedidos', 'Permitido'], ['yes', 'Consultar produtos', 'Permitido'],
    ['no', 'Receber no caixa', 'Bloqueado'], ['no', 'Movimentar o caixa', 'Bloqueado']
  ];
  // itens do menu lateral (recortes da tela real), y central nativo
  var MENU = [112, 155, 200, 243, 288, 331, 376, 419, 464, 507, 552];
  // sem permissão no perfil Vendedor: Caixa, Vendas, Compras, Financeiro, Entregas, Relatórios
  var BLOCK = [1, 2, 7, 8, 9, 10];
  var MS = 1.3, MSTEP = 60, MTOP = 236, COLA = 1010, COLV = 1430;
  F.scene({
    name: 'Você decide', start: 17.0, dur: 11.4,
    build: function (el) {
      var src = IMG + 'dashboard-dark.webp';
      F.images.push(src);
      var h = ecardHTML('rc', TEAM[0]) +
        '<div class="layer" data-r="ph" style="left:160px;top:486px;font-size:18px;color:#AAB1B9;' + MONO + '">Perfil Vendedor · o que pode fazer</div>';
      PERMS.forEach(function (p, i) {
        h += '<div class="perm ' + p[0] + '" data-r="p' + i + '" style="left:160px;top:' + (526 + i * 96) + 'px;width:640px">' +
          '<div class="ic">' + icon(p[0] === 'yes' ? 'check' : 'cross') + '</div><b>' + p[1] + '</b><em>' + p[2] + '</em></div>';
      });
      [['ca', COLA, 'Administrador'], ['cv', COLV, 'Vendedor']].forEach(function (col) {
        h += '<div class="menu-col" data-r="' + col[0] + '" style="left:' + col[1] + 'px;top:150px"><div class="hd">' + col[2] + '</div></div>';
        MENU.forEach(function (y, k) {
          h += '<div class="mitem slice" data-r="' + col[0] + k + '" style="left:' + col[1] + 'px;top:' + (MTOP + k * MSTEP) + 'px;' +
            F.sliceStyle(src, 30, y - 21, 212, 42, MS) + '">' +
            (col[0] === 'cv' && BLOCK.indexOf(k) >= 0 ? '<i class="x" data-r="x' + k + '"></i><i class="lk" data-r="l' + k + '">' + icon('lock') + '</i>' : '') + '</div>';
        });
      });
      h += '<div class="mnote" data-r="note" style="left:' + COLA + 'px;top:196px">Menu de cada perfil, segundo as permissões do Turium</div>' +
        cap('c1', 'Delegue com segurança. Restrinja quando necessário.', 160, 912, 56);
      el.innerHTML = h;
      var c = F.refs(el);
      box(c.rc, SLOT3.x, SLOT3.y, SLOT3.w, SLOT3.h);
      F.css(c.rc, 'background', 'rgba(20,24,29,.92)');
      F.tf(c.rcul, 'scaleX(1)');
      return c;
    },
    render: function (t, c) {
      var out = 1 - F.p(t, 10.6, 11.3);
      F.op(c.rc, out);
      F.op(c.ph, F.p(t, .4, .8) * out);
      PERMS.forEach(function (p, i) {
        var a = E.out(F.p(t, .6 + i * .35, 1.2 + i * .35));
        F.op(c['p' + i], a * out);
        F.tf(c['p' + i], 'translateX(' + ((1 - a) * -30).toFixed(1) + 'px)');
      });
      F.op(c.ca, F.p(t, 3.0, 3.4) * out);
      F.op(c.cv, F.p(t, 3.2, 3.6) * out);
      F.op(c.note, F.p(t, 3.4, 3.9) * out);
      MENU.forEach(function (y, k) {
        F.op(c['ca' + k], F.p(t, 3.2 + k * .05, 3.6 + k * .05) * out);
        var a = F.p(t, 3.4 + k * .05, 3.8 + k * .05);
        var bi = BLOCK.indexOf(k);
        if (bi >= 0) {
          var b = E.inOut(F.p(t, 5.0 + bi * .25, 5.5 + bi * .25));
          F.op(c['cv' + k], a * (1 - .78 * b) * out);
          F.tf(c['x' + k], 'scaleX(' + b.toFixed(3) + ')');
          F.op(c['l' + k], b);
        } else {
          F.op(c['cv' + k], a * out);
        }
      });
      F.line(c.c1, t, 7.4, 10.4);
    }
  });

  /* ======================================================================
     4 · CADA OPERAÇÃO DEIXA UM REGISTRO (28.0 – 40.4)
     Histórico real do PED-000011. Na base atual, os três passos foram feitos pelo mesmo usuário.
     ====================================================================== */
  var P = { head: [560, 180, 720, 64], h1: [555, 756, 1711, 26], h2: [555, 788, 1711, 26], h3: [555, 820, 1711, 26] };
  var EVENTS = [
    ['pedido', '08/10 · 06:48', 'Pedido criado', 'Ricardo Almeida'],
    ['check', '08/10 · 06:48', 'Pedido confirmado', 'Ricardo Almeida'],
    ['venda', '08/10 · 06:48', 'Vendido no caixa', 'Ricardo Almeida']
  ];
  var NX = [400, 960, 1520], LY = 500;
  F.scene({
    name: 'Cada operação registrada', start: 28.0, dur: 12.4,
    keys: [[550, 170, 760, 90], [1.6, 2.8, [545, 700, 1730, 170]]],
    build: function (el) {
      var h = '<div class="fill" data-r="sw">' + F.shotHTML(IMG + 'pedido.webp', 'shot', '<div class="spot" data-r="spot"></div>') + '</div>' +
        '<div class="layer" data-r="kick" style="left:300px;top:300px;font-size:20px;color:#AAB1B9;' + MONO + '">PED-000011 · Histórico</div>' +
        '<div class="hline" data-r="line" style="top:' + (LY - 1.5) + 'px"></div>';
      EVENTS.forEach(function (ev, i) {
        h += '<div class="node" data-r="n' + i + '" style="left:' + NX[i] + 'px;top:' + (LY - 101) + 'px">' +
          '<div class="ic">' + icon(ev[0]) + '</div><div class="dot"></div>' +
          '<div class="tm">' + ev[1] + '</div><div class="ev">' + ev[2] + '</div><div class="by">' + ev[3] + '</div></div>';
      });
      h += '<div class="shade-b"></div>' + cap('c1', 'Histórico. Responsabilidade. Rastreabilidade.', 160, 912, 56);
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var cam = F.camAt(t, this.keys);
      F.applyCam(c.shot, cam);
      F.op(c.sw, F.p(t, 0, .6) * (1 - F.p(t, 5.2, 6.0)));
      var sp = F.spotAt(t, [[P.head, 0], [.6, 1.2, P.head, 1], [1.6, 2.6, P.h3, 1], [3.2, 3.6, P.h2, 1], [4.0, 4.4, P.h1, 1], [4.8, 5.4, P.h1, 0]]);
      F.applySpot(c.spot, sp, cam.s, 8);
      // a lista vira uma linha do tempo dourada
      var d = E.inOut(F.p(t, 5.6, 7.4)), ex = E.inOut(F.p(t, 11.6, 12.4));
      var L0 = 300, R0 = 1620;
      F.css(c.line, 'left', F.px(F.lerp(L0, 0, ex)));
      F.css(c.line, 'width', F.px(F.lerp((R0 - L0) * d, 1920, ex)));
      F.op(c.line, F.p(t, 5.6, 5.7));
      F.op(c.kick, F.p(t, 5.8, 6.3) * (1 - F.p(t, 11.2, 11.6)));
      EVENTS.forEach(function (ev, i) {
        var a = E.out(F.p(t, 5.9 + i * .7, 6.6 + i * .7));
        F.op(c['n' + i], a * (1 - F.p(t, 11.2, 11.6)));
        F.tf(c['n' + i], 'translateX(-50%) translateY(' + ((1 - a) * 20).toFixed(1) + 'px)');
      });
      F.line(c.c1, t, 8.0, 11.4);
    }
  });

  /* ======================================================================
     5 · CONTROLE SEM FAZER TUDO SOZINHO (40.0 – 51.4)
     ====================================================================== */
  var ACT = [1424, 866, 1060, 134];
  var CHIPS = [[130, 90], [1490, 90], [130, 850], [1490, 850]];
  F.scene({
    name: 'Você acompanha', start: 40.0, dur: 11.4,
    keys: [H.FULL, [1.2, 2.6, [1420, 860, 1066, 150]], [6.0, 7.2, H.FULL]],
    build: function (el) {
      var h = '<div class="fill" data-r="sw">' + F.shotHTML(IMG + 'dashboard-dark.webp', 'shot', '<div class="spot" data-r="spot"></div>') + '</div>' +
        '<div class="hline" data-r="lin" style="left:0;width:1920px;top:' + (LY - 1.5) + 'px"></div>' +
        '<div class="hline" data-r="lout" style="left:0;width:1920px;top:598.5px"></div>';
      TEAM.forEach(function (p, i) {
        h += '<div class="chip" data-r="k' + i + '" style="left:' + CHIPS[i][0] + 'px;top:' + CHIPS[i][1] + 'px"><span class="ic">' + icon(p.icon) + '</span><b>' + p.nome + '</b><span>' + p.perfil + '</span></div>';
      });
      h += '<div class="shade-b" data-r="shade"></div>' + cap('c1', 'Sua equipe trabalha. Você acompanha.', 160, 912, 56);
      el.innerHTML = h;
      return F.refs(el);
    },
    render: function (t, c) {
      var cam = F.camAt(t, this.keys);
      F.applyCam(c.shot, cam);
      // abre a partir da linha da cena anterior e, no fim, fecha numa linha
      var half;
      if (t < 1) half = F.tw(t, 0, .9, 2, 560, E.out);
      else half = F.tw(t, 10.5, 11.1, 560, 1.5, E.inOut);
      var cy = t < 1 ? LY : 600;
      if (half >= 559) F.clip(c.sw, 'none'); else insetRect(c.sw, 0, cy - half, 1920, half * 2);
      F.op(c.lin, 1 - F.p(t, .3, .7));
      F.op(c.lout, F.p(t, 10.95, 11.1));
      var sp = F.spotAt(t, [[ACT, 0], [2.4, 2.9, ACT, 1], [5.8, 6.4, ACT, 0]]);
      F.applySpot(c.spot, sp, cam.s, 8);
      TEAM.forEach(function (p, i) {
        var a = E.out(F.p(t, 7.0 + i * .2, 7.6 + i * .2));
        F.op(c['k' + i], a * (1 - F.p(t, 10.2, 10.6)));
        F.tf(c['k' + i], 'scale(' + (.85 + .15 * a).toFixed(3) + ')');
      });
      F.op(c.shade, 1 - F.p(t, 10.2, 10.6));
      F.line(c.c1, t, 7.6, 10.2);
    }
  });

  /* ======================================================================
     6 · ENCERRAMENTO (51.0 – 58.0)
     ====================================================================== */
  F.scene({
    name: 'Encerramento', start: 51.0, dur: 7.0,
    build: function (el) {
      el.innerHTML =
        '<div class="hline" data-r="line" style="top:598.5px"></div>' +
        '<div class="tick" data-r="tl" style="left:358.5px;top:600px"></div><div class="tick" data-r="tr" style="left:1558.5px;top:600px"></div>' +
        '<div class="layer" style="left:640px;top:420px;width:640px;height:160px;overflow:hidden">' +
          '<div class="logo" data-r="logo" style="position:absolute;left:0;bottom:12px;width:640px">' + H.logoSVG('z') + '</div></div>' +
        '<div class="layer" style="left:0;top:640px;width:1920px;text-align:center"><div class="ln" data-r="tag" style="display:inline-block"><span style="font:600 46px/1.15 var(--font-display);letter-spacing:-0.025em;color:#AAB1B9">Do balcão à gestão.</span></div></div>' +
        '<div class="fill" data-r="black" style="background:#000"></div>';
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
      F.op(c.black, F.p(t, 6.0, 7.0));
    }
  });
})();
