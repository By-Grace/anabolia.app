import { z } from "zod";
import { MEAL_SLOTS, type MealSlot } from "@/lib/recipes/schema";
import { getRecipe } from "@/lib/recipes/load";

const Body = z.object({
  recipeSlug: z.string().min(1),
  slot: z.enum(MEAL_SLOTS),
  portions: z.number().int().min(1).max(8).default(1),
});

export type LogMealBody = { recipeSlug: string; slot: MealSlot; portions: number };

export function parseLogMealBody(raw: unknown):
  | { ok: true; value: LogMealBody }
  | { ok: false; status: 400 | 404; message: string } {
  const parsed = Body.safeParse(raw);
  if (!parsed.success) return { ok: false, status: 400, message: "Dados inválidos para registrar a refeição." };
  if (!getRecipe(parsed.data.recipeSlug)) return { ok: false, status: 404, message: "Receita não encontrada." };
  return { ok: true, value: parsed.data };
}
