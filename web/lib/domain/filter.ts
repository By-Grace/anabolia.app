import type { MealSlot, Recipe } from "@/lib/recipes/schema";

export type RecipeFilter = {
  slot?: MealSlot;
  maxMinutes?: number;
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
    if (f.maxMinutes && r.minutes > f.maxMinutes) return false;
    if (f.minProtein && r.perPortion.protein_g < f.minProtein) return false;
    if (f.favoritesOnly && !favs.has(r.slug)) return false;
    if (q) {
      const hay = fold([r.name, ...r.ingredients.map((i) => i.name)].join(" "));
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
