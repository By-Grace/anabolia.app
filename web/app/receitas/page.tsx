import { AppShell } from "@/components/ui/AppShell";
import { getRecipes } from "@/lib/recipes/load";
import { MEAL_SLOTS, type MealSlot } from "@/lib/recipes/schema";
import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession } from "@/lib/supabase/session";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { Library } from "./Library";
import { toggleFavoriteAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function ReceitasPage({ searchParams }: { searchParams: Promise<{ slot?: string }> }) {
  const { slot } = await searchParams;
  const initialSlot = MEAL_SLOTS.includes(slot as MealSlot) ? (slot as MealSlot) : undefined;
  let favorites: string[] = [];
  try {
    const client = await supabaseServer();
    const { userId } = await ensureSession(client);
    favorites = await supabaseDayRepo(client).getFavorites(userId);
  } catch {
    favorites = [];
  }
  return (
    <AppShell active="receitas" title="Receitas">
      <Library recipes={getRecipes()} favorites={favorites} initialSlot={initialSlot} onToggleFavorite={toggleFavoriteAction} />
    </AppShell>
  );
}
