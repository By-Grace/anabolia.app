# Anaból[IA] — Escopo do MVP (proposta para corte)

Data: 2026-10-31 · Status: ESCOPO FECHADO em 31/10 · direção visual B decidida em 31/10 · resta a decisão de conteúdo (receitas e fotos)
Substitui, para fins de produto, a camada visual e de copy de PRODUCT.md e DESIGN.md (congelados em 31/10).

## 1. O que o MVP precisa provar

Uma pessoa que treina e cozinha o próprio rango paga R$29,90/mês para ter receitas boas de ganho de massa que fecham a proteína do dia, e volta ao app várias vezes por semana para escolher o que cozinhar.

Métrica de sucesso em 30 dias após o lançamento (números são chute meu, a ajustar):
- 50 assinantes pagantes
- 3 ou mais refeições marcadas por assinante por semana
- 60% dos assinantes do primeiro mês renovam

## 2. O loop central

ABRIR → ver quanto falta de proteína hoje → ESCOLHER uma receita que fecha a conta → COZINHAR com o passo a passo → MARCAR como feita → o dia atualiza → a próxima escolha fica mais fácil.

Tudo que não serve a esse loop fica fora do MVP.

## 3. Dentro do MVP

### 3.1 Onboarding e meta (5 telas)
- Objetivo fixo: ganhar massa. Sem opção de secar no MVP.
- Dados: sexo, idade, peso, altura, nível de atividade.
- Cálculo: TMB e gasto diário, meta de calorias com superávit moderado, meta de proteína por kg.
- Resultado: "sua meta diária é X kcal e Y g de proteína", editável depois.
- DECIDIDO (Eduardo, 31/10): sem biotipo. Adiciona atrito e não muda a receita sugerida.

### 3.2 Hoje (tela inicial)
- Proteína consumida versus meta, e quanto falta.
- Refeições marcadas hoje.
- Sugestão: 3 receitas que fecham o que falta, filtradas pelo horário (café, almoço, lanche, jantar).

### 3.3 Receitas (biblioteca)
- 40 receitas no lançamento, 10 por refeição do dia.
- Card: foto, nome, proteína por porção, tempo, kcal.
- Filtros: refeição, tempo (até 15, até 30 min), proteína mínima.
- Busca por nome e ingrediente.
- Favoritos.

### 3.4 Receita (detalhe)
- Foto, macros por porção, tempo, dificuldade.
- Ingredientes com quantidades, escaláveis por número de porções.
- Modo cozinhar: um passo por tela, letra grande, tela não apaga.
- Botão "adicionar à lista de compras" e botão "marquei, comi".

### 3.5 Marcar refeição
- Marcar uma receita como feita soma os macros no dia.
- Histórico simples dos últimos 7 dias.
- Minha decisão: não existe registro de alimentos avulsos (não é MyFitnessPal). Só receitas do app contam. Simplifica tudo e mantém o foco.

### 3.6 Lista de compras (versão simples)
- Ingredientes entram a partir das receitas escolhidas.
- Agrupados por receita, com quantidade.
- Marcar como comprado. Limpar lista.
- Fora: estoque em casa, baixa automática, "o que posso fazer com o que tenho". Isso é a lista inteligente da v2.

### 3.7 Conta e assinatura
- Login por e-mail com link mágico, mais Google e Apple.
- Fluxo: landing/Instagram → cria conta → onboarding → paywall → checkout → app.
- Preço: R$29,90/mês. DECIDIDO (Eduardo, 31/10): sem trial grátis. Garantia de 7 dias com reembolso cobre o risco do comprador.
- Checkout com Pix e cartão. Cancelamento pelo próprio app.
- Provedor de pagamento: OnProfit (onprofit.com.br, checkout e área de membros para infoprodutores, taxa menor e repasse de juros, só Brasil) no lançamento; Stripe quando internacionalizar. Para não bloquear a construção, o código fala com o pagamento por uma única interface (criar assinatura, consultar status, cancelar, receber webhook); o provedor é um adaptador trocável. Até a decisão, o app funciona com um adaptador de teste.

### 3.8 Perfil
- Editar peso e meta. Sair. Cancelar assinatura. Só isso.

## 4. Fora do MVP (v2 em diante)
- Lista inteligente com estoque e baixa automática.
- Sugestão pelo que tem em casa.
- Biotipo, medidas corporais, fotos de progresso.
- Desafios e streaks ("arcs").
- Widget de home screen e notificações push.
- Order-bump de smoothies e snacks.
- Parcerias com cupom de suplemento.
- App nativo nas lojas.
- Integração com Apple Health.
- Objetivo "secar" (vira o Calor[IA] da esteira).

## 5. Anti-objetivos
Se acontecer, o MVP falhou mesmo funcionando:
- Virar tracker genérico de alimentos.
- Cara de app de dieta ou de restaurante.
- Depender de conteúdo gerado por IA que o usuário percebe como falso.

## 6. Conteúdo: o gargalo real
40 receitas com foto real, macros calculados e passo a passo testado é o maior esforço do MVP, maior que o código. Precisa de decisão sua:
- Quem cria e testa as receitas (você, um nutricionista parceiro, ou curadoria de receitas conhecidas com cálculo próprio).
- Quem fotografa. A regra de marca era "comida real, sem foto de IA". Mantemos? Foto de IA de comida hoje é boa, mas conflita com o anti-objetivo acima.
- Macros: cálculo por tabela TACO (base brasileira), feito uma vez por receita.

Formato padrão de receita: nome, refeição, tempo, dificuldade, porções, ingredientes com gramas, passos numerados, macros por porção, foto, uma dica de uma linha.

## 7. Como é feito (minhas escolhas, você pode trocar)
- DECIDIDO (Eduardo, 31/10): web app mobile-first instalável (PWA). Sem loja de apps no MVP; nativo depois.
- Next.js + Supabase (auth, banco, storage de fotos) + Vercel. Stack que você já opera.
- Checkout e recorrência: OnProfit no Brasil, Stripe no internacional, atrás de um adaptador. Modelo OnProfit: o checkout é hospedado por eles e o app recebe webhooks (pedido criado, status atualizado, assinatura cancelada, pagamento concluído) para liberar ou bloquear o acesso. Login no app por e-mail do comprador.
- Visual: DECIDIDO (31/10): direção B, "o treino do dia na cozinha", com a disciplina tabular da ficha técnica (de A) em ingredientes e macros. Mockups aprovados em `design/direcoes/index.html` (seção B). Contrato de direção no surface brief do impeccable (`.impeccable/`), que o build e a revisão final auditam. Branco, preto, cinza quente, um laranja só (D4451F) em ação/progresso/feito; SF do sistema, números em ui-rounded tabulares; tema claro.
- Sem mascote na interface do MVP. O Frangão fica para Instagram e reels.

## 8. Telas (13)
1. Landing/entrada · 2. Login · 3 a 6. Onboarding (dados, atividade, resultado) · 7. Paywall e checkout · 8. Hoje · 9. Biblioteca · 10. Receita · 11. Modo cozinhar · 12. Lista de compras · 13. Perfil

## 9. Decisões
1. ~~Biotipo~~ — fora (31/10).
2. ~~Trial~~ — sem trial, garantia de 7 dias (31/10).
3. ~~Plataforma~~ — PWA agora, nativo depois (31/10).
4. ~~Pagamento~~ — OnProfit no BR, Stripe no internacional, via adaptador (31/10).
5. EM ABERTO — conteúdo: quem produz as 40 receitas e as fotos, e se foto de comida gerada por IA é aceitável. Bloqueia o lançamento, não o desenho nem o código.

## 10. Depois do corte
Escopo aprovado → desenho das três telas principais em duas direções visuais → plano de implementação → construção.
