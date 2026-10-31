import type { MealSlot } from "@/lib/recipes/schema";

/** Marca 1 porção comida da receita no slot. Devolve o id da refeição registrada. */
export async function postMeal(recipeSlug: string, slot: MealSlot): Promise<string> {
  const res = await fetch("/api/log-meal", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeSlug, portions: 1, slot }),
  });
  if (!res.ok) throw new Error(String(res.status));
  const body = (await res.json()) as { log?: { id?: string } };
  return body.log?.id ?? "";
}

export async function deleteMeal(id: string): Promise<void> {
  const res = await fetch(`/api/log-meal/${encodeURIComponent(id)}`, { method: "DELETE" });
  if (!res.ok) throw new Error(String(res.status));
}

export const loggedUrl = (id: string) => (id ? `/hoje?marcou=${encodeURIComponent(id)}` : "/hoje");
