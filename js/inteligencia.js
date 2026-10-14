/* Turium — seção "Inteligência de negócios": player do filme 3.
   - Nada do vídeo é baixado antes de a seção se aproximar da tela (preload="none" e src definido só aqui).
   - Autoplay só SEM som, quando a seção está visível, sem "movimento reduzido" e sem economia de dados.
   - Som só por ação do visitante. Legendas sincronizadas (WebVTT) ligadas por padrão.
   - Versão 720p para telas pequenas ou economia de dados; 1080p nas demais. MP4 (H.264) ou WebM (VP9). */
(function () {
  'use strict';
  var fig = document.getElementById('intel-player');
  if (!fig) return;
  var video = fig.querySelector('video');
  var start = fig.querySelector('.intel-start');
  var startLbl = start.querySelector('.lbl');
  var btnPlay = fig.querySelector('[data-a="play"]');
  var btnSound = fig.querySelector('[data-a="sound"]');
  var btnCC = fig.querySelector('[data-a="cc"]');
  var btnFull = fig.querySelector('[data-a="full"]');
  var unmute = fig.querySelector('.intel-unmute');
  var track = fig.querySelector('.intel-track');
  var bar = track.querySelector('b');
  var time = fig.querySelector('.intel-time');

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var conn = navigator.connection || {};
  var saveData = !!conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
  var auto = false;           // tocando sozinho, sem som
  var quietTimer = 0;

  // H.264 (MP4) quando o navegador toca; senão VP9 (WebM), com o mesmo nome
  var mp4 = !!video.canPlayType('video/mp4; codecs="avc1.640028, mp4a.40.2"');
  function pickSrc() {
    var w = fig.clientWidth * Math.min(2, window.devicePixelRatio || 1);
    var src = (saveData || w <= 1300) ? video.getAttribute('data-src-sd') : video.getAttribute('data-src-hd');
    return mp4 ? src : src.replace(/\.mp4$/, '.webm');
  }
  video.addEventListener('error', function () {      // MP4 recusado: tenta o WebM uma vez
    var src = video.getAttribute('src') || '';
    if (/\.mp4$/.test(src)) { mp4 = false; video.setAttribute('src', src.replace(/\.mp4$/, '.webm')); video.load(); if (fig.classList.contains('started')) video.play().catch(function () {}); }
  });
  function ensureSrc() {
    if (!video.getAttribute('src')) { video.setAttribute('src', pickSrc()); video.load(); }
  }
  function fmt(s) { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function setSoundUI() {
    var on = !video.muted;
    btnSound.classList.toggle('on-sound', on);
    btnSound.setAttribute('aria-label', on ? 'Silenciar' : 'Ativar som');
    btnSound.querySelector('.txt').textContent = on ? 'Silenciar' : 'Ativar som';
    fig.classList.toggle('auto', auto && !on);
  }
  function play(withSound, fromStart) {
    ensureSrc();
    if (fromStart) { try { video.currentTime = 0; } catch (e) {} }
    video.muted = !withSound;
    auto = !withSound;
    fig.classList.add('started');
    var p = video.play();
    if (p && p.catch) p.catch(function () { fig.classList.remove('started'); });
    setSoundUI();
  }

  // pôster só quando a seção se aproxima (não pesa no carregamento inicial)
  new IntersectionObserver(function (es, io) {
    if (es[0].isIntersecting) { video.setAttribute('poster', video.getAttribute('data-poster')); io.disconnect(); }
  }, { rootMargin: '600px 0px' }).observe(fig);

  // autoplay silencioso enquanto visível
  new IntersectionObserver(function (es) {
    var e = es[0];
    if (e.isIntersecting && e.intersectionRatio >= .55) {
      if (!reduced && !saveData && !fig.classList.contains('started') && !fig.classList.contains('done')) play(false, false);
    } else if (!video.paused) {
      video.pause();
    }
  }, { threshold: [0, .55] }).observe(fig);

  start.addEventListener('click', function () { fig.classList.remove('done'); play(true, true); });
  unmute.addEventListener('click', function () { play(true, true); });
  btnSound.addEventListener('click', function () {
    if (video.muted) { if (auto) play(true, true); else { video.muted = false; setSoundUI(); } }
    else { video.muted = true; auto = false; setSoundUI(); }
  });
  btnPlay.addEventListener('click', function () {
    if (video.paused) { var p = video.play(); if (p && p.catch) p.catch(function () {}); } else video.pause();
  });
  btnCC.addEventListener('click', function () {
    var tt = video.textTracks && video.textTracks[0];
    if (!tt) return;
    var on = tt.mode !== 'showing';
    tt.mode = on ? 'showing' : 'hidden';
    btnCC.setAttribute('aria-pressed', String(on));
  });
  btnFull.addEventListener('click', function () {
    var el = fig.querySelector('.intel-frame');
    if (document.fullscreenElement) document.exitFullscreen();
    else if (el.requestFullscreen) el.requestFullscreen();
    else if (video.webkitEnterFullscreen) video.webkitEnterFullscreen();
  });
  track.addEventListener('click', function (ev) {
    if (!video.duration) return;
    var r = track.getBoundingClientRect();
    video.currentTime = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width)) * video.duration;
  });

  video.addEventListener('play', function () { fig.classList.add('playing'); btnPlay.setAttribute('aria-label', 'Pausar'); });
  video.addEventListener('pause', function () { fig.classList.remove('playing'); btnPlay.setAttribute('aria-label', 'Reproduzir'); });
  video.addEventListener('timeupdate', function () {
    var d = video.duration || 59.5;
    bar.style.transform = 'scaleX(' + (video.currentTime / d).toFixed(4) + ')';
    time.textContent = fmt(video.currentTime) + ' / ' + fmt(d);
  });
  video.addEventListener('ended', function () {
    auto = false;
    fig.classList.remove('started', 'playing', 'auto');
    fig.classList.add('done');
    startLbl.textContent = 'Assistir de novo · 59 s';
  });

  // barra some com o mouse parado ou sem toque (as legendas ficam livres); volta ao mover, tocar ou com foco do teclado
  function wake() {
    fig.classList.remove('quiet');
    clearTimeout(quietTimer);
    quietTimer = setTimeout(function () { if (!video.paused) fig.classList.add('quiet'); }, 2400);
  }
  fig.addEventListener('mousemove', wake);
  fig.addEventListener('touchstart', wake, { passive: true });
  video.addEventListener('play', wake);
  video.addEventListener('pause', function () { clearTimeout(quietTimer); fig.classList.remove('quiet'); });

  // legendas ligadas por padrão
  if (video.textTracks && video.textTracks[0]) video.textTracks[0].mode = 'showing';
})();
