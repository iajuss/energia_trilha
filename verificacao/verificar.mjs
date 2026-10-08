// Verificação da página P1 — roda os testes de "Como verifico" da SPEC.md.
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

// Abre a página a 375 px e intercepta o Formspree: cada POST é registrado e respondido com 200,
// sem chegar ao serviço de verdade.
async function abrir(largura = 375, altura = 812) {
  const pagina = await navegador.newPage({ viewport: { width: largura, height: altura } });
  const posts = [];
  await pagina.route('https://formspree.io/**', async (rota) => {
    const r = rota.request();
    posts.push({ metodo: r.method(), url: r.url(), corpo: JSON.parse(r.postData() || '{}') });
    await rota.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await pagina.goto(base);
  return { pagina, posts };
}

async function preencher(pagina, { cidade = 'Sorocaba', conta }) {
  await pagina.fill('#nome', 'Teste Verificação');
  await pagina.fill('#whatsapp', '(15) 99999-0000');
  await pagina.selectOption('#cidade', cidade);
  await pagina.fill('#conta', conta);
  await pagina.click('#enviar');
  await pagina.waitForTimeout(400);
}

// 1. Conta de R$ 300: nenhum POST e aparece a explicação
{
  const { pagina, posts } = await abrir();
  await preencher(pagina, { conta: '300' });
  const aviso = await pagina.isVisible('#aviso-conta');
  registrar('Conta R$ 300 não envia e mostra a explicação', posts.length === 0 && aviso,
    `POSTs: ${posts.length}; explicação visível: ${aviso}`);
  await pagina.locator('#simulacao').screenshot({ path: join(saida, '01-conta-300-bloqueada-375px.png') });
  await pagina.close();
}

// 2. Conta de R$ 450: o POST sai com os quatro campos
{
  const { pagina, posts } = await abrir();
  await preencher(pagina, { conta: '450' });
  const c = posts[0]?.corpo || {};
  const quatro = ['nome', 'whatsapp', 'cidade', 'conta'].every((k) => c[k]);
  const ok = await pagina.isVisible('#ok');
  registrar('Conta R$ 450 envia POST com os quatro campos', posts.length === 1 && posts[0].metodo === 'POST' && quatro && ok,
    `POSTs: ${posts.length}; corpo: ${JSON.stringify(c)}; confirmação visível: ${ok}`);
  const texto = await pagina.textContent('#ok');
  registrar('Confirmação pede a foto da conta pelo WhatsApp', /foto/.test(texto) && /WhatsApp/.test(texto));
  await pagina.locator('#simulacao').screenshot({ path: join(saida, '02-conta-450-enviada-375px.png') });
  await pagina.close();
}

// 3. Limites e formatos brasileiros
for (const [valor, deveEnviar] of [['449,99', false], ['R$ 449', false], ['450,00', true], ['R$ 1.200,00', true], ['1.200', true]]) {
  const { pagina, posts } = await abrir();
  await preencher(pagina, { conta: valor });
  registrar(`Conta "${valor}" ${deveEnviar ? 'envia' : 'não envia'}`, (posts.length === 1) === deveEnviar,
    `POSTs: ${posts.length}${posts[0] ? '; conta enviada: ' + posts[0].corpo.conta : ''}`);
  await pagina.close();
}

// 4. "Outra cidade da região": aviso de 80 km aparece e o pedido é enviado mesmo assim
{
  const { pagina, posts } = await abrir();
  await pagina.selectOption('#cidade', 'Outra cidade da região');
  const aviso = await pagina.isVisible('#aviso-cidade');
  const textoAviso = await pagina.textContent('#aviso-cidade');
  await pagina.locator('#cidade').locator('xpath=..').screenshot({ path: join(saida, '03-outra-cidade-aviso-375px.png') });
  await preencher(pagina, { cidade: 'Outra cidade da região', conta: '900' });
  registrar('Outra cidade mostra aviso de 80 km e envia', aviso && /80 km/.test(textoAviso) && posts.length === 1,
    `aviso visível: ${aviso}; POSTs: ${posts.length}`);
  await pagina.close();
}

// 5. Campos obrigatórios
{
  const { pagina, posts } = await abrir();
  await pagina.click('#enviar');
  await pagina.waitForTimeout(200);
  const erros = await pagina.locator('[aria-invalid="true"]').count();
  registrar('Formulário vazio não envia e marca os 4 campos', posts.length === 0 && erros === 4, `campos marcados: ${erros}`);
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
  const html = (await readFile(join(raiz, 'index.html'), 'utf8')).toLowerCase();
  const proibidas = ['energia do futuro', 'sustentabilidade', 'sustentável', 'revolução solar', 'grátis', 'gratis', '95%', '95 %'];
  const achadas = proibidas.filter((p) => html.includes(p));
  registrar('Nenhuma palavra proibida no HTML', achadas.length === 0, achadas.length ? `achadas: ${achadas.join(', ')}` : proibidas.join(' · '));
  const prazos = [...html.matchAll(/\d+\s*(?:a\s*\d+\s*)?dias/g)].map((m) => m[0]);
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
