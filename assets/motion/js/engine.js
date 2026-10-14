/* Turium — motor do filme.
   Um relógio (Film.T, em segundos) manda em tudo. Cada cena desenha o estado exato do instante
   com render(t), sem transições CSS: pausar, voltar ou arrastar a barra sempre mostra o quadro certo. */
(function () {
  'use strict';

  var F = window.Film = {
    W: 1920, H: 1080,
    T: 0,
    duration: 0,
    playing: false,
    scenes: [],
    clips: [],
    images: [],
    // área onde a câmera enquadra as telas (o rodapé fica livre para os textos)
    BOX: { x: 120, y: 96, w: 1680, h: 790 }
  };

  F.RM = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ---------- Matemática ---------- */
  F.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  F.lerp = function (a, b, p) { return a + (b - a) * p; };
  F.ease = {
    lin: function (p) { return p; },
    out: function (p) { return 1 - Math.pow(1 - p, 4); },            // "assenta"
    out3: function (p) { return 1 - Math.pow(1 - p, 3); },
    inOut: function (p) { return p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2; }, // "prumo"
    in: function (p) { return p * p * p; }
  };
  // progresso 0..1 de t no intervalo [a, b]. Com movimento reduzido vira corte seco no meio.
  F.p = function (t, a, b) {
    if (b <= a) return t >= a ? 1 : 0;
    if (F.RM) return t >= (a + b) / 2 ? 1 : 0;
    return F.clamp((t - a) / (b - a), 0, 1);
  };
  F.tw = function (t, a, b, from, to, e) {
    var k = (e || F.ease.inOut)(F.p(t, a, b));
    return from + (to - from) * k;
  };
  // entra em [a, a+din], sai em [b, b+dout] — devolve 0..1..0
  F.inout = function (t, a, din, b, dout, e) {
    if (t < b) return (e || F.ease.out)(F.p(t, a, a + din));
    return 1 - F.ease.inOut(F.p(t, b, b + dout));
  };

  /* ---------- Formatação pt-BR ---------- */
  F.fmt = function (n, dec) {
    return n.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  };
  F.brl = function (n) { return 'R$ ' + F.fmt(n, 2); };

  /* ---------- Escrita de estilo com cache (evita trabalho repetido a cada quadro) ---------- */
  F.css = function (el, prop, val) {
    var c = el.__c || (el.__c = {});
    if (c[prop] !== val) { el.style[prop] = val; c[prop] = val; }
  };
  F.op = function (el, v) { F.css(el, 'opacity', String(Math.round(F.clamp(v, 0, 1) * 1000) / 1000)); };
  F.tf = function (el, s) { F.css(el, 'transform', s); };
  F.vis = function (el, on) { F.css(el, 'visibility', on ? 'visible' : 'hidden'); };
  F.txt = function (el, s) { if (el.__t !== s) { el.textContent = s; el.__t = s; } };
  F.clip = function (el, s) { F.css(el, 'clipPath', s); F.css(el, 'webkitClipPath', s); };
  F.px = function (n) { return (Math.round(n * 100) / 100) + 'px'; };

  // linha de texto revelada por máscara: sobe ao entrar, sai para cima
  F.line = function (el, t, a, b, dIn, dOut) {
    var inner = el.firstElementChild || el;
    var y;
    if (t < b) y = F.tw(t, a, a + (dIn || .7), 135, 0, F.ease.out);
    else y = F.tw(t, b, b + (dOut || .45), 0, -135, F.ease.inOut);
    F.tf(inner, 'translate3d(0,' + y.toFixed(2) + '%,0)');
    F.vis(el, t >= a && t <= b + (dOut || .45) + .02);
  };

  /* ---------- Câmera virtual ----------
     A tela nativa (2560×1032) é posicionada para que um retângulo dela caiba na área BOX.
     keys: [ret0, [t0, t1, ret], [t0, t1, ret], ...] — de ret0, move para cada ret no intervalo. */
  F.fit = function (r, box) {
    box = box || F.BOX;
    return { s: Math.min(box.w / r[2], box.h / r[3]), cx: r[0] + r[2] / 2, cy: r[1] + r[3] / 2 };
  };
  F.camAt = function (t, keys, box, ease) {
    var cur = F.fit(keys[0], box);
    for (var i = 1; i < keys.length; i++) {
      var k = keys[i];
      if (t <= k[0]) break;
      var nxt = F.fit(k[2], box);
      var p = (ease || k[3] || F.ease.inOut)(F.p(t, k[0], k[1]));
      cur = {
        s: Math.exp(F.lerp(Math.log(cur.s), Math.log(nxt.s), p)),
        cx: F.lerp(cur.cx, nxt.cx, p),
        cy: F.lerp(cur.cy, nxt.cy, p)
      };
    }
    return cur;
  };
  // aplica a câmera e devolve um conversor de coordenadas da tela → palco
  F.applyCam = function (el, cam, box, extra) {
    box = box || F.BOX;
    var tx = box.x + box.w / 2 - cam.cx * cam.s;
    var ty = box.y + box.h / 2 - cam.cy * cam.s;
    F.tf(el, 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0) scale(' + cam.s.toFixed(5) + ')' + (extra || ''));
    return {
      s: cam.s,
      x: function (x) { return tx + x * cam.s; },
      y: function (y) { return ty + y * cam.s; }
    };
  };

  /* Foco: escurece tudo menos um retângulo da tela. keys como na câmera, com alpha. */
  F.spotAt = function (t, keys) {
    var cur = { r: keys[0][0].slice(), a: keys[0][1] };
    for (var i = 1; i < keys.length; i++) {
      var k = keys[i];
      if (t <= k[0]) break;
      var p = F.ease.inOut(F.p(t, k[0], k[1]));
      var r = k[2] || cur.r;
      cur = {
        r: [F.lerp(cur.r[0], r[0], p), F.lerp(cur.r[1], r[1], p), F.lerp(cur.r[2], r[2], p), F.lerp(cur.r[3], r[3], p)],
        a: F.lerp(cur.a, k[3], p)
      };
    }
    return cur;
  };
  F.applySpot = function (el, spot, camS, pad) {
    pad = pad || 10;
    var r = spot.r;
    F.css(el, 'left', F.px(r[0] - pad));
    F.css(el, 'top', F.px(r[1] - pad));
    F.css(el, 'width', F.px(r[2] + pad * 2));
    F.css(el, 'height', F.px(r[3] + pad * 2));
    var a = F.clamp(spot.a, 0, 1);
    F.css(el, 'boxShadow', '0 0 0 9000px rgba(9,11,14,' + (a * .72).toFixed(3) + ')');
    F.css(el, 'borderWidth', F.px(Math.max(0, 2.5 / (camS || 1))));
    F.css(el, 'borderColor', 'rgba(243,182,31,' + (Math.min(1, a * 1.4)).toFixed(3) + ')');
  };

  /* ---------- Construção de DOM ---------- */
  F.el = function (html) {
    var d = document.createElement('div');
    d.innerHTML = html.trim();
    return d.firstElementChild;
  };
  F.refs = function (root) {
    var o = {};
    Array.prototype.forEach.call(root.querySelectorAll('[data-r]'), function (n) { o[n.getAttribute('data-r')] = n; });
    return o;
  };
  F.shotHTML = function (src, ref, extra) {
    F.images.push(src);
    return '<div class="shot" data-r="' + ref + '"><div class="face"><img src="' + src + '" alt="" decoding="async"></div><div class="rim"></div>' + (extra || '') + '</div>';
  };
  // fatia de uma tela nativa usada como imagem de fundo (x, y, w, h nativos; s = escala)
  F.sliceStyle = function (src, x, y, w, h, s) {
    return 'width:' + (w * s) + 'px;height:' + (h * s) + 'px;background-image:url(' + src + ');' +
      'background-size:' + (2560 * s) + 'px ' + (1032 * s) + 'px;background-position:' + (-x * s) + 'px ' + (-y * s) + 'px';
  };

  /* ---------- Cenas ---------- */
  F.scene = function (def) { F.scenes.push(def); };

  /* Clipes reais sincronizados ao relógio do filme.
     at = instante do filme em que o clipe está no segundo 0; dur = duração usada. */
  F.addClip = function (video, at, dur) {
    F.clips.push({ v: video, at: at, dur: dur });
  };

  function syncClips() {
    F.clips.forEach(function (c) {
      var v = c.v;
      var local = F.T - c.at;
      var inside = local >= 0 && local < c.dur;
      var want = F.clamp(local, 0, Math.max(0, c.dur - .04));
      if (inside && F.playing && !F.scrubbing) {
        if (v.paused) {
          try { v.currentTime = want; } catch (e) {}
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else if (Math.abs(v.currentTime - want) > .25) {
          try { v.currentTime = want; } catch (e) {}
        }
      } else {
        if (!v.paused) v.pause();
        // só reposiciona perto da janela de uso, para não buscar à toa
        if (local > -2 && local < c.dur + 2 && Math.abs(v.currentTime - want) > .012 && !v.seeking) {
          try { v.currentTime = want; } catch (e) {}
        }
      }
    });
  }

  F.build = function (stage) {
    var t = 0;
    F.scenes.forEach(function (s) {
      s.el = F.el('<section class="scene" aria-hidden="true"></section>');
      stage.appendChild(s.el);
      s.ctx = s.build(s.el) || {};
      s.ctx.root = s.el;
      t = Math.max(t, s.start + s.dur);
    });
    F.duration = t;
  };

  F.render = function () {
    var T = F.T;
    F.scenes.forEach(function (s, i) {
      var lt = T - s.start;
      var last = i === F.scenes.length - 1;
      var on = lt >= 0 && (lt < s.dur || (last && lt <= s.dur + .001));
      F.css(s.el, 'display', on ? 'block' : 'none');
      if (on) s.render(Math.min(lt, s.dur), s.ctx);
    });
    syncClips();
  };

  F.sceneAt = function (T) {
    var cur = F.scenes[0];
    F.scenes.forEach(function (s) { if (T >= s.start) cur = s; });
    return cur;
  };
})();
