# Verificação — Página de simulação da Ravena Solar (P1)

Cada item de "Como verifico" da `SPEC.md`, com o teste que o cobre e a evidência.

Os testes automáticos estão em `verificar.mjs` (Playwright com o Microsoft Edge, viewport de 375 × 812). O script sobe um servidor local, abre `index.html` e intercepta as chamadas para `formspree.io`. Assim conta exatamente quantos POSTs saíram e com que corpo, sem enviar nada de verdade. O resultado bruto fica em `resultado.json`.

```bash
npm install
npm run verificar
```

**Última execução: 15/15 testes passaram.**

## 1. Conta de R$ 300 não envia; conta de R$ 450 envia os quatro campos

| Teste | Resultado |
|---|---|
| Conta `300` | 0 POSTs, explicação visível |
| Conta `449,99` e `R$ 449` | 0 POSTs |
| Conta `450` | 1 POST com `{"nome":"Teste Verificação","whatsapp":"(15) 99999-0000","cidade":"Sorocaba","conta":"450,00","_subject":"…"}` |
| Conta `450,00`, `R$ 1.200,00` e `1.200` | 1 POST cada (`1.200` é lido como mil e duzentos) |
| Formulário vazio | 0 POSTs e os 4 campos marcados com erro |
| "Outra cidade da região" | Aviso de 80 km aparece e o POST sai mesmo assim |
| Confirmação | Fala de WhatsApp e pede a foto da conta |

Capturas:
- `01-conta-300-bloqueada-375px.png`: explicação no lugar do envio.
- `02-conta-450-enviada-375px.png`: confirmação de pedido recebido.
- `03-outra-cidade-aviso-375px.png`: aviso de 80 km.

## 2. Envio de teste chega ao serviço e ao e-mail

**Pendente.** Precisa do ID do formulário no Formspree (`data-endpoint` em `index.html`, hoje `SEU_ID_AQUI`). Criar a conta no Formspree é com a dona ou o dono da conta. Depois de trocar o ID:

1. Abrir a página publicada e enviar um pedido com conta ≥ R$ 450.
2. Conferir o pedido no painel do Formspree (Submissions).
3. Conferir o e-mail de aviso na caixa cadastrada.
4. Registrar aqui a data e o horário do envio e anexar as capturas do painel e do e-mail.

Plano Free do Formspree: 50 envios por mês (formspree.io/plans, conferido em 07/10/2026), o dobro da meta de 25.

## 3. Nenhuma palavra proibida no HTML

O script procura em `index.html`, sem diferenciar maiúsculas: "energia do futuro", "sustentabilidade", "sustentável", "revolução solar", "grátis", "gratis", "95%" e "95 %". **Nenhuma ocorrência.**

Prazos encontrados no HTML: só "45 a 60 dias" (contrato até o sistema ligado) e "2 dias" (duração da instalação, que vem do brief). Nenhum outro prazo.

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

**Nenhum número sem fonte.**

## 5. Funciona e pode ser lida num celular de 375 px

- `scrollWidth` = 375 com viewport de 375: sem rolagem horizontal.
- Menor fonte de texto corrido: 15 px. O corpo é 17 px.
- Campos e botões com pelo menos 48 px de altura (44 px no botão do topo).
- Capturas da página inteira: `04-pagina-inteira-375px.png` (celular) e `05-pagina-inteira-1280px.png` (desktop).

## Também conferido

- Contraste (WCAG 2.1, calculado): texto azul sobre branco 11,92; botão com texto azul sobre sol 5,60. O laranja (3,06 sobre branco) só aparece em texto grande e em elementos não textuais. Detalhes em `DESIGN.md`.
- A página não tem telefone, WhatsApp nem endereço da Ravena, e nenhum link sai da página.
