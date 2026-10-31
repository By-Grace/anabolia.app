import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { Ingredient } from "./schema";

export type Per100 = { kcal: number; protein_g: number; carbs_g: number; fat_g: number };
type Measure = "un" | "dente" | "colher" | "ml";
export type IngredientInfo = { id: string; nome: string; per100g: Per100; fonte: string; gramasPor: Partial<Record<Measure, number>> };

type RawEntry = {
  nome: string;
  taco?: number;
  rotulo?: Per100;
  fonteRotulo?: string;
  gramasPor?: Partial<Record<Measure, number>>;
};
type TacoRow = { descricao: string; kcal: number | null; protein_g: number | null; carbs_g: number | null; fat_g: number | null };

const CONTENT = join(process.cwd(), "content");
let cache: Map<string, IngredientInfo> | null = null;

/** Tabela de ingredientes do app, com macros por 100 g resolvidos da TACO ou de rótulo. Só servidor. */
export function loadIngredientDb(): Map<string, IngredientInfo> {
  if (cache) return cache;
  const taco = JSON.parse(readFileSync(join(CONTENT, "taco", "taco.json"), "utf8")).alimentos as Record<string, TacoRow>;
  const raw = JSON.parse(readFileSync(join(CONTENT, "ingredients.json"), "utf8")).ingredientes as Record<string, RawEntry>;
  const db = new Map<string, IngredientInfo>();
  for (const [id, e] of Object.entries(raw)) {
    let per100g: Per100;
    let fonte: string;
    if (e.taco !== undefined) {
      const row = taco[String(e.taco)];
      if (!row) throw new Error(`Ingrediente "${id}": TACO #${e.taco} não existe`);
      per100g = { kcal: row.kcal ?? 0, protein_g: row.protein_g ?? 0, carbs_g: row.carbs_g ?? 0, fat_g: row.fat_g ?? 0 };
      if (row.kcal === null) throw new Error(`Ingrediente "${id}": TACO #${e.taco} (${row.descricao}) não tem energia; use 'rotulo'`);
      fonte = `TACO #${e.taco} ${row.descricao}`;
    } else if (e.rotulo) {
      per100g = e.rotulo;
      fonte = `Rótulo: ${e.fonteRotulo ?? "média de mercado"}`;
    } else {
      throw new Error(`Ingrediente "${id}" precisa de 'taco' ou 'rotulo'`);
    }
    db.set(id, { id, nome: e.nome, per100g, fonte, gramasPor: e.gramasPor ?? {} });
  }
  cache = db;
  return db;
}

/** Gramas de um ingrediente da receita (medida caseira convertida pela tabela). */
export function gramsOf(ing: Ingredient, info: IngredientInfo | undefined): number {
  if (ing.unit === "a gosto") return 0;
  if (ing.unit === "g") return ing.qty;
  const per = info?.gramasPor[ing.unit as Measure];
  if (per === undefined) {
    if (ing.unit === "ml") return ing.qty;
    throw new Error(`Ingrediente "${ing.name}": sem conversão de "${ing.unit}" para gramas em content/ingredients.json`);
  }
  return Math.round(ing.qty * per * 10) / 10;
}

/** Macros por porção a partir dos ingredientes (quantidades da receita-base). */
export function computePerPortion(ingredients: Ingredient[], basePortions: number, db: Map<string, IngredientInfo>): Per100 {
  const t = { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
  for (const ing of ingredients) {
    if (ing.unit === "a gosto") continue;
    if (!ing.ref) throw new Error(`Ingrediente "${ing.name}" sem 'ref' para a tabela`);
    const info = db.get(ing.ref);
    if (!info) throw new Error(`Ingrediente "${ing.name}": ref "${ing.ref}" não existe em content/ingredients.json`);
    const f = gramsOf(ing, info) / 100;
    t.kcal += info.per100g.kcal * f;
    t.protein_g += info.per100g.protein_g * f;
    t.carbs_g += info.per100g.carbs_g * f;
    t.fat_g += info.per100g.fat_g * f;
  }
  const n = Math.max(1, basePortions);
  return {
    kcal: Math.round(t.kcal / n),
    protein_g: Math.round(t.protein_g / n),
    carbs_g: Math.round(t.carbs_g / n),
    fat_g: Math.round(t.fat_g / n),
  };
}
