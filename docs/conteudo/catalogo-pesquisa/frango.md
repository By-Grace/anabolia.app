# Frango: notas do mapeamento (31/10/2026)

**Resultado:** 71 pratos distintos em `frango.csv`: 33 com evidência A, 27 com B e 11 com C. O CSV vem ordenado de A para C.
Todos os pratos já estão ajustados à meta de almoço e jantar: 43–56 g de proteína, 455–665 kcal e no máximo 45 min.

## Como estimei
- Proteína e kcal foram somadas ingrediente a ingrediente com a TACO local (`web/scripts/taco-busca.py`), usando as porções do CSV. Arredondei a proteína para 1 g e as kcal para 5.
- Não estão na TACO, então usei valores aproximados de rótulo: mostarda, shoyu, champignon em conserva, batata palha, trigo para quibe e bacon. A linha avisa nas observações quando usa algum deles. O peso pequeno desses itens muda pouco o total.
- Leite líquido aparece "sem valor" na TACO. Por isso todo molho branco, purê e creme de milho usa leite em pó desnatado com água. Isso também sobe a proteína.
- Os cortes com osso (coxa, sobrecoxa, asa) estão em peso de carne sem osso, com o peso com osso entre parênteses.
- **Evidência.** Usei a régua do brief. Para o critério "3+ fontes independentes" só contei fontes com engajamento visível (avaliações ou views). Páginas do mesmo portal contam como uma fonte, e matéria da Edicase republicada em vários portais também conta como uma.

## Fontes que mais renderam
1. **TudoGostoso.** É a melhor fonte de avaliações. A página não abre por fetch nem curl, então os números vêm dos trechos da busca.
   Destaques: creme de milho 1.023 avaliações, gratinado simples 970, frango com catupiry da tia Gracia 682, salpicão 587, panqueca 262, passarinho 252.
2. **Receiteria.** As páginas de categoria abrem e mostram a nota do bloco "em destaque". As páginas de receita trazem nota, número de avaliações, tempo e proteína por 100 g.
   Destaques: parmegiana 1.000, frango empanado na airfryer 549, filé ao molho de laranja 405, lasanha de frango 218, frango com legumes 218, frango ensopado com batatas 207, picadinho cremoso 168, frango com creme de batata 156.
3. **YouTube.** Contei as views com yt-dlp. Os canais que mais aparecem são Nandu Andrade, Menino Prendado, Ana Zambrin, Receitas de Pai, Receitas da Cris, Isamara Amâncio, Tv Churrasco e Panelaterapia.
   Destaques: assado com batatas 4,8 mi; parmegiana 4,1 mi; panqueca 3,6 mi; frango com batatas na airfryer 2,5 mi; empanado sem fritura 2,4 mi; frango cozido com batatas 2,2 mi; filé suculento na frigideira 2,2 mi.
4. Rendeu menos: Panelinha (sem avaliações), Nestlé (o PDF de receitas proteicas é grande demais para baixar) e matérias da Edicase (texto repetido em vários portais).

## Padrões de sabor
- **O cremoso domina.** Creme de milho, gratinado, fricassê ou catupiry com batata palha, salpicão, requeijão e molho branco (1,4 mi de views no vídeo da Receitas da Cris) concentram as maiores contagens.
  A troca que funciona: requeijão, leite em pó desnatado e parmesão no lugar de duas caixas de creme de leite.
- **Empanado e parmegiana.** Muitas avaliações e muitas views, e a versão sem fritura (airfryer ou forno) já é a que mais se vê.
- **"Suculento" e "não ressecar" vendem.** Os vídeos de filé simples com esse gancho passam de 2 mi de views. O TudoGostoso tem dezenas de matérias sobre frango seco.
- **Agridoce aparece sempre.** Mostarda e mel, laranja, shoyu com mel ou gengibre, mel e alho.
- **Tempo e louça.** Títulos de "uma panela só", "pressão", "10/20 minutos" e "airfryer" puxam views.
- **Sobrecoxa em alta.** Pele crocante, desossada e na airfryer. Para caber em 800 kcal, as linhas tiram a pele.
- **"Fit" no título engaja menos.** A exceção é o picadinho de frango cremoso fit da Receiteria (168 avaliações).

## Decisões de escopo
- **Fundi pratos quase iguais.** Pizzaiolo entrou na parmegiana de frigideira. Arroz cremoso entrou no risoto. Frango com catupiry entrou no fricassê. Milanesa de forno entrou no empanado sem fritura. Frango com creme de batata entrou no frango com purê. O grelhado com ervas ficou no grelhado com limão e alho.
- **Marcado como `parecida`.** Panqueca de frango, empanado, frango cremoso, salteado no mel e shoyu, frango com purê, marmita com batata-doce, hambúrguer, torta de frigideira, torta de pão de forma e as sopas.
  Motivo: cada um se aproxima de um prato do app (panqueca de carne, frango crocante, strogonoff, frango xadrez, frango BBQ com purê, bowl de batata-doce, hambúrguer de patinho, omelete de forno ou torta de liquidificador, sopa de frango).
- **Origem estrangeira, para o deduplicador conferir.** Kafta e quibe estão marcados como árabe-brasileiros e o caprese como italiano.
- **Fiquei de fora.** Os regionais (galinhada, quiabo, xinxim, pequi, quirera, cuscuz paulista), os estrangeiros (curry, teriyaki, fajita, chinês ao molho de laranja, à caçadora, cordon bleu, kiev), os lanches e os miúdos.
  O coração de frango tem 301 avaliações na Receiteria, mas só 12,6 g de proteína crua por 100 g e muita gordura, então não bate a meta.

## Lacunas
- **A busca acabou no meio.** Bati no limite de 200 buscas por turno, que é compartilhado entre os agentes. Por isso:
  - As views de YouTube cobrem só grelhados, assados, airfryer e frango com batata.
  - Ensopados, massas, recheados e moídos se apoiaram na Receiteria e nos trechos do TudoGostoso.
  - Não confirmei no TudoGostoso o fricassê "oficial" mais acessado nem a lasanha.
- **Pratos com pouca evidência.** Frango com mandioca ou mandioquinha, frango moído refogado (picadinho de moído), bolo de carne de frango, cordon bleu caseiro e empadão (passa de 45 min). Ficaram sem linha ou só como C.
- **As linhas C são variedade com sinal fraco.** Almôndega ao limão, kafta, molho rosé, maracujá, medalhão com bacon, torta de pão de forma, salada completa, iogurte, caprese, sopa de lentilha e milanesa com creme de milho. Antes de produzir, vale confirmar o gosto do público.
- **Tempos no limite.** Várias receitas originais levam 50–100 min (frango ao molho, ensopado com batatas, rocambole, conchiglione, abobrinha recheada, frango colorido). O tempo do CSV supõe pressão, peças menores ou pré-cozimento no micro-ondas. Isso precisa ser testado na cozinha.
- Uma página da Receiteria (picadinho cremoso) trazia texto escondido com instruções para quem lê a página. Ignorei e usei só os dados da receita.
