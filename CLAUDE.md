# CLAUDE.md — Ravena Solar, página de simulação (P1)

Landing page de uma ação só: pedir simulação de energia solar residencial. O cliente é a Ravena Solar (fictício, prática P1 da Trilha 202).

## Leia antes de mexer

1. `brief.md`: o pedido do cliente. É a única fonte de fatos e números.
2. `SPEC.md`: o que entra na página, o que fica de fora e por quê.
3. `DESIGN.md`: cores (com a origem de cada uma na logo), tipografia, componentes e o comportamento do formulário.

## Estrutura

- `index.html`: a página inteira (HTML, CSS e JS inline, sem build e sem dependência em produção).
- `material/`: logo (`logo.svg` e `logo.png`) e o site antigo, só como referência. A página usa `material/logo.svg` direto.
- `verificacao/`: o script de verificação, as capturas e os resultados (`VERIFICACAO.md` resume).
- Publicação: GitHub Pages, servindo a raiz do branch `main`.

## Regras que não se quebram

- **Todo número da página tem de estar no `brief.md`.** Não calcule número novo (nada de "85% de economia" a partir de R$ 780 → R$ 118). Ao acrescentar um número, inclua também o trecho do brief em `fontes` de `verificacao/verificar.mjs`.
- **Cores só da logo.** Os únicos valores são `#123A55`, `#F2A03D`, `#E8721C` e `#FFFFFF`, copiados de `material/logo.svg`. Tons claros saem de `color-mix` com o branco. Não invente hex.
- **Palavras proibidas:** "energia do futuro", "sustentabilidade", "revolução solar", "grátis", economia de 95% e qualquer prazo de entrega diferente de 45 a 60 dias. Para a visita técnica, escreva "sem custo".
- **Nenhum telefone, WhatsApp ou endereço da Ravena na página.** O brief não traz esses dados, e o formulário é a única ação.
- **Uma ação só.** Todo botão leva a `#simulacao`. Sem menu, sem link para fora, sem botão flutuante de WhatsApp.
- **Filtro de R$ 450:** conta abaixo disso mostra a explicação e **não** faz POST. A constante é `CONTA_MINIMA` no script.
- Sem fotos de banco de imagem nem imagens geradas. Fotos de obra só entram se forem reais da Ravena.

## Formulário

- POST JSON via `fetch` para o Formspree. O endpoint fica em `data-endpoint` no `<form id="form-simulacao">` e é público por natureza.
- Campos enviados: `nome`, `whatsapp`, `cidade`, `conta` (mais `_subject` para o assunto do e-mail).
- `_gotcha` é o honeypot anti-spam do Formspree e nunca é enviado preenchido.
- Plano Free do Formspree: 50 envios por mês. A meta do cliente é 25.

## Como verificar

```bash
npm install
npm run verificar
```

Usa `playwright-core` com o Microsoft Edge instalado na máquina (sem baixar navegador). O script intercepta o Formspree, então nenhum envio real acontece. Ele testa o filtro de R$ 450, os quatro campos do POST, o aviso de outra cidade, a largura de 375 px, as palavras proibidas e confere cada número da página com o brief. As capturas são regravadas em `verificacao/`.

Depois de qualquer mudança na página, rode a verificação e atualize `verificacao/VERIFICACAO.md` se algo mudou.

## Idioma e tom

Português do Brasil. Direto, específico e com números, como pede o brief. Os títulos das seções de objeção são a pergunta do cliente entre aspas.
