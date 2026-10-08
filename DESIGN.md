# Design — Página de simulação da Ravena Solar (P1)

A página serve a uma ação: pedir simulação. O design existe para que o dono da casa leia os números e chegue ao formulário. Não tem foto, ilustração, ícone decorativo nem animação.

## Cores

Todas saem de `material/logo.svg`. O brief diz que as cores da marca "são as da logo" e que ninguém as escreve à mão. Por isso, cada valor abaixo aponta para o elemento do SVG de onde foi copiado.

| Token | Valor | Origem no `logo.svg` | Uso na página |
|---|---|---|---|
| `--azul` | `#123A55` | `fill` do telhado (`<path d="M52 196 …">`) e do texto "RAVENA" | Texto principal, fundo do topo e do bloco de preço |
| `--sol` | `#F2A03D` | `fill` do círculo do sol e `stroke` dos raios | Fundo do botão, números em destaque sobre azul |
| `--laranja` | `#E8721C` | `fill` do texto "SOLAR" | Fios, bordas, números das etapas, contorno de foco |
| `--branco` | `#FFFFFF` | `stroke` das linhas do painel | Fundo da página, texto sobre azul |

### Tons derivados

A página precisa de um texto secundário e de dois fundos claros. Nenhum deles é cor nova. Todos misturam uma cor da logo com o branco da logo via `color-mix(in srgb, …)`:

| Token | Fórmula | Uso |
|---|---|---|
| `--azul-texto2` | `--azul` 78% + branco | Texto de apoio |
| `--azul-fundo` | `--azul` 6% + branco | Fundo das seções alternadas |
| `--sol-fundo` | `--sol` 16% + branco | Fundo do aviso de conta abaixo de R$ 450 e do aviso de cidade |

### Contraste (WCAG 2.1)

Calculado com a fórmula de luminância relativa da WCAG:

| Par | Razão | Regra seguida |
|---|---|---|
| `#123A55` sobre `#FFFFFF` | 11,92 | Texto de qualquer tamanho |
| `#F2A03D` sobre `#123A55` | 5,60 | Botão (texto azul sobre sol) e números sobre azul |
| `#E8721C` sobre `#FFFFFF` | 3,06 | **Só** texto grande (≥ 24 px negrito) ou elementos não textuais |
| `#F2A03D` sobre `#FFFFFF` | 2,13 | **Nunca** como texto. Só como fundo |

Por isso o botão é sol com texto azul, e não laranja com texto branco como no site antigo (3,06, reprovado para texto de botão).

O site antigo também usava `#0d2c42`, `#155a7a` e `#1d8f7e` em degradês. Essas cores não estão na logo e não entram.

## Tipografia

A família vem da própria logo: o `<text>` do SVG declara `font-family="Helvetica Neue, Helvetica, Arial, sans-serif"`, com peso 700 em "RAVENA" e 300 em "SOLAR". A página usa a mesma pilha, sem fonte externa. Isso evita uma requisição e uma troca de fonte no celular.

- Títulos: 700. `h1` com `clamp(1.75rem, 5vw, 2.75rem)` e `h2` com `clamp(1.375rem, 3.5vw, 1.875rem)`.
- Números de prova (R$ 780 → R$ 118, 412, 4,8): 700, grandes, porque são o argumento.
- Corpo: 400, 1.0625rem (17 px) e entrelinha de 1.6. O público tem de 35 a 60 anos, então o texto não desce de 16 px.
- O peso 300 fica só para rótulos curtos, nunca para parágrafo.

## Layout

- Uma coluna, com largura máxima de leitura de 44rem. Grades de 2 ou 3 colunas só em telas ≥ 720 px. No celular tudo empilha.
- Margem lateral de 16 px no celular. Nada pode rolar na horizontal a 375 px.
- Seções separadas por fundo alternado (branco e `--azul-fundo`), sem sombras nem cartões flutuantes.
- Cada medo do brief é uma seção cujo título é a própria pergunta do cliente, entre aspas, para ele se reconhecer.
- Topo (`header`): logo à esquerda e botão "Pedir simulação" à direita. Não fixo, porque tela pequena não sobra para ele.

## Componentes

- **Botão primário:** fundo `--sol`, texto `--azul` 700, raio de 6 px e altura mínima de 48 px (alvo de toque). Só existe a ação "Pedir simulação". Os botões do topo e do hero levam a `#simulacao`.
- **Caso conferido:** bloco no hero com "Antes R$ 780" riscado e "Depois R$ 118", seguido da linha de contexto (Sorocaba, 6,4 kWp, março de 2025, média dos últimos doze meses).
- **Lista de números:** número grande + legenda curta. Sem ícones.
- **Etapas:** lista ordenada com o número em `--laranja` grande.
- **Formulário:** rótulo visível acima de cada campo (nunca só placeholder), campos de 48 px de altura, mensagens de erro em texto abaixo do campo e ligadas por `aria-describedby`.
- **Aviso de conta baixa:** caixa `--sol-fundo` com borda esquerda `--laranja`, com `role="status"`. Substitui o envio e não é tratada como erro: é uma resposta honesta.
- **Aviso de outra cidade:** mesma caixa, mais curta, com o raio de 80 km. Não bloqueia o envio.
- **Foco:** contorno de 3 px `--laranja` com afastamento de 2 px em tudo que é focável.

## Formulário: comportamento

| Situação | O que acontece |
|---|---|
| Campo vazio ou WhatsApp com menos de 10 dígitos | Erro no campo, nada é enviado |
| Conta < R$ 450 | Aparece a explicação. **Nenhum POST.** O botão continua lá, para quem digitou errado corrigir |
| Conta ≥ R$ 450 | `fetch` POST JSON para o Formspree com `nome`, `whatsapp`, `cidade` e `conta` |
| "Outra cidade da região" | Aviso de 80 km aparece ao escolher. O envio segue normal |
| Envio OK | O formulário some e a confirmação diz que a resposta vem por WhatsApp no mesmo dia útil e que mandar a foto da conta por lá agiliza |
| Envio falhou | Mensagem pedindo para tentar de novo. Os dados ficam no formulário. Não aparece telefone, porque a página não tem nenhum |

O valor da conta aceita "780", "780,50", "1.200" e "R$ 1.200,00". O formato brasileiro é convertido antes da comparação com 450.

## Serviço de formulário

Formspree, plano Free: **50 envios por mês** (conferido em formspree.io/plans em 07/10/2026). É o dobro da meta de 25, com folga sobre os ~12 de hoje. Ele também avisa por e-mail. O painel do Free guarda os envios por 30 dias, então o histórico permanente é a caixa de e-mail. Se a página passar de 50 pedidos por mês, é hora de mudar de plano, e esse é um bom problema.

## O que o design deixa de fora

Foto de banco de imagem, imagem gerada, ícones de emoji, botão flutuante de WhatsApp, barra de cookies, menu de navegação, blog, parceiros, rodapé com telefone e endereço. Tudo isso estava no site antigo. Nada disso ajuda alguém a pedir simulação, e alguns itens (telefone, parceiros) não têm fonte no brief.
