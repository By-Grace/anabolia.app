import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { RecipeSchema, type Recipe } from "./schema";

const DIR = join(process.cwd(), "content", "recipes");

let cache: Recipe[] | null = null;

/** Todas as receitas do conteúdo, validadas e ordenadas por nome. Só servidor. */
export function getRecipes(): Recipe[] {
  if (cache) return cache;
  const files = readdirSync(DIR).filter((f) => f.endsWith(".json"));
  const recipes = files.map((f) => {
    const raw = JSON.parse(readFileSync(join(DIR, f), "utf8"));
    const parsed = RecipeSchema.safeParse(raw);
    if (!parsed.success) {
      throw new Error(`Receita inválida em content/recipes/${f}: ${parsed.error.message}`);
    }
    return parsed.data;
  });
  recipes.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
  cache = recipes;
  return recipes;
}

export function getRecipe(slug: string): Recipe | undefined {
  return getRecipes().find((r) => r.slug === slug);
}
