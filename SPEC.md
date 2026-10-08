# Spec — Página de simulação da Ravena Solar (P1)

## Decisão central

O campo do valor da conta de luz decide quem passa. Abaixo de R$ 450 a página explica por que o sistema não se paga e não envia o pedido.

## Objetivo

A página tem uma única ação: pedir simulação. O cliente quer passar de ~12 para 25 pedidos por mês e receber menos pedidos de quem tem conta baixa. O que não ajuda a fazer esse pedido sai da página.

## Para quem

A página fala com o dono da casa, entre 35 e 60 anos, que paga mais de R$ 450 de luz e mora em Sorocaba, Votorantim, Itu ou Salto. Ele pede três orçamentos e leva semanas para decidir. Ela não fala com "quem se interessa por energia solar".

## O formulário

- Campos: nome, WhatsApp, cidade e valor médio da conta.
- Cidade: escolha entre as quatro cidades ou "Outra cidade da região". Na última, aparece o aviso de que a Ravena atende até 80 km de Sorocaba e confirma a distância na resposta. O pedido é enviado mesmo assim.
- Conta abaixo de R$ 450: a página mostra uma explicação curta e honesta e não envia. Conta de R$ 450 ou mais: envia.
- Anexo da conta: fica fora do formulário. Upload pede backend e cria atrito. A confirmação de envio diz que mandar a foto da conta no WhatsApp agiliza a simulação.
- Envio: POST para um serviço de formulário externo (Formspree ou equivalente), que guarda o pedido e avisa por e-mail. Por quê: a meta do cliente é contável (de 12 para 25 por mês), então o pedido precisa existir no clique e ficar numa lista. Abrir o WhatsApp com a mensagem pronta perderia, sem rastro, quem desiste antes de apertar enviar. O vendedor responde pelo WhatsApp informado no campo, que por isso continua obrigatório.
- O plano gratuito do serviço precisa comportar pelo menos 25 envios por mês, com folga. Isso é conferido antes de escolher o serviço.
- O endpoint fica no HTML. É público por natureza e não é segredo.
- A página não mostra telefone nem WhatsApp da Ravena. O brief não traz o número, e um número fictício na tela seria um contato falso. Além disso, o formulário é a única ação da página.

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

- Conta de R$ 300: nenhum POST sai e aparece a explicação. Conta de R$ 450: o POST sai com os quatro campos.
- Um envio de teste chega ao serviço e ao e-mail.
- Uma busca no HTML pelas palavras proibidas não encontra nada.
- Cada número da página confere com o brief.
- A página funciona e pode ser lida num celular com tela de 375 px de largura.
