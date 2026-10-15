#!/usr/bin/env node
/* Turium — cria, UMA VEZ, os links de pagamento do Mercado Pago usados pelos botões da seção de planos.

   O que cria na sua conta do Mercado Pago:
     Turium Básico      → preferência do Checkout Pro (pagamento único de R$ 199,90)
     Turium Pro         → plano de assinatura mensal de R$ 450,00   (POST /preapproval_plan)
     Turium Enterprise  → plano de assinatura mensal de R$ 999,00   (POST /preapproval_plan)
   Cada um devolve um "init_point": a página de pagamento hospedada pelo Mercado Pago. O site só
   aponta para esses links; o Access Token fica SÓ no seu computador, na hora de rodar este script.

   Uso (PowerShell, na pasta do site):
     $env:MP_ACCESS_TOKEN = "<seu Access Token>"        # Mercado Pago → Suas integrações → Credenciais
     $env:SITE_URL = "https://seu-dominio.com.br"       # endereço público do site (https)
     node tools/mercadopago/criar-links.mjs --simular   # mostra o que seria criado, sem chamar a API
     node tools/mercadopago/criar-links.mjs             # cria e grava tools/mercadopago/links.json
     Remove-Item Env:MP_ACCESS_TOKEN                    # apaga o token da sessão ao terminar

   Teste primeiro com as credenciais de TESTE (contas de teste do Mercado Pago); depois rode de novo
   com as de produção, usando --novo. O token nunca é impresso nem gravado em arquivo.
   Requer Node 18 ou mais novo (fetch nativo). */
import { writeFileSync, existsSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'links.json');
const args = new Set(process.argv.slice(2));
const SIMULAR = args.has('--simular');

const TOKEN = process.env.MP_ACCESS_TOKEN || '';
const SITE = (process.env.SITE_URL || '').replace(/\/+$/, '');
if (!/^https:\/\/[^/]+/.test(SITE)) sair('Defina SITE_URL com o endereço público do site, começando com https://');
if (!SIMULAR && !TOKEN) sair('Defina MP_ACCESS_TOKEN (Access Token do Mercado Pago) antes de rodar.');
if (!SIMULAR && existsSync(OUT) && !args.has('--novo')) sair('Os links já foram criados (tools/mercadopago/links.json). Para criar outros, rode com --novo.');

const voltar = (plano, extra = '') => `${SITE}/obrigado.html?plano=${plano}${extra}`;

const BASICO = {
  items: [{ id: 'turium-basico', title: 'Turium Básico — licença permanente (1 computador)', quantity: 1, currency_id: 'BRL', unit_price: 199.90 }],
  back_urls: { success: voltar('basico'), pending: voltar('basico', '&status=pendente'), failure: `${SITE}/#planos` },
  auto_return: 'approved',
  external_reference: 'turium-basico'
};
const assinatura = (plano, nome, valor) => ({
  reason: `${nome} — assinatura mensal`,
  external_reference: `turium-${plano}`,
  auto_recurring: { frequency: 1, frequency_type: 'months', transaction_amount: valor, currency_id: 'BRL' },
  back_url: voltar(plano)
});
const PRO = assinatura('pro', 'Turium Pro', 450.00);
const ENTERPRISE = assinatura('enterprise', 'Turium Enterprise', 999.00);

if (SIMULAR) {
  console.log('POST /checkout/preferences', JSON.stringify(BASICO, null, 2));
  console.log('POST /preapproval_plan', JSON.stringify(PRO, null, 2));
  console.log('POST /preapproval_plan', JSON.stringify(ENTERPRISE, null, 2));
  console.log('\nSimulação: nada foi criado.');
  process.exit(0);
}

const links = {
  basico: (await mp('/checkout/preferences', BASICO)).init_point,
  pro: (await mp('/preapproval_plan', PRO)).init_point,
  enterprise: (await mp('/preapproval_plan', ENTERPRISE)).init_point
};
for (const [k, v] of Object.entries(links)) if (!/^https:\/\//.test(v || '')) sair(`O Mercado Pago não devolveu o link de ${k}.`);
writeFileSync(OUT, JSON.stringify({ criadoEm: new Date().toISOString(), site: SITE, ...links }, null, 2) + '\n');
console.log('Links criados (cole em js/plans.js, no objeto CHECKOUT):\n');
console.log(`  basico: '${links.basico}',\n  pro: '${links.pro}',\n  enterprise: '${links.enterprise}'`);

async function mp(caminho, corpo) {
  const r = await fetch('https://api.mercadopago.com' + caminho, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json', 'X-Idempotency-Key': randomUUID() },
    body: JSON.stringify(corpo)
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) sair(`${caminho} respondeu ${r.status}: ${j.message || j.error || 'erro sem mensagem'}`);
  return j;
}
function sair(msg) { console.error('Erro: ' + msg); process.exit(1); }
