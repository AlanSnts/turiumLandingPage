/* =========================================================
   PLANOS DO TURIUM — fonte única de preços e funcionalidades.
   Edite só este arquivo para mudar preço, textos ou recursos;
   o layout (js/pricing.js) monta tudo a partir daqui.
   ========================================================= */

/**
 * Situação de um recurso em um plano.
 *  included    → incluído e disponível hoje (ícone de confirmação)
 *  unavailable → não faz parte do plano (indicador neutro)
 *  optional    → módulo opcional, contratado à parte
 *  soon        → ainda não lançado ("Em breve")
 *  dev         → em desenvolvimento ("Em desenvolvimento")
 * Um recurso pode ser opcional E futuro: use status 'optional' com future: 'soon' | 'dev'.
 * @typedef {'included'|'unavailable'|'optional'|'soon'|'dev'} FeatureStatus
 */

/**
 * @typedef {Object} PlanFeature
 * @property {string} label
 * @property {FeatureStatus} status
 * @property {'soon'|'dev'} [future]   Para opcionais que ainda não foram lançados.
 * @property {string} [value]          Valor no lugar do ícone (ex.: "Até 3").
 */

/**
 * @typedef {Object} FeatureGroup
 * @property {string} title
 * @property {PlanFeature[]} features
 */

/**
 * @typedef {Object} Plan
 * @property {string} id
 * @property {string} name
 * @property {string} tagline            Frase de destaque do cartão.
 * @property {string} description        Para quem é o plano.
 * @property {{ amount: string, currency: string }} price
 * @property {'one-time'|'monthly'} billingPeriod
 * @property {string} billingLabel        Texto exibido ao lado do preço.
 * @property {{ count: number|null, label: string, note?: string }} deviceLimit  count null = sem limite comercial
 * @property {boolean} highlighted
 * @property {string} [badge]             Selo de posicionamento comercial (não é métrica).
 * @property {PlanFeature[]} primaryFeatures  Até 5, mostrados no cartão compacto.
 * @property {FeatureGroup[]} featureGroups   Lista completa, por categoria.
 * @property {string[]} optionalModules       Módulos vendidos à parte.
 * @property {{ label: string, href: string }} callToAction
 * @property {'available'} availabilityStatus Situação comercial do plano.
 * @property {string} [scopeNote]         Aviso de escopo exibido no cartão.
 */

(function () {
  'use strict';
  var I = 'included', N = 'unavailable', O = 'optional', SOON = 'soon', DEV = 'dev';

  /* Matriz única: cada linha traz o status em [Básico, Pro, Enterprise].
     Os grupos seguem as categorias pedidas para o estado expandido. */
  var MATRIX = [
    { title: 'Operação e vendas', rows: [
      ['Cadastro de clientes',              [I, I, I]],
      ['Orçamentos, pedidos e PDV',         [I, I, I]],
      ['Controle de caixa e pagamentos',    [I, I, I]],
      ['Descontos e políticas comerciais',  [N, I, I]],
      ['Campanhas e fidelidade',            [N, I, I]]
    ]},
    { title: 'Estoque e produtos', rows: [
      ['Cadastro de produtos',              [I, I, I]],
      ['Estoque e inventário',              [I, I, I]],
      ['Leitor de código de barras',        [I, I, I]],
      ['Impressão de etiquetas',            [I, I, I]]
    ]},
    { title: 'Gestão e relatórios', rows: [
      ['Dashboard de vendas',               [I, I, I]],
      ['Dashboard personalizado 2D/3D',     [I, I, I]],
      ['Margem e markup',                   [I, I, I]],
      ['Histórico de operações',            [I, I, I]],
      ['Relatórios financeiros avançados',  [N, I, I]],
      ['Usuários e permissões',             [N, I, I]],
      ['Gestão avançada de equipes',        [N, I, I]]
    ]},
    { title: 'Equipamentos e infraestrutura', rows: [
      ['Computadores licenciados',          [{ value: '1' }, { value: 'Até 3' }, { value: 'Sem limite' }]],
      ['Comprovantes térmicos 58/80 mm',    [I, I, I]],
      ['Funcionamento offline',             [I, I, I]],
      ['Backup local',                      [I, I, I]],
      ['Banco compartilhado pela LAN',      [N, I, I]],
      ['Vendas e caixa em vários terminais',[N, I, I]],
      ['Backup distribuído pela LAN',       [N, DEV, DEV]],
      ['Gestão de múltiplas filiais',       [N, N, SOON]]
    ]},
    { title: 'Fiscal e automação', rows: [
      ['NF-e / NFC-e',                      [N, { status: O, future: SOON }, { status: O, future: SOON }]],
      ['Turium Owner remoto',               [N, { status: O, future: SOON }, SOON]],
      ['IA para gestão e estoque',          [N, N, SOON]],
      ['Turium Mídia e painéis digitais',   [N, N, DEV]],
      ['Campanhas criadas com IA',          [N, N, DEV]],
      ['Integração com redes sociais',      [N, N, SOON]]
    ]}
  ];

  function groupsFor(col) {
    return MATRIX.map(function (g) {
      return {
        title: g.title,
        features: g.rows.map(function (r) {
          var cell = r[1][col];
          if (typeof cell === 'string') return { label: r[0], status: cell };
          if (cell.value) return { label: r[0], status: I, value: cell.value };
          return { label: r[0], status: cell.status, future: cell.future };
        })
      };
    });
  }

  /** @type {Plan[]} */
  var PLANS = [
    {
      id: 'basico',
      name: 'Turium Básico',
      tagline: 'Um computador. Controle completo da operação essencial.',
      description: 'Para pequenos comerciantes que precisam vender, organizar o estoque e acompanhar o negócio sem mensalidades.',
      price: { amount: '200', currency: 'R$' },
      billingPeriod: 'one-time',
      billingLabel: 'pagamento único',
      deviceLimit: { count: 1, label: '1 computador autorizado' },
      highlighted: false,
      primaryFeatures: [
        { label: 'Cadastro de produtos e clientes', status: I },
        { label: 'Vendas, pedidos e orçamentos', status: I },
        { label: 'Gestão de estoque e caixa', status: I },
        { label: 'Funcionamento offline', status: I }
      ],
      featureGroups: groupsFor(0),
      optionalModules: [],
      callToAction: { label: 'Comprar licença', href: '#comecar' },
      availabilityStatus: 'available',
      scopeNote: 'Licença permanente desta edição para 1 computador. Inclui só os recursos do Básico, sem NF-e/NFC-e nem rede entre computadores.'
    },
    {
      id: 'pro',
      name: 'Turium Pro',
      tagline: 'Mais computadores. Mais controle. Mais produtividade.',
      description: 'Para lojas em crescimento que precisam conectar setores, acompanhar resultados e administrar equipes com eficiência.',
      price: { amount: '450', currency: 'R$' },
      billingPeriod: 'monthly',
      billingLabel: '/mês',
      deviceLimit: { count: 3, label: 'Até 3 computadores autorizados' },
      highlighted: true,
      badge: 'Mais escolhido',
      primaryFeatures: [
        { label: 'Tudo do Básico', status: I },
        { label: 'Integração entre terminais pela LAN', status: I },
        { label: 'Relatórios financeiros avançados', status: I },
        { label: 'Campanhas e fidelidade', status: I }
      ],
      featureGroups: groupsFor(1),
      optionalModules: ['NF-e / NFC-e (em breve)', 'Turium Owner remoto (em breve)'],
      callToAction: { label: 'Assinar Turium Pro', href: '#comecar' },
      availabilityStatus: 'available'
    },
    {
      id: 'enterprise',
      name: 'Turium Enterprise',
      tagline: 'Sua operação sem limites comerciais de computadores.',
      description: 'Para empresas com operações maiores que precisam de infraestrutura escalável, automação e recursos avançados de gestão.',
      price: { amount: '1.000', currency: 'R$' },
      billingPeriod: 'monthly',
      billingLabel: '/mês',
      deviceLimit: { count: null, label: 'Computadores ilimitados', note: 'Sem limite comercial; o uso simultâneo depende da infraestrutura.' },
      highlighted: false,
      primaryFeatures: [
        { label: 'Tudo do Pro', status: I },
        { label: 'Operação integrada pela LAN', status: I },
        { label: 'Recursos empresariais avançados', status: I },
        { label: 'Automação e inteligência artificial', status: DEV }
      ],
      featureGroups: groupsFor(2),
      optionalModules: ['NF-e / NFC-e (em breve)'],
      callToAction: { label: 'Contratar Enterprise', href: '#comecar' },
      availabilityStatus: 'available'
    }
  ];

  /* Informações exibidas abaixo dos cartões. */
  var NOTES = [
    'Básico: licença permanente para um computador autorizado, com política própria de suporte e atualizações.',
    'Pro: até três computadores registrados por licença.',
    'Enterprise: sem limite comercial de computadores; a capacidade simultânea depende da infraestrutura contratada.',
    'O núcleo operacional do Turium funciona sem conexão permanente à internet.',
    'O módulo fiscal é exclusivo do Pro e do Enterprise, mediante contratação adicional, quando disponibilizado.',
    'Recursos marcados como “Em breve” ou “Em desenvolvimento” não fazem parte da entrega imediata.'
  ];

  var api = { PLANS: PLANS, NOTES: NOTES };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;   // usado pelos testes (Node)
  if (typeof window !== 'undefined') window.TURIUM_PLANS = api;
})();
