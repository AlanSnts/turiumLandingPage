/* Testes das regras comerciais dos planos (js/plans.js).
   Rodar: node turium-site/tests/plans.test.js   → exit code 0 = tudo certo. */
'use strict';
const assert = require('assert');
const path = require('path');
const { PLANS, NOTES } = require(path.join(__dirname, '..', 'js', 'plans.js'));

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok  ', name); }
  catch (e) { console.error('FAIL', name, '\n     ', e.message); process.exitCode = 1; }
}
const byId = Object.fromEntries(PLANS.map(p => [p.id, p]));
const all = p => p.featureGroups.flatMap(g => g.features);
const find = (p, label) => all(p).find(f => f.label === label);

test('três planos, na ordem Básico, Pro, Enterprise', () => {
  assert.deepStrictEqual(PLANS.map(p => p.id), ['basico', 'pro', 'enterprise']);
});
test('preços corretos', () => {
  assert.strictEqual(byId.basico.price.amount, '200');
  assert.strictEqual(byId.pro.price.amount, '450');
  assert.strictEqual(byId.enterprise.price.amount, '1.000');
  PLANS.forEach(p => assert.strictEqual(p.price.currency, 'R$'));
});
test('periodicidade: Básico único, Pro e Enterprise mensais', () => {
  assert.strictEqual(byId.basico.billingPeriod, 'one-time');
  assert.match(byId.basico.billingLabel, /pagamento único/);
  assert.strictEqual(byId.pro.billingPeriod, 'monthly');
  assert.strictEqual(byId.enterprise.billingPeriod, 'monthly');
});
test('limite de computadores: 1, 3 e sem limite', () => {
  assert.strictEqual(byId.basico.deviceLimit.count, 1);
  assert.strictEqual(byId.pro.deviceLimit.count, 3);
  assert.strictEqual(byId.enterprise.deviceLimit.count, null);
});
test('Enterprise não promete capacidade infinita do servidor', () => {
  assert.match(byId.enterprise.deviceLimit.note, /infraestrutura/);
});
test('só o Pro é destacado', () => {
  assert.deepStrictEqual(PLANS.filter(p => p.highlighted).map(p => p.id), ['pro']);
});
test('cartão compacto: até 5 itens (computadores + recursos principais)', () => {
  PLANS.forEach(p => assert.ok(p.primaryFeatures.length + 1 <= 5, p.id));
});
test('botões de contratação com os textos definidos', () => {
  assert.strictEqual(byId.basico.callToAction.label, 'Comprar licença');
  assert.strictEqual(byId.pro.callToAction.label, 'Assinar Turium Pro');
  assert.strictEqual(byId.enterprise.callToAction.label, 'Contratar Enterprise');
});
test('Básico não anuncia NF-e/NFC-e nem LAN multi-PC', () => {
  assert.strictEqual(find(byId.basico, 'NF-e / NFC-e').status, 'unavailable');
  assert.strictEqual(find(byId.basico, 'Banco compartilhado pela LAN').status, 'unavailable');
  assert.ok(!JSON.stringify(byId.basico.primaryFeatures).match(/NF-e|LAN/));
});
test('NF-e/NFC-e é opcional e futura no Pro e no Enterprise (não inclusa na mensalidade)', () => {
  ['pro', 'enterprise'].forEach(id => {
    const f = find(byId[id], 'NF-e / NFC-e');
    assert.strictEqual(f.status, 'optional', id);
    assert.ok(f.future, id + ' deve estar marcada como futura');
  });
});
test('recursos futuros nunca aparecem como incluídos', () => {
  const futuros = ['Backup distribuído pela LAN', 'Gestão de múltiplas filiais', 'Turium Owner remoto', 'IA para gestão e estoque', 'Turium Mídia e painéis digitais', 'Campanhas criadas com IA', 'Integração com redes sociais', 'NF-e / NFC-e'];
  PLANS.forEach(p => futuros.forEach(label => {
    const f = find(p, label);
    assert.ok(f, p.id + ': falta ' + label);
    assert.notStrictEqual(f.status, 'included', p.id + ': ' + label + ' não pode estar como incluído');
  }));
});
test('Enterprise: IA aparece como em desenvolvimento no cartão compacto', () => {
  const ia = byId.enterprise.primaryFeatures.find(f => /inteligência artificial/.test(f.label));
  assert.strictEqual(ia.status, 'dev');
});
test('cada plano superior inclui tudo o que o anterior inclui', () => {
  [['basico', 'pro'], ['pro', 'enterprise']].forEach(([a, b]) => {
    all(byId[a]).filter(f => f.status === 'included').forEach(f => {
      assert.strictEqual(find(byId[b], f.label).status, 'included', b + ' deveria incluir ' + f.label);
    });
  });
});
test('Básico explica que a licença cobre só esta edição', () => {
  assert.match(byId.basico.scopeNote, /1 computador/);
  assert.match(byId.basico.scopeNote, /só os recursos do Básico/);
});
test('avisos importantes presentes', () => {
  assert.ok(NOTES.length >= 5);
});

console.log('\n' + passed + ' testes passaram' + (process.exitCode ? ' — há falhas' : ''));
