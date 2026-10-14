/* =========================================================
   CONECTIVIDADE — dados da seção (fonte única).
   Dispositivos, posição de cada um por plano e ligações.
   Limites de computadores e situação do app do proprietário
   vêm de js/plans.js, para nunca contradizer os preços.
   ========================================================= */

/**
 * @typedef {'laptop'|'server'|'phone'|'db'|'ghost'|'badge'|'log'} DeviceType
 * @typedef {Object} DeviceDef
 * @property {DeviceType} type
 * @property {string} label
 * @property {string} desc
 * @property {string} [screen]     Imagem mostrada na tela (laptops).
 * @property {string} [screenPos]  object-position da captura.
 * @property {number} order        Ordem no layout simplificado do celular.
 * @property {boolean} [isComputer]
 */
/**
 * @typedef {'lan'|'local'|'future'|'ghost'} LinkKind
 *  lan    → rede local ativa (pulsos nos dois sentidos)
 *  local  → dentro do mesmo computador (Básico)
 *  future → recurso ainda não lançado (tracejado, sem pulsos)
 *  ghost  → capacidade de expansão (tracejado dourado, pulso lento)
 * @typedef {Object} PlanLayout
 * @property {string} title
 * @property {string} text
 * @property {string[]} highlights
 * @property {string} a11y                         Descrição da ilustração para leitores de tela.
 * @property {Object<string,{x:number,y:number,w:number,dim?:boolean}>} nodes  Centro (x,y) e largura w no palco 1000×540.
 * @property {Array<[string,string,LinkKind]>} links
 */

(function () {
  'use strict';

  /** @type {Object<string, DeviceDef>} */
  var DEVICES = {
    server:     { type: 'server', label: 'Servidor da loja', desc: 'Banco de dados central', order: 0 },
    gestao:     { type: 'laptop', label: 'Gestão', desc: 'Vendas, estoque e relatórios', screen: 'img/turium-dashboard-960.webp', screenPos: 'left top', order: 1, isComputer: true },
    caixa:      { type: 'laptop', label: 'Caixa', desc: 'Abertura, sangria e fechamento', screen: 'img/turium-caixa.webp', screenPos: 'left top', order: 2, isComputer: true },
    pdv:        { type: 'laptop', label: 'PDV Rápido', desc: 'Monta e recebe no balcão', screen: 'img/turium-pdv.webp', screenPos: 'left top', order: 3, isComputer: true },
    escritorio: { type: 'laptop', label: 'Escritório', desc: 'Financeiro e compras', screen: 'img/turium-dashboard-960.webp', screenPos: 'right top', order: 4, isComputer: true },
    more:       { type: 'ghost', label: 'Novos terminais', desc: 'Sem limite comercial', order: 5 },
    db:         { type: 'db', label: 'Banco de dados local', desc: 'Neste computador', order: 2 },
    offline:    { type: 'badge', label: 'Funciona sem internet', desc: 'Sem servidor e sem rede', order: 3 },
    sync:       { type: 'log', label: 'Sincronização na rede', desc: 'Eventos chegando ao servidor', order: 6 },
    phone:      { type: 'phone', label: 'Celular', desc: 'App do proprietário', order: 7 }
  };

  /** @type {Object<string, PlanLayout>} */
  var LAYOUTS = {
    basico: {
      title: 'Operação local para começar com simplicidade',
      text: 'Ideal para quem deseja usar o Turium em um único computador, com os recursos essenciais da operação.',
      highlights: ['Banco de dados no próprio computador', 'Funciona sem internet', 'Sem rede entre computadores'],
      a11y: 'Plano Básico: um único computador com a tela de gestão do Turium, ligado ao banco de dados local no próprio computador. Não há servidor nem rede entre computadores. O celular aparece apagado: o app do proprietário não faz parte do Básico.',
      nodes: {
        gestao:  { x: 500, y: 200, w: 430 },
        db:      { x: 500, y: 468, w: 270 },
        offline: { x: 140, y: 250, w: 200 },
        phone:   { x: 865, y: 270, w: 88, dim: true }
      },
      links: [['gestao', 'db', 'local']]
    },
    pro: {
      title: 'Até 3 computadores conectados na mesma loja',
      text: 'Compartilhe vendas, caixa e gestão com integração pela rede local e controle centralizado da operação.',
      highlights: ['Servidor da loja com banco central', 'Gestão, caixa e PDV na mesma base', 'Rede local (LAN), sem depender de internet'],
      a11y: 'Plano Pro: um servidor da loja no centro, ligado pela rede local a três computadores: gestão, caixa e PDV Rápido. Pulsos mostram os dados indo e voltando. Um celular aparece ligado por linha tracejada: o app do proprietário é opcional e ainda não foi lançado.',
      nodes: {
        gestao: { x: 175, y: 128, w: 262 },
        caixa:  { x: 500, y: 112, w: 262 },
        pdv:    { x: 825, y: 128, w: 262 },
        server: { x: 500, y: 410, w: 104 },
        phone:  { x: 160, y: 412, w: 76 },
        sync:   { x: 822, y: 425, w: 250 }
      },
      links: [['server', 'gestao', 'lan'], ['server', 'caixa', 'lan'], ['server', 'pdv', 'lan'], ['server', 'phone', 'future']]
    },
    enterprise: {
      title: 'Infraestrutura escalável para operações mais completas',
      text: 'Conecte múltiplos dispositivos, organize equipes e amplie a gestão do negócio com uma estrutura mais robusta.',
      highlights: ['Terminais por setor: gestão, caixa, PDV e escritório', 'Equipes e permissões por função', 'Capacidade conforme a infraestrutura contratada'],
      a11y: 'Plano Enterprise: um servidor da loja ligado pela rede local a quatro computadores (gestão, caixa, PDV Rápido e escritório) e a um espaço para novos terminais, sem limite comercial. Um celular aparece ligado por linha tracejada: o app do proprietário ainda não foi lançado.',
      nodes: {
        gestao:     { x: 125, y: 118, w: 212 },
        caixa:      { x: 375, y: 100, w: 212 },
        pdv:        { x: 625, y: 100, w: 212 },
        escritorio: { x: 875, y: 118, w: 212 },
        server:     { x: 500, y: 418, w: 104 },
        phone:      { x: 150, y: 418, w: 72 },
        more:       { x: 845, y: 418, w: 215 }
      },
      links: [['server', 'gestao', 'lan'], ['server', 'caixa', 'lan'], ['server', 'pdv', 'lan'], ['server', 'escritorio', 'lan'], ['server', 'more', 'ghost'], ['server', 'phone', 'future']]
    }
  };

  var BENEFITS = [
    { title: 'Estrutura que cresce com a loja', text: 'Comece em um computador e evolua para uma rede com servidor quando a operação pedir.' },
    { title: 'Integração entre vendas, caixa e gestão', text: 'A venda do PDV aparece no caixa e nos relatórios, sem redigitar nada.' },
    { title: 'Rede local com dados centralizados', text: 'No Pro e no Enterprise, todos os computadores usam o mesmo banco do servidor da loja.' },
    { title: 'Experiência visual moderna e intuitiva', text: 'A mesma interface em todos os computadores, do balcão ao escritório.' }
  ];

  /* ---------- Ligações com js/plans.js ---------- */
  function planById(plansApi, id) {
    return plansApi.PLANS.find(function (p) { return p.id === id; });
  }
  /** Situação do app do proprietário no plano (lida da matriz de funcionalidades). */
  function ownerStatus(plansApi, id) {
    var p = planById(plansApi, id);
    var f = p.featureGroups.flatMap(function (g) { return g.features; }).find(function (x) { return x.label === 'Turium Owner remoto'; });
    if (!f || f.status === 'unavailable') return { kind: 'none', label: 'Não incluso no Básico' };
    if (f.status === 'optional') return { kind: 'future', label: 'Opcional · em breve' };
    if (f.status === 'soon' || f.status === 'dev') return { kind: 'future', label: 'Em breve' };
    return { kind: 'active', label: 'Incluso' };
  }
  function computerCount(layout) {
    return Object.keys(layout.nodes).filter(function (id) { return DEVICES[id].isComputer; }).length;
  }

  var api = { DEVICES: DEVICES, LAYOUTS: LAYOUTS, BENEFITS: BENEFITS, ownerStatus: ownerStatus, planById: planById, computerCount: computerCount };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (typeof window !== 'undefined') window.TURIUM_CONNECTIVITY = api;
})();
