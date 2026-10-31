# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (PWA mobile-first instalável; app nativo nas lojas só depois do MVP validar — decisão do usuário, 31/10/2026)

## Stack

Next.js + Supabase (auth, banco, storage) + Vercel para o app (decisão 31/10/2026). Pagamento por adaptador: OnProfit no Brasil, Stripe no internacional. A landing de 09/2026 (`landing/`, HTML estático) permanece como artefato congelado, sem deploy.

## Users

Núcleo de aquisição: pessoas de 18–35 que treinam musculação, vivem rotina corrida e cozinham o próprio rango (bulking/ganho de massa). A marca permanece aberta a qualquer pessoa que compartilhe as tensões (kit v1, slide 5). Situação: enjoadas da dieta monótona ("frango sem graça"), querem bater proteína sem transformar comida em obrigação.

## Product Purpose

Anaból[IA] (anabolia.app): mini-app de assinatura com receitas para ganho de massa. Escopo do MVP em `docs/specs/2026-10-31-mvp-escopo.md`: onboarding com meta de calorias/proteína (sem biotipo), tela Hoje, biblioteca de 40 receitas, receita com modo cozinhar, marcar refeição, lista de compras simples, assinatura R$29,90/mês sem trial. Essência: "um sistema de alimentação para ganhar massa sem transformar comida em obrigação". Sucesso do produto = uso diário (refeições marcadas) sustentando recorrência (~R$29,90/mês). Sucesso desta landing = seguir @anabolia.app (CTA único confirmado pelo usuário em 01/09; sem form de e-mail nesta fase).

## Positioning

Quadrante "desejável + personalizado" (SABOR + INTELIGÊNCIA): ebooks são estáticos, trackers são frios/gringos, perfis de receita são desorganizados. Só o Anaból[IA] junta comida que dá vontade com dado que dá direção. Promessa central: "Você bate proteína com comida que dá vontade de repetir."

## Operating Context

Mobile-first (descoberta via reels/IG). Sequência-mãe do produto: ABRIR → ESCOLHER → COZINHAR → MARCAR; efeito: lista se ajusta → macros atualizam → próxima escolha mais fácil. Pré-lançamento: app ainda não existe publicamente; a landing é o primeiro ponto de contato após o Instagram.

## Capabilities and Constraints

- App em pré-lançamento: NADA de claims de preço, nota de loja, número de usuários ou depoimentos (não existem — não fabricar).
- Momentos de UI demonstráveis (kit v1, slide 14, material sintético rotulável): saudação "Boa, Edu. faltam [87g] de proteína"; card de receita "Frango crocante com arroz tostado · 42g proteína · 22 min · fácil · 610 kcal · Comece pela crosta. O resto vai sozinho."; lista inteligente com baixa automática.
- CTA único: https://instagram.com/anabolia.app (decisão do usuário, 01/09).
- Domínio anabolia.app ainda não registrado; página deve funcionar em qualquer host.

## Brand Commitments

REVISÃO 31/10/2026 (usuário): o Brand Kit v1 "Precisão Gostosa" NÃO é mais vinculante para o app. O usuário rejeitou as assinaturas ("tudo muito ruim"), a paleta INK/PULSE/GOAL ("parece coisa química, cara de IA") e o mascote verde. Compromissos vigentes para o app:
- Visual minimalista, premium, padrão Apple (HIG como referência de comportamento e densidade). Sem cara de restaurante, sem cara de "app de IA".
- A foto da comida é a cor da interface: cromo neutro, acento único e discreto, sem lima/azul elétrico.
- Sem taglines na interface. Sem mascote na interface do MVP (o Frangão fica para Instagram/reels, com cores naturais de galo).
- A marca v2 (ícone, cores finais, lugar do mascote) nasce das telas do MVP, não antes.
- Mantidos do kit v1 apenas como história: o nome Anaból[IA], a regra "apetite antes de academia", "comida real" na fotografia, e a voz sem tom de coach/culpa.

Kit v1 (histórico, não vinculante):
- Cores com função: INK #17282B (estrutura) · PULSE #3156FF (reconhecimento) · GOAL #C8F24C (progresso/confirmação) · MIST #B9D8DB (apoio) · ICE #F1F5EA (respiro). Leis: PULSE nunca toca a camada de comida; GOAL nunca é texto sobre fundo claro.
- Tipografia (recomendação v1.1, pendência Avenir registrada): Space Grotesk (display/wordmark) + Plus Jakarta Sans (texto) + IBM Plex Mono (camada de precisão).
- Colchetes SEMÂNTICOS: só enquadram o que foi calculado ou personalizado (ex.: [42g]). Setas → mostram o próximo passo. Números viram manchete.
- Logo: wordmark minúsculo anaból[ia] ([ia] em PULSE) + ícone "a" entre colchetes-lima; SVGs oficiais em landing/assets/.
- Voz: apetitosa, precisa, parceira; evita clínico/guru/coach; regra de ouro "Curta. Direta. Com fome."
- Assinaturas por contexto: institucional "Precisão que dá fome." · produto "Sua meta virou almoço." (FOCO desta landing, pedido do usuário) · campanha "Frango sem graça nunca mais." · manifesto "Cozinha. Come. Cresce."
- Fotografia: comida real, luz quente, cor natural, ingredientes acessíveis, sem pote de suplemento; PULSE aparece como prop (pano/caneca azul).

## Evidence on Hand

- 3 fotos oficiais do kit (comida real, já seguem as regras): kit-photo1 (frango grelhado + arroz de couve-flor), kit-photo2 (bowl carne moída + batata-doce + feijão), kit-photo3 (café da manhã BR: tapioca, omelete, mamão) — originais no pptx, otimizadas em landing/assets/.
- SVGs oficiais do logo (ícone + assinatura principal) extraídos do kit.
- @anabolia.app registrado no Instagram (01/09) — único canal vivo.
- Ausências que não podem ser fabricadas: preço público, depoimentos, contagem de usuários, screenshots reais do app (usar os momentos de UI do kit rotulados como demonstração).

## Product Principles

1. Apetite antes de academia — a comida lidera, o dado sustenta.
2. Colchete é significado, não enfeite — precisão visível só onde houve cálculo/personalização.
3. Tirar a dieta do modo castigo — nunca tom de coach, culpa ou promessa milagrosa.
4. Produto antes de marca — nenhuma rodada de identidade sem tela construída (31/10/2026).
5. Template da esteira — decisões daqui herdam para os apps-irmãos [ia].
