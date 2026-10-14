/* Turium Motion — alternância de tema claro/escuro.
   Escolha salva > preferência do sistema > escuro (o script inline do <head> aplica antes da pintura). */
(function () {
  'use strict';
  var root = document.documentElement;
  var KEY = 'turium-theme';
  var btn = document.querySelector('.theme-toggle');

  function saved() {
    try { var t = localStorage.getItem(KEY); return (t === 'light' || t === 'dark') ? t : null; }
    catch (e) { return null; }
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (btn) {
      btn.setAttribute('aria-label', theme === 'light' ? 'Mudar para o tema escuro' : 'Mudar para o tema claro');
    }
  }

  apply(root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

  if (btn) {
    btn.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      apply(next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    });
  }

  /* Sem escolha salva, acompanha o sistema. */
  if (window.matchMedia) {
    var mq = window.matchMedia('(prefers-color-scheme: light)');
    var onChange = function (e) { if (!saved()) apply(e.matches ? 'light' : 'dark'); };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }
})();
