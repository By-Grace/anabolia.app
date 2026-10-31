# Café da manhã: notas do mapeamento

73 linhas em `cafe.csv`: 59 pratos novos, 13 parecidos com algo que já está no app, 1 que já existe ("ovos mexidos", mantido porque a técnica de hotel é o que viraliza).
Evidência: 56 A, 15 B, 2 C. Proteína estimada de 25 a 47 g, de 350 a 560 kcal, tempo máximo de 35 min.

## Como as estimativas foram feitas
- Todas as quantidades passaram pela TACO local (`web/scripts/taco-busca.py`). Os itens que não estão na TACO foram estimados assim:
  - leite fluido integral (3,1 g/60 kcal) e desnatado (3,3 g/35 kcal): rótulo;
  - queijo coalho (23 g/297 kcal): rótulo;
  - Rap10 (8,5 g/300 kcal por 100 g): rótulo;
  - cacau em pó (rótulo);
  - goma hidratada: 70% da fécula de mandioca da TACO;
  - carne de sol: estimada como carne seca cozida.
- A sardinha em óleo da TACO dá só 15,9 g/100 g. Por isso o cuscuz com sardinha leva 2 ovos.
- O reforço segue o brief: 3 ovos, +50 a 80 g de frango desfiado, +15 a 40 g de leite em pó desnatado, ricota no lugar de cottage ou grego. Whey não entra em nenhuma linha. Nas receitas virais "proteicas" com whey, a troca está escrita em `ajuste_meta`.
- Critério de A: o do brief. Para "3+ fontes independentes" só contei quando ao menos uma fonte tinha 100 mil visualizações ou mais, ou 20 avaliações ou mais.

## Fontes que mais renderam
1. **YouTube, Shorts incluídos.** É de longe o melhor sinal para café da manhã. O café brasileiro viraliza em vídeo curto: tapioca com ovo (1,6 mi), pãozinho de cuscuz (2,7 mi), pão de batata-doce (11 mi), pão com ovo (9,9 mi). Também apareceram canais do brief: Mohamad Hindi, Dr. Henrique Monteiro, Gabriel Freitas, Nandu Andrade, Patricia Leite, Ana Zambrin e Panelinha/Rita Lobo.
2. **TudoGostoso.** Contagens grandes nos clássicos: panqueca americana (4,7/5 com 1.945 avaliações) e misto quente de forno (4,7/5 com 1.468). As receitas "fit" e de crepioca ficam na faixa de 100 a 150 avaliações. As matérias de café proteico ajudam a confirmar presença em várias fontes.
3. **Receiteria.** A página de café reforçado traz notas: pão proteico de frango (3,6/5 com 234), panqueca americana (4,5/5 com 100), fortaia (4,4/5 com 34).
4. **Internacional.** Budget Bytes, BBC Good Food e Allrecipes bloquearam a leitura (403 ou domínio recusado). Shakshuka, huevos rancheros, egg muffins, baked oats e congee foram avaliados pelas visualizações no YouTube. Da Budget Bytes (burrito congelável), a nota não foi conferida.
5. A cota de busca na web da sessão acabou no fim do trabalho. Algumas notas (Budget Bytes, BBC) ficaram sem conferir.

## Padrões de sabor percebidos
- **"Substitua o pão."** É a tendência dominante: massas de ovo com tapioca, cuscuz, batata-doce, aveia ou frango viram pão (pão de batata-doce, pãozinho de cuscuz, pão proteico de frango, crepioca, pão de micro-ondas).
- **Queijo derretido e tostado com ovo.** Aparece no ovo crocante, no pão de queijo de frigideira, no waffle de pão de queijo, no Rap10 com ovo e na pizza de omelete. O crocante do queijo na frigideira é o gancho dos vídeos.
- **Velocidade de eletrodoméstico.** Micro-ondas em caneca (ovo pochê, omelete, cuscuz, bolo, torta) e airfryer (pão com ovo, omelete, pão de queijo) somam milhões de visualizações.
- **Nordeste forte e com proteína natural.** Cuscuz e tapioca com carne seca, coalho, sardinha ou frango batem a meta com pouco ajuste.
- **Doces de café.** Repetem banana + canela + cacau + mel. O leite em pó desnatado é o substituto natural do whey (mingau, vitamina, overnight oats, baked oats, bolo de caneca).
- **Meal prep de café.** Pede peças congeláveis: burritos, McMuffin, muffins de ovo, muffins de banana, pão de queijo cru, panquecas americanas.

## Lacunas
- **Peixe no café:** só o omelete de atum e o cuscuz com sardinha têm sinal. Tapioca de atum só achei com menos de 6 mil visualizações.
- **Carne bovina fora do Nordeste:** só a crepioca de carne moída (B, cerca de 15 mil) e o burrito congelável.
- **Pão com frango quente:** os vídeos fortes são de pão de massa fermentada recheado, que passa de 45 min e fica mais para lanche. O app já cobre com o sanduíche natural e o patê de frango.
- **Regionais com sinal fraco (C):** banana-da-terra com ovos e coalho, macaxeira com carne de sol. Norte (açaí, tapioca paraense) e Centro-Oeste (pamonha) ficam abaixo da meta de proteína sem virar outro prato.
- **Panquecas congeladas** ficaram só como observação da panqueca americana. Não achei uma receita "de congelar" de café com sinal próprio: as panquecas de congelar do YouTube são recheadas, de almoço.
- **Fronteiras de categoria:**
  - com doces: rabanada de forno (a do TudoGostoso é sobremesa de Natal), bolo de caneca de chocolate, mingau de milho;
  - com lanche: torta de caneca, pão de queijo.
  - Ficaram aqui porque o uso principal mostrado é o café.

## Parecidas com o app (13)
- Variações de método ou recheio de itens que já existem:
  - omelete recheado, omelete na airfryer, omelete de forno;
  - muffins de ovo, pizza de omelete;
  - crepioca de presunto e queijo, tapioca com ovo e queijo;
  - cuscuz de caneca, pão de micro-ondas.
- Mesmo prato com o truque do leite em pó ou do ovo: mingau de aveia com ovo, overnight oats, iogurte engrossado, bolo de caneca de chocolate.
- Vale tratá-las como "versão 2" do card existente, não como receita nova.
