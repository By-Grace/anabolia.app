# Brief comum — mapeamento do catálogo de receitas do Anaból[IA]

## O app
Anaból[IA] é um app brasileiro para quem treina e precisa bater proteína no dia. O usuário é brasileiro comum que cozinha em casa.
O cardápio hoje tem 52 receitas; a meta é chegar a centenas (o fundador fala em "mil"). Sem mentalidade de escassez:
mapeie MUITAS receitas boas, desde que cada uma seja um prato distinto com sinal real de que as pessoas gostam.

## Critérios de uma receita do app
- Proteína por porção: almoço/jantar 40–57 g; café/lanche 25–52 g.
- Calorias por porção: almoço/jantar 450–800 kcal; café/lanche 340–680 kcal.
- Tempo: a maioria até 30 min; nunca mais de 45 min (forno/pressão contam).
- Ingredientes de qualquer supermercado brasileiro comum (frango, patinho/acém/alcatra/músculo/carne moída, lombo/pernil suíno,
  ovo, atum/sardinha em lata, tilápia/merluza, queijos comuns, ricota, requeijão, iogurte natural, leite e leite em pó desnatado,
  feijão, lentilha, grão-de-bico, arroz, macarrão, batata, batata-doce, mandioca, aveia, banana, tapioca, cuscuz de milho, legumes comuns).
  Evite: salmão, peru, cottage (troque por ricota), iogurte grego importado, carnes nobres caras, ingrediente de loja especializada.
- Sem whey/proteína em pó. Se uma receita muito popular usa whey, registre só se funcionar sem ele (diga a troca: ovo, leite em pó desnatado, ricota).
- Receita popular que não bate a meta como publicada ENTRA, desde que você proponha o ajuste (ex.: 180 g de frango cru por pessoa,
  3 ovos, + 60 g de frango desfiado, + 30 g de leite em pó desnatado) e estime a proteína já ajustada.

## Estimativa de proteína
Use a TACO local (tabela oficial brasileira) para estimar, com porções que batem a meta:
    python3 /Users/eduardosantos/projects/anabolia/web/scripts/taco-busca.py "frango peito" "arroz cozido"
Valores são por 100 g. Marque sempre como estimativa (a coluna já diz _est). Referências rápidas por 100 g: peito de frango cru 21,5 g;
patinho cru 21,7 g; ovo 13 g (1 ovo ≈ 50 g ≈ 6,5 g); arroz cozido 2,5 g; feijão cozido 4,8 g; leite em pó desnatado 34,7 g;
ricota 12,6 g; mozarela ~22 g; atum em lata drenado 26 g.

## Já no app (marque ja_no_app = "sim" ou "parecida" se o candidato coincidir)
arroz carreteiro; arroz de forno com frango e queijo; aveia de geladeira com iogurte; baião de dois; batata recheada com carne;
bolo de caneca de banana e aveia; bolonhesa de patinho; bowl de carne com batata-doce; bowl mexicano de frango; carne de panela;
coxinha de batata-doce com frango; crepioca de frango com requeijão; cuscuz com carne moída e ovos; cuscuz com ovos e queijo;
escondidinho de carne com batata-doce; escondidinho de frango com batata-doce; frango BBQ com purê; frango crocante com arroz;
frango cremoso ao curry; frango desfiado da semana; frango com quiabo; frango xadrez; galinhada; hambúrguer caseiro de patinho;
iogurte com aveia e banana; macarrão com atum; mingau de aveia; muffin salgado de frango e ovo; omelete de forno com frango;
omelete recheado de carne; ovos cozidos com batata-doce; ovos mexidos com pão integral; panqueca de banana e aveia;
panqueca de carne moída; pão de frigideira; pão de ricota e ovo; patê de frango com torradas; peixe com purê e brócolis;
PF bife acebolado e ovo; pizza de frigideira de aveia; sanduíche natural de frango; sanduíche quente de atum e ovo;
sardinha assada; shake de leite em pó; sopa de frango com batata-doce; strogonoff de frango; tapioca de frango com omelete;
torta de liquidificador de frango; tortinhas de tapioca com frango; vitamina de banana e aveia; wrap de atum; wrap de frango.

## Fontes
Brasil: TudoGostoso (avaliações e comentários), Receiteria (seção alta proteína), Panelinha, Receitas Nestlé, Cybercook, Guia da Cozinha,
Mais Você, YouTube (Receitas de Pai, Ana Zambrin, Gabriel Freitas, Menino Prendado, Mohamad Hindi, Patricia Leite, Leonardo Abreu,
Dr. Henrique Monteiro, Mirielly Ruback, Leandro Twin, Cariani), Hipertrofia.org, matérias de portais.
Fora: Budget Bytes, Meal Prep Manual, Fit Men Cook, Skinnytaste, BBC Good Food, Allrecipes, Serious Eats, RecipeTin Eats, Love & Lemons,
EatingWell, Delish, Jalalsamfit, Ethan Chlebowski.
O Reddit está bloqueado em todas as ferramentas: não tente e não use sites-espelho.
Direitos autorais: não copie texto de receita. Nome, link e um resumo seu de uma linha.

## Força da evidência
A = forte (≥100 avaliações, ou ≥500 mil visualizações, ou o prato aparece em 3+ fontes independentes)
B = moderada (20–99 avaliações, 50–499 mil visualizações, ou 2 fontes)
C = fraca (fonte única, sem sinal). Prefira A e B; C só se preencher lacuna real (prato regional, variedade).

## Formato de saída (obrigatório)
1) CSV UTF-8 com cabeçalho exatamente assim (vírgula como separador, campos com vírgula entre aspas duplas):
nome,categoria,refeicoes,proteina_principal,ingredientes_porcao,proteina_g_est,kcal_est,tempo_min,metodo,origem,fonte_nome,fonte_url,popularidade,evidencia,ajuste_meta,ja_no_app,observacoes
- refeicoes: um ou mais de cafe|almoco|lanche|jantar separados por "|" (a primeira é a principal)
- proteina_principal: frango|bovina|suina|peixe|ovo|laticinio|leguminosa|misto
- ingredientes_porcao: ingredientes-chave com quantidade POR PORÇÃO já ajustada à meta (ex.: "180 g peito de frango; 120 g arroz cozido; 1 ovo")
- metodo: panela|forno|airfryer|pressao|microondas|frigideira|sem_fogo|assadeira (pode combinar com "|")
- origem: brasil-<regiao> | internacional-<pais/cozinha> | fit-moderno
- popularidade: o sinal concreto (ex.: "4,8/5 com 1.234 avaliações", "2,3 mi visualizações")
- evidencia: A|B|C
- ajuste_meta: o que muda para bater a meta, ou "nenhum"
- ja_no_app: nao|sim|parecida
2) Um .md curto com: fontes que renderam mais, lacunas, padrões de sabor percebidos.

Cada linha = um prato distinto. Variações só se mudarem a proteína principal, o molho ou o formato de forma relevante
(ex.: "frango ao molho de mostarda" e "frango ao molho de limão" são duas; "frango grelhado com orégano" e "com tomilho" não).
