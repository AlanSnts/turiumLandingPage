/* Turium — player: escala do palco, relógio, controles, tela inicial. */
(function () {
  'use strict';
  var F = window.Film;
  var stage = document.getElementById('stage');
  var body = document.body;

  F.build(stage);

  /* ---------- Escala do palco 16:9 ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / F.W, window.innerHeight / F.H);
    var x = (window.innerWidth - F.W * s) / 2, y = (window.innerHeight - F.H * s) / 2;
    stage.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(5) + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Controles ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var btnPlay = $('btn-play'), btnReplay = $('btn-replay'), btnFull = $('btn-full');
  var track = $('track'), fillbar = $('fillbar'), head = $('head'), tip = $('tip');
  var tNow = $('t-now'), tDur = $('t-dur'), sceneName = $('scene-name');

  function tc(s) {
    s = Math.max(0, Math.floor(s));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  tDur.textContent = tc(F.duration);

  // marcas de cena na barra
  F.scenes.forEach(function (s, i) {
    if (i === 0) return;
    var m = document.createElement('i');
    m.className = 'mark';
    m.style.left = (s.start / F.duration * 100) + '%';
    track.appendChild(m);
  });

  var ended = false;
  function play() {
    if (ended || F.T >= F.duration - .01) { F.T = 0; ended = false; }
    F.playing = true;
    body.classList.add('playing');
    btnPlay.setAttribute('aria-label', 'Pausar');
    armIdle();
  }
  function pause() {
    F.playing = false;
    body.classList.remove('playing');
    btnPlay.setAttribute('aria-label', 'Reproduzir');
    wake();
  }
  F.play = play; F.pause = pause;
  F.seek = function (t) { F.T = F.clamp(t, 0, F.duration); ended = F.T >= F.duration; };

  btnPlay.addEventListener('click', function () { F.playing ? pause() : play(); });
  btnReplay.addEventListener('click', function () { F.T = 0; ended = false; play(); });
  btnFull.addEventListener('click', toggleFull);
  function toggleFull() {
    var d = document;
    if (d.fullscreenElement) { d.exitFullscreen && d.exitFullscreen(); }
    else if (d.documentElement.requestFullscreen) { d.documentElement.requestFullscreen().catch(function () {}); }
  }

  /* barra: clique e arrastar */
  var wasPlaying = false;
  function tAt(e) {
    var r = track.getBoundingClientRect();
    return F.clamp((e.clientX - r.left) / r.width, 0, 1) * F.duration;
  }
  track.addEventListener('pointerdown', function (e) {
    track.setPointerCapture(e.pointerId);
    wasPlaying = F.playing;
    F.scrubbing = true;
    F.seek(tAt(e));
  });
  track.addEventListener('pointermove', function (e) {
    var t = tAt(e);
    var r = track.getBoundingClientRect();
    tip.style.left = ((e.clientX - r.left) / r.width * 100) + '%';
    tip.textContent = tc(t) + ' · ' + F.sceneAt(t).name;
    if (F.scrubbing) F.seek(t);
  });
  function endScrub() {
    if (!F.scrubbing) return;
    F.scrubbing = false;
    if (wasPlaying && !ended) play();
  }
  track.addEventListener('pointerup', endScrub);
  track.addEventListener('pointercancel', endScrub);
  track.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') { F.seek(F.T - 5); e.preventDefault(); }
    if (e.key === 'ArrowRight') { F.seek(F.T + 5); e.preventDefault(); }
  });

  document.addEventListener('keydown', function (e) {
    if (e.target && e.target.closest && e.target.closest('button') && (e.key === ' ' || e.key === 'Enter')) return;
    if (e.key === ' ' || e.key === 'k' || e.key === 'K') { F.playing ? pause() : play(); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') F.seek(F.T - 5);
    else if (e.key === 'ArrowRight') F.seek(F.T + 5);
    else if (e.key === 'Home' || e.key === '0') { F.seek(0); }
    else if (e.key === 'f' || e.key === 'F') toggleFull();
    wake();
  });

  /* controles somem com o mouse parado durante a reprodução */
  var idleTimer = null;
  function wake() { body.classList.remove('idle'); armIdle(); }
  function armIdle() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { if (F.playing && !F.scrubbing) body.classList.add('idle'); }, 2200);
  }
  window.addEventListener('pointermove', wake);

  function updateUI() {
    var k = F.duration ? F.T / F.duration : 0;
    F.css(fillbar, 'transform', 'scaleX(' + k.toFixed(5) + ')');
    F.css(head, 'left', (k * 100).toFixed(3) + '%');
    F.txt(tNow, tc(F.T));
    F.txt(sceneName, F.sceneAt(F.T).name);
    track.setAttribute('aria-valuenow', String(Math.round(F.T)));
  }

  /* ---------- Relógio ---------- */
  var last = null;
  function frame(now) {
    if (last === null) last = now;
    var dt = Math.min((now - last) / 1000, .1);
    last = now;
    if (F.playing && !F.scrubbing && !F.external) {
      F.T += dt;
      if (F.T >= F.duration) { F.T = F.duration; ended = true; pause(); }
    }
    F.render();
    updateUI();
    requestAnimationFrame(frame);
  }

  /* ---------- Carregamento e início ---------- */
  var gate = $('gate'), gateBar = $('gate-bar'), gateBtn = $('gate-btn');
  var hashT = (function () { var m = /t=([\d.]+)/.exec(location.hash); return m ? parseFloat(m[1]) : 0; })();

  function preload() {
    var jobs = [];
    var done = 0;
    function tick() { done++; gateBar.style.transform = 'scaleX(' + (done / jobs.length).toFixed(3) + ')'; }
    F.images.filter(function (v, i, a) { return a.indexOf(v) === i; }).forEach(function (src) {
      jobs.push(new Promise(function (res) {
        var im = new Image();
        im.onload = function () { (im.decode ? im.decode() : Promise.resolve()).catch(function () {}).then(res); };
        im.onerror = res;
        im.src = src;
      }).then(tick));
    });
    F.clips.forEach(function (c) {
      jobs.push(new Promise(function (res) {
        var v = c.v;
        if (v.readyState >= 2) return res();
        var to = setTimeout(res, 8000);
        v.addEventListener('loadeddata', function () { clearTimeout(to); res(); }, { once: true });
        v.addEventListener('error', function () { clearTimeout(to); res(); }, { once: true });
        v.load();
      }).then(tick));
    });
    if (document.fonts && document.fonts.ready) jobs.push(document.fonts.ready.then(tick));
    return Promise.all(jobs);
  }

  function start() {
    gate.classList.add('gone');
    F.seek(hashT);
    if (!/paused/.test(location.hash)) play(); else pause();
  }

  gateBtn.addEventListener('click', function () {
    F.clips.forEach(function (c) { var p = c.v.play(); if (p && p.catch) p.catch(function () {}); c.v.pause(); });
    start();
  });

  requestAnimationFrame(frame);
  preload().then(function () {
    // Sem áudio, o navegador costuma permitir o início automático. Se recusar, mostra o botão.
    var v = F.clips[0] && F.clips[0].v;
    if (!v) return start();
    var p;
    try { p = v.play(); } catch (e) { p = Promise.reject(e); }
    Promise.resolve(p).then(function () { v.pause(); start(); }).catch(function (err) {
      // só pede o clique quando o navegador bloqueou o início automático
      if (err && err.name === 'NotAllowedError') { gate.classList.add('ask'); gateBtn.focus(); }
      else start();
    });
  });
})();
