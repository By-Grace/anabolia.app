import { AppShell } from "@/components/ui/AppShell";
import { getRecipes } from "@/lib/recipes/load";
import { DEFAULT_GOAL } from "@/lib/domain/day";
import { lastDayKeys, weekHistory, type DayLog } from "@/lib/domain/history";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { supabaseProfileRepo, type Profile } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { PerfilView } from "./PerfilView";
import { cancelSubscriptionAction, saveGoalAction, updateWeightAction } from "./actions";
import { signOutAction } from "@/app/entrar/actions";
import { hasAccess } from "@/lib/domain/access";
import { readSubscription } from "@/lib/data/subscription-repo";
import { allowTestSubscriptions } from "@/lib/payments";
import type { Account } from "./AccountSection";

export const dynamic = "force-dynamic";
export const metadata = { title: "Perfil · Anaból[IA]" };

export default async function PerfilPage() {
  const now = new Date();
  let profile: Profile = { body: null, goal: DEFAULT_GOAL };
  let logs: DayLog[] = [];
  let error: string | undefined;
  let account: Account = { email: null, subscription: null, access: false };
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (userId) {
      const keys = lastDayKeys(now);
      [profile, logs] = await Promise.all([
        supabaseProfileRepo(client).getProfile(userId, now),
        supabaseDayRepo(client).getLogsBetween(userId, keys[0], keys[keys.length - 1]),
      ]);
      const { data } = await client.auth.getUser();
      if (data.user && !data.user.is_anonymous) {
        // A assinatura é lida à parte: se falhar, o Perfil abre e avisa, sem oferecer assinar de novo.
        let failed = false;
        const sub = await readSubscription(client, userId).catch(() => { failed = true; return null; });
        account = { email: data.user.email ?? null, subscription: sub, access: hasAccess(sub, now, { allowTest: allowTestSubscriptions() }), subscriptionError: failed };
      }
    }
  } catch {
    error = "Não deu para carregar o seu perfil agora.";
  }
  const week = weekHistory(logs, getRecipes(), profile.goal, now);
  return (
    <AppShell>
      <PerfilView profile={profile} week={week} error={error} onSaveWeight={updateWeightAction} onSaveGoal={saveGoalAction}
        account={account} onCancel={cancelSubscriptionAction} onSignOut={signOutAction} />
    </AppShell>
  );
}
