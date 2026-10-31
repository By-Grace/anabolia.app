# Pratos de outras cozinhas adaptados ao mercado brasileiro

Arquivo: `internacional.csv`, com 89 linhas: 76 com evidência A, 11 com B e 2 com C.

- **Origem:** 45 de frango, 28 de carne bovina, 9 mistas, 5 suínas e 2 de peixe (atum em lata).
- **Já no app:** 1 linha já existe (burrito bowl de frango, que é o "bowl mexicano de frango") e 19 são parecidas com pratos do app.
- **Repetidas em outros arquivos:** 10 linhas são o mesmo prato de outra lista. Restam **78 pratos novos**.

Todas as linhas ficam entre 41 e 56 g de proteína, entre 480 e 730 kcal e levam até 45 min.

## O que muda em todas as receitas
- **Porção:** 160 a 180 g de carne crua por pessoa, ou 230 g de sobrecoxa sem pele. As fontes estrangeiras usam de 110 a 130 g e chegam a 20–30 g de proteína.
- **Tortilla:** vira Rap10. O rótulo diz 274 kcal e 8,2 g de proteína por 100 g; uma unidade pesa cerca de 33 g. Como o Rap10 é pequeno, o burrito leva 2 e o taco leva 3.
- **Sour cream, ranch e tzatziki:** viram iogurte natural.
- **Creme de leite fresco (heavy cream):** vira leite desnatado com requeijão. No alfredo e no mac and cheese também entra leite em pó desnatado.
- **Cottage:** vira ricota batida.
- **Cheddar e provolone:** viram queijo prato ou mussarela.
- **Feta e cotija:** viram minas frescal ou minas meia cura.
- **Temperos prontos (chili powder, cajun, taco seasoning, garam masala):** viram misturas caseiras de páprica, cominho, orégano, alho e caiena, ou de curry, cominho, canela e cravo.
- **Pimentas e pastas que faltam aqui:**
  - chipotle → páprica defumada com pimenta calabresa
  - gochujang → sriracha com mel e páprica
  - ají amarillo → dedo-de-moça com cúrcuma
  - achiote → colorau, que é o mesmo urucum
- **Molhos asiáticos:** mirin, saquê e Shaoxing viram açúcar com vinagre. Molho de peixe e molho de ostra viram shoyu.
- **Carnes:** cordeiro e peru moídos viram patinho; pork shoulder vira pernil; ribeye e skirt viram alcatra.
- **Tempo:** pratos de cozimento longo (carnitas, barbacoa, pulled pork, goulash) vão para a panela de pressão, em cubos de 4 cm por 30 a 35 min.

## Fontes que renderam mais
- **RecipeTin Eats e Natasha's Kitchen:** publicam nota, número de votos e macros por porção, e foram as mais fáceis de conferir. A Natasha tem os maiores volumes, como meatloaf com 9.828 votos e chili com 2.511.
- **The Woks of Life e Omnivore's Cookbook:** foram as melhores para a cozinha asiática.
- **Meal Prep Manual:** é a única fonte que já pensa em proteína alta, com 40 a 50 g por porção. Serviu de referência para ajustar as porções.
- **Cafe Delites, Well Plated e Spend With Pennies:** completam a contagem de fontes independentes.
- **YouTube:** buscado em português, mostra o que o brasileiro assiste. Os casos mais fortes:

  | Prato | Canal | Visualizações |
  |---|---|---|
  | Yakisoba | Tia do Joinha | 4,7 mi |
  | Parmegiana | Menino Prendado | 4,1 mi |
  | Kafta | Manual do Mundo | 4,9 mi |
  | Carbonara | Paola Carosella | 3,8 mi |
  | Shawarma | Rodrigo Hilbert | 1,2 mi |
  | Chili | Leonardo Abreu | 519 mil |

  O YouTube também lista vídeos estrangeiros com o título traduzido. No CSV, eles contam como popularidade global, não como sinal brasileiro.

## Lacunas e limites
- **Busca esgotada:** o limite de buscas na web desta rodada acabou no meio do trabalho. Allrecipes, BBC Good Food, Serious Eats, Budget Bytes, Skinnytaste, Delish e Damn Delicious estavam bloqueados ou fora do ar. Por isso as notas desses sites, que costumam ter milhares de avaliações, não entraram.
- **Sem fonte escrita grande:** tacos al pastor e picadillo cubano entraram só com vídeos. O bife à pizzaiola tem só vídeos pequenos e por isso é C.
- **Adaptações nossas:** nenhuma fonte grande publica o poke com atum em lata nem a shakshuka com carne moída.
- **Duplicatas com outras listas:**
  - lanches.csv: tacos, burrito e quesadilla.
  - carnes.csv: kafta, almôndegas e lombo agridoce.
  - frango.csv: parmegiana, caprese, mostarda e mel, e gengibre.

  Shawarma, cheesesteak, Caesar e buffalo ficaram em formato de prato para não repetir os sanduíches e wraps do lanches.csv. Vale consolidar.
- **Pouco conhecidos no Brasil:** o macarrão de cheeseburger tem menos de 5 mil visualizações em vídeos brasileiros. Lomo saltado, adobo, jerk e niçoise são conhecidos lá fora e pouco aqui.

## Pratos descartados
- **Pelo ingrediente:**
  - frango marsala, que depende do vinho marsala
  - pollo a la brasa peruano, que depende de ají panca e huacatay
  - katsu curry, que precisa do tablete de curry japonês
  - japchae, que leva macarrão de batata-doce
  - arepa, que usa a farinha Harina PAN
  - salmão teriyaki, porque o brief exclui salmão
- **Pelo tempo:** moussaka e gumbo passam de 45 min.
- **Por ser quase igual a outro prato:** butter chicken (já é o curry do app), paella de frango (quase igual à jambalaya e à galinhada), ropa vieja (quase igual à barbacoa e à carne desfiada), lo mein e chow mein (iguais ao yakisoba) e frango general Tso (quase igual ao agridoce e ao de laranja).
- **Por ter pouca proteína:** chana masala e dal sem carne.

## Sabores que se repetem
- **Doce, salgado e alho:** a família com mais votos é shoyu com mel ou açúcar mascavo e alho. Entram aqui teriyaki, alho e mel, carne mongol, carne com brócolis, bulgogi e laranja. Combina com o paladar brasileiro e usa ingredientes de qualquer mercado.
- **Tex-mex:** o padrão é cominho, páprica defumada e limão, com feijão, milho e Rap10. É a categoria com mais pratos que o público já conhece.
- **Iogurte:** no lugar dos cremes, o iogurte serve de molho cremoso em várias cozinhas (tikka, tandoori, tzatziki, ranch, paprikash, halal). Dá para usar a mesma base em muitas receitas.
- **Tudo numa panela só:** arroz mexicano, biryani, jambalaya e peri-peri são o formato galinhada com outro tempero. São bons para variar sem ensinar técnica nova.
- **Formato bowl ou marmita:** é o que os portais de meal prep mais publicam (burrito, poke, grego, gyro, Big Mac, esquites). Combina com o uso do app.

## Método
A proteína e as calorias foram estimadas com a TACO local, item a item, pelo peso cru da carne, do arroz cru e do macarrão cru, e pelo peso cozido do arroz e do feijão prontos.

Alguns ingredientes vieram de fora da TACO:
- **Rótulo:** Rap10, leite desnatado e leite integral (a TACO não tem os valores do leite).
- **USDA:** feijão branco, ketchup, sriracha, molho barbecue, tomate seco, massa folhada e uva-passa.
- **Aproximações dentro da TACO:**
  - pão sírio e pão de hambúrguer → pão francês
  - bacon → toucinho frito
  - calabresa → linguiça de porco crua
  - pasta de amendoim → amendoim torrado
  - grão-de-bico cozido → valor do grão cru dividido por 2,4

As calorias e proteínas publicadas pelas fontes ficam na coluna `observacoes`, marcadas como "Macros da fonte" ou "Macros publicados".
