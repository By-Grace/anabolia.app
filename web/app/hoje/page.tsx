import { AppShell } from "@/components/ui/AppShell";
import { getRecipes } from "@/lib/recipes/load";
import { DEFAULT_GOAL, type Goal, type MealLog } from "@/lib/domain/day";
import { localDayKey } from "@/lib/data/day-key";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession } from "@/lib/supabase/session";
import { HojeView } from "./HojeView";

export const dynamic = "force-dynamic";

export default async function HojePage() {
  const now = new Date();
  const recipes = getRecipes();
  let goal: Goal = DEFAULT_GOAL;
  let logs: MealLog[] = [];
  let error: string | undefined;

  try {
    const client = await supabaseServer();
    const { userId } = await ensureSession(client);
    const repo = supabaseDayRepo(client);
    [goal, logs] = await Promise.all([repo.getGoal(userId), repo.getLogs(userId, localDayKey(now))]);
  } catch {
    error = "Não deu para carregar o seu dia agora. As receitas continuam aqui.";
  }

  return (
    <AppShell active="hoje">
      <HojeView recipes={recipes} logs={logs} goal={goal} now={now} error={error} />
    </AppShell>
  );
}
