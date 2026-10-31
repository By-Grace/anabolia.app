# Carnes bovina e suína — notas do mapeamento

72 linhas em `carnes.csv`: 50 A, 20 B, 2 C. São 55 bovinas, 16 suínas e 1 mista (quibe com ricota). Todas foram ajustadas para 40–57 g de proteína, 450–800 kcal e no máximo 45 min. Os números de popularidade foram colhidos em 31/10/2026.

## Fontes que renderam mais
- **TudoGostoso, páginas de categoria.** A busca e o WebFetch são bloqueados, mas as categorias abertas no navegador listam as receitas pela contagem de avaliações. O JSON-LD de cada receita dá a nota, o número de avaliações, o tempo e os ingredientes. Foi a base de quase todas as linhas A. As categorias usadas foram bovina, carne moída, bife, picadinho, músculo, alcatra, almôndega, lagarto, paleta, porco, lombo, pernil e molho madeira.
- **Receiteria.** O JSON-LD também traz contagens. Ela confirmou pratos que o TG não sustenta sozinho: parmegiana de carne moída (149), coxão mole com creme de batata (124), tirinhas com shoyu (101), carne moída com abóbora (112) e almôndegas na airfryer (473).
- **YouTube.** As visualizações vieram do resultado de busca. Os canais que mais aparecem são Receitas de Pai, Ana Zambrin, Isamara Amâncio, Cozinha da Wilza, Nandu Andrade, Mohamad Hindi, Menino Prendado e ChefTaico. Para o fitness, aparecem Nandu Andrade (carne moída para marmita, 386 mil) e Dr. Henrique Monteiro (tigela de x-burguer, 246 mil).
- Não usei Panelinha (o site depende de JS; só o canal da Rita Lobo entrou) nem as fontes internacionais: os pratos de carne delas são quase todos de cozinha estrangeira, fora do escopo. Reddit não foi tentado.

## Lacunas
- **O "fit" de carne tem pouco sinal.** A internet fitness brasileira gira em torno do frango. Marmitas de patinho em cubos ou desfiado têm de 4 a 5 mil visualizações. Por isso "Carne desfiada da semana" ficou C: ela entrou só porque é o equivalente bovino do frango desfiado do app.
- **Linhas fracas:** carne moída com chuchu (C), carne xadrez (B; quem sustenta é o frango xadrez), lombo acebolado (B) e lombo ao maracujá (B, com um ajuste grande no açúcar).
- **Bifes rápidos dependem de corte macio.** Usei coxão mole, que custa quase o mesmo que o patinho. Nenhum corte barato funciona na frigideira; para baratear, use a pressão: bife de panela com coxão duro ou acém.
- **Ficaram de fora de propósito:**
  - Já estão no app: carne de panela (TG 1.549 aval.), carne de panela com batata, panqueca de carne moída (TG 3,8 mil), escondidinho, bolonhesa e hambúrguer.
  - Passam de 45 min: lasanha de carne moída (TG 1,8 mil), lombo recheado e pernil inteiro.
  - Muito gordos ou caros: costela, cupim, picanha e rabada.
  - Regionais: vaca atolada, carne de sol e carreteiro.
  - Estrangeiros: yakisoba, tacos, chilli, goulash, picadinho indiano e ossobuco.
  - Lanches: esfiha, bolinho, croquete e carne louca no pão.

## Padrões de sabor
- **Cebola em quantidade** é o sabor-assinatura: acebolados (bife, fígado, iscas, bisteca, pernil) e cozidos "sem água" na cebola (músculo, pernil, carne de panela).
- **Molho de tomate com carne moída** é a base mais versátil: almôndega, polenta, PF e recheados (pimentão, abobrinha, charuto).
- **O gratinado com mozarela e presunto** tem as maiores contagens (rocambole 1.276, parmegiana 456, bife lasanha 163). A gordura vem do queijo: limitei a 20–30 g por porção.
- **Molhos com creme de leite** (strogonoff, mostarda, fricassê): 25–35 g por porção mantém o prato na faixa.
- **A panela de pressão** é o que permite usar cortes baratos (acém, músculo, pernil, bisteca) dentro de 45 min.
- **No porco dominam o agridoce e o cítrico:** laranja, maracujá, abacaxi e limão na marinada.
- **O árabe-brasileiro é forte:** kafta, quibe e charuto, quase sempre com hortelã.

## Custo
Do mais barato para o mais caro por grama de proteína: fígado, acém moído, músculo, pernil, bisteca e lombo; depois coxão duro e paleta; por último coxão mole, patinho, alcatra, maminha e fraldinha. Usei acém moído em toda a carne moída e acém ou músculo nos cozidos. Patinho aparece só como alternativa mais magra, com o aviso de custo.

## Estimativas
- Pesos crus da TACO local, multiplicados pela porção. O kcal foi arredondado para múltiplos de 5.
- **Fora da TACO** (valores aproximados por 100 g): champignon em conserva 25 kcal e 1,9 g de proteína; mostarda 66 kcal e 3,7 g; catchup 112 kcal e 1,0 g; trigo para quibe 342 kcal e 12,3 g (USDA); vinho tinto 85 kcal e 0,1 g.
- **Filé mignon suíno** não existe na TACO: usei lombo cru.
- **Fraldinha** só existe "com gordura" na TACO, por isso as iscas usam coxão mole como padrão.
- **Bisteca:** 200 g é a parte comestível. Com osso, compre cerca de 260 g.
