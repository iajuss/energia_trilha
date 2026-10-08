# Verificação — Página de simulação da Ravena Solar (P1)

Cada item de "Como verifico" da `SPEC.md`, com o teste que o cobre e a evidência. O envio é pelo WhatsApp (decisões D1 e D3 em `DECISOES.md`). Por isso os testes de POST e de e-mail da versão Formspree deram lugar aos testes do link do WhatsApp.

Os testes automáticos estão em `verificar.mjs` (Playwright com o Microsoft Edge, viewport de 375 × 812). O script sobe um servidor local, abre `index.html` e intercepta toda abertura de `wa.me`. Assim registra quantas vezes o WhatsApp abriria, para qual número e com qual mensagem, sem abrir conversa de verdade. O resultado bruto fica em `resultado.json`.

```bash
npm install
npm run verificar
```

**Última execução: 19/19 testes passaram.**

## 1. Conta de R$ 300 não abre o WhatsApp; conta de R$ 450 abre com a mensagem certa

| Teste | Resultado |
|---|---|
| Conta `300` | 0 aberturas do WhatsApp, explicação visível |
| Conta `449,99` e `R$ 449` | 0 aberturas |
| Conta `450` | 1 abertura de `wa.me/551500000000` com a mensagem abaixo |
| Conta `450,00`, `R$ 1.200,00` e `1.200` | 1 abertura cada. A conta vai na mensagem como `R$ 450,00` e `R$ 1.200,00` |
| Formulário vazio | 0 aberturas e os 3 campos marcados com erro |
| "Outra cidade da região" | Aviso de 80 km aparece e o WhatsApp abre com "Cidade: Outra cidade da região" |
| Confirmação | Diz que falta apertar enviar e pede a foto da conta na mesma conversa |
| "Abrir o WhatsApp de novo" | Aponta para o mesmo link (cobre navegador que bloqueia nova aba) |

Mensagem gerada no teste da conta de R$ 450:

```
Simulação pelo site
Olá, Ravena Solar! Quero uma simulação de energia solar.
Nome: Teste Verificação
Cidade: Sorocaba
Conta de luz média: R$ 450,00
```

A primeira linha é a etiqueta fixa que o vendedor usa para contar os pedidos do mês (D1).

Capturas:
- `01-conta-300-bloqueada-375px.png`: explicação no lugar do envio.
- `02-conta-450-whatsapp-375px.png`: confirmação depois de abrir o WhatsApp.
- `03-outra-cidade-aviso-375px.png`: aviso de 80 km.

## 2. O número da Ravena: link correto, nunca na tela

| Teste | Resultado |
|---|---|
| `WHATSAPP_RAVENA` tem formato de link (55 + DDD + número) | `551500000000`, **fictício** (D3) |
| O link aberto usa esse número | Sim |
| O número aparece como texto na página | Não |

**Número fictício.** (15) 0000-0000 não pertence a ninguém, porque nenhum telefone no Brasil começa com 0. Na página publicada, num celular, o esperado é: o formulário abre o WhatsApp com a mensagem pronta, e o WhatsApp avisa que o número é inválido. Esse é o comportamento aceito na D3. Quando o número real entrar, este item passa a ser: um pedido enviado da página publicada chega ao WhatsApp da Ravena.

## 3. Nenhuma palavra proibida no HTML

O script procura em `index.html`, sem diferenciar maiúsculas: "energia do futuro", "sustentabilidade", "sustentável", "revolução solar", "grátis", "gratis", "95%" e "95 %". **Nenhuma ocorrência.**

Prazos encontrados no HTML: só "45 a 60 dias" (contrato até o sistema ligado) e "2 dias" (duração da instalação, que vem do brief).

## 4. Cada número da página confere com o brief

O script extrai todos os números do texto visível e exige que cada um tenha um trecho do `brief.md` que o sustente. Também confirma que esse trecho existe literalmente no brief. Mapa completo em `numeros.json`.

| Na página | Trecho do brief |
|---|---|
| R$ 450 | "Conta de luz acima de R$ 450 por mês" |
| 75% e 90% | "a conta cai entre 75% e 90%" |
| R$ 780 → R$ 118 | "conta de R$ 780 por mês" / "conta média dos últimos doze meses em R$ 118" |
| 6,4 kWp, março de 2025 | "sistema de 6,4 kWp instalado em março de 2025" |
| 6 anos | "Ravena Solar, seis anos" |
| 412 | "Já instalamos 412 sistemas residenciais" |
| 4,8 e 137 | "Nota 4,8 no Google, com 137 avaliações" |
| 5 anos da instalação | "5 anos da nossa instalação, incluindo qualquer infiltração causada pela obra" |
| 2 dias | "A instalação em si leva dois dias" |
| Lei 14.300 | "Desde a Lei 14.300 existe uma cobrança sobre a energia injetada" |
| 5 a 8 kWp | "O tamanho típico fica entre 5 e 8 kWp" |
| 12 a 20 painéis | "de doze a vinte painéis no telhado" |
| R$ 14 mil a R$ 19 mil | "investimento entre R$ 14 mil e R$ 19 mil" |
| 3 a 4 anos | "O retorno do investimento tem levado de três a quatro anos" |
| 25 / 10 / 5 anos de garantia | "25 anos de performance do painel, 10 anos do inversor, 5 anos da nossa instalação" |
| 45 a 60 dias | "de 45 a 60 dias entre a assinatura e o sistema ligado" |
| 80 km | "num raio de 80 km" |

**Nenhum número sem fonte.** O número fictício do WhatsApp não está na lista porque não aparece no texto da página (item 2).

## 5. Funciona e pode ser lida num celular de 375 px

- `scrollWidth` = 375 com viewport de 375: sem rolagem horizontal.
- Menor fonte de texto corrido: 15 px. O corpo é 17 px.
- Campos e botões com pelo menos 48 px de altura (44 px no botão do topo).
- Capturas da página inteira: `04-pagina-inteira-375px.png` (celular) e `05-pagina-inteira-1280px.png` (desktop).

## 6. Publicação

Vercel, ligada ao repositório `iajuss/energia_trilha` (D2). Cada push no `main` publica sozinho. A seção "Publicado" abaixo registra a URL e a conferência da página no ar.

## Também conferido

- Contraste (WCAG 2.1, calculado): texto azul sobre branco 11,92; botão com texto azul sobre sol 5,60. O laranja (3,06 sobre branco) só aparece em texto grande e em elementos não textuais. Detalhes em `DESIGN.md`.
- Nenhum link sai da página além do WhatsApp do formulário.
