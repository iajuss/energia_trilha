# Spec — Página de simulação da Ravena Solar (P1)

## Decisão central

O campo do valor da conta de luz decide quem passa. Abaixo de R$ 450 a página explica por que o sistema não se paga e não envia o pedido.

## Objetivo

A página tem uma única ação: pedir simulação. O cliente quer passar de ~12 para 25 pedidos por mês e receber menos pedidos de quem tem conta baixa. O que não ajuda a fazer esse pedido sai da página.

## Para quem

A página fala com o dono da casa, entre 35 e 60 anos, que paga mais de R$ 450 de luz e mora em Sorocaba, Votorantim, Itu ou Salto. Ele pede três orçamentos e leva semanas para decidir. Ela não fala com "quem se interessa por energia solar".

## O formulário

### Decisão revista em 07/10/2026: o pedido vai pelo WhatsApp

**O que a spec dizia antes.** O envio era por POST para um serviço de formulário (Formspree), que guardava o pedido numa lista e avisava por e-mail. Dois motivos sustentavam isso:

1. Abrir o WhatsApp com a mensagem pronta "perderia, sem rastro, quem desiste antes de apertar enviar", e a meta do cliente (de 12 para 25 pedidos por mês) é contável.
2. A página não mostraria número da Ravena, porque o brief não traz o número e "um número fictício na tela seria um contato falso".

**O que mudou.** O pedido agora abre o WhatsApp da Ravena com a mensagem pronta. O motivo é facilidade e praticidade. O Formspree pedia conta, configuração e mais um painel para o vendedor olhar. O WhatsApp é onde o atendimento já acontece: o brief diz que "quem pede simulação recebe resposta no mesmo dia útil, por WhatsApp". O pedido passa a cair direto na conversa em que vai ser respondido.

**Motivo 1 (rastro): continua verdadeiro. É um custo aceito, não um argumento vencido.**
- Quem abre o WhatsApp e desiste antes de apertar enviar se perde sem rastro, e a contagem mensal deixa de ser automática. Aceito isso em troca de não ter serviço, conta nem painel no meio.
- O que diminui a perda: toda mensagem começa com a etiqueta fixa "Simulação pelo site". O vendedor busca essa frase (ou cria uma etiqueta no WhatsApp Business) e conta os pedidos do mês. A contagem também separa os pedidos da página dos que chegam por indicação e Instagram, coisa que a lista do Formspree não fazia.
- O que se ganha no lugar: a foto da conta, que antes ficava para depois, agora pode ir na mesma conversa, no mesmo passo. E o campo WhatsApp sai do formulário, porque a mensagem já chega com o número de quem mandou.

**Motivo 2 (contato falso): a objeção era ao número na tela, e a página não mostra número na tela. Mas o link também é um contato, então o número fictício foi escolhido para não ser de ninguém.**
- A Ravena é fictícia (o brief diz "a empresa não existe"), então não há número real para pôr. O número fictício existe para representar o fluxo de ponta a ponta.
- O número é **(15) 0000-0000** (`551500000000`). Nenhum telefone no Brasil começa com 0, então esse número não pertence a ninguém. Um número com cara de real, como (15) 99999-9999, poderia ser de uma pessoa de verdade, que passaria a receber nome, cidade e conta de luz de desconhecidos. Esse seria o contato falso de fato, e com dado pessoal no meio.
- O número continua sem aparecer como texto na página. Ele fica só dentro do link, numa única constante do script (`WHATSAPP_RAVENA`).
- O que isso custa: enquanto o número for o fictício, quem completar o formulário vê o WhatsApp abrir com a mensagem pronta e em seguida avisar que o número é inválido. A página demonstra o fluxo, mas não entrega pedido. Para virar página de produção, basta trocar a constante pelo número real da Ravena. Nada mais muda.

O registro completo, com datas, está em `DECISOES.md` (D1 e D3).

### Como o formulário funciona agora

- Campos: nome, cidade e valor médio da conta. O WhatsApp da pessoa não é pedido: a mensagem sai do próprio WhatsApp dela, e o vendedor recebe o número junto.
- Cidade: escolha entre as quatro cidades ou "Outra cidade da região". Na última, aparece o aviso de que a Ravena atende até 80 km de Sorocaba e confirma a distância na resposta. O pedido segue mesmo assim.
- Conta abaixo de R$ 450: a página mostra uma explicação curta e honesta e não abre o WhatsApp. Conta de R$ 450 ou mais: abre.
- Envio: o botão abre o WhatsApp da Ravena (`wa.me`) com a mensagem pronta (nome, cidade, conta), começando pela etiqueta fixa "Simulação pelo site". O vendedor busca essa etiqueta para contar os pedidos do mês e separá-los dos que vêm por indicação e Instagram.
- Anexo da conta: fica fora do formulário. A confirmação pede para mandar a foto ou o PDF da conta na mesma conversa do WhatsApp.
- O número da Ravena fica numa constante do script e aparece só dentro do link, nunca como texto na tela. Hoje é o fictício (15) 0000-0000. O formulário continua sendo a única ação da página.

## O que entra, e por quê

A ordem da página segue a ordem dos medos que o brief relata.

1. **Topo.** O título fala com quem paga mais de R$ 450 nas quatro cidades. A prova principal é o caso de R$ 780 → R$ 118, e há um botão que leva ao formulário. Por quê: um número conferido convence mais que uma promessa, e dizer o limite de R$ 450 já no topo começa a filtrar antes do formulário.
2. **"Vocês vão sumir?"** Seis anos de empresa, 412 sistemas instalados, equipe própria com carteira assinada, nota 4,8 no Google com 137 avaliações, assistência técnica autorizada do inversor e acompanhamento da produção no primeiro ano. Por quê: é o medo número um, e a região teve empresas que fecharam com obra pela metade.
3. **"Vai estragar meu telhado?"** Garantia de 5 anos da instalação, que cobre infiltração causada pela obra, feita por equipe que não é terceirizada. Por quê: é o medo número dois.
4. **"Taxaram o sol?"** Explicação curta: existe uma cobrança sobre a energia injetada, e ela sobe a cada ano. O caso de Sorocaba foi instalado em março de 2025 e já está sob essa regra, e a simulação já considera essa cobrança. Por quê: é o medo número três, e um caso real responde melhor do que explicar a lei.
5. **Quanto custa.** Sistemas de 5 a 8 kWp, de R$ 14 mil a R$ 19 mil. A conta cai entre 75% e 90%, sem zerar, e o retorno leva de 3 a 4 anos. Entrada zero é possível, e na maioria dos casos a parcela fica perto do valor da conta atual. Garantias: 25 anos do painel, 10 do inversor, 5 da instalação. Por quê: quem pede três orçamentos compara preço. Mostrar a faixa de valores filtra quem não pode e dá base para quem pode.
6. **Depois do pedido.** Resposta por WhatsApp no mesmo dia útil, depois a visita técnica sem custo, depois a proposta com três tamanhos de sistema. Do contrato ao sistema ligado são 45 a 60 dias, com 2 dias de instalação. Por quê: diminui o custo de pedir, e um prazo honesto evita problema com o Procon.
7. **Formulário.**

## O que fica de fora, e por quê

- **Quem somos e missão.** É o que a página antiga tem, e ela não traz cliente. A prova de que a empresa existe fica no bloco "Vocês vão sumir?", em números.
- **Processo completo em oito etapas.** Interessa à Ravena, não a quem ainda não pediu simulação. Fica só o que acontece depois do pedido e o prazo total.
- **"E se eu mudar de casa?"** O público é quem não pretende vender a casa. Responder essa pergunta é falar com quem não deveria comprar.
- **Dia nublado, noite e bateria.** São dúvidas reais, mas pesam menos e se resolvem na conversa por WhatsApp. Uma seção de perguntas frequentes deixaria a página mais longa para todo mundo.
- **Ticket médio de R$ 16.300.** A faixa de preço já informa, e dois números de preço confundem.
- **Fotos de obra e depoimentos em vídeo.** Não vieram em `material/`. Não uso banco de imagens nem imagem gerada, porque um telhado falso contradiz o argumento da equipe própria. Se o site antigo tiver fotos de obra, reavalio.
- **O que a Ravena não faz** (bateria, comércio acima de 75 kWp, manutenção de sistema de terceiros). Não entra, porque o filtro da página é a conta e a cidade.
- **Linguagem proibida:** "energia do futuro", "sustentabilidade", "revolução solar", "grátis", economia de 95% e qualquer prazo diferente de 45 a 60 dias.

## Restrições

- As cores saem do arquivo da logo e nunca são inventadas. O valor de cada cor e a origem dele ficam registrados no documento de design.
- Todo número na página tem de estar no brief.

## Como verifico

- Conta de R$ 300: o WhatsApp não abre e aparece a explicação. Conta de R$ 450: o WhatsApp abre com o número da constante e com etiqueta, nome, cidade e conta na mensagem. (Isso substitui os testes de POST e de e-mail, que deixaram de existir com o Formspree.)
- O número no link é o da constante e não aparece como texto na página.
- Na página publicada, num celular: o formulário abre o WhatsApp com a mensagem pronta. Com o número fictício, o esperado é o WhatsApp avisar que o número é inválido. Quando entrar o número real, o teste passa a ser o pedido chegar ao WhatsApp da Ravena.
- Uma busca no HTML pelas palavras proibidas não encontra nada.
- Cada número da página confere com o brief.
- A página funciona e pode ser lida num celular com tela de 375 px de largura.
