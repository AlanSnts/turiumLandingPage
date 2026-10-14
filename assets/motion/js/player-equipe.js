/* Turium — player do filme 2 (Cada função tem um responsável) COM NARRAÇÃO.
   Mesmo motor de player-narrado.js (filme 1): enquanto a voz toca, ela é o relógio-mestre do filme.
   A narração (turium_narracao_58s_equipe.mp3) já foi montada no tempo do filme: cada fala começa
   no segundo da sua cena, então o mapa de sincronia é um trecho só, sem atraso.
   No site (?embed=1): espera o clique, pausa ao sair da tela e, no fim, volta para a capa. */
(function () {
  'use strict';
  var F = window.Film;
  var stage = document.getElementById('stage');
  var body = document.body;
  var audio = document.getElementById('narracao');
  var EMBED = /[?&]embed=1/.test(location.search);
  if (EMBED) document.documentElement.classList.add('embed');

  F.build(stage);

  /* ---------- Escala do palco 16:9 ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / F.W, window.innerHeight / F.H);
    var x = (window.innerWidth - F.W * s) / 2, y = (window.innerHeight - F.H * s) / 2;
    stage.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px) scale(' + s.toFixed(5) + ')';
  }
  window.addEventListener('resize', fit);
  fit();

  /* ---------- Narração ---------- */
  var DRIFT = 0.15; // tolerância (s) entre filme e voz antes de corrigir

  /* MAPA DE SINCRONIA — liga trechos da narração a momentos do filme.
     Cada linha: [início no áudio, fim no áudio, atraso da voz em relação à imagem] (segundos).
     Hoje é um trecho só e sem atraso: a voz já começa cada fala no segundo certo da cena.
     Se alguma cena precisar de ajuste próprio, basta dividir em mais linhas,
     cortando o áudio dentro de um silêncio. */
  var CUES = [
    [0, 999, 0]
  ];

  /* Ajuste fino para TODO o filme (soma ao mapa). Teclas [ e ] (Shift = 0,5 s) ou ?ajuste=0.3 na URL.
     O valor fica salvo só neste navegador. */
  var KEY = 'turium-narracao-ajuste-equipe';
  var NUDGE = (function () {
    var m = /[?&]ajuste=(-?[\d.]+)/.exec(location.search);
    if (m) return parseFloat(m[1]);
    try { var s = localStorage.getItem(KEY); if (s !== null && !isNaN(parseFloat(s))) return parseFloat(s); } catch (e) {}
    return 0;
  })();

  function audioDur() { return isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0; }
  // posição da voz para o instante t do filme; null = sem voz neste instante
  function audioAt(t) {
    var d = audioDur();
    if (!d) return null;
    for (var i = 0; i < CUES.length; i++) {
      var c = CUES[i], a = t - c[2] - NUDGE;
      if (a >= c[0] && a < Math.min(c[1], d - 0.05)) return a;
    }
    return null;
  }
  function voiceStart() { return CUES[0][0] + CUES[0][2] + NUDGE; }
  function voiceEnd() { var c = CUES[CUES.length - 1]; return Math.min(c[1], audioDur()) + c[2] + NUDGE; }
  function audioCovers(t) { return audioAt(t) !== null; }

  function audioTo(t) {
    var a = audioAt(t);
    if (a === null) {
      // antes de a voz entrar ou depois do fim: silêncio. Nas pausas entre trechos ela segue (é silêncio no arquivo).
      if ((t < voiceStart() || t >= voiceEnd()) && !audio.paused) audio.pause();
      return;
    }
    if (Math.abs(audio.currentTime - a) > 0.05) { try { audio.currentTime = a; } catch (e) {} }
  }
  var starting = false;   // play() da voz pedido e ainda não começou
  var blocked = false;    // navegador recusou o áudio ou o arquivo falhou: o filme segue sem voz
  function audioRun() {
    if (starting || blocked || !audioCovers(F.T)) return;
    audioTo(F.T);
    starting = true;
    var p; try { p = audio.play(); } catch (e) { p = Promise.reject(e); }
    Promise.resolve(p).then(function () { starting = false; }, function () { starting = false; blocked = true; });
  }
  audio.addEventListener('error', function () { blocked = true; starting = false; });

  /* ---------- Controles ---------- */
  var $ = function (id) { return document.getElementById(id); };
  var btnPlay = $('btn-play'), btnReplay = $('btn-replay'), btnFull = $('btn-full'), btnMute = $('btn-mute');
  var track = $('track'), fillbar = $('fillbar'), head = $('head'), tip = $('tip');
  var tNow = $('t-now'), tDur = $('t-dur'), sceneName = $('scene-name');

  function tc(s) {
    s = Math.max(0, Math.floor(s));
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  }
  tDur.textContent = tc(F.duration);

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
    blocked = false; // cada play é um gesto do usuário: tenta a voz de novo
    F.playing = true;
    body.classList.add('playing');
    btnPlay.setAttribute('aria-label', 'Pausar');
    audioRun();
    armIdle();
  }
  function pause() {
    F.playing = false;
    body.classList.remove('playing');
    btnPlay.setAttribute('aria-label', 'Reproduzir');
    if (!audio.paused) audio.pause();
    wake();
  }
  F.play = play; F.pause = pause;
  F.seek = function (t) {
    F.T = F.clamp(t, 0, F.duration);
    ended = F.T >= F.duration;
    audioTo(F.T);
    if (F.playing && !F.scrubbing && !ended && audio.paused) audioRun();
  };

  btnPlay.addEventListener('click', function () { F.playing ? pause() : play(); });
  btnReplay.addEventListener('click', function () { F.seek(0); play(); });
  btnFull.addEventListener('click', toggleFull);
  btnMute.addEventListener('click', function () { setMuted(!audio.muted); });

  function setMuted(m) {
    audio.muted = m;
    body.classList.toggle('muted', m);
    btnMute.setAttribute('aria-label', m ? 'Ativar narração' : 'Silenciar narração');
    btnMute.setAttribute('aria-pressed', m ? 'true' : 'false');
  }
  setMuted(false);

  /* No site (iframe), quem amplia é a página de fora: ela aumenta este mesmo iframe
     (e o gira no celular em pé). Fora do site, tela cheia normal. */
  var IN_SITE = EMBED && window.parent !== window;
  var ICON_FULL = btnFull.innerHTML;
  var ICON_EXIT = '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M6 2v4H2M14 6h-4V2M10 14v-4h4M2 10h4v4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
  function toggleFull() {
    if (IN_SITE) { window.parent.postMessage({ turium: 'zoom' }, '*'); return; }
    var d = document;
    if (d.fullscreenElement) { d.exitFullscreen && d.exitFullscreen(); }
    else if (d.documentElement.requestFullscreen) { d.documentElement.requestFullscreen().catch(function () {}); }
  }
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || e.data.turium !== 'zoom-state') return;
    btnFull.innerHTML = e.data.on ? ICON_EXIT : ICON_FULL;
    btnFull.setAttribute('aria-label', e.data.on ? 'Reduzir' : 'Tela cheia');
  });

  /* barra: clique e arrastar (a voz pausa durante o arraste e volta no ponto certo) */
  var wasPlaying = false;
  function tAt(e) {
    var r = track.getBoundingClientRect();
    return F.clamp((e.clientX - r.left) / r.width, 0, 1) * F.duration;
  }
  track.addEventListener('pointerdown', function (e) {
    track.setPointerCapture(e.pointerId);
    wasPlaying = F.playing;
    F.scrubbing = true;
    if (!audio.paused) audio.pause();
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
    else if (e.key === 'Home' || e.key === '0') F.seek(0);
    else if (e.key === 'f' || e.key === 'F') toggleFull();
    else if (e.key === 'm' || e.key === 'M') setMuted(!audio.muted);
    else if (e.code === 'BracketLeft' || e.key === '[' || e.key === '{') { nudge(e.shiftKey ? -0.5 : -0.1); e.preventDefault(); }
    else if (e.code === 'BracketRight' || e.key === ']' || e.key === '}') { nudge(e.shiftKey ? 0.5 : 0.1); e.preventDefault(); }
    wake();
  });

  /* Ajuste fino do atraso, com aviso na tela */
  var toast = $('sync-toast'), toastTimer = null;
  function nudge(d) {
    NUDGE = Math.round((NUDGE + d) * 10) / 10;
    try { localStorage.setItem(KEY, String(NUDGE)); } catch (e) {}
    if (F.playing && !F.scrubbing) {
      if (audioCovers(F.T)) { audioTo(F.T); if (audio.paused) audioRun(); }
      else audioTo(F.T);
    }
    if (toast) {
      var v = NUDGE.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
      toast.textContent = 'Ajuste da narração: ' + (NUDGE > 0 ? '+' : '') + v + ' s   ·   [ adianta   ] atrasa';
      toast.classList.add('on');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(function () { toast.classList.remove('on'); }, 2600);
    }
  }

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
    if (F.playing && !F.scrubbing) {
      var exp = blocked ? null : audioAt(F.T);
      if (exp === null) {
        F.T += dt; // sem voz neste instante (antes de ela entrar, numa pausa entre trechos, ou depois do fim)
        if (!blocked) audioTo(F.T);
      } else if (audio.paused) {
        audioRun(); // a voz deveria estar tocando: pede para começar e segura o quadro até ela entrar
      } else if (audio.readyState < 3) {
        // voz carregando: o filme espera junto
      } else {
        var err = audio.currentTime - exp;
        if (Math.abs(err) > DRIFT * 2) {
          // passagem de um trecho para o outro (ou voz desencontrada): leva a voz ao ponto certo
          try { audio.currentTime = audioAt(F.T + dt) !== null ? audioAt(F.T + dt) : exp; } catch (e) {}
          F.T += dt;
        } else {
          F.T += dt + err * 0.12; // a voz manda: puxa o filme aos poucos para ela
        }
      }
      if (F.T >= F.duration) {
        F.T = F.duration; ended = true; pause();
        // no site, o fim não fica numa tela preta: volta para a capa com "Assistir de novo"
        if (EMBED) { F.seek(0); ended = false; gateBtn.lastChild.textContent = 'Assistir de novo'; gate.classList.remove('gone'); gate.classList.add('ask'); }
        // no site, o carrossel avança para o próximo filme
        if (IN_SITE) { try { window.parent.postMessage({ turium: 'ended' }, '*'); } catch (e) {} }
      }
    }
    F.render();
    updateUI();
    requestAnimationFrame(frame);
  }

  /* No site, pausa sozinho quando o filme sai da tela. */
  if (EMBED && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (!en.isIntersecting && F.playing) pause(); });
    }, { threshold: 0.25 }).observe(document.documentElement);
  }

  /* ---------- Carregamento e início ----------
     Com áudio o navegador exige um clique: a tela inicial sempre mostra o botão. */
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
    jobs.push(new Promise(function (res) {
      if (audio.readyState >= 3) return res();
      var to = setTimeout(res, 10000);
      audio.addEventListener('canplaythrough', function () { clearTimeout(to); res(); }, { once: true });
      audio.addEventListener('error', function () { clearTimeout(to); res(); }, { once: true });
      audio.load();
    }).then(tick));
    if (document.fonts && document.fonts.ready) jobs.push(document.fonts.ready.then(tick));
    return Promise.all(jobs);
  }

  function startFromGate() {
    // o clique libera vídeos e áudio no navegador
    F.clips.forEach(function (c) { var p = c.v.play(); if (p && p.catch) p.catch(function () {}); c.v.pause(); });
    gate.classList.add('gone');
    F.seek(hashT);
    play();
  }
  gateBtn.addEventListener('click', function () {
    startFromGate();
    // avisa o carrossel do site: a partir de agora, os próximos filmes começam sozinhos
    if (IN_SITE) { try { window.parent.postMessage({ turium: 'started' }, '*'); } catch (e) {} }
  });

  /* ---------- No site: reprodução em sequência ----------
     O primeiro filme sempre espera o clique. Depois que o visitante deu play em um filme,
     a página manda { turium: 'autoplay', on: true } quando este cartão chega ao centro:
     o filme começa sozinho, com voz. Se o navegador recusar o som, a capa continua pedindo o clique. */
  var wantAuto = false;
  function tryAuto() {
    if (!wantAuto || gate.classList.contains('gone') || !gate.classList.contains('ask')) return;
    var p;
    try { audio.currentTime = 0; p = audio.play(); } catch (e) { p = Promise.reject(e); }
    Promise.resolve(p).then(function () {
      if (!wantAuto) { audio.pause(); return; }
      wantAuto = false;
      startFromGate();
    }, function () { wantAuto = false; /* sem permissão de som: fica a capa com o botão */ });
  }
  window.addEventListener('message', function (e) {
    if (e.source !== window.parent || !e.data || e.data.turium !== 'autoplay') return;
    wantAuto = !!e.data.on;
    if (wantAuto) tryAuto();
  });

  requestAnimationFrame(frame);
  preload().then(function () {
    gate.classList.add('ask');
    if (!EMBED) gateBtn.focus();
    tryAuto();
  });
})();
