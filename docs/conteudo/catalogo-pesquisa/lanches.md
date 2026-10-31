# Lanches salgados e itens portáteis: notas do mapeamento

Arquivo: `lanches.csv`, 62 linhas (A 29, B 25, C 8). Todas as linhas ficam entre 26 e 49 g de proteína,
entre 355 e 585 kcal e levam no máximo 45 min. Nenhuma usa whey.

## Como estimei os números
- Proteína e kcal vêm de um script com valores da TACO local (`taco-busca.py`), calculados por ingrediente na porção já ajustada.
- Ingredientes fora da TACO usam rótulo médio ou USDA: tortilha/rap10 (8 g e 295 kcal por 100 g), pão sírio (9,1 g e 275),
  pão de hambúrguer (8,5 g e 280), tilápia crua (20,1 g e 96), queijo coalho (23 g e 310), trigo para quibe (12,3 g e 342),
  goma de tapioca hidratada (0 g e 240), tahine, batata palha, leite integral (a TACO local não tem valores para ele).
- A sardinha em lata da TACO (15,9 g/100 g) parece baixa perto dos rótulos (~20 g). Mantive o valor da TACO, por ser o mais conservador.
- Carnes estão em peso cru, salvo quando a linha diz "cozido/grelhado/desfiado". Nesse caso usei o valor da TACO para a carne cozida.

## Fontes que mais renderam
- **TudoGostoso** dá a maior parte do sinal. As páginas de categoria mostram a contagem de avaliações de várias receitas de uma vez:
  "Bolos e tortas salgadas" (empadão de frango com 1,8 mil, bolo salgado de pão de forma com 652, bolo de pão de queijo com 437),
  o especial "Temporada de Sanduíche" (misto quente de forno com 1,5 mil, hambúrguer recheado com 95, buraco quente com 78)
  e "Airfryer" (lanches e pratos). Receitas soltas fortes: salpicão (587), patê de atum (208), torta de atum de liquidificador (211),
  carne louca de festa (301), quibe assado (261), esfiha turca (409), salada de macarrão com atum (122).
- **Receiteria** confirma os formatos fit e virais (pizza e cone de rap10, pizza de massa de frango, falafel assado, enroladinho),
  mas quase não tem avaliações.
- **Internacionais com volume**: HelloFresh (quesadilla, cerca de 9.300 avaliações), Tastes Better From Scratch (caesar wrap,
  179 votos), RecipeTin Eats (shawarma, 1.365 comentários), Skinnytaste (buffalo).
- Para fit e viral (nuggets, coxinha sem massa, pizza de massa de frango, ovo mayak), o sinal vem de 3 ou mais fontes independentes
  (matérias do TudoGostoso, Receiteria, Vitat, portais), não de muitas avaliações.

## Limites desta rodada
- O orçamento de busca na web (200 por turno, dividido entre todos os pesquisadores) acabou no meio do trabalho. Depois disso,
  usei só a leitura direta de 5 páginas que eu já conhecia (categorias do TudoGostoso e 2 receitas).
  Não consegui conferir YouTube e TikTok (visualizações), Panelinha, Cybercook, Guia da Cozinha nem Budget Bytes/Meal Prep Manual para lanches.
- Várias notas A se apoiam em "3 ou mais fontes" e não em avaliações (empanada, churrasquinho, falafel, salada de pote, buffalo).
  Vale reconferir com visualizações do YouTube quando houver busca.

## Lacunas
- **Sardinha**: só uma linha C (torta de liquidificador). Ficaram de fora, por falta de sinal verificado, o cuscuz paulista
  (clássico de SP, sai frio em fatia), o patê de sardinha e o sanduíche de sardinha.
- **Suíno e laticínio**: poucos. Pernil (A), lombo desfiado (C) e beirute de ricota (C).
- **Vegetariano**: só o falafel. Leguminosa sozinha mal passa de 30 g sem muito iogurte.
- **Regionais**: só Nordeste (tapioca de carne-seca, espetinho com coalho, bolinho de mandioca) e o pão de queijo mineiro.
  Ficaram de fora acarajé e bolinho de feijoada, por pouca proteína e fritura, e a paçoca de carne-seca, por falta de sinal.
- **Não verificados, mas promissores**: wrap de omelete, kibe de frango, bolinho de atum na airfryer, pizza viral de frango
  à parmegiana (filé como base) e a variação de frango do kibe e da esfiha (entrou só a esfiha, como C).
- **Fronteira com o café**: misto quente, patê de atum e tapioca de carne-seca podem coincidir com o pesquisador do café da manhã.

## Padrões de sabor percebidos
- **Frango desfiado + requeijão** é a base universal do lanche brasileiro: coxinha, pastel, esfiha, empadinha, enroladinho, cone de rap10,
  bolo de pão de queijo. É a forma mais barata de passar de 35 g. Cuidado para o cardápio não ficar todo frango (hoje são 32 de 62).
- **Airfryer** virou o método padrão do lanche "saudável": nuggets, tiras empanadas, passarinho, isca de peixe, bolinhos, pizza de rap10.
  Os títulos que fazem sucesso prometem "crocante sem fritura".
- **Rap10/tortilha e pão sírio** substituem a massa caseira e mantêm o tempo abaixo de 20 min (pizza, cone, quesadilla, burrito, shawarma, beirute).
- **Cozinha árabe paulista** (kibe, esfiha, kafta, beirute, shawarma) tem um dos sinais mais fortes e já usa carne magra e iogurte.
- **Clássicos de boteco e de lanchonete** (pernil, carne louca, bauru, buraco quente, misto) batem a meta só trocando o corte
  (lagarto ou patinho) e aumentando o recheio. O pão francês segura a conta das kcal.
- **Truques recorrentes de ajuste**: iogurte natural no lugar de metade da maionese (salpicão, salada de maionese, caesar, patê),
  massa de iogurte com fermento químico para não esperar a massa crescer (esfiha, calzone), e dobrar a proteína do recheio
  em vez de mexer na massa (torta de atum, pastel, empadinha).
