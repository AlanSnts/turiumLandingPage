/* Testes das regras da seção de conectividade (js/connectivity.js + js/plans.js).
   Rodar: node turium-site/tests/connectivity.test.js   → exit code 0 = tudo certo. */
'use strict';
const assert = require('assert');
const path = require('path');
const fs = require('fs');
const P = require(path.join(__dirname, '..', 'js', 'plans.js'));
const C = require(path.join(__dirname, '..', 'js', 'connectivity.js'));

let passed = 0;
function test(name, fn) {
  try { fn(); passed++; console.log('ok  ', name); }
  catch (e) { console.error('FAIL', name, '\n     ', e.message); process.exitCode = 1; }
}
const L = C.LAYOUTS;
const kinds = id => L[id].links.map(l => l[2]);

test('os três planos têm layout', () => {
  assert.deepStrictEqual(Object.keys(L), ['basico', 'pro', 'enterprise']);
});
test('Básico: exatamente 1 computador, sem servidor e sem rede LAN', () => {
  assert.strictEqual(C.computerCount(L.basico), 1);
  assert.ok(!L.basico.nodes.server, 'Básico não pode ter servidor');
  assert.ok(!kinds('basico').includes('lan'), 'Básico não pode ter ligação LAN');
});
test('Pro: até 3 computadores (igual ao limite em plans.js), com servidor', () => {
  const limit = P.PLANS.find(p => p.id === 'pro').deviceLimit.count;
  assert.ok(C.computerCount(L.pro) <= limit);
  assert.strictEqual(C.computerCount(L.pro), 3);
  assert.ok(L.pro.nodes.server);
});
test('Enterprise: mais de 3 computadores e espaço para expansão', () => {
  assert.ok(C.computerCount(L.enterprise) > 3);
  assert.ok(L.enterprise.nodes.more, 'precisa mostrar novos terminais');
  assert.strictEqual(P.PLANS.find(p => p.id === 'enterprise').deviceLimit.count, null);
});
test('celular presente nos três planos', () => {
  ['basico', 'pro', 'enterprise'].forEach(id => assert.ok(L[id].nodes.phone, id));
});
test('app do proprietário segue a matriz de plans.js (nunca aparece como ativo)', () => {
  assert.strictEqual(C.ownerStatus(P, 'basico').kind, 'none');
  assert.strictEqual(C.ownerStatus(P, 'pro').kind, 'future');
  assert.strictEqual(C.ownerStatus(P, 'enterprise').kind, 'future');
  ['pro', 'enterprise'].forEach(id => {
    const link = L[id].links.find(l => l[1] === 'phone');
    assert.strictEqual(link[2], 'future', id + ': ligação do celular deve ser tracejada (futura)');
  });
  assert.ok(!L.basico.links.some(l => l[1] === 'phone'), 'Básico não liga o celular');
});
test('toda ligação aponta para dispositivos que existem no plano', () => {
  Object.keys(L).forEach(id => L[id].links.forEach(([a, b]) => {
    assert.ok(L[id].nodes[a] && L[id].nodes[b], id + ': ' + a + ' → ' + b);
  }));
});
test('telas usam as capturas enviadas (gestão, caixa, PDV) e elas existem', () => {
  assert.match(C.DEVICES.gestao.screen, /dashboard/);
  assert.match(C.DEVICES.caixa.screen, /caixa/);
  assert.match(C.DEVICES.pdv.screen, /pdv/);
  ['gestao', 'caixa', 'pdv', 'escritorio'].forEach(id =>
    assert.ok(fs.existsSync(path.join(__dirname, '..', C.DEVICES[id].screen)), C.DEVICES[id].screen));
});
test('dispositivos dentro do palco 1000×540', () => {
  Object.keys(L).forEach(id => Object.entries(L[id].nodes).forEach(([n, p]) => {
    assert.ok(p.x - p.w / 2 >= 0 && p.x + p.w / 2 <= 1000, id + '/' + n + ' sai pela lateral');
    assert.ok(p.y > 0 && p.y < 540, id + '/' + n);
  }));
});
test('quatro benefícios', () => { assert.strictEqual(C.BENEFITS.length, 4); });

console.log('\n' + passed + ' testes passaram' + (process.exitCode ? ' — há falhas' : ''));
