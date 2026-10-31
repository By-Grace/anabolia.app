# Ovos, laticínios e leguminosas: pratos de almoço e jantar

O CSV `ovos-leguminosas.csv` tem 60 linhas: 22 com evidência A, 31 com B e 7 com C. Todas ficam entre 41 e 48 g de proteína (estimada pela TACO local), entre 535 e 775 kcal e levam no máximo 45 min.
- Proteína principal: ovo em 20 linhas, laticínio em 14, misto em 21 (ovo com leguminosa ou com queijo), leguminosa em 5.
- 11 linhas estão marcadas como `parecida` com o app. São formatos que o app já tem com carne: omelete de forno, PF, torta de liquidificador, panqueca, arroz de forno, batata recheada, hambúrguer, bolonhesa e strogonoff.

## Como foi feito
- A cota de WebSearch da sessão acabou cedo, porque é dividida com os outros pesquisadores. Depois disso usei só três coisas:
  - a busca interna do TudoGostoso, ordenada por número de avaliações;
  - páginas de receita abertas direto, lendo nota, número de avaliações e ingredientes do JSON-LD;
  - URLs de receita conhecidas da Receiteria, do Love & Lemons, da BBC Good Food e do Panelinha.
- Não usei a busca do YouTube, então nenhuma linha cita visualizações. Para os itens B e C que são "fit-moderno", vale uma segunda rodada com vídeos.
- Regra de nota: A quando uma receita sozinha passa de 100 avaliações ou quando o prato aparece em 3 ou mais fontes independentes. Quando troquei a proteína da receita original (carne, bacon ou presunto por ovo e ricota), baixei um nível e escrevi isso em `observacoes`.
- Ingredientes que não estão na TACO:
  - ervilha seca: valor USDA;
  - feijão-branco: usei feijão rajado cozido como substituto, o que é conservador;
  - grão-de-bico cozido: valor do cru na TACO dividido por 2,4;
  - leite desnatado: valor TBCA, porque a TACO 457 não tem números.

## Fontes que mais renderam
1. **TudoGostoso** foi a principal. Os pratos vegetarianos mais avaliados:
   - lasanha de berinjela: 401 avaliações;
   - suflê de legumes: 333 e 206;
   - torta de abobrinha: 321;
   - couve-flor gratinada: 266;
   - repolho ao forno: 182;
   - sopa de feijão: 515;
   - sopa de ervilha: 155;
   - sopa de lentilha: 117;
   - salada de grão-de-bico: 110.
2. **Receiteria**: suflê de chuchu com 253 avaliações e lasanha de berinjela com 101. Também deu a segunda fonte de vários itens B: salada de feijão-branco (64), omelete de espinafre (60) e quiche sem massa (50).
3. **Love & Lemons** confirmou as versões vegetarianas que no Brasil aparecem com carne:
   - lentil soup: 733 avaliações;
   - eggplant parmesan: 585;
   - frittata: 250;
   - stuffed shells (conchiglione de ricota): 248;
   - chickpea salad: 153;
   - lentil salad: 121;
   - stuffed zucchini: 66;
   - buddha bowl: 54.
4. **Panelinha** (nhoque de ricota) e **BBC Good Food** (canelone de ricota e espinafre) entraram só como fontes a mais para chegar a 3. Não mostram nota.

## Padrões
- **Para passar de 40 g, a leguminosa sozinha não basta.**
  - Versões veganas ficam em 15 a 25 g: sopa de lentilha, bolonhesa de lentilha, hambúrguer de grão-de-bico, buddha bowl.
  - Quase todas as linhas precisam de 2 a 4 ovos, ou de 100 a 180 g de ricota, ou de 15 a 25 g de leite em pó no molho.
  - As saladas de leguminosa pedem 3 ovos cozidos e 40 a 50 g de queijo minas.
- **No Brasil, leguminosa vem com linguiça.** As versões mais avaliadas de sopa de lentilha, sopa de ervilha, lentilha de ano-novo, arroz com lentilha e feijão-branco levam calabresa, bacon ou costelinha. A troca que repeti foi tirar o embutido e colocar ovo pochê ou cozido mais parmesão. O sabor defumado se perde. Se fizer falta, páprica defumada resolve.
- **Os pratos de forno são os que mais recebem avaliações.** Lasanha de legume, suflê, torta de legume, gratinado e legume recheado. Nesses, o ajuste é sempre o mesmo:
  - tirar o óleo ou o creme de leite;
  - pôr leite desnatado com leite em pó;
  - acrescentar ricota.
- **Pares de sabor que se repetem:** ricota com espinafre (é a combinação vegetariana dominante), ao sugo com parmesão, molho branco gratinado e cebola dourada com lentilha.
- **Sobras viram prato.** Torta de sobra de arroz, omelete de arroz, sopa de feijão e arroz de brócolis com ovos têm bom sinal e custam pouco.

## Lacunas e o que ficou de fora
- **Sinal fraco, mas mantidos por variedade:**
  - feijão com ovos pochê (o "feijão gordo" leve);
  - ervilhas com ovos;
  - macarrão com ovos;
  - bolonhesa de lentilha;
  - rocambole de omelete;
  - omelete de arroz;
  - nhoque de mandioquinha.
  Todos são C. Antes de publicar, vale buscar vídeos para eles.
- **Ficaram de fora:**
  - hambúrguer de feijão: o TG dá 2,5/5 com 4 avaliações;
  - almôndega de lentilha: sem sinal;
  - polenta com ovo: sem sinal;
  - torta de pão amanhecido: as versões avaliadas têm carne ou presunto;
  - mexidão: leva carne;
  - moqueca de ovos e tutu: regionais;
  - falafel, homus, curry e chili: nome estrangeiro ou lanche.
- **Linhas parecidas que o editor pode cortar:**
  - os suflês de chuchu e de couve-flor usam o mesmo método;
  - as quatro saladas de leguminosa (grão-de-bico, fradinho, lentilha e feijão-branco) têm a mesma estrutura;
  - os dois hambúrgueres de leguminosa;
  - as tortas de abobrinha, de legumes de liquidificador e o repolho ao forno.
  Mantive todos porque são pratos com nome próprio e com sinal separado.
- **Sobreposição com os outros CSVs:**
  - `cafe.csv` já tem pizza de omelete, tortilha (por isso não incluí fritada de batata), shakshuka, ovos abafados no espinafre e omelete de forno de liquidificador com presunto;
  - `peixes.csv` tem as saladas de grão-de-bico e de fradinho com atum;
  - `frango.csv` tem sopa de lentilha com frango e frango com grão-de-bico.
  Nesses casos, as linhas daqui mudam a proteína principal.
