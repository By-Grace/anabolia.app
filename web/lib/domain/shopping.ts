import type { Recipe } from "@/lib/recipes/schema";
import { fmtHousehold, fmtWeight } from "@/lib/format";
import { scaleIngredients } from "./scale";

/** Uma receita na lista: porções escolhidas e os índices (na receita) dos ingredientes já comprados. */
export type ListEntry = { recipeSlug: string; portions: number; checked: number[] };
export type ShoppingItem = { index: number; name: string; amount: string; household?: string; checked: boolean };
export type ShoppingGroup = { slug: string; name: string; portions: number; items: ShoppingItem[] };

/** Nada a comprar: tempero "a gosto" e água da torneira. */
const skip = (ing: Recipe["ingredients"][number]) => ing.unit === "a gosto" || ing.ref === "agua";

/** Grupos da lista na ordem das entradas, com quantidades escaladas. Receita que saiu do conteúdo some. */
export function shoppingGroups(entries: ListEntry[], recipes: Recipe[]): ShoppingGroup[] {
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  return entries.flatMap((e) => {
    const recipe = bySlug.get(e.recipeSlug);
    if (!recipe) return [];
    const done = new Set(e.checked);
    const items: ShoppingItem[] = [];
    scaleIngredients(recipe, e.portions).forEach((ing, index) => {
      if (skip(ing)) return;
      const household = ing.unit !== "g" && ing.grams ? fmtHousehold(ing) : undefined;
      items.push({ index, name: ing.name, amount: fmtWeight(ing), ...(household ? { household } : {}), checked: done.has(index) });
    });
    return [{ slug: recipe.slug, name: recipe.name, portions: e.portions, items }];
  });
}
