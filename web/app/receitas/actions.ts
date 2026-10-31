"use server";

import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession } from "@/lib/supabase/session";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { getRecipe } from "@/lib/recipes/load";

export async function toggleFavoriteAction(slug: string): Promise<boolean> {
  if (!getRecipe(slug)) throw new Error("Receita não encontrada");
  const client = await supabaseServer();
  const { userId } = await ensureSession(client);
  return supabaseDayRepo(client).toggleFavorite(userId, slug);
}
