import { getRecipes } from "@/lib/recipes/load";
import { hasAccess } from "@/lib/domain/access";
import { readSubscription } from "@/lib/data/subscription-repo";
import { allowTestSubscriptions } from "@/lib/payments";
import { supabaseServer } from "@/lib/supabase/server";
import { AssinarView } from "./AssinarView";
import { startCheckoutAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assinatura · Anaból[IA]" };

export default async function AssinarPage() {
  let access = false;
  let periodEnd: string | null = null;
  try {
    const client = await supabaseServer();
    const { data } = await client.auth.getUser();
    if (data.user && !data.user.is_anonymous) {
      const sub = await readSubscription(client, data.user.id);
      access = hasAccess(sub, new Date(), { allowTest: allowTestSubscriptions() });
      periodEnd = sub?.currentPeriodEnd ?? null;
    }
  } catch {
    // Sem leitura da assinatura, mostra a oferta; o checkout confere de novo.
  }
  return <AssinarView recipeCount={getRecipes().length} access={access} periodEnd={periodEnd} onStart={startCheckoutAction} />;
}
