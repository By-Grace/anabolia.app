import type { Ingredient, Recipe } from "@/lib/recipes/schema";

export const MIN_PORTIONS = 1;
export const MAX_PORTIONS = 8;

export function clampPortions(portions: number): number {
  if (!Number.isFinite(portions)) return MIN_PORTIONS;
  return Math.min(MAX_PORTIONS, Math.max(MIN_PORTIONS, Math.round(portions)));
}

/** Ingredientes escalados para `portions`; "a gosto" não escala e nada com quantidade vira 0. */
export function scaleIngredients(recipe: Recipe, portions: number): Ingredient[] {
  const factor = clampPortions(portions) / recipe.basePortions;
  return recipe.ingredients.map((ing) => {
    if (ing.unit === "a gosto" || ing.qty === 0) return { ...ing };
    return { ...ing, qty: Math.max(1, Math.round(ing.qty * factor)) };
  });
}

/** Macros de `portions` porções (perPortion × porções). */
export function macrosFor(recipe: Recipe, portions: number): Recipe["perPortion"] {
  const n = clampPortions(portions);
  const p = recipe.perPortion;
  return {
    kcal: Math.round(p.kcal * n),
    protein_g: Math.round(p.protein_g * n),
    carbs_g: Math.round(p.carbs_g * n),
    fat_g: Math.round(p.fat_g * n),
  };
}
