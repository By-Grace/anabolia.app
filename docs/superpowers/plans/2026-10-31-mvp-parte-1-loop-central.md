# Anaból[IA] MVP · Parte 1: fundação e loop central — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Um PWA Next.js em `web/` onde uma pessoa abre a tela Hoje, vê quanto falta de proteína, escolhe uma receita que fecha a conta, cozinha pelo modo passo a passo e marca a refeição, com o dia atualizando.

**Architecture:** Conteúdo (receitas) vive no repositório como JSON validado por zod e é carregado em build; estado do usuário (meta, refeições marcadas, favoritos) vive no Supabase, com sessão anônima nesta parte e login por e-mail na parte 2. Lógica de macros, escala de porções e sugestões é pura e testada em isolamento; as páginas só compõem. O visual segue o contrato de direção B em `.impeccable/surfaces/app-hoje-page-tsx.md`.

**Tech Stack:** Next.js 15 (App Router, TypeScript), Tailwind CSS v4, Supabase (`@supabase/ssr`, `@supabase/supabase-js`), zod, Vitest + @testing-library/react, Playwright (um smoke), `next-pwa` NÃO (manifest + service worker mínimo próprio).

**Spec:** `docs/specs/2026-10-31-mvp-escopo.md` (seções 2, 3.2 a 3.5, 5, 7) e contrato de direção `.impeccable/surfaces/app-hoje-page-tsx.md`.

## Global Constraints

- App em `web/` na raiz do projeto; rotas `web/app/hoje`, `web/app/receitas`, `web/app/receitas/[slug]`, `web/app/cozinhar/[slug]`.
- Mobile-first 390px; tema claro fixo; fonte do sistema (`-apple-system, BlinkMacSystemFont, system-ui`); números em `ui-rounded` com `font-variant-numeric: tabular-nums`.
- Tokens exatos do contrato: fundo `#FFFFFF`, texto `#0E0E0E`, secundário `#6B6B6B`, fio `#ECECEC`, superfície `#F5F5F5`, acento `#D4451F`, acento-suave `#FBE4DC`, acento-texto `#8E2F12`. O acento só aparece em ação primária, barra de progresso, estado feito e links. Nunca em fundo de seção.
- Nenhuma tagline, nenhum mascote, nenhum texto de preço na interface.
- Quantidades sempre em gramas ou unidades explícitas; macros por porção; porções escaláveis.
- Só receitas do app contam para o dia (sem registro de alimento avulso).
- Copy em PT-BR, voz direta, sem tom de coach. Botões nomeiam a ação: "Cozinhar", "Próximo passo", "Marquei, comi".
- Commits pequenos, mensagem em PT-BR, prefixo `feat:`/`test:`/`chore:`.

## Review Focus

1. **Porções fracionárias ou zero.** Stepper de porções não pode ir abaixo de 1 nem acima de 8; gramas escaladas arredondam para inteiro e nunca viram 0 para ingrediente com quantidade > 0. (Task 3)
2. **Dia sem meta cadastrada.** Hoje abre antes de qualquer onboarding: deve usar a meta padrão 160 g / 3.100 kcal e dizer "meta padrão" discretamente, nunca quebrar. (Task 3, Task 6)
3. **Meta já batida ou ultrapassada.** "Faltam −12 g" é bug: mostrar "Meta batida" e barra cheia a 100%. (Task 3, Task 6)
4. **Fuso e virada do dia.** Refeições marcadas às 23h50 em São Paulo pertencem ao dia local, não ao dia UTC. (Task 4)
5. **Receita sem foto ou sem passo de tempo.** Card e modo cozinhar renderizam com placeholder neutro e sem cronômetro, sem erro. (Task 2, Task 9)

---

### Task 1: Scaffold, tokens e PWA

**Files:**
- Create: `web/` (Next.js 15 via `create-next-app`, TypeScript, Tailwind, App Router, sem src/, alias `@/*`)
- Create: `web/app/globals.css`, `web/app/layout.tsx`, `web/app/manifest.ts`, `web/public/sw.js`, `web/vitest.config.ts`, `web/vitest.setup.ts`
- Modify: `web/package.json` (scripts `test`, `test:watch`)
- Test: `web/tests/tokens.test.ts`

**Interfaces:**
- Produces: classes utilitárias Tailwind via `@theme` com tokens `--color-ink`, `--color-paper`, `--color-grey`, `--color-hair`, `--color-soft`, `--color-acc`, `--color-acc-soft`, `--color-acc-text`; fontes `--font-sans`, `--font-round`.

- [ ] **Step 1: Inicializar git na raiz do projeto e criar o app**

Run (na raiz `~/projects/anabolia`):
```bash
git init && printf 'node_modules/\n.next/\n.env*\n!.env.example\n.DS_Store\n' > .gitignore && git add -A && git commit -qm "chore: estado inicial do projeto (landing, brand, specs, mockups)"
npx create-next-app@15 web --ts --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm
```
Expected: pasta `web/` com `app/page.tsx`, `npm run dev` sobe em 3000.

- [ ] **Step 2: Escrever o teste dos tokens**

`web/tests/tokens.test.ts`:
```ts
import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
const css = readFileSync(new URL("../app/globals.css", import.meta.url), "utf8");
describe("tokens da direção B", () => {
  it.each([["--color-acc", "#D4451F"], ["--color-ink", "#0E0E0E"], ["--color-grey", "#6B6B6B"], ["--color-hair", "#ECECEC"], ["--color-soft", "#F5F5F5"], ["--color-acc-soft", "#FBE4DC"], ["--color-acc-text", "#8E2F12"]])("%s = %s", (name, value) => {
    expect(css).toMatch(new RegExp(`${name}:\\s*${value}`, "i"));
  });
  it("não contém lima nem azul do kit v1", () => {
    expect(css.toUpperCase()).not.toMatch(/#C8F24C|#3156FF|#17282B/);
  });
});
```

- [ ] **Step 3: Configurar Vitest e rodar o teste para vê-lo falhar**

Instalar: `npm i -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom`. `vitest.config.ts` com `environment: "jsdom"`, `setupFiles: ["./vitest.setup.ts"]`, plugin react. Script `"test": "vitest run"`.
Run: `cd web && npm test`
Expected: FAIL (tokens ausentes em globals.css).

- [ ] **Step 4: Escrever `globals.css` com os tokens e base**

`@import "tailwindcss"; @theme { ...tokens acima...; --font-sans: -apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif; --font-round: ui-rounded, "SF Pro Rounded", -apple-system, system-ui, sans-serif; }` e base: `html{color-scheme:light} body{background:var(--color-paper);color:var(--color-ink);font-family:var(--font-sans);-webkit-font-smoothing:antialiased} .num{font-family:var(--font-round);font-variant-numeric:tabular-nums}`.

- [ ] **Step 5: Layout raiz, manifest e service worker mínimo**

`layout.tsx`: `<html lang="pt-BR">`, `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`, `themeColor: "#FFFFFF"`, registra `/sw.js` num `useEffect` em um client component `RegisterSW`. `manifest.ts`: `name: "Anaból[IA]"`, `short_name: "Anabolia"`, `display: "standalone"`, `start_url: "/hoje"`, `background_color: "#FFFFFF"`, `theme_color: "#FFFFFF"`, ícones 192 e 512 (gerar PNG neutros, letra "a" preta em fundo branco, sem mascote). `sw.js`: cache-first só para `/_next/static/` e ícones; network-first para o resto.

- [ ] **Step 6: Rodar testes e commitar**

Run: `npm test` → PASS. `npm run build` → sem erros.
```bash
git add -A && git commit -m "feat(web): scaffold Next.js, tokens da direção B, PWA mínimo"
```

---

### Task 2: Conteúdo de receitas (schema + seed + loader)

**Files:**
- Create: `web/content/recipes/frango-crocante-arroz-tostado.json`, `web/content/recipes/bowl-carne-batata-doce.json`, `web/content/recipes/tapioca-frango-omelete.json`
- Create: `web/public/recipes/` (copiar `landing/assets/food-1.webp` → `frango-crocante-arroz-tostado.webp`, `food-2` → `bowl-carne-batata-doce.webp`, `food-3` → `tapioca-frango-omelete.webp`)
- Create: `web/lib/recipes/schema.ts`, `web/lib/recipes/load.ts`
- Test: `web/tests/recipes.test.ts`

**Interfaces:**
- Produces:
```ts
export type MealSlot = "cafe" | "almoco" | "lanche" | "jantar";
export type Ingredient = { name: string; qty: number; unit: "g" | "ml" | "un" | "dente" | "colher" | "a gosto" };
export type Step = { text: string; seconds?: number; ingredientHint?: string };
export type Recipe = { slug: string; name: string; slot: MealSlot[]; minutes: number; difficulty: "fácil" | "médio"; basePortions: number; perPortion: { kcal: number; protein_g: number; carbs_g: number; fat_g: number }; ingredients: Ingredient[]; steps: Step[]; photo?: string; tip?: string };
export const RecipeSchema: z.ZodType<Recipe>;
export function getRecipes(): Recipe[];           // todas, ordenadas por name
export function getRecipe(slug: string): Recipe | undefined;
```

- [ ] **Step 1: Escrever os testes**

`web/tests/recipes.test.ts`:
```ts
import { getRecipes, getRecipe } from "@/lib/recipes/load";
import { RecipeSchema } from "@/lib/recipes/schema";
it("carrega as 3 receitas seed válidas", () => {
  const all = getRecipes();
  expect(all.map(r => r.slug)).toEqual(["bowl-carne-batata-doce","frango-crocante-arroz-tostado","tapioca-frango-omelete"]);
  for (const r of all) expect(() => RecipeSchema.parse(r)).not.toThrow();
});
it("frango crocante tem 42 g de proteína e 610 kcal por porção, 22 min, 7 passos", () => {
  const r = getRecipe("frango-crocante-arroz-tostado")!;
  expect(r.perPortion.protein_g).toBe(42); expect(r.perPortion.kcal).toBe(610);
  expect(r.minutes).toBe(22); expect(r.steps).toHaveLength(7); expect(r.basePortions).toBe(2);
});
it("schema rejeita receita sem ingredientes e aceita receita sem foto", () => {
  const base = getRecipe("tapioca-frango-omelete")!;
  expect(() => RecipeSchema.parse({ ...base, ingredients: [] })).toThrow();
  expect(() => RecipeSchema.parse({ ...base, photo: undefined })).not.toThrow();
});
it("getRecipe de slug inexistente retorna undefined", () => { expect(getRecipe("nada")).toBeUndefined(); });
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test -- recipes` → FAIL (módulos inexistentes).

- [ ] **Step 3: Implementar `schema.ts` com zod** (`ingredients: z.array(...).min(1)`, `steps: z.array(...).min(1)`, `slot: z.array(z.enum([...])).min(1)`, `basePortions: z.number().int().min(1).max(8)`).

- [ ] **Step 4: Implementar `load.ts`** usando `import.meta.glob`? Não: usar `fs.readdirSync` em `process.cwd()/content/recipes` apenas no servidor; exportar `getRecipes` que lê, valida com `RecipeSchema.parse`, ordena por `name` com `localeCompare("pt-BR")` e cacheia em módulo.

- [ ] **Step 5: Escrever os 3 JSON seed** com os valores do mockup: frango crocante (42 g, 610 kcal, 22 min, fácil, 2 porções, ingredientes: peito de frango 400 g, arroz cozido 300 g, farinha de rosca 40 g, ovo 1 un, alho 2 dente, azeite 15 ml, sal e pimenta a gosto; 7 passos, passo 3 = "Sele o frango 3 minutos de cada lado. Não mexa até formar a crosta." com `seconds: 180`, `ingredientHint: "peito de frango · 400 g · fogo alto"`), bowl de carne (45 g, 680 kcal, 25 min, almoço/jantar), tapioca (38 g, 520 kcal, 12 min, café). Macros são dados de demonstração: marcar `"_demo": true` no JSON NÃO é permitido pelo schema; registrar no commit que os macros serão recalculados pela TACO na produção de conteúdo.

- [ ] **Step 6: Rodar testes e commitar**

Run: `npm test -- recipes` → PASS.
```bash
git add -A && git commit -m "feat(web): schema zod e loader de receitas com 3 seeds de demonstração"
```

---

### Task 3: Domínio puro (escala, totais do dia, sugestões)

**Files:**
- Create: `web/lib/domain/scale.ts`, `web/lib/domain/day.ts`, `web/lib/domain/suggest.ts`
- Test: `web/tests/domain.test.ts`

**Interfaces:**
- Consumes: `Recipe`, `MealSlot` (Task 2).
- Produces:
```ts
export function scaleIngredients(recipe: Recipe, portions: number): Ingredient[]; // portions clamp [1,8]; qty = round(qty * portions / basePortions), mínimo 1 quando qty > 0 e unit !== "a gosto"
export function macrosFor(recipe: Recipe, portions: number): Recipe["perPortion"]; // soma por porção × portions
export type Goal = { protein_g: number; kcal: number; isDefault: boolean };
export const DEFAULT_GOAL: Goal; // { protein_g: 160, kcal: 3100, isDefault: true }
export type MealLog = { id: string; recipeSlug: string; portions: number; loggedAt: string /* ISO */; slot: MealSlot };
export type DayTotals = { protein_g: number; kcal: number; remainingProtein_g: number; progress: number /* 0..1 */; goalMet: boolean; mealsDone: number };
export function dayTotals(logs: MealLog[], recipes: Recipe[], goal: Goal): DayTotals;
export function slotForHour(hour: number): MealSlot; // 5–10 cafe, 11–14 almoco, 15–17 lanche, 18–4 jantar
export function suggest(recipes: Recipe[], remainingProtein_g: number, slot: MealSlot, limit?: number): Recipe[]; // filtra por slot, ordena por |protein_g − remaining| crescente, limit 3
```

- [ ] **Step 1: Escrever os testes**

```ts
it("escala 400 g de frango para 3 porções em base 2 → 600 g; 'a gosto' não escala", ...)       // qty 600, unit "a gosto" permanece qty 0
it("porções clampam em [1,8]: 0 → 1, 9 → 8", ...)
it("ingrediente de 1 un em 1 porção de base 2 não vira 0", ...)                                 // round(0.5)=1
it("dayTotals com 2 refeições (31 g + 42 g) e meta 160 → faltam 87, progress 0.456, goalMet false, mealsDone 2", ...)
it("dayTotals acima da meta → remaining 0, progress 1, goalMet true", ...)
it("dayTotals sem meta usa DEFAULT_GOAL e marca isDefault", ...)
it("slotForHour(21) = jantar, (8) = cafe, (12) = almoco, (16) = lanche, (2) = jantar", ...)
it("suggest para jantar com 87 g faltando ordena bowl (45) antes de frango (42) antes de tapioca (fora do slot, excluída)", ...)
```

- [ ] **Step 2: Rodar e ver falhar** — Run: `npm test -- domain` → FAIL.

- [ ] **Step 3: Implementar `scale.ts`, `day.ts`, `suggest.ts`** com as assinaturas acima. `progress = min(1, protein_g / goal.protein_g)`; `remainingProtein_g = max(0, goal − protein_g)`.

- [ ] **Step 4: Rodar e commitar** — `npm test -- domain` → PASS. `git commit -m "feat(web): domínio de escala, totais do dia e sugestões"`.

---

### Task 4: Supabase (schema, sessão anônima, repositório do dia)

**Files:**
- Create: `supabase/migrations/20261031000000_init.sql`, `web/lib/supabase/client.ts`, `web/lib/supabase/server.ts`, `web/lib/supabase/session.ts`, `web/lib/data/day-repo.ts`, `web/.env.example`
- Test: `web/tests/day-repo.test.ts` (unitário com cliente mockado), `web/tests/day-key.test.ts`

**Interfaces:**
- Consumes: `MealLog`, `Goal`, `MealSlot` (Task 3).
- Produces:
```ts
export function localDayKey(date: Date, tz?: string): string; // "2026-10-31" no fuso America/Sao_Paulo por padrão
export async function ensureSession(): Promise<{ userId: string }>; // signInAnonymously se não houver sessão
export interface DayRepo {
  getGoal(userId: string): Promise<Goal>;                       // DEFAULT_GOAL se não houver profile
  getLogs(userId: string, dayKey: string): Promise<MealLog[]>;
  logMeal(userId: string, input: { recipeSlug: string; portions: number; slot: MealSlot; at?: Date }): Promise<MealLog>;
  getFavorites(userId: string): Promise<string[]>;
  toggleFavorite(userId: string, slug: string): Promise<boolean>; // retorna novo estado
}
export function supabaseDayRepo(client: SupabaseClient): DayRepo;
```

- [ ] **Step 1: Escrever a migration**

Tabelas: `profiles(user_id uuid pk references auth.users, goal_protein_g int, goal_kcal int, created_at)`, `meal_logs(id uuid pk default gen_random_uuid(), user_id uuid references auth.users, recipe_slug text, portions int check (portions between 1 and 8), slot text check (slot in ('cafe','almoco','lanche','jantar')), day_key text, logged_at timestamptz default now())`, índice `(user_id, day_key)`, `favorites(user_id uuid, recipe_slug text, primary key (user_id, recipe_slug))`. RLS ativo nas três com política `user_id = auth.uid()` para select/insert/update/delete.

- [ ] **Step 2: Testes unitários**

`day-key.test.ts`: `localDayKey(new Date("2026-11-01T02:30:00Z"))` → `"2026-10-31"` (23:30 em SP); `localDayKey(new Date("2026-10-31T12:00:00Z"))` → `"2026-10-31"`.
`day-repo.test.ts`: com um `SupabaseClient` falso (objeto com `from().select().eq()` encadeável devolvendo fixtures), `getGoal` sem linha → `DEFAULT_GOAL`; `logMeal` insere `day_key = localDayKey(at)` e devolve `MealLog` com `loggedAt` ISO; `toggleFavorite` insere quando ausente e apaga quando presente.

- [ ] **Step 3: Rodar e ver falhar** — `npm test -- day` → FAIL.

- [ ] **Step 4: Implementar** `client.ts` (`createBrowserClient` do `@supabase/ssr`), `server.ts` (`createServerClient` com cookies), `session.ts` (`ensureSession`), `day-repo.ts` (`supabaseDayRepo`), `localDayKey` com `Intl.DateTimeFormat("en-CA", { timeZone: tz ?? "America/Sao_Paulo" })`.
`.env.example` com `NEXT_PUBLIC_SUPABASE_URL=` e `NEXT_PUBLIC_SUPABASE_ANON_KEY=`.

- [ ] **Step 5: Aplicar a migration no projeto Supabase do Eduardo**

Run: `supabase link --project-ref <ref>` e `supabase db push` (o ref vem do Eduardo; sem ele, parar aqui e registrar no PR). Ativar "Anonymous sign-ins" em Authentication → Providers no painel.

- [ ] **Step 6: Rodar e commitar** — `npm test -- day` → PASS. `git commit -m "feat(web): schema Supabase, sessão anônima e repositório do dia"`.

---

### Task 5: Componentes da direção B

**Files:**
- Create: `web/components/ui/AppShell.tsx`, `web/components/ui/TabBar.tsx`, `web/components/ui/ProgressBar.tsx`, `web/components/ui/PhotoCard.tsx`, `web/components/ui/SetRow.tsx`, `web/components/ui/Button.tsx`, `web/components/ui/Stepper.tsx`, `web/components/ui/Stat.tsx`, `web/components/ui/icons.tsx`
- Test: `web/tests/ui.test.tsx`

**Interfaces:**
- Produces:
```tsx
<AppShell title?: string, date?: string, active: "hoje"|"receitas"|"lista"|"perfil", children>   // tab bar translúcida fixa, padding inferior 84px + safe-area
<ProgressBar value: number /* 0..1 */ />                                                           // 10px, trilho #E6E6E6, preenchimento acento, aria-valuenow
<PhotoCard src?: string, title: string, meta: string, href: string, onPlay?: () => void />        // 220px, gradiente na base, play 46px acento no canto inferior direito; sem src → fundo soft com ícone de prato
<SetRow label: string, sub?: string, value: string, state: "done"|"todo"|"next" />               // círculo 26px: done = acento com check; todo = traço #D6D6D6
<Button variant: "primary"|"secondary"|"text", ...>                                               // primary: pill 54px acento, texto branco 17/700, sombra neutra
<Stepper value: number, min=1, max=8, onChange />                                                  // "−" valor "+", aria-label "Porções"
<Stat value: string, label: string />                                                              // valor ui-rounded 26/700, rótulo 11.5 uppercase
icons: Home, Book, List, Person, Play, Check, Chevron, Flame, Pause (SVG stroke 2px, 24px)
```

- [ ] **Step 1: Escrever os testes de render**

```tsx
it("ProgressBar expõe aria-valuenow em porcentagem inteira e clampa", ...)      // 0.456 → 46; 1.2 → 100
it("SetRow done renderiza o check e todo não", ...)
it("Stepper não desce de 1 nem sobe de 8 e chama onChange com o novo valor", ...)
it("PhotoCard sem src mostra o placeholder e mantém título e meta", ...)
it("Button primary tem a classe do acento e role button", ...)
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test -- ui` → FAIL.

- [ ] **Step 3: Implementar os componentes** com Tailwind sobre os tokens. Regras do contrato: cards sem borda, raio 18–20; sombras neutras; acento só em ação/progresso/feito; ícones em traço único.

- [ ] **Step 4: Rodar e commitar** — `npm test -- ui` → PASS. `git commit -m "feat(web): componentes da direção B"`.

---

### Task 6: Tela Hoje

**Files:**
- Create: `web/app/hoje/page.tsx` (server), `web/app/hoje/HojeView.tsx` (client), `web/app/page.tsx` (redirect para `/hoje`)
- Test: `web/tests/hoje.test.tsx`

**Interfaces:**
- Consumes: `getRecipes` (T2); `dayTotals`, `suggest`, `slotForHour`, `DEFAULT_GOAL` (T3); `ensureSession`, `DayRepo` (T4); `AppShell`, `ProgressBar`, `PhotoCard`, `SetRow` (T5).
- Produces: `HojeView({ recipes, logs, goal, now }: { recipes: Recipe[]; logs: MealLog[]; goal: Goal; now: Date })`.

- [ ] **Step 1: Escrever os testes de `HojeView`**

```tsx
it("com 2 refeições (31+42) e meta 160 mostra '87 g para fechar', '73 de 160 g de proteína' e barra 46%", ...)
it("com meta batida mostra 'Meta batida' e barra 100%", ...)
it("sem meta mostra 'meta padrão' ao lado da sublinha", ...)
it("às 21h a próxima refeição é do slot jantar e o card mostra '+45 g proteína · 25 min · 680 kcal' para o bowl", ...)
it("lista 4 linhas de refeição: cafe e almoco done, lanche e jantar todo", ...)
```

- [ ] **Step 2: Rodar e ver falhar** — `npm test -- hoje` → FAIL.

- [ ] **Step 3: Implementar `HojeView`** seguindo o FIRST VIEWPORT do contrato: data pequena, "Hoje" 34/700, card soft com número `.num` 44/700, sublinha, `ProgressBar`; seção "Próxima refeição" com link "trocar" (vai para `/receitas?slot=<slot>`); `PhotoCard` da primeira sugestão (href `/receitas/<slug>`); seção "Refeições N de 4" com `SetRow` por slot (café, almoço, lanche, jantar), `done` quando há log no slot, valor em gramas.

- [ ] **Step 4: Implementar `page.tsx`** (server): `ensureSession` → `repo.getGoal`, `repo.getLogs(userId, localDayKey(new Date()))`, `getRecipes()`, renderiza `HojeView` dentro de `AppShell active="hoje"`. `app/page.tsx`: `redirect("/hoje")`.

- [ ] **Step 5: Rodar, abrir no navegador a 390px, commitar** — `npm test -- hoje` → PASS; `npm run dev` e conferir contra o mockup B. `git commit -m "feat(web): tela Hoje"`.

---

### Task 7: Biblioteca de receitas

**Files:**
- Create: `web/app/receitas/page.tsx`, `web/app/receitas/Library.tsx` (client), `web/components/RecipeRow.tsx`
- Test: `web/tests/library.test.tsx`

**Interfaces:**
- Consumes: `getRecipes` (T2), `DayRepo.getFavorites/toggleFavorite` (T4), `AppShell` (T5).
- Produces: `Library({ recipes, favorites, initialSlot?, onToggleFavorite })`; `RecipeRow({ recipe, favorite, onToggleFavorite })` com foto 56px, nome, "22 min · fácil", proteína à direita em `.num` ("42 g" + "610 kcal" menor).

- [ ] **Step 1: Testes**

```tsx
it("filtra por slot 'cafe' e mostra só a tapioca", ...)
it("filtro de tempo 'até 15 min' mostra só a tapioca; 'até 30' mostra as 3", ...)
it("proteína mínima 44 mostra só o bowl", ...)
it("busca 'batata' encontra o bowl por ingrediente", ...)
it("aba 'Favoritas' lista só os slugs favoritos", ...)
```

- [ ] **Step 2: Rodar e ver falhar.** — [ ] **Step 3: Implementar** chips de filtro (slot, tempo, proteína) em pill `soft`, ativo em `ink` com texto branco (não acento: acento é ação); campo de busca nativo; favoritos com ícone de coração em traço, cheio quando favorito; estado vazio "Nenhuma receita com esses filtros". — [ ] **Step 4: Rodar, commitar** `feat(web): biblioteca de receitas com filtros, busca e favoritas`.

---

### Task 8: Tela Receita

**Files:**
- Create: `web/app/receitas/[slug]/page.tsx`, `web/app/receitas/[slug]/RecipeView.tsx` (client)
- Test: `web/tests/recipe.test.tsx`

**Interfaces:**
- Consumes: `getRecipe` (T2), `scaleIngredients`, `macrosFor` (T3), `Stat`, `Stepper`, `Button` (T5).
- Produces: `RecipeView({ recipe })`; navega para `/cozinhar/<slug>?p=<portions>`.

- [ ] **Step 1: Testes**

```tsx
it("mostra foto 380px com tag do slot e título, e 3 stats '42 g', '22', '610'", ...)
it("stepper em 3 porções mostra peito de frango 600 g e stats 126 g / 1.830 kcal", ...)
it("botão 'Começar a cozinhar' aponta para /cozinhar/frango-crocante-arroz-tostado?p=2", ...)
it("receita sem foto renderiza placeholder e não quebra", ...)
```

- [ ] **Step 2: Rodar e ver falhar.** — [ ] **Step 3: Implementar** conforme mockup B: foto com gradiente e tag ("JANTAR" em acento), stats em 3 colunas, seção "Ingredientes" com `Stepper` à direita, lista com checkbox de mise en place (estado local) e gramas em `.num` alinhadas à direita (raise da ficha técnica), "Preparo" numerado, CTA fixo "Começar a cozinhar". Botão de lista de compras fica FORA desta parte (parte 3). — [ ] **Step 4: Rodar, commitar** `feat(web): tela de receita com porções escaláveis`.

---

### Task 9: Modo cozinhar e marcar refeição

**Files:**
- Create: `web/app/cozinhar/[slug]/page.tsx`, `web/app/cozinhar/[slug]/CookMode.tsx` (client), `web/lib/cook/timer.ts`, `web/app/api/log-meal/route.ts`
- Test: `web/tests/timer.test.ts`, `web/tests/cook.test.tsx`

**Interfaces:**
- Consumes: `getRecipe` (T2), `slotForHour` (T3), `DayRepo.logMeal` (T4), `Button`, icons (T5).
- Produces:
```ts
export function createTimer(seconds: number, now: () => number): { start(): void; pause(): void; remaining(): number; done(): boolean }; // puro, injetável
```
`CookMode({ recipe, portions })`; `POST /api/log-meal` body `{ recipeSlug, portions, slot }` → `201 { log: MealLog }`.

- [ ] **Step 1: Testes**

`timer.test.ts`: `createTimer(180, clock)`; após `start` e 13 s, `remaining() === 167`; `pause` congela; `done()` em 0.
`cook.test.tsx`: `it("abre no passo 1 de 7 com as pílulas de progresso", ...)`; `it("no passo 3 mostra o chip 'peito de frango · 400 g · fogo alto' e o cronômetro 3:00", ...)`; `it("'Próximo passo' avança e 'Anterior' volta; no último passo o botão vira 'Marquei, comi'", ...)`; `it("'Marquei, comi' chama POST /api/log-meal com slot do horário e volta para /hoje", ...)` (fetch mockado); `it("passo sem seconds não renderiza cronômetro", ...)`.

- [ ] **Step 2: Rodar e ver falhar.** — [ ] **Step 3: Implementar** `timer.ts`; `CookMode` com pílulas, rótulo "PASSO N DE M", texto 28/700, chip acento-suave com `ingredientHint`, cronômetro `.num` 104px em acento quando houver `seconds`, botão de pausa, CTA "Próximo passo" (último passo: "Marquei, comi"); `navigator.wakeLock?.request("screen")` em `useEffect` com catch; troca de passo por botões e por deslize horizontal (pointer events, limiar 60px). `route.ts`: valida body com zod, `ensureSession`, `repo.logMeal`, responde 201. — [ ] **Step 4: Rodar, commitar** `feat(web): modo cozinhar com cronômetro e marcar refeição`.

---

### Task 10: Smoke end-to-end e acabamento impeccable

**Files:**
- Create: `web/e2e/loop.spec.ts`, `web/playwright.config.ts`
- Create: `.impeccable/review/mobile.png`, `.impeccable/review/desktop.png`
- Modify: `DESIGN.md`, `.impeccable/design.json` (escritos pelo documenter a partir do app construído)

- [ ] **Step 1: Escrever o smoke Playwright** (viewport 390×844): abre `/hoje`, lê "g para fechar", clica no card da próxima refeição, confere stats, "Começar a cozinhar", avança 7 passos, "Marquei, comi", volta a `/hoje` e o número de gramas faltantes diminuiu em 42 e a linha "Jantar" está `done`. Requer `.env.local` apontando para o Supabase; sem ele o teste é pulado com mensagem clara.

- [ ] **Step 2: Rodar** `npx playwright test` → PASS.

- [ ] **Step 3: Rodada única de inspeção impeccable**: capturar `mobile.png` (390) e `desktop.png` (1440) das três telas em `.impeccable/review/`; rodar `impeccable detect --json web/app web/components` uma vez; corrigir o mecânico em um lote.

- [ ] **Step 4: Finish review**: spawnar `impeccable-finish-reviewer` com o pedido original, o contrato em `.impeccable/surfaces/app-hoje-page-tsx.md`, os screenshots, os findings do detector e o mockup `design/direcoes/index.html` (seção B) como referência de crítica. Agir pela disposição (`fix` em um lote e recaptura; `ship` segue).

- [ ] **Step 5: Documenter**: spawnar `impeccable-documenter` para escrever `DESIGN.md` e `.impeccable/design.json` a partir do app construído (substituindo o DESIGN.md da landing).

- [ ] **Step 6: Commit final** `chore: smoke e2e, revisão impeccable e DESIGN.md do app`.

---

## Fora deste plano (planos seguintes)

- **Parte 2, conta e assinatura:** login por e-mail (link mágico), Google e Apple; vínculo da sessão anônima ao e-mail; adaptador de pagamento (`PaymentProvider` com `createCheckoutUrl`, `handleWebhook`, `getStatus`), implementação OnProfit (webhook → `subscriptions` table) e stub Stripe; gate de acesso nas rotas; cancelamento.
- **Parte 3, onboarding, lista e perfil:** quiz de 5 telas com cálculo de TMB/gasto e gravação em `profiles`; lista de compras simples; perfil (editar meta, sair, cancelar); histórico dos últimos 7 dias (spec 3.5), que precisa de `DayRepo.getLogsRange(userId, fromKey, toKey)`.
- **Conteúdo:** 40 receitas reais com fotos e macros TACO (decisão pendente de quem produz).
