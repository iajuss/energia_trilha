// Verificação da página P1 — roda os testes de "Como verifico" da SPEC.md, com o envio pelo WhatsApp (DECISOES.md, D1).
// Uso: npm install && npm run verificar  (usa o Microsoft Edge instalado, sem baixar navegador)
import { chromium } from 'playwright-core';
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const saida = join(raiz, 'verificacao');
const tipos = { '.html': 'text/html; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png' };

const servidor = createServer(async (req, res) => {
  try {
    const caminho = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const arquivo = join(raiz, caminho === '/' ? 'index.html' : caminho);
    res.writeHead(200, { 'Content-Type': tipos[extname(arquivo)] || 'application/octet-stream' });
    res.end(await readFile(arquivo));
  } catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${servidor.address().port}/`;

const resultados = [];
function registrar(nome, passou, detalhe) {
  resultados.push({ teste: nome, passou, detalhe });
  console.log(`${passou ? 'PASSOU' : 'FALHOU'}  ${nome}${detalhe ? ' — ' + detalhe : ''}`);
}

const navegador = await chromium.launch({ channel: 'msedge' });

// Abre a página a 375 px e intercepta o WhatsApp: cada abertura de wa.me é registrada e
// respondida com uma página vazia, sem sair para o WhatsApp de verdade.
const html = await readFile(join(raiz, 'index.html'), 'utf8');
const numeroConfigurado = (html.match(/WHATSAPP_RAVENA = '([^']*)'/) || [])[1];

async function abrir(largura = 375, altura = 812) {
  const contexto = await navegador.newContext({ viewport: { width: largura, height: altura } });
  const aberturas = [];
  await contexto.route(/^https:\/\/(wa\.me|api\.whatsapp\.com)\//, async (rota) => {
    const u = new URL(rota.request().url());
    aberturas.push({ url: u.href, numero: u.pathname.slice(1), texto: u.searchParams.get('text') || '' });
    await rota.fulfill({ status: 200, contentType: 'text/html', body: '<p>WhatsApp (interceptado)</p>' });
  });
  const pagina = await contexto.newPage();
  await pagina.goto(base);
  return { pagina, aberturas };
}

async function preencher(pagina, { cidade = 'Sorocaba', conta }) {
  await pagina.fill('#nome', 'Teste Verificação');
  await pagina.selectOption('#cidade', cidade);
  await pagina.fill('#conta', conta);
  await pagina.click('#enviar');
  await pagina.waitForTimeout(600);
}

// 0. O número no link tem formato de WhatsApp (DDI 55 + DDD + número) e não aparece como texto na página.
//    Hoje é o fictício 551500000000 (DECISOES.md, D3): nenhum número no Brasil começa com 0.
const ficticio = numeroConfigurado === '551500000000';
registrar('Número do WhatsApp em formato válido de link' + (ficticio ? ' (FICTÍCIO, ver D3)' : ''),
  /^55\d{10,11}$/.test(numeroConfigurado || ''), `WHATSAPP_RAVENA = '${numeroConfigurado}'`);
{
  const { pagina } = await abrir();
  const texto = (await pagina.evaluate(() => document.body.innerText)).replace(/\D/g, '');
  const local = (numeroConfigurado || '').slice(2);
  registrar('Número da Ravena não aparece como texto na página', !texto.includes(local), `procurado: ${local}`);
  await pagina.close();
}

// 1. Conta de R$ 300: o WhatsApp não abre e aparece a explicação
{
  const { pagina, aberturas } = await abrir();
  await preencher(pagina, { conta: '300' });
  const aviso = await pagina.isVisible('#aviso-conta');
  registrar('Conta R$ 300 não abre o WhatsApp e mostra a explicação', aberturas.length === 0 && aviso,
    `aberturas do WhatsApp: ${aberturas.length}; explicação visível: ${aviso}`);
  await pagina.locator('#simulacao').screenshot({ path: join(saida, '01-conta-300-bloqueada-375px.png') });
  await pagina.close();
}

// 2. Conta de R$ 450: abre o WhatsApp da Ravena com nome, cidade e conta na mensagem
{
  const { pagina, aberturas } = await abrir();
  await preencher(pagina, { conta: '450' });
  const a = aberturas[0] || { texto: '', numero: '' };
  const esperado = ['Simulação pelo site', 'Nome: Teste Verificação', 'Cidade: Sorocaba', 'Conta de luz média: R$ 450,00'];
  const faltando = esperado.filter((t) => !a.texto.includes(t));
  const ok = await pagina.isVisible('#ok');
  registrar('Conta R$ 450 abre o WhatsApp com nome, cidade e conta', aberturas.length === 1 && faltando.length === 0 && ok,
    `aberturas: ${aberturas.length}; mensagem: ${JSON.stringify(a.texto)}` + (faltando.length ? `; FALTANDO: ${faltando.join(' | ')}` : ''));
  registrar('Mensagem vai para o número da Ravena', a.numero === numeroConfigurado, `número no link: ${a.numero}`);
  const href = await pagina.getAttribute('#abrir-zap', 'href');
  registrar('Botão "Abrir o WhatsApp de novo" aponta para o mesmo link', href === a.url);
  const texto = await pagina.textContent('#ok');
  registrar('Confirmação manda apertar enviar e pede a foto da conta', /apertar enviar/.test(texto) && /foto/.test(texto));
  await pagina.locator('#simulacao').screenshot({ path: join(saida, '02-conta-450-whatsapp-375px.png') });
  await pagina.close();
}

// 3. Limites e formatos brasileiros
for (const [valor, deveAbrir, naMensagem] of [['449,99', false], ['R$ 449', false], ['450,00', true, 'R$ 450,00'], ['R$ 1.200,00', true, 'R$ 1.200,00'], ['1.200', true, 'R$ 1.200,00']]) {
  const { pagina, aberturas } = await abrir();
  await preencher(pagina, { conta: valor });
  const conta = (aberturas[0]?.texto.match(/Conta de luz média: (.*)/) || [])[1];
  registrar(`Conta "${valor}" ${deveAbrir ? 'abre o WhatsApp' : 'não abre'}`,
    (aberturas.length === 1) === deveAbrir && (!deveAbrir || conta === naMensagem),
    `aberturas: ${aberturas.length}${conta ? '; conta na mensagem: ' + conta : ''}`);
  await pagina.close();
}

// 4. "Outra cidade da região": aviso de 80 km aparece e o pedido segue mesmo assim
{
  const { pagina, aberturas } = await abrir();
  await pagina.selectOption('#cidade', 'Outra cidade da região');
  const aviso = await pagina.isVisible('#aviso-cidade');
  const textoAviso = await pagina.textContent('#aviso-cidade');
  await pagina.locator('#cidade').locator('xpath=..').screenshot({ path: join(saida, '03-outra-cidade-aviso-375px.png') });
  await preencher(pagina, { cidade: 'Outra cidade da região', conta: '900' });
  registrar('Outra cidade mostra aviso de 80 km e abre o WhatsApp', aviso && /80 km/.test(textoAviso) && aberturas.length === 1
    && aberturas[0].texto.includes('Cidade: Outra cidade da região'), `aviso visível: ${aviso}; aberturas: ${aberturas.length}`);
  await pagina.close();
}

// 5. Campos obrigatórios
{
  const { pagina, aberturas } = await abrir();
  await pagina.click('#enviar');
  await pagina.waitForTimeout(200);
  const erros = await pagina.locator('[aria-invalid="true"]').count();
  registrar('Formulário vazio não abre o WhatsApp e marca os 3 campos', aberturas.length === 0 && erros === 3, `campos marcados: ${erros}`);
  await pagina.close();
}

// 6. Celular de 375 px: sem rolagem horizontal; capturas da página inteira
{
  const { pagina } = await abrir();
  const larguras = await pagina.evaluate(() => ({ doc: document.documentElement.scrollWidth, tela: window.innerWidth }));
  registrar('Sem rolagem horizontal a 375 px', larguras.doc <= larguras.tela, `scrollWidth ${larguras.doc} / viewport ${larguras.tela}`);
  const menorFonte = await pagina.evaluate(() => {
    let min = 99;
    for (const el of document.querySelectorAll('main p, main li, main dd, main label')) {
      if (el.offsetParent) min = Math.min(min, parseFloat(getComputedStyle(el).fontSize));
    }
    return min;
  });
  registrar('Texto corrido com pelo menos 15 px no celular', menorFonte >= 15, `menor fonte: ${menorFonte}px`);
  await pagina.screenshot({ path: join(saida, '04-pagina-inteira-375px.png'), fullPage: true });
  await pagina.close();
  const { pagina: desk } = await abrir(1280, 800);
  await desk.screenshot({ path: join(saida, '05-pagina-inteira-1280px.png'), fullPage: true });
  await desk.close();
}

// 7. Palavras proibidas pelo brief
{
  const minusculo = html.toLowerCase();
  const proibidas = ['energia do futuro', 'sustentabilidade', 'sustentável', 'revolução solar', 'grátis', 'gratis', '95%', '95 %'];
  const achadas = proibidas.filter((p) => minusculo.includes(p));
  registrar('Nenhuma palavra proibida no HTML', achadas.length === 0, achadas.length ? `achadas: ${achadas.join(', ')}` : proibidas.join(' · '));
  const prazos = [...minusculo.matchAll(/\d+\s*(?:a\s*\d+\s*)?dias/g)].map((m) => m[0]);
  const prazosOk = prazos.every((p) => p === '45 a 60 dias' || p === '2 dias');
  registrar('Único prazo de entrega é 45 a 60 dias (2 dias = instalação)', prazosOk, `prazos no HTML: ${prazos.join(' · ')}`);
}

// 8. Cada número visível na página confere com o brief
{
  const { pagina } = await abrir(1280, 800);
  const texto = await pagina.evaluate(() => document.body.innerText);
  await pagina.close();
  const brief = (await readFile(join(raiz, 'brief.md'), 'utf8')).replace(/\s+/g, ' ');
  // número na página -> trecho do brief que o sustenta
  const fontes = {
    '450': 'Conta de luz acima de R$ 450 por mês',
    '75': 'a conta cai entre 75% e 90%',
    '90': 'a conta cai entre 75% e 90%',
    '780': 'conta de R$ 780 por mês',
    '118': 'conta média dos últimos doze meses em R$ 118',
    '6,4': 'sistema de 6,4 kWp instalado em março de 2025',
    '2025': 'sistema de 6,4 kWp instalado em março de 2025',
    '6': 'Ravena Solar, seis anos',
    '412': 'Já instalamos 412 sistemas residenciais',
    '4,8': 'Nota 4,8 no Google, com 137 avaliações',
    '137': 'Nota 4,8 no Google, com 137 avaliações',
    '5': '5 anos da nossa instalação, incluindo qualquer infiltração causada pela obra',
    '2': 'A instalação em si leva dois dias',
    '14.300': 'Desde a Lei 14.300 existe uma cobrança sobre a energia injetada',
    '8': 'O tamanho típico fica entre 5 e 8 kWp',
    '12': 'de doze a vinte painéis no telhado',
    '20': 'de doze a vinte painéis no telhado',
    '14': 'investimento entre R$ 14 mil e R$ 19 mil',
    '19': 'investimento entre R$ 14 mil e R$ 19 mil',
    '3': 'O retorno do investimento tem levado de três a quatro anos',
    '4': 'O retorno do investimento tem levado de três a quatro anos',
    '25': '25 anos de performance do painel',
    '10': '10 anos do inversor',
    '45': 'de 45 a 60 dias entre a assinatura e o sistema ligado',
    '60': 'de 45 a 60 dias entre a assinatura e o sistema ligado',
    '80': 'num raio de 80 km',
  };
  const numeros = [...new Set(texto.match(/\d+(?:[.,]\d+)?/g))];
  const semFonte = numeros.filter((n) => !fontes[n]);
  const fonteFora = Object.entries(fontes).filter(([, trecho]) => !brief.includes(trecho)).map(([n]) => n);
  registrar('Todo número visível tem trecho correspondente no brief', semFonte.length === 0 && fonteFora.length === 0,
    `números na página: ${numeros.join(' ')}` + (semFonte.length ? `; SEM FONTE: ${semFonte.join(' ')}` : '') + (fonteFora.length ? `; trecho não achado no brief: ${fonteFora.join(' ')}` : ''));
  await writeFile(join(saida, 'numeros.json'), JSON.stringify(Object.fromEntries(numeros.map((n) => [n, fontes[n] || null])), null, 2));
}

await navegador.close();
servidor.close();

await writeFile(join(saida, 'resultado.json'), JSON.stringify({ data: new Date().toISOString(), resultados }, null, 2));
const falhas = resultados.filter((r) => !r.passou).length;
console.log(`\n${resultados.length - falhas}/${resultados.length} testes passaram.`);
process.exit(falhas ? 1 : 0);
