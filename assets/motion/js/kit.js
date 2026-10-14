/* Turium — kit de auxiliares compartilhado pelos filmes (texto, etiquetas, recortes, logo). */
(function () {
  'use strict';
  var F = window.Film, E = F.ease, IMG = 'assets/film/';
  var FULL = [0, 0, 2560, 1032];
  var CX = F.BOX.x + F.BOX.w / 2, CY = F.BOX.y + F.BOX.h / 2;
  var MONO = 'font-family:var(--font-mono);letter-spacing:.12em;text-transform:uppercase;';

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

  F.h = { attr: attr, cap: cap, tag: tag, place: place, box: box, insetRect: insetRect, logoSVG: logoSVG, drawLogo: drawLogo, FULL: FULL, CX: CX, CY: CY, IMG: IMG, MONO: MONO };
})();
