import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeInputSchema, type Recipe } from "./schema";
import { computePerPortion, gramsOf, loadIngredientDb } from "./nutrition";

const DIR = join(process.cwd(), "content", "recipes");

let cache: Recipe[] | null = null;

/** Todas as receitas do conteúdo, validadas e ordenadas por nome. Só servidor. */
export function getRecipes(): Recipe[] {
  if (cache) return cache;
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const recipes = files.map((f) => {
    const raw = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    const parsed = RecipeInputSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Receita inválida em content/recipes/${f}: ${parsed.error.message}`);
    }
    if (`${parsed.data.slug}.json` !== f) {
      throw new Error(`content/recipes/${f}: slug "${parsed.data.slug}" diferente do nome do arquivo`);
    }
    return withNutrition(parsed.data, f);
  });
  recipes.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  cache = recipes;
  return recipes;
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipes().find((r) => r.slug === slug);
}

/** Preenche gramas das medidas caseiras e calcula os macros pela tabela (TACO / rótulo). */
function withNutrition(input: ReturnType<typeof RecipeInputSchema.parse>, file: string): Recipe {
  const db = loadIngredientDb();
  try {
    const ingredients = input.ingredients.map((ing) => {
      if (!ing.ref || ing.unit === "g" || ing.unit === "a gosto") return ing;
      return { ...ing, grams: gramsOf(ing, db.get(ing.ref)) };
    });
    const allRefs = input.ingredients.every((i) => i.unit === "a gosto" || i.ref);
    const perPortion = allRefs ? computePerPortion(input.ingredients, input.basePortions, db) : input.perPortion;
    if (!perPortion) throw new Error("sem 'ref' em todos os ingredientes e sem 'perPortion'");
    return { ...input, ingredients, perPortion };
  } catch (e) {
    throw new Error(`content/recipes/${file}: ${e instanceof Error ? e.message : e}`);
  }
}
