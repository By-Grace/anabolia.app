import type { Body } from "@/lib/domain/goal";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { Onboarding } from "./Onboarding";
import { saveOnboardingAction } from "./actions";
import { onboardingRoutes } from "./routes";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sua meta · Anaból[IA]" };

export default async function ComecarPage({ searchParams }: { searchParams: Promise<{ de?: string }> }) {
  const { de } = await searchParams;
  let initial: Body | undefined;
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (userId) initial = (await supabaseProfileRepo(client).getProfile(userId)).body ?? undefined;
  } catch {
    // Sem perfil carregado, o cadastro começa vazio.
  }
  const { exitHref, doneHref } = onboardingRoutes(de, !!initial);
  return <Onboarding initial={initial} onSave={saveOnboardingAction} exitHref={exitHref} doneHref={doneHref} />;
}
