# Registro de decisões — Ravena Solar (P1)

Decisões que mudaram o que a `SPEC.md` previa. Cada uma traz data, quem decidiu, o motivo, o que se ganha, o que se perde e o que mudou nos arquivos. Quando uma decisão contradiz a SPEC, vale o registro mais recente daqui.

---

## D1 — O pedido de simulação vai pelo WhatsApp, não pelo Formspree

- **Data:** 07/10/2026
- **Decidido por:** responsável pelo projeto (dono do repositório)
- **Substitui:** SPEC.md › O formulário › "Envio: POST para um serviço de formulário externo (Formspree ou equivalente)"

### Motivo

Facilidade e praticidade. O Formspree exige criar conta, configurar um formulário e manter um ID no HTML, e cria mais um painel para o vendedor olhar. O vendedor já trabalha no WhatsApp: a resposta da simulação sempre foi por lá, e o brief diz que "quem pede simulação recebe resposta no mesmo dia útil, por WhatsApp". Com o envio pelo WhatsApp, o pedido cai direto onde o atendimento acontece, sem serviço intermediário, sem conta e sem limite de 50 envios por mês.

### Como fica

1. O formulário continua na página, com o mesmo filtro. Conta abaixo de R$ 450 mostra a explicação e **não abre o WhatsApp**. A regra principal da SPEC não muda.
2. Com conta de R$ 450 ou mais, o botão abre o WhatsApp da Ravena (`wa.me`) com a mensagem pronta: nome, cidade e valor da conta, mais uma etiqueta fixa de origem ("Simulação pelo site").
3. **O campo WhatsApp sai do formulário.** A mensagem é enviada do próprio WhatsApp da pessoa, então o vendedor recebe o número automaticamente. Pedir para digitar o número que vai mandar a mensagem seria atrito sem ganho. O formulário fica com três campos: nome, cidade e valor da conta.
4. A confirmação diz que falta apertar enviar no WhatsApp e pede para mandar a foto da conta na mesma conversa. Agora isso é possível no mesmo passo, o que resolve melhor o "anexo da conta" do brief.
5. O número da Ravena fica numa constante no script (`WHATSAPP_RAVENA`). Ele aparece no link, mas não é exibido como texto: o formulário continua sendo a única ação da página. Enquanto a Ravena não tiver número real, ele é fictício (ver D3).

### Os dois motivos que a SPEC dava contra o WhatsApp

- **"Perderia, sem rastro, quem desiste antes de apertar enviar."** Continua verdadeiro. É um custo aceito, não um argumento vencido (ver "O que se perde" abaixo).
- **"Um número fictício na tela seria um contato falso."** A página não mostra número na tela. O link usa um número fictício escolhido para ser impossível, então ninguém real recebe mensagem (ver D3).

### O que se perde (aceito conscientemente)

A SPEC escolheu o Formspree para que o pedido "exista no clique e fique numa lista". Com o WhatsApp:

- **Quem abre o WhatsApp e desiste antes de apertar enviar se perde sem rastro.** A SPEC já apontava esse risco.
- A contagem de pedidos por mês (meta: de 12 para 25) deixa de ser automática.

**Como contar mesmo assim:** toda mensagem que sai da página começa com a mesma etiqueta, "Simulação pelo site". O vendedor busca essa frase no WhatsApp (ou cria uma etiqueta no WhatsApp Business) e conta as conversas do mês. Isso também separa os pedidos da página dos que chegam por indicação e Instagram, o que a lista do Formspree não fazia.

### Arquivos alterados

`index.html` (formulário e script), `SPEC.md` (seção do formulário aponta para esta decisão), `DESIGN.md` (comportamento do formulário e serviço), `CLAUDE.md`, `verificacao/verificar.mjs` e `verificacao/VERIFICACAO.md`.

---

## D2 — Publicação na Vercel, com deploy automático a cada push

- **Data:** 07/10/2026
- **Decidido por:** responsável pelo projeto
- **Antes:** GitHub Pages (`iajuss.github.io/energia_trilha`)

### Motivo

**URL:** https://energia-trilha.vercel.app/ (projeto `energia-trilha`, time `iajuss-projects`).

O responsável pediu que, com o WhatsApp funcionando, a página subisse na Vercel automaticamente. O projeto da Vercel fica ligado ao repositório `iajuss/energia_trilha`: cada push no `main` publica sozinho, sem passo manual. A página é um HTML estático, então não há build nem configuração.

---

## D3 — Número fictício e impossível no lugar do WhatsApp da Ravena

- **Data:** 07/10/2026
- **Decidido por:** responsável pelo projeto ("número fictício para representar o fluxo")
- **Revisa:** SPEC.md › O formulário, que antes dizia que "um número fictício na tela seria um contato falso"

### Motivo

A Ravena é fictícia, e o brief não traz número. Sem número nenhum, o fluxo do WhatsApp não pode ser demonstrado nem verificado na página publicada.

### Como a página trata o número

- O número é `551500000000`, isto é, (15) 0000-0000. Nenhum telefone no Brasil começa com 0, então ele não pertence a ninguém. Um número com aparência real, como (15) 99999-9999, poderia ser de uma pessoa, que passaria a receber nome, cidade e valor da conta de desconhecidos. Esse seria o contato falso de verdade.
- O número não aparece como texto na página. Ele fica só no link, na constante `WHATSAPP_RAVENA`, marcado com o comentário `FICTÍCIO`.
- Para virar produção, basta trocar a constante pelo número real. Nada mais muda.

### O que se aceita

Enquanto o número for o fictício, quem completa o formulário vê o WhatsApp abrir com a mensagem pronta e depois avisar que o número é inválido. A página demonstra o fluxo, mas não entrega pedido.
