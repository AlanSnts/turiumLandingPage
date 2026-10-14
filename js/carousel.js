/* =========================================================
   Carrossel de vídeos — porte em JS puro do cards-rotate-slider
   (mesmas constantes e mesma timeline GSAP do componente React).
   ========================================================= */
(function () {
  'use strict';
  var outer = document.getElementById('reel');
  var track = document.getElementById('reel-track');
  if (!outer || !track || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  var VIDEOS = window.TURIUM_VIDEOS || [];
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var MOBILE_BREAKPOINT = 640, TABLET_BREAKPOINT = 1025;
  var STEP = { mobile: 2, tablet: 6, desktop: 10 };
  var ROTATE_IN = { mobile: -60, tablet: -80, desktop: -100 };
  var ROTATE_OUT = { mobile: 50, tablet: 65, desktop: 80 };
  var ROTATE_X_NEGATIVE = 5, ROTATE_X_POSITIVE = -5;
  var ROTATION_REDUCTION_FACTOR = 0.15;
  var ROTATION_AMOUNT = 1.1, VERTICAL_DRIFT = 1.2, SCROLL_SMOOTHING = 1;

  /* Faixa da timeline de cada cartão (0 → 1) em que ele está "assentado" na frente. */
  var ACTIVE_FROM = 0.38, ACTIVE_TO = 0.62;

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildMedia(item) {
    if (item.type === 'embed') {
      var f = el('iframe');
      f.src = item.src;
      f.title = item.title || 'Vídeo do Turium';
      f.loading = 'lazy';
      f.allow = 'autoplay; fullscreen';
      f.setAttribute('allowfullscreen', '');
      return f;
    }
    if (item.type === 'video') {
      var v = el('video');
      v.playsInline = true; v.setAttribute('playsinline', '');
      if (item.narrated) {
        /* filme com narração: não toca sozinho; o visitante dá o play (com som) nos controles do próprio vídeo */
        v.preload = 'none';
        v.setAttribute('aria-label', item.title || 'Vídeo do Turium');
      } else {
        v.muted = true; v.loop = true; v.preload = 'metadata';
        v.setAttribute('muted', '');
      }
      if (item.poster) v.poster = item.poster;
      if (item.webm) { var s1 = el('source'); s1.src = item.webm; s1.type = 'video/webm'; v.appendChild(s1); }
      var s2 = el('source'); s2.src = item.src; s2.type = 'video/mp4'; v.appendChild(s2);
      if (item.captions) {
        var tr = el('track'); tr.kind = 'captions'; tr.srclang = 'pt-BR'; tr.label = 'Português (Brasil)'; tr.src = item.captions; tr.default = true;
        v.appendChild(tr);
      }
      return v;
    }
    var ph = el('div', 'reel-placeholder');
    ph.innerHTML =
      '<div class="ph-top"><span class="ph-symbol" aria-hidden="true"><i></i><i></i></span><span class="ph-tag">Em breve</span></div>' +
      '<div><div class="ph-title"></div><div class="ph-sub">Vídeo em produção</div></div>';
    ph.querySelector('.ph-title').textContent = item.title || 'Novo vídeo';
    return ph;
  }

  /* Filme com narração em arquivo de vídeo: botão "Assistir com narração" (como nos filmes em HTML).
     Os controles do vídeo aparecem depois do primeiro play; ao terminar, o botão volta. */
  function addPlayButton(card, item) {
    var v = card.firstChild;
    var go = el('button', 'reel-play',
      '<span class="rp-btn"><svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 2.5v11l9-5.5z" fill="currentColor"/></svg>Assistir com narração</span>' +
      '<span class="rp-note"></span>');
    go.type = 'button';
    go.setAttribute('aria-label', 'Assistir com narração: ' + (item.title || 'vídeo do Turium'));
    go.querySelector('.rp-note').textContent = (item.meta || '').replace(/^Filme com narração · /, '') + ' · com áudio';
    go.addEventListener('click', function (e) {
      if (!card._on) return;            // fora do centro, o clique do cartão o traz para o centro
      e.stopPropagation();
      engaged = true;
      v.controls = true;
      var p = v.play(); if (p && p.catch) p.catch(function () { go.hidden = false; });
    });
    v.addEventListener('play', function () { go.hidden = true; v.controls = true; });
    v.addEventListener('ended', function () {
      go.hidden = false; v.controls = false; try { v.currentTime = 0; } catch (e) {}
      advanceFrom(cards.indexOf(card));
    });
    card.appendChild(go);
  }

  /* ---------- Monta os cartões a partir do array ---------- */
  var cards = [], slots = [];
  /* no espaço 3D, trilho e slots ficam no mesmo plano dos cartões e "roubam" o clique */
  track.style.pointerEvents = 'none';
  VIDEOS.forEach(function (item, i) {
    var slot = el('div', 'reel-slot');
    var card = el('div', 'reel-card is-inactive');
    card.style.zIndex = String(VIDEOS.length - i);
    card.appendChild(buildMedia(item));
    if (item.type === 'video' && item.narrated) addPlayButton(card, item);
    if (item.type === 'embed') {
      card.firstChild.addEventListener('load', function () { if (card._on && engaged) postAuto(i, true); });
    }
    slot.appendChild(card);
    var meta = el('div', 'reel-meta');
    meta.innerHTML = '<b></b><span></span>';
    meta.querySelector('b').textContent = item.title || '';
    meta.querySelector('span').textContent = item.meta || '';
    slot.appendChild(meta);
    track.appendChild(slot);
    slots.push(slot); cards.push(card);
    /* Só o cartão recebe cliques: no centro, o clique vai para o filme;
       fora do centro, traz o cartão para o centro. */
    slot.style.pointerEvents = 'none';
    card.style.pointerEvents = 'auto';
    card.addEventListener('click', function () { if (!card._on) centerOn(slot); });
  });

  function centerOn(slot) {
    // o trilho anda 1 px para cada 1 px de rolagem: o centro do cartão vira uma posição de rolagem
    var outerTop = outer.getBoundingClientRect().top + window.scrollY;
    var target = outerTop + slot.offsetLeft + slot.offsetWidth / 2 - window.innerWidth / 2;
    window.scrollTo({ top: Math.max(outerTop, target), behavior: reduced ? 'auto' : 'smooth' });
  }

  /* ---------- Reprodução em sequência ----------
     O primeiro filme sempre espera o clique do visitante. Depois desse primeiro play,
     cada filme que chega ao centro começa sozinho (com voz). Quem avisa o "primeiro play"
     é o próprio filme (postMessage { turium: 'started' }) ou o botão do cartão de vídeo. */
  var engaged = false;
  function postAuto(i, on) {
    try { cards[i].firstChild.contentWindow.postMessage({ turium: 'autoplay', on: on }, '*'); } catch (e) {}
  }
  window.addEventListener('message', function (e) {
    if (!e.data || (e.data.turium !== 'started' && e.data.turium !== 'ended')) return;
    for (var i = 0; i < cards.length; i++) {
      if (VIDEOS[i].type !== 'embed' || cards[i].firstChild.contentWindow !== e.source) continue;
      engaged = true;
      if (e.data.turium === 'ended') advanceFrom(i);
      return;
    }
  });
  /* Ao terminar um filme, o carrossel rola até o próximo; ao chegar ao centro, ele começa sozinho.
     Cartões "em breve" não contam: depois do último filme, o carrossel para. */
  function advanceFrom(i) {
    var next = i + 1;
    if (next >= cards.length || VIDEOS[next].type === 'placeholder') return;
    if (zoomed === i) setZoom(i, false);
    centerOn(slots[next]);
  }

  /* ---------- Controle de mídia ---------- */
  function pauseEmbed(iframe) {
    try {
      var F = iframe.contentWindow && iframe.contentWindow.Film;
      if (F && F.playing && typeof F.pause === 'function') F.pause();
    } catch (e) { /* abriu fora de um servidor (file://): o modo embed do filme ainda pausa sozinho ao sair da tela */ }
  }
  function setActive(i, on) {
    var card = cards[i];
    if (card._on === on || (!on && zoomed === i)) return; // ampliado: a rolagem/resize não pausa o filme
    card._on = on;
    card.classList.toggle('is-inactive', !on);
    card.style.cursor = on ? '' : 'pointer';
    card.firstChild.style.pointerEvents = on ? '' : 'none';
    var media = card.firstChild;
    var type = VIDEOS[i].type;
    if (type === 'embed') {
      if (!on) { postAuto(i, false); pauseEmbed(media); }
      else if (engaged) postAuto(i, true);
    }
    if (type === 'video') {
      if (VIDEOS[i].narrated) {                               // com narração: toca sozinho só depois do primeiro play
        if (!on) media.pause();
        else if (engaged) { media.controls = true; var pn = media.play(); if (pn && pn.catch) pn.catch(function () {}); }
      }
      else if (on) { var p = media.play(); if (p && p.catch) p.catch(function () {}); }
      else media.pause();
    }
  }

  /* ---------- Ampliar (botão de tela cheia do próprio filme) ----------
     Dentro do site, o filme não pede tela cheia sozinho: avisa esta página
     (postMessage) e aqui o MESMO iframe é ampliado — nada recarrega, o filme
     continua de onde estava. Android/desktop: tela cheia + trava na horizontal.
     iPhone (sem Fullscreen API fora de <video>): o CSS gira o iframe 90° em retrato. */
  var zoomed = -1, zoomFs = false;
  function postZoom(i, on) {
    try { cards[i].firstChild.contentWindow.postMessage({ turium: 'zoom-state', on: on }, '*'); } catch (e) {}
  }
  function setZoom(i, on) {
    if (on === (zoomed === i)) return;
    if (on && zoomed >= 0) setZoom(zoomed, false);
    var d = document, root = d.documentElement;
    cards[i].classList.toggle('is-zoomed', on);
    root.classList.toggle('reel-zoom', on);
    zoomed = on ? i : -1;
    if (on) {
      var req = root.requestFullscreen || root.webkitRequestFullscreen;
      try {
        var r = req && req.call(root);
        if (r && r.then) r.then(function () {
          zoomFs = true;
          if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {});
        }).catch(function () {});
      } catch (e) { /* sem tela cheia: o CSS cuida da rotação */ }
    } else {
      try { if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock(); } catch (e) {}
      if (zoomFs) {
        zoomFs = false;
        if (d.fullscreenElement && d.exitFullscreen) d.exitFullscreen().catch(function () {});
        else if (d.webkitFullscreenElement && d.webkitExitFullscreen) d.webkitExitFullscreen();
      }
    }
    postZoom(i, on);
  }
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.turium !== 'zoom') return;
    for (var i = 0; i < cards.length; i++) {
      if (cards[i].firstChild.contentWindow === e.source) { setZoom(i, zoomed !== i); return; }
    }
  });
  function onFsChange() {
    /* saiu da tela cheia pelo Esc ou pelo "voltar" do celular: desfaz o zoom junto */
    if (zoomFs && !(document.fullscreenElement || document.webkitFullscreenElement)) { zoomFs = false; if (zoomed >= 0) setZoom(zoomed, false); }
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && zoomed >= 0) setZoom(zoomed, false); });

  /* ---------- Altura do trilho = distância horizontal + 1 tela ---------- */
  function onResize() {
    outer.style.height = (track.scrollWidth - window.innerWidth + window.innerHeight) + 'px';
  }
  onResize();
  if ('ResizeObserver' in window) new ResizeObserver(onResize).observe(track);
  window.addEventListener('resize', onResize);

  if (reduced) document.querySelector('.reel-sticky').style.perspective = '4800px';

  /* ---------- Animação ---------- */
  var ctx;
  function build() {
    if (ctx) ctx.revert();
    var w = window.innerWidth;
    var bp = w < MOBILE_BREAKPOINT ? 'mobile' : w < TABLET_BREAKPOINT ? 'tablet' : 'desktop';

    ctx = gsap.context(function () {
      var horizontal = gsap.to(track, {
        x: function () { return -(track.scrollWidth - window.innerWidth); },
        ease: 'none',
        scrollTrigger: {
          trigger: outer,
          start: 'top top',
          end: function () { return '+=' + (track.scrollWidth - window.innerWidth); },
          scrub: reduced ? true : SCROLL_SMOOTHING,
          invalidateOnRefresh: true,
          onLeave: function () { cards.forEach(function (c, i) { setActive(i, false); }); },
          onLeaveBack: function () { cards.forEach(function (c, i) { setActive(i, false); }); }
        }
      });

      var total = cards.length, mid = Math.floor(total / 2);
      cards.forEach(function (card, index) {
        var step = STEP[bp] * VERTICAL_DRIFT;
        var offset = index < mid ? -((mid - index) * step) : (index - mid + 1) * step;
        var scale = reduced ? ROTATION_REDUCTION_FACTOR : 1;
        var rotateX = (offset < 0 ? ROTATE_X_NEGATIVE : ROTATE_X_POSITIVE) * scale;
        var rotateIn = ROTATE_IN[bp] * scale * ROTATION_AMOUNT;
        var rotateOut = ROTATE_OUT[bp] * scale * ROTATION_AMOUNT;

        gsap.timeline({
          scrollTrigger: {
            trigger: slots[index],
            containerAnimation: horizontal,
            start: 'left 100%',
            end: 'right 0%',
            scrub: true,
            onUpdate: function (self) {
              setActive(index, self.progress > ACTIVE_FROM && self.progress < ACTIVE_TO);
            },
            onToggle: function (self) { if (!self.isActive) setActive(index, false); }
          }
        })
          .fromTo(card,
            { rotateY: rotateIn, rotateX: rotateX, opacity: 0.8, y: offset + 'vh' },
            { rotateY: 0, rotateX: 0, opacity: 1, y: 0, ease: 'none' })
          .to(card, { rotateY: rotateOut, opacity: 0.9, y: (-offset) + 'vh', ease: 'none' });
      });
    });
    ScrollTrigger.refresh();
  }

  build();
  /* recalcula as constantes quando muda de faixa (celular / tablet / desktop) */
  var lastBp = window.innerWidth < MOBILE_BREAKPOINT ? 0 : window.innerWidth < TABLET_BREAKPOINT ? 1 : 2;
  window.addEventListener('resize', function () {
    var bp = window.innerWidth < MOBILE_BREAKPOINT ? 0 : window.innerWidth < TABLET_BREAKPOINT ? 1 : 2;
    if (bp !== lastBp) { lastBp = bp; build(); }
  });
})();
