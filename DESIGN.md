---
name: "Anaból[IA]"
description: "Precisão Gostosa em forma de chat — a landing é a conversa de onboarding onde a meta vira almoço."
colors:
  ink: "#17282B"
  pulse: "#3156FF"
  goal: "#C8F24C"
  mist: "#B9D8DB"
  ice: "#F1F5EA"
  ink-2: "#22363A"
  ice-2: "#FFFDF8"
  line: "#DCE3D2"
  muted: "#5D6E71"
typography:
  display:
    fontFamily: "Space Grotesk, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "clamp(2.35rem, 8.5vw, 5.4rem)"
    fontWeight: 500
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  title:
    fontFamily: "Space Grotesk, Plus Jakarta Sans, system-ui, sans-serif"
    fontSize: "1.35rem"
    fontWeight: 500
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Plus Jakarta Sans, system-ui, -apple-system, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace"
    fontSize: "0.72rem"
    fontWeight: 500
    letterSpacing: "0.14em"
rounded:
  tick: "7px"
  chip: "8px"
  tail: "8px"
  badge: "10px"
  avatar: "12px"
  card: "20px"
  bubble: "22px"
  pill: "999px"
spacing:
  gap-sm: "12px"
  gap-md: "18px"
  gap-lg: "26px"
  gap-xl: "34px"
  section: "56px"
  gutter: "clamp(16px, 4.5vw, 32px)"
components:
  button-primary:
    backgroundColor: "{colors.pulse}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: "0.72em 1.3em"
  bubble-ia:
    backgroundColor: "{colors.ice-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.bubble}"
    padding: "14px 18px"
  bubble-me:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.ice}"
    rounded: "{rounded.bubble}"
    padding: "14px 18px"
  chip-calc:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.goal}"
    rounded: "{rounded.chip}"
    padding: "0.08em 0.45em"
  badge-macro:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.goal}"
    rounded: "{rounded.badge}"
    padding: "0.35em 0.6em"
  appcard:
    backgroundColor: "{colors.ice-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
---

# Design System: Anaból[IA]

## Overview

**Creative North Star: "A Página é a Conversa" (Precisão Gostosa em forma de chat)**

Registro do mundo CONSTRUÍDO em `landing/index.html` (contrato de direção no comentário do topo do body; seed 92f9f722). A landing recusa o hero-de-features da categoria fitness: ela É o onboarding encenado — a [ia] pergunta a meta, o visitante responde, e a manchete "Sua meta virou almoço." nasce dentro de uma bolha de chat. Fundo ICE claro e quente, superfícies levemente elevadas em branco-creme, estrutura e contraste em INK, um único azul de ação (PULSE) e o lima GOAL reservado ao que foi calculado. A camada de precisão é mono: todo número, timestamp e microlabel do sistema fala IBM Plex Mono.

O sistema é mobile-first (descoberta via IG), coluna única, e alterna dois palcos: o chat sobre ICE e interlúdios full-bleed em INK (outdoor de campanha, fechamento). Tudo encenado é rotulado "demonstração" — regra visível no próprio card.

**Key Characteristics:**
- Cores com função, não decoração: INK estrutura · PULSE ação/reconhecimento · GOAL progresso calculado · MIST apoio no escuro · ICE respiro.
- Colchetes são semântica: `[42g]` só existe como chip/badge mono lima-sobre-INK quando houve cálculo/personalização.
- Display Space Grotesk 500 com tracking negativo e line-height ≤1.12; números viram manchete.
- Sombras ambiente tingidas de INK; nunca duras.
- Setas `→` marcam próximo passo e efeito em cadeia.

**Sistema durável vs. superfície.** Herdável pela esteira [ia]: a paleta funcional e suas três leis, o trio tipográfico e a camada mono de precisão, o chip/badge de cálculo, a pill PULSE de CTA, o appcard (foto + badge + título + meta mono), a família de raios e a sombra ambiente, os microlabels mono uppercase, o sprite do avatar/ícone "a". Superfície só desta landing (não é lei do sistema; reutilizável apenas se outra superfície adotar a mesma forma): a gramática de chat inteira (bolhas por remetente, day separators, stamps, read receipts, typing indicator, reveal lateral), o interlúdio outdoor, o bloco promise sublinhado, a coluna de 760px e a copy encenada.

## Colors

Paleta de 5 cores do Brand Kit v1 "Precisão Gostosa" + 4 neutros derivados que o código introduziu para superfície e hierarquia.

### Primary
- **Pulse Blue** (#3156FF): a cor da ação e do reconhecimento de marca. No código: fundo do CTA único (pill "Seguir @anabolia.app"), links, anel de foco (`outline: 3px solid`), setas do sysline, "cozinhar →" nos cards, o `[ia]` do wordmark e o ponto do avatar. Porção pequena de qualquer tela; nunca fundo de seção.

### Secondary
- **Goal Lime** (#C8F24C): progresso e confirmação calculada. No código: texto de chips e badges sobre INK, o destaque `goal-ink` da manchete, ênfases nas seções INK (em do outdoor, ponto final do close, assinatura mono), fundo do tick marcado, `::selection` (com texto INK) e o sublinhado de 4px da promessa.

### Tertiary
- **Mist** (#B9D8DB): apoio sobre fundos INK — texto secundário das seções escuras, stamps da bolha do usuário, borda do tick vazio, pontinhos do typing indicator, links do footer.

### Neutral
- **Ink** (#17282B): estrutura. Texto padrão sobre claro, bolha do usuário, fundo de chip/badge, seções outdoor/close/footer, tinta das sombras.
- **Ink-2** (#22363A): hairline sobre INK (borda superior do footer).
- **Ice** (#F1F5EA): fundo da página e texto sobre INK; também o `theme-color`.
- **Ice-2** (#FFFDF8): superfície elevada — bolhas da [ia], appcards, typing bubble.
- **Line** (#DCE3D2): bordas de 1px e divisórias tracejadas (header, bolhas, cards, lista).
- **Muted** (#5D6E71): texto secundário sobre claro — day separators, subs, metas, hints, qty, microlabels neutros.

### Named Rules
**The Bracket Rule.** Colchetes só enquadram o que foi calculado ou personalizado, e o valor calculado vive no chip/badge mono GOAL-sobre-INK (`[125g]`, `[42g] proteína`). Sem cálculo, sem colchete. Exceção única: o `[ia]` do wordmark (marca registrada do kit).

**The Food Layer Rule.** PULSE nunca toca a camada de comida. Sobre a foto, a única sobreposição permitida é o badge INK/GOAL; PULSE só aparece abaixo dela, no corpo do card.

**The GOAL-on-INK Rule.** GOAL nunca é texto sobre fundo claro. Como texto, só sobre INK. Sobre claro, GOAL aparece apenas como preenchimento ou traço: fundo de tick (check em INK), sublinhado, fundo de seleção.

## Typography

**Display Font:** Space Grotesk (fallback Plus Jakarta Sans → system-ui)
**Body Font:** Plus Jakarta Sans (fallback system-ui) — pesos 400/500/700 + itálico 400
**Label/Mono Font:** IBM Plex Mono (fallback ui-monospace) — pesos 400/500/600

Carregadas via Google Fonts (`display=swap`). **Character:** display geométrica em peso médio (500, nunca black), corpo humanista e legível, mono como voz de sistema — a precisão é literal: se é dado, é mono.

### Hierarchy
- **Display** (500, clamp(2.35rem, 8.5vw, 5.4rem), lh 1.02, ls −0.035em, `text-wrap: balance`): a manchete do chat — um h1 dentro de bolha. Variações da mesma voz: outdoor h2 clamp(3rem, 10.5vw, 6rem)/lh 0.98, close h2 clamp(2.6rem, 8.5vw, 5rem)/lh 1, promise clamp(1.7rem, 4.6vw, 2.6rem)/lh 1.12.
- **Title** (500, 1.35rem, ls −0.02em): título de receita no appcard. Wordmark: 1.25rem/ls −0.03em.
- **Body** (400, 1.0625rem, lh 1.6): texto das bolhas e listas; bold 700 para ênfase; sub-linhas 1.12–1.15rem em Muted/Mist com max-width 34–56ch.
- **Label** (mono 500, 0.66–0.8rem, ls 0.03–0.3em, uppercase nos rótulos de sistema): day separators (0.72rem/0.14em), stamps (0.68rem), meta de receita (0.78rem), demo-note (0.66rem/0.12em), sysline (0.8rem), assinatura outdoor (0.74rem/0.3em). Chips/badges: mono 600.

### Named Rules
**The Precision Layer Rule.** Todo metadado do sistema — número, tempo, timestamp, status, rótulo — é IBM Plex Mono; rótulos de sistema são uppercase com tracking largo. Números importantes não viram parágrafo: viram chip, badge ou manchete.

**The Medium Display Rule.** Display é sempre peso 500 com tracking negativo e line-height ≤1.12. Itálico só existe na "dica" de receita (`hint`).

## Layout

Coluna única de chat: `.wrap` com max-width 760px e gutter `clamp(16px, 4.5vw, 32px)`. Bolhas e appcards limitados a `min(560px, 86%)` (lista: 480px), alinhados por remetente — [ia] à esquerda com avatar de 38px, usuário à direita sem avatar. Header sticky (z-index 40) em ICE 90% com `backdrop-filter: blur(10px)` e borda Line. Interlúdios INK (outdoor, close, footer) são full-bleed e quebram a coluna; respiram com padding vertical `clamp(56px, 9vw, 104px)` e `clamp(64px, 10vw, 110px)`.

Ritmo observado: 12px (gaps internos, header), 14px (padding vertical de bolha), 18px (entre mensagens, padding horizontal), 26px (day separator, sysline), 34px (cta-row), 56px (margens de seção). Breakpoints por max-width: **560px** (avatar 30px, bolhas/cards a 92%, CTA da cta-row em largura total) e **359px** (o par da manchete volta a quebrar linha). `scroll-behavior: smooth`.

## Elevation & Depth

Híbrido claro/escuro: sobre ICE, a profundidade vem de sombras ambiente tingidas de INK + borda Line em superfícies Ice-2; as seções INK são totalmente planas (contraste faz o trabalho). O header usa translucidez + blur em vez de sombra.

### Shadow Vocabulary
- **Ambient** (`box-shadow: 0 14px 34px rgba(23,40,43,.10), 0 2px 8px rgba(23,40,43,.06)` — token `--shadow`): bolhas da [ia], appcards, typing bubble.
- **CTA glow** (`0 8px 22px rgba(49,86,255,.28)`; hover `0 12px 28px rgba(49,86,255,.34)`): exclusiva do botão PULSE — a única sombra colorida do sistema.
- **Badge lift** (`0 6px 16px rgba(23,40,43,.35)`): badge de macro sobre foto.

### Named Rules
**The Ambient Ink Rule.** Sombras são sempre difusas e tingidas de INK (`rgba(23,40,43,·)`), nunca duras nem cinza-neutro; a única exceção cromática é o glow PULSE do CTA.

## Shapes

Família arredondada suave, nunca circular além do necessário: pill 999px (CTA), bolha 22px com cauda assimétrica de 8px no canto do remetente (bottom-left na [ia], bottom-right no usuário), card 20px, avatar 12px, badge 10px, chip 8px, tick 7px, foco 4px; o destaque `goal-ink` usa raio relativo (0.14em). Divisórias internas são tracejadas (`border-bottom/top: dashed` Line) — linguagem de recibo/lista de compras. Traços SVG (read receipt, check do tick, colchetes do avatar) usam `stroke-linecap: square`, ecoando a geometria dos colchetes. Fotos vivem em `aspect-ratio` ~5:4 (1408/1126 e 1405/1126) com `object-fit: cover`.

## Components

### Buttons
- **Character:** uma só voz de ação — pill PULSE, sempre para o mesmo destino (instagram.com/anabolia.app nesta fase).
- **Shape:** pill (999px), `inline-flex` com gap 10px e ícone Instagram inline SVG (18px, `stroke: currentColor`).
- **Primary:** fundo PULSE, texto #FFFFFF, Space Grotesk 500 1rem (ls −0.01em), padding 0.72em 1.3em, CTA glow.
- **Hover / Active:** `translateY(-2px)` + glow maior em 0.18s `cubic-bezier(.2,.8,.2,1)`; active volta a 0.
- **Variantes de escala:** `.small` 0.92rem / 0.6em 1.1em (header); no close 1.15rem / 0.85em 1.6em. Não há variante secundária/ghost.
- **Foco (global):** `outline: 3px solid PULSE, offset 3px, radius 4px` via `:focus-visible`.

### Chips
- **chip-calc** (o dispositivo-assinatura): mono 600 0.95em, GOAL sobre INK, raio 8px, padding 0.08em 0.45em, `white-space: nowrap`. Só para valor calculado — ver The Bracket Rule.
- **badge-macro:** mesmo DNA sobre foto — mono 600 0.95rem, raio 10px, padding 0.35em 0.6em, posicionado 14px do canto inferior-esquerdo, Badge lift.

### Cards / Containers (appcard)
- **Corner Style:** 20px, `overflow: hidden`.
- **Background / Border:** Ice-2 + 1px Line; sombra Ambient.
- **Anatomia:** foto 5:4 com badge-macro → corpo (16px 18px 18px): título Space Grotesk 1.35rem, meta mono 0.78rem Muted ("22 min · fácil · 610 kcal"), hint em itálico Muted entre aspas, e rodapé com divisória tracejada contendo "cozinhar →" (Space Grotesk PULSE, não-clicável) e o rótulo "demonstração" (mono uppercase 0.66rem).

### Navigation
- Header sticky translúcido (ICE 90% + blur 10px, borda Line): wordmark `anaból[ia]` (Space Grotesk 500, `[ia]` em PULSE) + ícone-avatar 34px à esquerda, `.btn.small` à direita. Sem menu; a página é um fluxo único.

### Gramática do chat (superfície desta landing)
- **Bolha [ia]:** Ice-2, borda Line, raio 22px/cauda 8px, padding 14px 18px, sombra Ambient; pode conter h1, chips, appcard ou lista.
- **Bolha usuário (`.me`):** INK sólido, texto ICE, sem borda, cauda à direita; stamp mono 0.68rem em MIST + read receipt (SVG double-check 15×10, stroke MIST, linecap square).
- **Day separator:** mono 500 0.72rem uppercase ls 0.14em Muted, centralizado.
- **Sysline** (efeito em cadeia): linha central mono 0.8rem Muted com termos-âncora em INK bold e setas `→` em PULSE.
- **Lista de compras:** dentro de bolha; linhas com divisória tracejada, tick 22px (raio 7px, borda 1.5px MIST; marcado = fundo GOAL + check INK stroke-width 3), nome (Muted quando resolvido), qty mono 0.8rem à direita, rodapé mono uppercase em PULSE.
- **Avatar:** sprite SVG `#av-ia` (rect INK raio ~24%, colchetes GOAL linecap square, "a" ICE em Space Grotesk, ponto PULSE), 38px/raio 12px (30px ≤560px).

### Moção (chat chegando)
Progressive enhancement: classe `.js` no root; sem JS, sem IntersectionObserver ou com `prefers-reduced-motion: reduce`, tudo aparece estático. Com moção: elementos `.reveal` entram uma única vez ao cruzar o viewport (IO com `rootMargin: 0 0 -8%`, threshold 0.08, unobserve após entrar) em 0.5s `cubic-bezier(.16,1,.3,1)` — mensagens da [ia] deslizam de −16px (esquerda), do usuário de +16px (direita), demais elementos sobem 12px. Antes de cada bolha da [ia], um typing indicator (3 pontos MIST, bounce 1s com delays 0.15s/0.3s, fade 0.25s) segura ~620ms e some. Nenhuma animação em loop além dos pontos; nada re-anima.

### Seções INK (outdoor / close / footer)
Outdoor: manchete display com `em` em GOAL, lista de valores em MIST com termos bold em ICE, assinatura mono GOAL ls 0.3em uppercase. Close: centralizado, ponto final em GOAL, sub em MIST, CTA grande, sign-off mono "precisão que dá fome". Footer: MIST sobre INK, hairline Ink-2, nota legal obrigatória ("demonstração do produto em desenvolvimento… nada aqui é conselho nutricional").

## Do's and Don'ts

### Do:
- **Do** enquadrar todo valor calculado no chip/badge mono GOAL-sobre-INK: `[125g]`, `[42g] proteína`.
- **Do** usar `→` para próximo passo e efeito em cadeia (PULSE quando for o conector do sistema).
- **Do** usar mono uppercase 0.66–0.8rem com tracking largo para todo microlabel de sistema.
- **Do** usar foto real de comida (luz quente, sem pote de suplemento) com o badge INK/GOAL como única sobreposição.
- **Do** rotular toda tela/momento encenado com "demonstração" e manter a nota legal no footer.
- **Do** manter um único CTA por página — pill PULSE, mesmo destino em todas as instâncias.

### Don't:
- **Don't** usar GOAL como texto sobre fundo claro — sobre claro, só preenchimento/traço (tick, sublinhado, seleção).
- **Don't** deixar PULSE tocar a camada de comida (nem overlay, nem texto sobre foto).
- **Don't** usar colchetes decorativos; sem cálculo, sem colchete (exceção: wordmark `[ia]`).
- **Don't** usar sombras duras, offset ou cinza-neutro — sempre Ambient Ink; glow só no CTA.
- **Don't** usar itálico fora da hint de receita, nem display em peso diferente de 500.
- **Don't** re-animar reveals nem animar em loop; com `prefers-reduced-motion`, entregar a página estática.
