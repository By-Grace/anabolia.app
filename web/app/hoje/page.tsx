import { AppShell } from "@/components/ui/AppShell";
import { getRecipes } from "@/lib/recipes/load";
import { DEFAULT_GOAL, type Goal, type MealLog } from "@/lib/domain/day";
import { localDayKey } from "@/lib/data/day-key";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { HojeView } from "./HojeView";

export const dynamic = "force-dynamic";

export default async function HojePage({ searchParams }: { searchParams: Promise<{ marcou?: string; simular?: string }> }) {
  const { marcou, simular } = await searchParams;
  const now = new Date();
  const recipes = getRecipes();
  let goal: Goal = DEFAULT_GOAL;
  let logs: MealLog[] = [];
  let error: string | undefined;

  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (userId) {
      const repo = supabaseDayRepo(client);
      [goal, logs] = await Promise.all([repo.getGoal(userId), repo.getLogs(userId, localDayKey(now))]);
    }
  } catch {
    error = "Não deu para carregar o seu dia agora. As receitas continuam aqui.";
  }
  // Só no servidor de desenvolvimento: permite ver/capturar o estado de erro (?simular=erro).
  if (process.env.NODE_ENV === "development" && simular === "erro") {
    error = "Não deu para carregar o seu dia agora. As receitas continuam aqui.";
    logs = [];
  }

  return (
    <AppShell active="hoje">
      <HojeView recipes={recipes} logs={logs} goal={goal} now={now} error={error} justLogged={marcou} />
    </AppShell>
  );
}
