---
name: "Anaból[IA]"
description: "O treino do dia, na cozinha: meta de proteína como carga, refeição como série, receita como cronômetro."
colors:
  paper: "#FFFFFF"
  ink: "#0E0E0E"
  grey: "#6B6B6B"
  hair: "#ECECEC"
  soft: "#F5F5F5"
  track: "#E6E6E6"
  ring: "#D6D6D6"
  acc: "#D4451F"
  acc-soft: "#FBE4DC"
  acc-text: "#8E2F12"
typography:
  numeral-giant:
    fontFamily: "ui-rounded, SF Pro Rounded, Nunito, Roboto, system-ui, sans-serif"
    fontSize: "104px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  numeral-hero:
    fontFamily: "ui-rounded, SF Pro Rounded, Nunito, Roboto, system-ui, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  numeral-stat:
    fontFamily: "ui-rounded, SF Pro Rounded, Nunito, Roboto, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.02em"
    fontFeature: "tnum"
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "28px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.022em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  body-strong:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.375
  meta:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.35
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Roboto, Segoe UI, system-ui, sans-serif"
    fontSize: "11.5px"
    fontWeight: 600
    letterSpacing: "0.05em"
rounded:
  check: "7px"
  thumb: "10px"
  field: "12px"
  panel: "16px"
  card: "18px"
  photo: "20px"
  full: "9999px"
spacing:
  row-tight: "10px"
  row: "12px"
  card-pad: "18px"
  gutter: "20px"
  section: "24px"
components:
  button-primary:
    backgroundColor: "{colors.acc}"
    textColor: "{colors.paper}"
    typography: "{typography.body-strong}"
    rounded: "{rounded.full}"
    height: "54px"
    padding: "0 24px"
  button-secondary:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    size: "54px"
  button-soft:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: "54px"
    padding: "0 20px"
  button-text:
    textColor: "{colors.acc}"
    height: "44px"
    padding: "0 8px"
  progress-card:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "16px 18px 18px"
  progress-bar:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.full}"
    height: "10px"
  progress-bar-fill:
    backgroundColor: "{colors.acc}"
    rounded: "{rounded.full}"
  photo-card:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.paper}"
    rounded: "{rounded.photo}"
    height: "220px"
  photo-card-play:
    backgroundColor: "{colors.acc}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "46px"
  set-row:
    textColor: "{colors.ink}"
    typography: "{typography.body-strong}"
    padding: "12px 0"
  set-ring-done:
    backgroundColor: "{colors.acc}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    size: "26px"
  chip:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.full}"
    height: "36px"
    padding: "0 14px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
  timer-chip:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  hint-chip:
    backgroundColor: "{colors.acc-soft}"
    textColor: "{colors.acc-text}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
  stepper:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.thumb}"
    height: "32px"
  search-field:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    height: "44px"
    padding: "0 12px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.panel}"
    padding: "12px 16px"
  tab-bar:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.grey}"
    rounded: "{rounded.full}"
    height: "64px"
  number-field:
    backgroundColor: "{colors.soft}"
    textColor: "{colors.ink}"
    typography: "{typography.numeral-stat}"
    rounded: "{rounded.panel}"
    height: "72px"
    padding: "14px 16px 0"
  week-column:
    backgroundColor: "{colors.track}"
    rounded: "{rounded.full}"
    width: "10px"
    height: "96px"
  week-column-fill:
    backgroundColor: "{colors.acc}"
    rounded: "{rounded.full}"
---

# Design System: Anaból[IA]

## Overview

**Creative North Star: "O treino do dia, na cozinha"**

Registro do app construído em `web/` (Next.js, PWA mobile-first), contrato de direção em `.impeccable/surfaces/app-hoje-page-tsx.md` (direção B, aprovada por Eduardo em 31/10/2026). Este mundo SUBSTITUI o de setembro (Space Grotesk, lima, azul pulse, IBM Plex Mono, gramática de chat), rejeitado pelo usuário em 31/10/2026. A landing antiga (`landing/index.html`) fica no repositório como artefato congelado e não vinculante; nada dela é lei deste sistema.

O app empresta a gramática da tela de treino que o público sabe de cor: a meta de proteína é a carga do dia e a barra que enche, a próxima refeição é o card de exercício com play, a refeição marcada é a série concluída (círculo que preenche, barra que sobe), o modo cozinhar é o cronômetro de um passo por tela. Tema claro de propósito, para o celular apoiado no balcão de uma cozinha iluminada: branco puro, preto quase puro, cinza para o secundário, fio hairline entre linhas, superfícies em cinza muito claro sem borda. Um único acento, laranja de crosta, que só fala quando algo é ação, progresso, feito ou vínculo.

Densidade de app nativo, não de site: coluna única de 480px no máximo, fonte do sistema (SF na Apple) em 600/700, números arredondados e tabulares, fotos de comida grandes com gradiente só na base. Nada de tagline, mascote, eyebrow, grid de cards com anéis de macros, nem tema escuro "de academia".

**Sistema durável vs. superfície.** Herdável pela esteira de apps-irmãos [ia] (trocando apenas o matiz do acento e seus dois derivados `acc-soft`/`acc-text`): os papéis de cor e a lei do acento único, o par tipográfico sistema + rounded, a regra dos numerais `.num`, a set-row, o photo card com play, a barra de progresso e seu momento de subida, a família de botões, chips, stepper, toast, tab bar e a família de raios. Superfície só deste app (não é lei do sistema): a copy ("g para fechar", "Marquei, comi"), os quatro slots de refeição, a coluna de ingredientes grams-first (específica de receita; herdável só por quem tiver ficha técnica), o modo cozinhar com cronômetro e a ordem de composição da tela Hoje.

**Key Characteristics:**
- Fundo branco puro, texto ink, um acento só.
- Fonte nativa da plataforma em 600/700; todo número em rounded tabular.
- Cards sem borda em cinza suave; listas separadas por hairline.
- Foto de comida grande sempre que há uma receita em foco (photo card, hero de receita).
- Movimento curto com ease-out expressivo, reservado para confirmação e troca de passo.

## Colors

Neutro de app nativo com um único laranja de crosta funcional.

### Primary
- **Laranja Crosta** (`acc`): fundo do botão primário e do play do photo card, preenchimento da barra de progresso e das pílulas de passo, círculo e checkbox de "feito", links de texto ("Trocar", "Marquei, comi", "Tentar de novo"), aba ativa, coração de favorita, dígitos do cronômetro rodando, ponto pulsante do timer-chip e anel de foco. Nunca em fundo de seção, nunca em título.
- **Crosta Clara** (`acc-soft`): fundo do hint-chip de quantidade escalada no modo cozinhar e da seleção de texto.
- **Crosta Funda** (`acc-text`): texto sobre `acc-soft`; é o único jeito de pôr texto pequeno em tom de acento sobre fundo tingido.

### Neutral
- **Papel** (`paper`): fundo de tudo; também texto sobre acento, foto e ink.
- **Tinta** (`ink`): texto principal, anel da próxima refeição, chip selecionado, toast e timer-chip.
- **Cinza** (`grey`): datas, sublinhas, metas, rótulos de stat, abas inativas, medida caseira.
- **Fio** (`hair`): divisória de 1px entre linhas de lista.
- **Suave** (`soft`): superfícies sem borda (card de proteína, trilho do controle segmentado, stepper, busca, botões de ícone, aviso, dica, botões secundários) e fundo de foto ausente.
- **Trilho** (`track`): fundo da barra de progresso e pílulas de passo futuras.
- **Anel** (`ring`): círculo de refeição pendente, checkbox vazio, ícone de aba indisponível, coração não favoritado, placeholder de prato.

### Named Rules
**The One Crust Rule.** O laranja marca só ação primária, progresso, estado feito/selecionado/ao vivo e links. Seleção de filtro usa ink, não acento. Se o laranja aparecer em fundo de seção, título ou decoração, está errado.

**The Ink Next Rule.** A próxima refeição é anel ink de 2px, vazio; pendente é anel `ring`; feito é círculo laranja cheio com check branco. Três estados, três tratamentos, nenhum outro.

**The Light Kitchen Rule.** Tema claro de propósito (`color-scheme: light`, `themeColor` branco). Não existe modo escuro neste sistema.

## Typography

**Display/Body Font:** fonte do sistema (`-apple-system` / SF Pro na Apple, Roboto no Android, Segoe UI no Windows)
**Numeral Font:** `ui-rounded` (SF Pro Rounded na Apple), com Nunito 700/800 via `next/font` como fallback fora da Apple

**Character:** O SF em 600/700 dá a voz de app nativo sem personalidade emprestada; o rounded tabular nos números dá a leitura de placar de treino, macia e alinhada.

### Hierarchy
- **Numeral giant** (700, 104px, 1, -0.04em): cronômetro do modo cozinhar; laranja rodando, ink em "Pronto".
- **Numeral hero** (700, 44px, 1, -0.02em): "N g para fechar" na Hoje; a unidade cai para 18px/600 em cinza.
- **Numeral stat** (700, 26px): trio proteína/min/kcal da receita.
- **Display** (700, 34px, 1.05, -0.025em): título grande de tela ("Hoje", "Receitas"), sempre sob a data/contexto pequeno em cinza 13px.
- **Headline** (700, 28px, 1.08–1.15, -0.022em, `text-balance`): nome da receita sobre a foto e o texto do passo no modo cozinhar.
- **Title** (700, 19px, -0.015em): cabeçalho de seção ("Próxima refeição", "Ingredientes"). Nome no photo card usa 20px/700.
- **Body strong** (600, 16px, -0.01em): rótulo de set-row e nome de receita na lista; valores numéricos à direita em 16/700 rounded.
- **Body** (400, 15px, ~1.375): ingredientes, passos do preparo, dica.
- **Meta** (500, 13px, cinza): sublinhas, datas, contadores ("2 de 4", "4/7").
- **Label** (600, 11.5px, 0.05em, maiúsculas, cinza): só como unidade sob numeral de stat. Tab bar usa 11px/600 sem caixa alta.

### Named Rules
**The Rounded Numeral Rule.** Todo número que o usuário lê como medida (gramas, kcal, minutos, porções, contadores, cronômetro, toast) leva `.num`: família rounded + `tabular-nums`. Texto corrido nunca leva.

**The Grams-First Rule.** Em listas de ingredientes, a coluna da direita é sempre peso em gramas, rounded 700 alinhado à direita; a medida caseira ("1 un", "2 col. sopa") vai em cinza 13px colada ao nome. Sem peso conhecido, a medida caseira ocupa a coluna.

## Layout

Coluna única centralizada, `max-width: 480px`, gutter de 20px; no desktop a mesma coluna fica centrada sobre branco (sem breakpoints, sem layout de duas colunas). Topo e base respeitam `env(safe-area-inset-*)`. Ritmo: 20px de topo + safe area, cabeçalho de tela com 20px abaixo, seções separadas por 24px, cabeçalho de seção a 4–10px do conteúdo. Linhas de lista com 10–12px verticais e 12px de gap horizontal. O card de proteína respira 16/18px. Conteúdo rolável reserva 110px (tab bar flutuante ou barra de ação fixa) mais a safe area no rodapé.

Ações fixas de rodapé ficam sobre um gradiente de branco (`from-white 70%` até transparente) para não cortar o conteúdo seco. Não há faixas horizontais de chips: escolhas frequentes viram controle segmentado; as raras ficam numa folha (Lei de Hick, revelação progressiva).

**The One Step Rule.** No modo cozinhar, uma instrução por tela: pílulas de progresso (6px, uma por passo, laranja até o atual) com contador `N/total` em rounded cinza, texto do passo em headline, cronômetro gigante ancorado embaixo, e a dupla voltar (círculo suave 54px) + primário ("Próximo passo" / "Marquei, comi"). Troca de passo por botão ou deslize horizontal acima de 60px.

## Elevation & Depth

Plano por padrão: profundidade vem de superfície suave sobre branco e de fios hairline, não de sombra. Sombra existe só em três coisas que flutuam ou são o alvo do polegar, sempre ambiente, preta e difusa. A tab bar é uma cápsula flutuante de vidro (`.glass`: branco 62%, `blur(22px) saturate(180%)`, borda de luz branca, sombra ambiente dupla e realces internos), afastada 16px das laterais e 10px acima da safe area; o conteúdo passa por baixo dela. A foto ganha legibilidade por gradiente preto só na base (75–80% até transparente), nunca por véu na imagem inteira.

### Shadow Vocabulary
- **Lift** (`box-shadow: 0 6px 16px rgba(0,0,0,.14)`): botão primário.
- **Play** (`box-shadow: 0 4px 12px rgba(0,0,0,.25)`): botão play do photo card, sobre foto.
- **Float** (`box-shadow: 0 10px 30px rgba(0,0,0,.25)`): toast de confirmação.

### Named Rules
**The No-Border Card Rule.** Cards e superfícies não têm borda; a separação é o cinza `soft` sobre branco. Borda só existe como fio `hair` entre linhas e no anel dos círculos.

## Shapes

Família arredondada de app nativo: pílula total para botões, chips, barra, círculos de estado e timer-chip; 20px no photo card; 18px no card de proteína; 16px em toast, aviso e dica; 12px em busca e hint-chip; 10px em stepper e miniatura de receita (56px); 7px no checkbox de ingrediente (22px, borda 2px). Ícones: Phosphor (MIT), um único conjunto. Peso `regular` no repouso e `fill` no estado ativo/selecionado (aba ativa, coração favoritado), como o iOS; `bold` em ícones pequenos de controle (lupa, filtros, fechar, menos/mais, voltar); play, pausa e chama em `fill`. Nada de glifo de texto no lugar de ícone. Fotos sempre `object-cover` com recorte pelo raio do contêiner.

## Components

### Buttons
Família de pílulas de 54px, firmes e com resposta tátil (`active: scale(.98)`, desabilitado a 50% de opacidade).
- **Shape:** pílula total.
- **Primary:** fundo laranja, texto branco 17px/700, 54px de altura, ocupa a largura disponível, sombra Lift. Um por tela.
- **Secondary:** círculo suave de 54px com ícone ink (voltar no modo cozinhar).
- **Soft:** pílula suave de 54px, texto ink 16px/600.
- **Text:** texto laranja 15px/600, 44px de alvo, para a ação alternativa ("Marquei, comi" sob "Começar a cozinhar").
- **Focus:** contorno laranja de 2px com offset de 2px em todo foco visível.

### Chips
- **Style:** pílula de 36px, suave, texto ink 14px/600.
- **State:** selecionado inverte para fundo ink e texto branco (nunca laranja). Toque alterna.
- **Timer-chip:** pílula ink com ponto laranja pulsante de 6px e "Passo N · m:ss" em rounded; aparece quando outro passo tem cronômetro rodando e leva até ele.
- **Hint-chip:** `acc-soft` com texto `acc-text` 14px/600 e ícone de chama; mostra a quantidade já escalada para as porções.

### Cards / Containers
- **Progress card:** superfície suave, raio 18px, padding 16/18px: numeral hero, sublinha meta em rounded, barra de progresso.
- **Photo card:** 220px, raio 20px, foto cobrindo, gradiente preto na base com nome 20/700 branco e meta em rounded branco 90%, play laranja de 46px no canto inferior direito (14px da borda). O card inteiro é o link.
- **Hero de receita:** foto sangrando 380px, nome em headline sobre gradiente, botão voltar circular translúcido (preto 35% + blur).
- **Aviso / dica:** superfície suave, raio 16px, texto ink 14–15px; aviso de erro traz ação em texto laranja ("Tentar de novo").

### Inputs / Fields
- **Busca:** campo suave de 44px, raio 12px, ícone de lupa cinza, sem borda, sem anel próprio além do foco global.
- **Stepper:** grupo suave raio 10px, botões de 36×32px com ícones Phosphor menos/mais, valor em rounded 15/700 ao centro; limite desabilita para `ring`.
- **Controle segmentado:** trilho `soft` raio 12px, 40–44px de altura, polegar branco raio 9px com sombra curta que desliza até a opção marcada (340ms, `cubic-bezier(.22,1,.36,1)`); opção marcada ink 600, demais cinza 500; `radiogroup` com setas do teclado. Usado para refeição na biblioteca e para tempo/proteína na folha de filtros.
- **Folha (Sheet):** sobe de baixo (raio 28px no topo, alça de 40×6px, véu preto 30%); título 22/700 com uma ação de texto opcional à direita ("Limpar"); foco vai para o painel, Esc e toque no véu fecham, a página não rola. Uma só para o app: filtros da biblioteca, peso e meta no Perfil.
- **Folha de filtros:** seções com controle segmentado; botão primário "Ver N receitas" com a contagem ao vivo. Só aplica ao tocar no botão; fechar descarta.
- **Campo numérico grande:** superfície suave de 72px, raio 16px, rótulo 15/600 acima (só para leitor de tela quando o título da folha já nomeia o campo); número em rounded 34/700 com a unidade em cinza 18/600 colada a ele; dica 13px embaixo, que vira ink 600 quando o valor sai da faixa. Aceita vírgula ("80,5"). Tocar em qualquer ponto da superfície abre o teclado; o anel de foco fica na superfície, nunca no texto.
- **Escolha em linhas (rádio):** para opções com explicação (nível de atividade). Linha com fio, círculo de 26px à esquerda (anel `ring` vazio; marcado vira laranja cheio com check, a gramática da set-row), rótulo body-strong e dica meta em cinza.
- **Botões de ícone:** 44×44px raio 12px em `soft` ao lado da busca (favoritas, filtros). Favoritas ativo: `acc-soft` com coração `fill` laranja. Filtros ativo: ink com selo laranja de contagem.
- **Etiqueta de filtro ativo:** pílula ink 28px com rótulo e X; tocar remove o filtro. Aparece só quando há filtro, ao lado da contagem "N receitas".
- **Checkbox de ingrediente:** quadrado 22px raio 7px, borda `ring`; marcado vira laranja com check branco e o nome passa a cinza riscado.

### Navigation
- **Tab bar:** cápsula flutuante de vidro de 64px, até 440px de largura, no layout raiz. Aparece nas quatro telas-raiz (/hoje, /receitas, /lista, /perfil) e some em receita, modo cozinhar e cadastro, que têm a própria ação no rodapé. Uma lente (preto 5,5% com realce interno) desliza até a aba ativa em 480ms `cubic-bezier(.22,1,.36,1)`. Ícone Phosphor 25px sobre rótulo 11px/600; ativa em laranja com ícone `fill`, inativas em tinta 75% com ícone `regular`.

### Cadastro (onboarding)
**The One Question Rule.** Uma pergunta por tela, na mesma moldura do modo cozinhar: voltar circular suave + pílulas de passo com `N/4` no topo, título em headline 28/700 com uma frase cinza de porquê, campos, e o primário "Continuar" ancorado embaixo, desabilitado até a resposta valer. Sexo começa sem escolha (o controle segmentado aceita vazio). A última tela mostra a meta calculada no card de proteína (numeral hero para os gramas, numeral stat para as kcal, separados por fio) e diz como foi calculada; nada é gravado antes de "Começar".

### Gráfico da semana (Perfil)
Sete colunas na gramática da barra de proteína: trilho `track` de 10×96px com a altura da meta, preenchimento laranja até onde o dia chegou (teto na meta, mínimo visível de 10% quando houve registro), subindo da base em 700ms `cubic-bezier(.16,1,.3,1)` com 40ms de atraso entre colunas. Dia em 3 letras embaixo ("sáb"), hoje em ink 600 escrito "hoje", coluna tocada em ink 700. Uma leitura acima ("Hoje · 44 g de 160 g") troca com o toque; cada coluna é um botão com o valor no nome acessível. Sem legenda em caixa: uma série só, e a frase "A coluna cheia é a meta." embaixo.

### Entrar
Mesma coluna, sem tab bar. Contexto "Anaból[IA]" em cinza, título display "Entrar", uma frase ("Receba um link no seu e-mail para entrar. Sem senha."), campo de e-mail suave de 54px (raio 12, texto 17px, teclado de e-mail) e o primário "Receber link". Google e Apple, quando ligados, vêm depois de um "ou" como botões suaves de largura total. Enviado: círculo laranja de 48px com check, headline "Confira seu e-mail", o endereço em ink 600 e "Usar outro e-mail" em texto. Link vencido: aviso suave acima do campo.

### Assinatura (paywall)
Sem hero e sem tagline: título display "Assinatura", três linhas com check laranja de 22px dizendo o que vem (o número de receitas vem do conteúdo), card suave de preço com "R$ 29,90" em numeral hero e "por mês" em cinza, as duas frases de condição (Pix ou cartão, cancela no Perfil; garantia de 7 dias) e um único primário fixo no rodapé, "Assinar por R$ 29,90/mês". Com assinatura ativa, a tela só confirma e leva para Hoje.

### Conta (Perfil)
Última seção do Perfil. Linhas com fio: e-mail (valor em cinza à direita) e assinatura (estado em meta: "Ativa, renova em 01/12", "Cancelada, acesso até 01/12", "Sem assinatura" com "Assinar" em texto). "Cancelar assinatura" e "Sair" em texto laranja; cancelar abre a confirmação na própria tela ("Manter" suave e "Confirmar cancelamento" primário), nunca um diálogo do sistema. Sem conta: frase curta e botão suave "Criar conta".

### Lista de compras
Agrupada por receita: nome em title 19/700 (leva à receita), "N porções · M de T" em meta, X num círculo suave de 36px para tirar a receita. Itens com o checkbox de ingrediente da receita e gramas à direita (Grams-First); comprado fica laranja com o nome e o peso em cinza riscado. "Limpar" em texto ao lado do título abre uma confirmação na própria tela (cartão suave com "Cancelar" e "Limpar lista"), nunca um diálogo do sistema. Tempero "a gosto" e água não entram.

### Set Row (signature)
A refeição como série de treino. Linha com fio no topo: círculo de 26px à esquerda (anel `ring` pendente, anel ink próxima, laranja cheio com check feita), rótulo body-strong com sublinha cinza truncada, valor em gramas rounded 16/700 à direita (`+N g` para a próxima, `—` para pendente, que também fica cinza). Na próxima refeição o círculo é botão de marcar direto.

### Progress Bar e o momento "série concluída" (signature)
Trilho de 10px em `track`, preenchimento laranja em pílula. Ao voltar de uma marcação, a barra monta no valor anterior (`from`) e sobe até o novo em 900ms `cubic-bezier(.16,1,.3,1)`; o círculo da refeição marcada preenche em laranja após 350ms (transição de cor 500ms, check aparecendo em 300ms); um toast ink sobe 12px em 400ms acima da tab bar com check laranja, "+N g · Slot marcado" em rounded e "Desfazer" em branco 80%, e some sozinho em 8s. `prefers-reduced-motion` zera as durações.

### Recipe Row
Miniatura 56px raio 10px, nome body-strong com "N min · dificuldade" em meta, à direita proteína em rounded 16/700 sobre kcal em cinza 12px, coração de 40px de alvo (laranja preenchido quando favorita).

## Do's and Don'ts

### Do:
- **Do** manter um único acento por app e usá-lo só em ação primária, progresso, feito/selecionado/ao vivo e links; num app-irmão [ia], troque o matiz de `acc`, `acc-soft` e `acc-text` e nada mais.
- **Do** pôr todo número de medida em `.num` (rounded + tabular-nums).
- **Do** listar ingredientes com gramas na coluna da direita e a medida caseira em cinza junto ao nome.
- **Do** usar fio `hair` entre linhas e superfície `soft` sem borda para agrupar.
- **Do** confirmar marcação com o trio barra que sobe, círculo que preenche e toast com desfazer.
- **Do** manter o modo cozinhar em um passo por tela, com contador `N/total` e o timer-chip para cronômetros de outros passos.

### Don't:
- **Don't** usar o laranja em fundo de seção, título, chip de filtro selecionado ou decoração.
- **Don't** criar tema escuro "de academia"; o sistema é claro de propósito.
- **Don't** pôr eyebrow/kicker acima de títulos, tagline, ou mascote na interface.
- **Don't** montar grid de cards de receita com anéis de macros nem acento verde.
- **Don't** trazer de volta lima, azul pulse, Space Grotesk, IBM Plex Mono ou a gramática de chat da landing de setembro.
- **Don't** dar borda a cards nem sombra a superfícies que não flutuam.
- **Don't** escurecer a foto inteira; o gradiente vive só na base, sob a legenda.
