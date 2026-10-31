import { AppShell } from "@/components/ui/AppShell";
import { getRecipes } from "@/lib/recipes/load";
import { DEFAULT_GOAL } from "@/lib/domain/day";
import { lastDayKeys, weekHistory, type DayLog } from "@/lib/domain/history";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { supabaseProfileRepo, type Profile } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { PerfilView } from "./PerfilView";
import { saveGoalAction, updateWeightAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Perfil · Anaból[IA]" };

export default async function PerfilPage() {
  const now = new Date();
  let profile: Profile = { body: null, goal: DEFAULT_GOAL };
  let logs: DayLog[] = [];
  let error: string | undefined;
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (userId) {
      const keys = lastDayKeys(now);
      [profile, logs] = await Promise.all([
        supabaseProfileRepo(client).getProfile(userId, now),
        supabaseDayRepo(client).getLogsBetween(userId, keys[0], keys[keys.length - 1]),
      ]);
    }
  } catch {
    error = "Não deu para carregar o seu perfil agora.";
  }
  const week = weekHistory(logs, getRecipes(), profile.goal, now);
  return (
    <AppShell>
      <PerfilView profile={profile} week={week} error={error} onSaveWeight={updateWeightAction} onSaveGoal={saveGoalAction} />
    </AppShell>
  );
}
