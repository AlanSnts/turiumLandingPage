/* =========================================================
   Seção de planos — monta os cartões a partir de js/plans.js
   e controla a expansão (hover no desktop, toque/botão no
   celular, teclado em todos).
   ========================================================= */
(function () {
  'use strict';
  var data = window.TURIUM_PLANS;
  var grid = document.getElementById('plans-grid');
  var notesEl = document.getElementById('plans-notes');
  if (!data || !grid) return;

  var hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
  var OPEN_DELAY = 90;    // intenção: evita abrir ao só passar o mouse por cima
  var CLOSE_DELAY = 220;  // tolerância: evita oscilar ao sair e voltar

  var ICON = {
    check: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.5 8.5l3 3 6-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    dash: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 8h6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    clock: '<svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="5.5" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M8 5v3.2l2 1.3" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    plus: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 4v8M4 8h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
    monitor: '<svg viewBox="0 0 16 16" aria-hidden="true"><rect x="2" y="2.5" width="12" height="8.5" rx="1.2" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M5.5 13.5h5M8 11v2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
    chevron: '<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 6.5L8 10l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
  };
  var FUTURE_LABEL = { soon: 'Em breve', dev: 'Em desenvolvimento' };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
  }

  /* Uma linha de recurso: ícone + texto + etiqueta de situação. */
  function featureHTML(f) {
    var icon, sr, tags = '';
    switch (f.status) {
      case 'included': icon = ICON.check; sr = 'Incluído'; break;
      case 'unavailable': icon = ICON.dash; sr = 'Não incluído'; break;
      case 'optional':
        icon = ICON.plus; sr = 'Módulo opcional';
        tags = '<span class="f-tag f-tag-opt">Opcional</span>' + (f.future ? '<span class="f-tag f-tag-future">' + FUTURE_LABEL[f.future] + '</span>' : '');
        break;
      default: icon = ICON.clock; sr = 'Ainda não lançado'; tags = '<span class="f-tag f-tag-future">' + FUTURE_LABEL[f.status] + '</span>';
    }
    var value = f.value ? '<span class="f-val">' + esc(f.value) + '</span>' : '';
    return '<li class="f f-' + f.status + '"><span class="f-ico">' + icon + '</span>' +
      '<span class="f-label"><span class="sr-only">' + sr + ': </span>' + esc(f.label) + '</span>' + value + tags + '</li>';
  }

  /* "1.800" / "199,90" (pt-BR) → número */
  function num(s) { return parseFloat(String(s).replace(/\./g, '').replace(',', '.')); }

  /* Ancoragem: "De R$ 1.800/mês" riscado + economia em %, acima do preço atual. */
  function anchorHTML(p) {
    /* sempre presente (vazio sem ancoragem) para manter as 9 linhas alinhadas entre os cartões */
    if (!p.price.was) return '<p class="plan-anchor" aria-hidden="true"></p>';
    var off = Math.round((1 - num(p.price.amount) / num(p.price.was)) * 100);
    var per = p.billingPeriod === 'monthly' ? esc(p.billingLabel) : '';
    return '<p class="plan-anchor"><span>De</span> <s><span class="sr-only">preço anterior: </span>' + esc(p.price.currency) + ' ' + esc(p.price.was) + per + '</s>' +
      (off > 0 ? '<span class="plan-save">' + off + '% off</span>' : '') + '</p>';
  }

  /* "199,90" → "199" + ",90" menor */
  function amountHTML(a) {
    var i = String(a).indexOf(',');
    return i < 0 ? esc(a) : esc(a.slice(0, i)) + '<span class="dec">' + esc(a.slice(i)) + '</span>';
  }

  function cardHTML(p) {
    var panelId = 'plan-' + p.id + '-all';
    var titleId = 'plan-' + p.id + '-title';
    var groups = p.featureGroups.map(function (g) {
      return '<div class="plan-group"><h4>' + esc(g.title) + '</h4><ul>' + g.features.map(featureHTML).join('') + '</ul></div>';
    }).join('');
    return '' +
      '<article class="plan' + (p.highlighted ? ' is-featured' : '') + '" data-plan="' + p.id + '" aria-labelledby="' + titleId + '">' +
        (p.badge ? '<span class="plan-badge">' + esc(p.badge) + '</span>' : '') +
        '<h3 class="plan-name" id="' + titleId + '">' + esc(p.name) + '</h3>' +
        '<p class="plan-tagline">' + esc(p.tagline) + '</p>' +
        anchorHTML(p) +
        '<p class="plan-price' + (p.price.was ? ' has-anchor' : '') + '">' + (p.price.was ? '<span class="por">por</span>' : '') +
          '<span class="cur">' + esc(p.price.currency) + '</span><span class="amt">' + amountHTML(p.price.amount) + '</span>' +
          '<span class="per' + (p.billingPeriod === 'one-time' ? ' per-once' : '') + '">' + esc(p.billingLabel) + '</span></p>' +
        '<p class="plan-devices">' + ICON.monitor + '<span>' + esc(p.deviceLimit.label) + '</span></p>' +
        /* sempre presente (vazio quando não há nota) para alinhar as linhas dos três cartões no desktop */
        '<p class="plan-devices-note"' + (p.deviceLimit.note ? '>' + esc(p.deviceLimit.note) : ' aria-hidden="true">') + '</p>' +
        '<p class="plan-desc">' + esc(p.description) + '</p>' +
        /* com link do Mercado Pago, o botão abre o checkout dele (mesma aba) */
        '<a class="plan-cta" href="' + esc(p.callToAction.href) + '"' +
          (p.callToAction.checkout ? ' rel="noopener" data-checkout="mercadopago" aria-label="' + esc(p.callToAction.label) + ' — pagamento pelo Mercado Pago"' : '') + '>' +
          esc(p.callToAction.label) + '</a>' +
        '<div class="plan-body">' +
          '<ul class="plan-primary">' + p.primaryFeatures.map(featureHTML).join('') + '</ul>' +
          (p.scopeNote ? '<p class="plan-scope">' + esc(p.scopeNote) + '</p>' : '') +
          '<button class="plan-more" type="button" aria-expanded="false" aria-controls="' + panelId + '">Ver todas as funcionalidades' + ICON.chevron + '</button>' +
          '<div class="plan-panel" id="' + panelId + '" role="region" aria-label="Todas as funcionalidades do ' + esc(p.name) + '" aria-hidden="true">' +
            '<div class="plan-panel-head"><span>Todas as funcionalidades</span>' +
              '<button class="plan-less" type="button" aria-controls="' + panelId + '" aria-expanded="true">Recolher' + ICON.chevron + '</button></div>' +
            '<div class="plan-panel-body">' + groups +
              '<ul class="plan-legend" aria-label="Legenda">' +
                '<li>' + ICON.check + 'Incluído</li><li>' + ICON.dash + 'Não incluído</li><li>' + ICON.plus + 'Opcional</li><li>' + ICON.clock + 'Em breve</li>' +
              '</ul>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</article>';
  }

  grid.innerHTML = data.PLANS.map(cardHTML).join('');
  if (notesEl) notesEl.innerHTML = data.NOTES.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('');

  /* ---------- Expansão ---------- */
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.plan'));
  var current = null;

  function parts(card) {
    return { body: card.querySelector('.plan-body'), more: card.querySelector('.plan-more'), panel: card.querySelector('.plan-panel') };
  }

  /* Altura máxima do painel: o espaço visível abaixo dele, entre 240 e 520 px (rolagem interna no resto). */
  function fitPanel(card) {
    var p = parts(card);
    var top = p.body.getBoundingClientRect().top;
    var avail = window.innerHeight - Math.max(top, 96) - 16;
    p.panel.style.setProperty('--panel-max', Math.round(Math.max(240, Math.min(520, avail))) + 'px');
  }

  function open(card) {
    if (current && current !== card) close(current);
    var p = parts(card);
    fitPanel(card);
    card.classList.add('is-open');
    p.more.setAttribute('aria-expanded', 'true');
    p.panel.setAttribute('aria-hidden', 'false');
    p.panel.removeAttribute('inert');
    current = card;
  }

  function close(card) {
    var p = parts(card);
    card.classList.remove('is-open');
    p.more.setAttribute('aria-expanded', 'false');
    p.panel.setAttribute('aria-hidden', 'true');
    p.panel.setAttribute('inert', '');
    p.panel.querySelector('.plan-panel-body').scrollTop = 0;
    if (current === card) current = null;
  }

  cards.forEach(function (card) {
    var p = parts(card);
    var openTimer = null, closeTimer = null;
    p.panel.setAttribute('inert', '');

    /* Desktop: abre com o mouse e fecha ao sair do cartão (o painel faz parte do cartão). */
    card.addEventListener('pointerenter', function (e) {
      if (e.pointerType !== 'mouse' || !hoverCapable.matches) return;
      clearTimeout(closeTimer);
      if (!card.classList.contains('is-open')) openTimer = setTimeout(function () { open(card); }, OPEN_DELAY);
    });
    card.addEventListener('pointerleave', function (e) {
      if (e.pointerType !== 'mouse' || !hoverCapable.matches) return;
      clearTimeout(openTimer);
      if (card.contains(document.activeElement) && document.activeElement.matches(':focus-visible')) return; // teclado no comando
      closeTimer = setTimeout(function () { close(card); }, CLOSE_DELAY);
    });

    /* Toque e teclado (Enter/Espaço são nativos do <button>). */
    p.more.addEventListener('click', function () {
      clearTimeout(openTimer); clearTimeout(closeTimer);
      if (card.classList.contains('is-open')) close(card);
      else { open(card); p.panel.querySelector('.plan-less').focus({ preventScroll: true }); }
    });
    p.panel.querySelector('.plan-less').addEventListener('click', function () {
      close(card); p.more.focus({ preventScroll: true });
    });

    /* Fecha quando o foco do teclado sai do cartão. */
    card.addEventListener('focusout', function (e) {
      if (!card.contains(e.relatedTarget) && !card.matches(':hover')) close(card);
    });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && current) {
      var card = current;
      close(card);
      parts(card).more.focus({ preventScroll: true });
    }
  });
  /* Toque fora fecha o painel aberto. */
  document.addEventListener('pointerdown', function (e) {
    if (current && !current.contains(e.target)) close(current);
  });
  window.addEventListener('resize', function () { if (current) fitPanel(current); });
})();
