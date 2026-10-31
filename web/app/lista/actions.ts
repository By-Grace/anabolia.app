"use server";

import { getRecipe } from "@/lib/recipes/load";
import { supabaseListRepo } from "@/lib/data/list-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession, getUserId } from "@/lib/supabase/session";

/** Põe (ou atualiza) a receita na lista com as porções escolhidas. A sessão anônima nasce aqui se faltar. */
export async function addToListAction(slug: string, portions: number): Promise<boolean> {
  if (!getRecipe(slug)) return false;
  try {
    const client = await supabaseServer();
    const { userId } = await ensureSession(client);
    await supabaseListRepo(client).add(userId, slug, portions);
    return true;
  } catch (e) {
    console.error("lista: pôr", e);
    return false;
  }
}

/** As demais ações só mexem numa lista que já existe: sem sessão, não há o que mudar. */
async function withUser(label: string, run: (repo: ReturnType<typeof supabaseListRepo>, userId: string) => Promise<void>) {
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (!userId) return false;
    await run(supabaseListRepo(client), userId);
    return true;
  } catch (e) {
    console.error(`lista: ${label}`, e);
    return false;
  }
}

export async function setItemCheckedAction(slug: string, index: number, checked: boolean): Promise<boolean> {
  const recipe = getRecipe(slug);
  if (!recipe || !Number.isInteger(index) || index < 0 || index >= recipe.ingredients.length) return false;
  return withUser("marcar", (repo, userId) => repo.setChecked(userId, slug, index, checked === true));
}

export async function removeFromListAction(slug: string): Promise<boolean> {
  if (typeof slug !== "string" || !slug) return false;
  return withUser("tirar", (repo, userId) => repo.remove(userId, slug));
}

export async function clearListAction(): Promise<boolean> {
  return withUser("limpar", (repo, userId) => repo.clear(userId));
}
