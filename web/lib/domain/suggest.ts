import type { MealSlot, Recipe } from "@/lib/recipes/schema";

/** 5–10 café · 11–14 almoço · 15–17 lanche · 18–4 jantar. */
export function slotForHour(hour: number): MealSlot {
  const h = ((Math.floor(hour) % 24) + 24) % 24;
  if (h >= 5 && h <= 10) return "cafe";
  if (h >= 11 && h <= 14) return "almoco";
  if (h >= 15 && h <= 17) return "lanche";
  return "jantar";
}

/** Tempo máximo preferido por refeição: lanche é entre uma coisa e outra, então só receitas rápidas. */
export const QUICK_MINUTES: Partial<Record<MealSlot, number>> = { lanche: 15 };

/**
 * Receitas do slot, as que mais se aproximam da proteína que falta primeiro.
 * Se o slot tem tempo preferido e existe receita dentro dele, só essas entram; senão, todas.
 */
export function suggest(recipes: Recipe[], remainingProtein_g: number, slot: MealSlot, limit = 3): Recipe[] {
  const inSlot = recipes.filter((r) => r.slot.includes(slot));
  const max = QUICK_MINUTES[slot];
  const quick = max ? inSlot.filter((r) => r.minutes <= max) : [];
  return (quick.length ? quick : inSlot)
    .map((r) => ({ r, d: Math.abs(r.perPortion.protein_g - remainingProtein_g) }))
    .sort((a, b) => a.d - b.d || a.r.minutes - b.r.minutes)
    .slice(0, Math.max(0, limit))
    .map(({ r }) => r);
}
