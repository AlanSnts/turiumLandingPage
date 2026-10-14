/* Turium Motion — revelação por rolagem e navegação que se recolhe.
   Sem JS o conteúdo aparece normalmente; os estados iniciais só existem sob .js. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.TuriumMotion = { reduce: reduce };

  /* ---------- Revelação ---------- */
  var targets = Array.prototype.slice.call(document.querySelectorAll('[data-reveal], [data-scene="hero-cotas"]'));

  function show(el) {
    el.classList.add('is-in');
    el.dispatchEvent(new CustomEvent('turium:in', { bubbles: false }));
  }

  if (reduce || !('IntersectionObserver' in window)) {
    targets.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { show(entry.target); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });

    /* Rede de segurança: nada fica invisível se o observador falhar. */
    window.addEventListener('load', function () {
      setTimeout(function () {
        targets.forEach(function (el) {
          if (!el.classList.contains('is-in') && el.getBoundingClientRect().top < window.innerHeight) show(el);
        });
      }, 1500);
    });
  }

  /* ---------- Navegação: recolhe ao descer, volta ao subir ---------- */
  var nav = document.querySelector('.nav');
  function focusVisibleIn(el) {
    try { return !!el.querySelector(':focus-visible'); } catch (e) { return el.contains(document.activeElement); }
  }
  if (nav && !reduce) {
    var lastY = window.scrollY, ticking = false;
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var y = window.scrollY;
        var down = y > lastY + 4, up = y < lastY - 4;
        if (y < 120 || up || focusVisibleIn(nav)) nav.classList.remove('is-hidden');
        else if (down) nav.classList.add('is-hidden');
        if (down || up) lastY = y;
        ticking = false;
      });
    }, { passive: true });
    nav.addEventListener('focusin', function () { if (focusVisibleIn(nav)) nav.classList.remove('is-hidden'); });
  }

  root.classList.add('motion-ready');
})();
