import type { MealSlot, Recipe } from "@/lib/recipes/schema";

/** Rápidas: até 20 min. Demoradas: mais de 20 min. O corte divide o cardápio v1 quase ao meio. */
export const QUICK_MAX_MINUTES = 20;
export type TimeChoice = "rapidas" | "demoradas";

export type RecipeFilter = {
  slot?: MealSlot;
  time?: TimeChoice;
  minProtein?: number;
  query?: string;
  favoritesOnly?: boolean;
  favorites?: string[];
};

export const fold = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function filterRecipes(recipes: Recipe[], f: RecipeFilter): Recipe[] {
  const q = f.query ? fold(f.query) : "";
  const favs = new Set(f.favorites ?? []);
  return recipes.filter((r) => {
    if (f.slot && !r.slot.includes(f.slot)) return false;
    if (f.time === "rapidas" && r.minutes > QUICK_MAX_MINUTES) return false;
    if (f.time === "demoradas" && r.minutes <= QUICK_MAX_MINUTES) return false;
    if (f.minProtein && r.perPortion.protein_g < f.minProtein) return false;
    if (f.favoritesOnly && !favs.has(r.slug)) return false;
    if (q) {
      const hay = fold([r.name, ...r.ingredients.map((i) => i.name)].join(" "));
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
