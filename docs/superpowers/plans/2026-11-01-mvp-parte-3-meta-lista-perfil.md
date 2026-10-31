# MVP parte 3 — meta pessoal, lista de compras, perfil e histórico — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a meta padrão por uma meta calculada para cada pessoa e ligar as abas Lista e Perfil, com lista de compras por receita e o histórico dos últimos 7 dias.

**Architecture:** Mesmo desenho da parte 1. Regras puras em `web/lib/domain/` (cálculo da meta, histórico, lista), acesso ao Supabase em repositórios finos em `web/lib/data/`, telas como Server Component que carrega dados e passa para uma view client que recebe as ações por prop. Escritas por Server Action com `ensureSession` (a sessão anônima nasce na primeira escrita, nunca na visita). Uma migração nova acrescenta os dados do corpo em `profiles` e cria `shopping_list`.

**Tech Stack:** Next.js 15.5 App Router, React 19, Tailwind v4 (`@theme`), Supabase (RLS), zod, Vitest + Testing Library, Phosphor.

**Spec:** `docs/specs/2026-10-31-mvp-escopo.md`, seções 3.1 (onboarding e meta), 3.5 (histórico de 7 dias), 3.6 (lista de compras) e 3.8 (perfil). Visual: `DESIGN.md` e o contrato `.impeccable/surfaces/app-hoje-page-tsx.md`, que já declara Lista, Perfil e Onboarding como herdeiras.

## Global Constraints

- Objetivo fixo: ganhar massa. Sem opção de secar. Sem biotipo.
- Dados do cadastro: sexo, idade, peso, altura, nível de atividade.
- Cálculo: TMB e gasto diário, meta de calorias com superávit moderado, meta de proteína por kg. Resultado "sua meta diária é X kcal e Y g de proteína", editável depois.
- Lista: ingredientes entram a partir das receitas escolhidas, agrupados por receita, com quantidade; marcar como comprado; limpar lista. Fora: estoque, baixa automática.
- Perfil: editar peso e meta. Sair e cancelar assinatura ficam para a parte 2 (dependem de login e pagamento).
- Histórico simples dos últimos 7 dias. Só receitas do app contam.
- Visual: One Crust Rule (laranja só em ação, progresso, feito e link), Rounded Numeral Rule (todo número de medida em `.num`), Grams-First Rule, sem borda em card, tema claro, sem tagline, sem mascote. Coluna de 480px, gutter 20px.
- Copy em pt-BR, sem travessão nos textos da interface.
- Banco: RLS `(select auth.uid()) = user_id` em toda tabela nova. Limites já existentes: `goal_protein_g` 40–400, `goal_kcal` 1200–7000, porções 1–8.

## Decisões desta parte (sem pergunta ao Eduardo, registradas aqui)

- **Fórmula:** Mifflin-St Jeor. Homem `10·peso + 6,25·altura − 5·idade + 5`; mulher `… − 161`.
- **Atividade (fator):** `leve` 1,375 · `moderado` 1,55 · `alto` 1,725 · `muito_alto` 1,9.
- **Superávit:** +15% sobre o gasto, arredondado para o múltiplo de 50 kcal mais próximo.
- **Proteína:** 2,0 g por kg, arredondada para o múltiplo de 5 g mais próximo.
- **Limites de entrada:** idade 16–90, peso 35–250 kg (aceita vírgula), altura 130–230 cm. Meta resultante presa aos limites do banco.
- **Idade guardada como `birth_year`** (ano atual − idade), para não envelhecer parada no banco.
- **Mudar o peso no Perfil recalcula a meta** com os dados guardados. Editar a meta à mão sobrescreve até a próxima mudança de peso ou recálculo.
- **Onde fica o histórico:** no Perfil, primeira seção. Mantém quatro abas.
- **Entrada do app:** `/` leva a `/comecar` quando não há meta salva e a `/hoje` quando há. Falha do Supabase leva a `/hoje`.
- **Lista exclui** ingredientes "a gosto" e `ref: "agua"`. Item é identificado pelo índice original do ingrediente na receita.
- **Marcar item é idempotente:** a ação recebe o estado final (`checked: boolean`), não "inverter".
- **Botão da receita não lê estado do servidor:** a página da receita segue estática; o botão "Pôr na lista de compras" faz upsert e vira "Na lista · Ver lista".

## Review Focus

1. Peso digitado com vírgula ("80,5") num teclado pt-BR precisa virar 80,5 kg, não erro nem 805.
2. Visitante sem sessão abrindo `/perfil` ou `/lista` vê estado vazio, sem erro e sem criar usuário anônimo.
3. Receita que saiu do conteúdo, mas segue na lista ou no histórico, é ignorada sem quebrar a tela.
4. Semana que cruza a virada do mês (hoje 01/11 mostra 26/10 a 01/11) e dias sem registro aparecem com 0 g.
5. Dois toques rápidos no mesmo item da lista terminam no estado do último toque.

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `supabase/migrations/20261101000000_parte3.sql` | colunas do corpo em `profiles`, tabela `shopping_list` com RLS |
| `web/lib/domain/goal.ts` | tipos do corpo, atividades, validação, `calcGoal`, `parseNumber` |
| `web/lib/domain/history.ts` | `lastDayKeys`, `weekHistory` |
| `web/lib/domain/shopping.ts` | `shoppingGroups` |
| `web/lib/data/profile-repo.ts` | ler e gravar corpo e meta |
| `web/lib/data/list-repo.ts` | ler e gravar a lista |
| `web/lib/data/day-repo.ts` | + `getLogsBetween` |
| `web/components/ui/Sheet.tsx` | folha inferior reaproveitável (sai de dentro do FilterSheet) |
| `web/components/ui/NumberField.tsx` | campo numérico grande com unidade |
| `web/components/ui/StepPills.tsx` | pílulas de progresso (sai de dentro do CookMode) |
| `web/app/comecar/{page,Onboarding,actions}.tsx?` | cadastro em 4 passos |
| `web/app/lista/{page,ListaView,actions}.tsx?` | lista de compras |
| `web/app/perfil/{page,PerfilView,WeekChart,actions}.tsx?` | perfil e histórico |
| `web/app/page.tsx`, `web/middleware.ts`, `web/components/ui/TabBar.tsx`, `web/app/hoje/HojeView.tsx`, `web/app/receitas/[slug]/{page,RecipeView}.tsx` | ligações |

---

### Task 1: Cálculo da meta

**Files:**
- Create: `web/lib/domain/goal.ts`
- Test: `web/tests/goal.test.ts`

**Interfaces:**
- Produces:
  - `type Sex = "m" | "f"`; `type Activity = "leve" | "moderado" | "alto" | "muito_alto"`
  - `type Body = { sex: Sex; age: number; weightKg: number; heightCm: number; activity: Activity }`
  - `const ACTIVITIES: { value: Activity; label: string; hint: string; factor: number }[]` com os textos: leve "Leve" / "Treino até 3 vezes por semana e passo o dia sentado"; moderado "Moderado" / "Treino de 3 a 5 vezes por semana"; alto "Alto" / "Treino quase todo dia ou trabalho em pé"; muito_alto "Muito alto" / "Treino pesado todo dia e trabalho físico".
  - `const LIMITS = { age: [16, 90], weightKg: [35, 250], heightCm: [130, 230] } as const`
  - `parseNumber(s: string): number | null` — aceita vírgula ou ponto; vazio ou inválido devolve null.
  - `BodySchema` (zod) e `parseBody(raw: unknown): { ok: true; value: Body } | { ok: false; message: string }`
  - `calcGoal(b: Body): { protein_g: number; kcal: number; bmr: number; tdee: number }`

- [ ] **Step 1: Testes que falham**

```ts
it("homem 30 anos, 80 kg, 180 cm, moderado → 160 g e 3.150 kcal", () => {
  expect(calcGoal({ sex: "m", age: 30, weightKg: 80, heightCm: 180, activity: "moderado" }))
    .toMatchObject({ bmr: 1780, protein_g: 160, kcal: 3150 });
});
it("mulher 25 anos, 60 kg, 165 cm, leve → 120 g e 2.150 kcal", () => {
  expect(calcGoal({ sex: "f", age: 25, weightKg: 60, heightCm: 165, activity: "leve" }))
    .toMatchObject({ protein_g: 120, kcal: 2150 });
});
it("proteína arredonda para múltiplo de 5: 72,5 kg → 145 g", () => { /* 2 × 72,5 = 145 */ });
it("meta fica dentro dos limites do banco (40–400 g, 1200–7000 kcal) nos extremos de entrada", () => { /* 35 kg/130 cm/90 anos/leve e 250 kg/230 cm/16 anos/muito_alto */ });
it("parseNumber aceita '80,5', '80.5', ' 80 ' e recusa '', 'abc', '8,0,1'", () => {
  expect(parseNumber("80,5")).toBe(80.5); expect(parseNumber("80.5")).toBe(80.5); expect(parseNumber(" 80 ")).toBe(80);
  expect(parseNumber("")).toBeNull(); expect(parseNumber("abc")).toBeNull(); expect(parseNumber("8,0,1")).toBeNull();
});
it("parseBody recusa idade 15, peso 251 e atividade desconhecida com mensagem em pt-BR", () => { /* ok:false e message não vazia */ });
it("ACTIVITIES tem 4 opções na ordem leve, moderado, alto, muito_alto", () => { /* values */ });
```

- [ ] **Step 2:** `npx vitest run tests/goal.test.ts` → FAIL (módulo não existe).
- [ ] **Step 3:** Implementar `web/lib/domain/goal.ts` com as fórmulas da seção Decisões.
- [ ] **Step 4:** `npx vitest run tests/goal.test.ts` → PASS.
- [ ] **Step 5:** Commit `feat(dominio): cálculo da meta por Mifflin-St Jeor, superávit de 15% e 2 g/kg`.

### Task 2: Banco e repositório do perfil

**Files:**
- Create: `supabase/migrations/20261101000000_parte3.sql`, `web/lib/data/profile-repo.ts`
- Modify: `web/tests/fake-supabase.ts` (suporte a `upsert`, `update`, `gte`, `lte`)
- Test: `web/tests/profile-repo.test.ts`

**Interfaces:**
- Consumes: `Body`, `Activity`, `Sex` (Task 1); `Goal`, `DEFAULT_GOAL` de `lib/domain/day`.
- Produces:
  - `type Profile = { body: Body | null; goal: Goal }`
  - `interface ProfileRepo { getProfile(userId: string, now?: Date): Promise<Profile>; saveBody(userId: string, body: Body, goal: { protein_g: number; kcal: number }, now?: Date): Promise<void>; saveGoal(userId: string, goal: { protein_g: number; kcal: number }): Promise<void> }`
  - `supabaseProfileRepo(client: SupabaseClient): ProfileRepo`
  - fake: operações `kind: "upsert" | "update"`; filtros `gte`/`lte` gravados como `"col>="` e `"col<="`.

Migração (copiar exatamente):

```sql
-- Anaból[IA] · MVP parte 3: dados do corpo para a meta e lista de compras.
alter table public.profiles
  add column if not exists sex text check (sex in ('m', 'f')),
  add column if not exists birth_year integer check (birth_year between 1900 and 2100),
  add column if not exists weight_kg numeric(5, 1) check (weight_kg between 35 and 250),
  add column if not exists height_cm integer check (height_cm between 130 and 230),
  add column if not exists activity text check (activity in ('leve', 'moderado', 'alto', 'muito_alto'));

create table if not exists public.shopping_list (
  user_id uuid not null references auth.users (id) on delete cascade,
  recipe_slug text not null,
  portions integer not null check (portions between 1 and 8),
  checked integer[] not null default '{}',
  added_at timestamptz not null default now(),
  primary key (user_id, recipe_slug)
);
alter table public.shopping_list enable row level security;
create policy "shopping_list: dono" on public.shopping_list for all
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
```

- [ ] **Step 1: Testes que falham**

```ts
it("getProfile sem linha devolve body null e DEFAULT_GOAL", ...);
it("getProfile com linha completa converte birth_year em idade (now 2026 e birth_year 1996 → 30) e weight_kg '80.5' em 80.5", ...);
it("getProfile com corpo incompleto (sem activity) devolve body null e a meta salva", ...);
it("saveBody faz upsert com user_id, sex, birth_year = ano atual − idade, weight_kg, height_cm, activity, goal_protein_g, goal_kcal e updated_at", ...);
it("saveGoal faz upsert só de goal_protein_g, goal_kcal e updated_at", ...);
it("erro do Supabase vira exceção com a mensagem", ...);
```

- [ ] **Step 2:** `npx vitest run tests/profile-repo.test.ts` → FAIL.
- [ ] **Step 3:** Estender o fake e implementar o repositório (upsert com `onConflict: "user_id"`).
- [ ] **Step 4:** `npx vitest run` (suite inteira, o fake mudou) → PASS.
- [ ] **Step 5:** Commit `feat(dados): migração da parte 3 e repositório do perfil`.

### Task 3: Cadastro inicial (`/comecar`) e entrada do app

**Files:**
- Create: `web/components/ui/NumberField.tsx`, `web/components/ui/StepPills.tsx`, `web/app/comecar/page.tsx`, `web/app/comecar/Onboarding.tsx`, `web/app/comecar/actions.ts`
- Modify: `web/app/cozinhar/[slug]/CookMode.tsx` (usar `StepPills`), `web/app/page.tsx`, `web/middleware.ts` (matcher + `/`, `/comecar`, `/lista`, `/perfil`), `web/app/hoje/HojeView.tsx`
- Test: `web/tests/onboarding.test.tsx`, `web/tests/hoje.test.tsx`

**Interfaces:**
- Consumes: Task 1 inteira; `ProfileRepo` (Task 2); `ensureSession`, `getUserId`, `supabaseServer`.
- Produces:
  - `Onboarding({ initial?: Partial<Body>; onSave: (b: Body) => Promise<{ ok: true } | { ok: false; message: string }>; onDone: () => void })`
  - `saveOnboardingAction(raw: unknown): Promise<{ ok: true } | { ok: false; message: string }>` (valida com `parseBody`, calcula com `calcGoal`, grava com `saveBody`).
  - `NumberField({ label, unit, value, onChange, inputMode, error?, autoFocus? })` — numeral grande em `.num`, unidade em cinza.
  - `StepPills({ total, current, label })` — mesma marcação das pílulas do modo cozinhar.

Telas (uma pergunta por tela, botão primário "Continuar" fixo no rodapé, desabilitado até valer; voltar circular a partir do passo 2; pílulas 1–4 no topo):
1. "Sobre você": controle segmentado Homem/Mulher (`Sexo`) e idade em anos.
2. "Seu corpo": peso em kg e altura em cm.
3. "Quanto você se mexe": as 4 atividades como linhas de escolha (rádio), rótulo e dica.
4. "Sua meta diária": `N g` de proteína em numeral hero e `N kcal` em numeral stat; texto "Calculada pela fórmula de Mifflin-St Jeor, 15% acima do seu gasto para ganhar massa, com 2 g de proteína por kg. Dá para ajustar no Perfil."; primário "Começar".

- [ ] **Step 1: Testes que falham** (`onboarding.test.tsx`)

```ts
it("passo 1 só libera Continuar com sexo e idade válidos (15 bloqueia, 30 libera)", ...);
it("percorre os 4 passos com homem/30/80/180/moderado e mostra '160 g' e '3.150 kcal'", ...);
it("aceita peso '80,5' e calcula com 80,5 kg", ...);
it("Começar chama onSave com o Body e depois onDone; erro de onSave aparece em role=alert e não chama onDone", ...);
it("Voltar no passo 2 retorna ao passo 1 mantendo a idade digitada", ...);
it("com initial preenchido, abre com os valores do perfil", ...);
```
E em `hoje.test.tsx`: `it("com meta padrão oferece o link 'calcular a minha' para /comecar")`.

- [ ] **Step 2:** `npx vitest run tests/onboarding.test.tsx tests/hoje.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar componentes, view, ação e página (página carrega o perfil para `initial` quando houver sessão). `/` redireciona por `getProfile(...).goal.isDefault`. HojeView troca "meta padrão" por "meta padrão, calcular a minha" com link.
- [ ] **Step 4:** `npx vitest run` → PASS (cook.test segue verde com `StepPills`).
- [ ] **Step 5:** Commit `feat(web): cadastro inicial em 4 passos com a meta calculada`.

### Task 4: Histórico dos últimos 7 dias

**Files:**
- Create: `web/lib/domain/history.ts`
- Modify: `web/lib/data/day-repo.ts`
- Test: `web/tests/history.test.ts`, `web/tests/day-repo.test.ts`

**Interfaces:**
- Consumes: `MealLog`, `Goal`, `macrosFor`, `localDayKey`, `DEFAULT_TZ`.
- Produces:
  - `type DayLog = MealLog & { dayKey: string }`
  - `lastDayKeys(today: Date, n?: number, tz?: string): string[]` — do mais antigo para hoje.
  - `type DayBar = { dayKey: string; weekday: string; protein_g: number; progress: number; met: boolean; isToday: boolean }`
  - `weekHistory(logs: DayLog[], recipes: Recipe[], goal: Goal, today: Date, tz?: string): { days: DayBar[]; averageLogged_g: number; metCount: number }` — `weekday` em 3 letras minúsculas sem ponto ("sáb"); média só dos dias com registro, 0 se nenhum.
  - `DayRepo.getLogsBetween(userId: string, fromKey: string, toKey: string): Promise<DayLog[]>`

- [ ] **Step 1: Testes que falham**

```ts
it("lastDayKeys em 01/11 (21h SP) devolve 26/10 a 01/11", () => {
  expect(lastDayKeys(new Date("2026-11-02T00:00:00Z"))).toEqual(["2026-10-26","2026-10-27","2026-10-28","2026-10-29","2026-10-30","2026-10-31","2026-11-01"]);
});
it("weekHistory soma por dia, marca meta batida, dá 0 aos dias vazios e marca hoje", ...);
it("weekday vem em 3 letras: 2026-10-31 é 'sáb'", ...);
it("ignora log de receita que não existe mais", ...);
it("averageLogged_g é a média só dos dias com registro; metCount conta os dias com meta batida", ...);
it("getLogsBetween filtra user_id e day_key entre from e to e devolve dayKey", ...); // day-repo.test
```

- [ ] **Step 2:** `npx vitest run tests/history.test.ts tests/day-repo.test.ts` → FAIL.
- [ ] **Step 3:** Implementar (aritmética de datas em UTC sobre a chave local, sem horário de verão).
- [ ] **Step 4:** Mesmo comando → PASS.
- [ ] **Step 5:** Commit `feat(dominio): histórico dos últimos 7 dias`.

### Task 5: Perfil (`/perfil`)

**Files:**
- Create: `web/components/ui/Sheet.tsx`, `web/app/perfil/page.tsx`, `web/app/perfil/PerfilView.tsx`, `web/app/perfil/WeekChart.tsx`, `web/app/perfil/actions.ts`
- Modify: `web/app/receitas/FilterSheet.tsx` (usar `Sheet`)
- Test: `web/tests/perfil.test.tsx`

**Interfaces:**
- Consumes: `Profile`, `ProfileRepo` (Task 2); `calcGoal`, `parseNumber`, `LIMITS` (Task 1); `weekHistory`, `lastDayKeys`, `getLogsBetween` (Task 4); `NumberField` (Task 3).
- Produces:
  - `Sheet({ title, onClose, action?, children })` — chrome da folha de filtros (véu, alça, foco no painel, Esc fecha, trava rolagem).
  - `PerfilView({ profile: Profile; week: ReturnType<typeof weekHistory>; onSaveWeight: (kg: number) => Promise<Result>; onSaveGoal: (g: { protein_g: number; kcal: number }) => Promise<Result> })`, com `type Result = { ok: true; goal: Goal } | { ok: false; message: string }`
  - `updateWeightAction(kg: number): Promise<Result>` — exige corpo salvo; recalcula com `calcGoal`.
  - `saveGoalAction(g): Promise<Result>` — valida 40–400 g e 1200–7000 kcal.
  - `WeekChart({ days: DayBar[] })` — 7 colunas; trilho `track` com altura da meta, preenchimento laranja proporcional (teto 100%), rótulo do dia embaixo (hoje em ink 700), gramas acima em `.num`; `role="img"` com `aria-label` que lê os 7 valores.

Composição: contexto "Meta de N g por dia" + título "Perfil"; seção "Últimos 7 dias" com "N de 7 na meta" à direita, o gráfico e "Média de N g nos dias registrados" (ou "Nenhuma refeição marcada nesta semana"); seção "Meta diária" com linhas Proteína e Calorias que abrem a folha de meta, e link "Recalcular com os meus dados" para `/comecar`; seção "Seus dados" com a linha Peso que abre a folha de peso (aviso na folha: "A meta é recalculada com o peso novo."). Sem corpo salvo: no lugar de "Seus dados", aviso suave "Você está usando a meta padrão." e primário "Calcular minha meta" para `/comecar`.

- [ ] **Step 1: Testes que falham**

```ts
it("mostra 'Perfil', a meta '160 g' e '3.150 kcal' e o peso '80 kg'", ...);
it("gráfico tem 7 colunas e aria-label com os valores; resumo '2 de 7 na meta'", ...);
it("sem corpo salvo mostra 'Você está usando a meta padrão.' e o link 'Calcular minha meta' para /comecar", ...);
it("editar peso: abre a folha, digita '82,5', Salvar chama onSaveWeight(82.5) e a meta exibida passa para a devolvida", ...);
it("editar meta: 30 g é recusado na folha com mensagem e onSaveGoal não é chamado", ...);
it("erro da ação aparece em role=alert dentro da folha e a folha continua aberta", ...);
it("semana sem registros mostra 'Nenhuma refeição marcada nesta semana'", ...);
```

- [ ] **Step 2:** `npx vitest run tests/perfil.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar. A página usa `getUserId` (só leitura); sem sessão, mostra perfil vazio com a meta padrão e semana zerada.
- [ ] **Step 4:** `npx vitest run` → PASS (library.test segue verde com o FilterSheet sobre `Sheet`).
- [ ] **Step 5:** Commit `feat(web): perfil com histórico de 7 dias e edição de peso e meta`.

### Task 6: Lista de compras (`/lista`) e botão na receita

**Files:**
- Create: `web/lib/domain/shopping.ts`, `web/lib/data/list-repo.ts`, `web/app/lista/page.tsx`, `web/app/lista/ListaView.tsx`, `web/app/lista/actions.ts`
- Modify: `web/app/receitas/[slug]/RecipeView.tsx`, `web/app/receitas/[slug]/page.tsx`
- Test: `web/tests/shopping.test.ts`, `web/tests/list-repo.test.ts`, `web/tests/lista.test.tsx`, `web/tests/recipe.test.tsx`

**Interfaces:**
- Consumes: `scaleIngredients`, `fmtWeight`, `fmtHousehold`, `ensureSession`, `getUserId`.
- Produces:
  - `type ListEntry = { recipeSlug: string; portions: number; checked: number[] }`
  - `type ShoppingItem = { index: number; name: string; amount: string; household?: string; checked: boolean }`
  - `type ShoppingGroup = { slug: string; name: string; portions: number; items: ShoppingItem[] }`
  - `shoppingGroups(entries: ListEntry[], recipes: Recipe[]): ShoppingGroup[]`
  - `interface ListRepo { getList(userId): Promise<ListEntry[]>; add(userId, slug, portions): Promise<void>; setChecked(userId, slug, index, checked: boolean): Promise<void>; remove(userId, slug): Promise<void>; clear(userId): Promise<void> }`, `supabaseListRepo(client)`
  - Ações: `addToListAction(slug: string, portions: number): Promise<boolean>`, `setItemCheckedAction(slug, index, checked): Promise<boolean>`, `removeFromListAction(slug): Promise<boolean>`, `clearListAction(): Promise<boolean>` (todas validam slug contra o conteúdo e devolvem false em erro).
  - `ListaView({ groups: ShoppingGroup[]; onCheck; onRemove; onClear })`
  - `RecipeView` ganha a prop `onAddToList?: (slug: string, portions: number) => Promise<boolean>`.

Composição da lista: contexto "N receitas · M de T comprados" + título "Lista"; à direita do título, texto "Limpar" que vira confirmação na própria tela ("Limpar a lista inteira?" com "Limpar" e "Cancelar"); um grupo por receita com nome (body-strong), "N porções" em cinza e X "Tirar <nome> da lista"; itens com o checkbox de ingrediente da receita (22px, raio 7, marcado laranja e nome riscado), gramas à direita. Vazia: "Sua lista está vazia" e "Abra uma receita e toque em Pôr na lista de compras.", com botão suave "Ver receitas". Na receita: abaixo dos ingredientes, botão de texto com ícone de lista "Pôr na lista de compras" que vira "Na lista" com check e link "Ver lista"; mudar as porções depois volta o botão para "Pôr na lista de compras" (o upsert atualiza as porções).

- [ ] **Step 1: Testes que falham**

```ts
// shopping.test.ts
it("escala pelas porções da lista e mantém o índice original", ...);
it("tira 'a gosto' e água", ...);
it("marca checked pelos índices guardados", ...);
it("ignora receita que não existe mais", ...);
// list-repo.test.ts
it("add faz upsert de user_id, recipe_slug e portions com onConflict user_id,recipe_slug", ...);
it("setChecked(true) acrescenta o índice uma vez só; setChecked(false) remove", ...);
it("clear apaga só as linhas do usuário", ...);
// lista.test.tsx
it("agrupa por receita com 'N porções' e o contexto 'N receitas · M de T comprados'", ...);
it("marcar item chama onCheck(slug, index, true) e risca na hora; falha desfaz e mostra alerta", ...);
it("Limpar pede confirmação; Cancelar não chama onClear; confirmar chama", ...);
it("lista vazia mostra 'Sua lista está vazia' e link para /receitas", ...);
// recipe.test.tsx
it("'Pôr na lista de compras' chama onAddToList(slug, porções) e vira 'Na lista' com link 'Ver lista'", ...);
```

- [ ] **Step 2:** `npx vitest run tests/shopping.test.ts tests/list-repo.test.ts tests/lista.test.tsx tests/recipe.test.tsx` → FAIL.
- [ ] **Step 3:** Implementar domínio, repositório (setChecked lê a linha e grava o array sem repetição), ações, view e página (`getUserId`; sem sessão, lista vazia).
- [ ] **Step 4:** `npx vitest run` → PASS.
- [ ] **Step 5:** Commit `feat(web): lista de compras por receita`.

### Task 7: Abas ligadas, migração aplicada, verificação e documentação

**Files:**
- Modify: `web/components/ui/TabBar.tsx`, `web/tests/tabbar.test.tsx`, `web/e2e/loop.spec.ts`, `DESIGN.md`, `.impeccable/design.json`

- [ ] **Step 1: Teste que falha:** `tabbar.test.tsx` passa a exigir links "Lista" → `/lista` e "Perfil" → `/perfil`, barra visível nas duas rotas e ausente em `/comecar`.
- [ ] **Step 2:** `npx vitest run tests/tabbar.test.tsx` → FAIL.
- [ ] **Step 3:** Ligar as abas (`ROOTS` = `/hoje`, `/receitas`, `/lista`, `/perfil`).
- [ ] **Step 4:** `npx vitest run` → PASS; `npx tsc --noEmit` sem erro; `npm run build` (fora do sandbox) sem erro.
- [ ] **Step 5:** Aplicar a migração no projeto `qdvqzetncvfiisdmfnhh` pelo MCP supabase-cockpit e rodar os advisors de segurança. Expected: sem aviso novo de RLS.
- [ ] **Step 6:** e2e: cadastro → Hoje sem "meta padrão" → receita → "Pôr na lista de compras" → Lista mostra o grupo → Perfil mostra a meta. `E2E_BASE_URL=http://localhost:3100 npx playwright test` → PASS.
- [ ] **Step 7:** Conferência visual no Simulador iOS das quatro telas novas (cadastro, lista, perfil, folha de peso).
- [ ] **Step 8:** DESIGN.md: Onboarding, NumberField, StepPills, Sheet, WeekChart, lista e tab bar com as quatro abas; design.json no mesmo passo.
- [ ] **Step 9:** Commit `feat(web): abas Lista e Perfil ligadas; docs do sistema visual`.
