---
version: 1
slug: "app-hoje-page-tsx"
primary_target: "app/hoje/page.tsx"
related_targets: ["app/receita/[id]/page.tsx","app/cozinhar/[id]/page.tsx"]
---

# Surface brief — app Anaból[IA] (telas Hoje, Receita, Modo cozinhar; herdado por Biblioteca, Lista, Perfil, Onboarding)

Modo: Operate. Visitante: assinante que treina e cozinha, usando o celular apoiado no balcão da cozinha à noite, mão suja, luz de cozinha. Tarefa: ver quanto falta de proteína, escolher uma receita que fecha a conta, cozinhar pelo passo a passo, marcar. Conteúdo: 40 receitas com foto real, macros por porção (TACO), passos numerados. Restrições: PWA mobile-first, tema claro de propósito (cozinha iluminada), sem tagline, sem mascote na interface, sem lima/azul do kit v1, sem cara de restaurante nem de "app de IA".

Decisão (Eduardo, 31/10/2026): direção B com dois ajustes vindos de A. Mockup aprovado: `design/direcoes/index.html`, seção B (artifact https://claude.ai/artifact/7KQCaxxCxt5PsA9iamW66g).

## Direction contract

THESIS: O treino do dia, na cozinha. A gramática da tela de treino que esse público sabe de cor, aplicada à alimentação: meta de proteína como carga do dia, próxima refeição como card de exercício, refeição marcada como série concluída, modo cozinhar como cronômetro. Recusa o grid de cards de receita com anéis de macros e acento verde, e recusa o escuro "de academia".

OWN-WORLD: Branco puro de fundo, preto quase puro no texto, cinza quente nos secundários, fio hairline entre linhas, superfícies suaves em cinza muito claro (cards sem borda, raio 18 a 20). Um acento só, laranja de crosta (D4451F), usado apenas em ação primária, barra de progresso, estado feito e links; nunca em fundo de seção. Tipografia do sistema Apple (SF via -apple-system) em peso 600/700 para títulos; números em ui-rounded, tabulares. Fotos reais da comida em cards de canto arredondado com gradiente escuro só na base para legenda. Ícones em traço único de 2px. Raise de A (disciplina da ficha técnica): ingredientes e macros em coluna alinhada à direita com tabular-nums, porções escaláveis com stepper, quantidades sempre em gramas.

STORY: Abro e vejo quanto falta hoje e a barra enchendo. A próxima refeição já está escolhida e me chama com foto e play. Entro, confiro a ficha, escalo porções, começo a cozinhar: um passo por tela, número gigante, próximo. Marco. A barra sobe. Amanhã eu volto.

FIRST VIEWPORT (Hoje, 390×844): status bar; "Terça, 31 de outubro" pequeno; título "Hoje" 34/700; card cinza-claro com "87 g para fechar" em ui-rounded 44/700, sublinha "73 de 160 g de proteína · 1.240 de 3.100 kcal", barra 10px com 46% em laranja; seção "Próxima refeição" com link "trocar"; card de foto 220px com gradiente na base, nome 20/700, meta "+42 g proteína · 22 min · 610 kcal", botão play laranja 46px no canto inferior direito; seção "Refeições 2 de 4" com quatro linhas: círculo (laranja com check quando feita), refeição + receita, gramas em ui-rounded à direita; tab bar translúcida com Hoje, Receitas, Lista, Perfil, ativo em laranja. Ação primária: o play do card. Regra: toda tela abre com comida antes de número, exceto Hoje, onde o número abre e a foto vem logo abaixo.

FORM: Direção B, "o treino do dia na cozinha", posição 2 na minha lista ordenada de sete (IMPECCABLE'S PICK); a sorteada era a 6 (ficha da cozinha profissional), apresentada como A e não escolhida. Seed key dba59215 (concept-seed, scope direction, mode operate). Raise registrado: disciplina tabular da ficha técnica (de A) nos ingredientes e macros. Assinatura de interação: a barra de proteína sobe com ease-out ao marcar uma refeição e o círculo da refeição preenche em laranja; o modo cozinhar troca de passo com deslize horizontal e o cronômetro conta em ui-rounded.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.
