import type { MealSlot, Recipe } from "@/lib/recipes/schema";
import { macrosFor } from "./scale";

export type Goal = { protein_g: number; kcal: number; isDefault: boolean };

export const DEFAULT_GOAL: Goal = { protein_g: 160, kcal: 3100, isDefault: true };

export type MealLog = {
  id: string;
  recipeSlug: string;
  portions: number;
  loggedAt: string;
  slot: MealSlot;
};

export type DayTotals = {
  protein_g: number;
  kcal: number;
  remainingProtein_g: number;
  progress: number;
  goalMet: boolean;
  mealsDone: number;
};

export function dayTotals(logs: MealLog[], recipes: Recipe[], goal: Goal = DEFAULT_GOAL): DayTotals {
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  let protein_g = 0;
  let kcal = 0;
  let mealsDone = 0;
  for (const log of logs) {
    const recipe = bySlug.get(log.recipeSlug);
    if (!recipe) continue;
    const m = macrosFor(recipe, log.portions);
    protein_g += m.protein_g;
    kcal += m.kcal;
    mealsDone += 1;
  }
  const target = Math.max(1, goal.protein_g);
  return {
    protein_g,
    kcal,
    remainingProtein_g: Math.max(0, goal.protein_g - protein_g),
    progress: Math.min(1, protein_g / target),
    goalMet: protein_g >= goal.protein_g,
    mealsDone,
  };
}
