import type { MealSlot, Recipe } from "@/lib/recipes/schema";

/** 5–10 café · 11–14 almoço · 15–17 lanche · 18–4 jantar. */
export function slotForHour(hour: number): MealSlot {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h >= 5 && h <= 10) return "cafe";
  if (h >= 11 && h <= 14) return "almoco";
  if (h >= 15 && h <= 17) return "lanche";
  return "jantar";
}

/** Receitas do slot, as que mais se aproximam da proteína que falta primeiro. */
export function suggest(recipes: Recipe[], remainingProtein_g: number, slot: MealSlot, limit = 3): Recipe[] {
  return recipes
    .filter((r) => r.slot.includes(slot))
    .map((r) => ({ r, d: Math.abs(r.perPortion.protein_g - remainingProtein_g) }))
    .sort((a, b) => a.d - b.d || a.r.minutes - b.r.minutes)
    .slice(0, Math.max(0, limit))
    .map(({ r }) => r);
}
