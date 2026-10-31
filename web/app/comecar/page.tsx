import type { Body } from "@/lib/domain/goal";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { Onboarding } from "./Onboarding";
import { saveOnboardingAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Sua meta · Anaból[IA]" };

export default async function ComecarPage() {
  let initial: Body | undefined;
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (userId) initial = (await supabaseProfileRepo(client).getProfile(userId)).body ?? undefined;
  } catch {
    // Sem perfil carregado, o cadastro começa vazio.
  }
  // Quem já tem os dados chega aqui pelo Perfil ("Recalcular") e pode voltar para lá.
  return <Onboarding initial={initial} onSave={saveOnboardingAction} exitHref={initial ? "/perfil" : undefined} />;
}
