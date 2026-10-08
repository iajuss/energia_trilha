# CLAUDE.md — Ravena Solar, página de simulação (P1)

Landing page de uma ação só: pedir simulação de energia solar residencial. O cliente é a Ravena Solar (fictício, prática P1 da Trilha 202).

## Leia antes de mexer

1. `brief.md`: o pedido do cliente. É a única fonte de fatos e números.
2. `SPEC.md`: o que entra na página, o que fica de fora e por quê.
3. `DESIGN.md`: cores (com a origem de cada uma na logo), tipografia, componentes e o comportamento do formulário.
4. `DECISOES.md`: decisões que mudaram a SPEC depois de escrita. Quando houver conflito, vale a decisão mais recente.

## Estrutura

- `index.html`: a página inteira (HTML, CSS e JS inline, sem build e sem dependência em produção).
- `material/`: logo (`logo.svg` e `logo.png`) e o site antigo, só como referência. A página usa `material/logo.svg` direto.
- `verificacao/`: o script de verificação, as capturas e os resultados (`VERIFICACAO.md` resume).
- Publicação: Vercel, ligada ao repositório. Cada push no `main` publica sozinho (`DECISOES.md`, D2). Não há build.

## Regras que não se quebram

- **Todo número da página tem de estar no `brief.md`.** Não calcule número novo (nada de "85% de economia" a partir de R$ 780 → R$ 118). Ao acrescentar um número, inclua também o trecho do brief em `fontes` de `verificacao/verificar.mjs`.
- **Cores só da logo.** Os únicos valores são `#123A55`, `#F2A03D`, `#E8721C` e `#FFFFFF`, copiados de `material/logo.svg`. Tons claros saem de `color-mix` com o branco. Não invente hex.
- **Palavras proibidas:** "energia do futuro", "sustentabilidade", "revolução solar", "grátis", economia de 95% e qualquer prazo de entrega diferente de 45 a 60 dias. Para a visita técnica, escreva "sem custo".
- **Nenhum telefone, WhatsApp ou endereço da Ravena escrito na página.** O número do WhatsApp existe só dentro do link do formulário, e o formulário é a única ação.
- **Uma ação só.** Todo botão leva a `#simulacao`. Sem menu, sem link para fora, sem botão flutuante de WhatsApp.
- **Filtro de R$ 450:** conta abaixo disso mostra a explicação e **não** abre o WhatsApp. A constante é `CONTA_MINIMA` no script.
- Sem fotos de banco de imagem nem imagens geradas. Fotos de obra só entram se forem reais da Ravena.

## Formulário

- Envio pelo WhatsApp (`DECISOES.md`, D1): o botão abre `wa.me/<WHATSAPP_RAVENA>` com a mensagem pronta. Não há backend nem serviço de formulário.
- Campos: `nome`, `cidade` e `conta`. O WhatsApp da pessoa não é pedido, porque ela manda a mensagem do próprio número.
- A primeira linha da mensagem é sempre a etiqueta "Simulação pelo site" (`ETIQUETA`). O vendedor conta os pedidos buscando por ela, então não a mude sem avisar o cliente.
- O número da Ravena fica em `WHATSAPP_RAVENA` (DDI 55 + DDD + número, só dígitos) e nunca aparece como texto na página.

## Como verificar

```bash
npm install
npm run verificar
```

Usa `playwright-core` com o Microsoft Edge instalado na máquina (sem baixar navegador). O script intercepta o `wa.me`, então nenhuma conversa real é aberta. Ele confere se o número está configurado e testa o filtro de R$ 450, o conteúdo da mensagem, o aviso de outra cidade, a largura de 375 px, as palavras proibidas e confere cada número da página com o brief. As capturas são regravadas em `verificacao/`.

Depois de qualquer mudança na página, rode a verificação e atualize `verificacao/VERIFICACAO.md` se algo mudou.

## Idioma e tom

Português do Brasil. Direto, específico e com números, como pede o brief. Os títulos das seções de objeção são a pergunta do cliente entre aspas.
