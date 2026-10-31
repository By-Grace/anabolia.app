import type { Recipe, MealSlot } from "@/lib/recipes/schema";

export function fakeRecipe(slug: string, protein_g: number, slot: MealSlot[] = ["almoco", "jantar"], extra: Partial<Recipe> = {}): Recipe {
  return {
    slug,
    name: slug,
    slot,
    minutes: 20,
    difficulty: "fácil",
    basePortions: 1,
    perPortion: { kcal: protein_g * 14, protein_g, carbs_g: 40, fat_g: 15 },
    ingredients: [{ name: "x", qty: 100, unit: "g" }],
    steps: [{ text: "passo" }],
    ...extra,
  };
}
