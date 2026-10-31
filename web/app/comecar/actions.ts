"use server";

import { calcGoal, parseBody } from "@/lib/domain/goal";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession } from "@/lib/supabase/session";
import type { SaveResult } from "./Onboarding";

/** Valida o corpo, calcula a meta e grava os dois. A sessão anônima nasce aqui se ainda não existir. */
export async function saveOnboardingAction(raw: unknown): Promise<SaveResult> {
  const parsed = parseBody(raw);
  if (!parsed.ok) return parsed;
  try {
    const client = await supabaseServer();
    const { userId } = await ensureSession(client);
    const { protein_g, kcal } = calcGoal(parsed.value);
    await supabaseProfileRepo(client).saveBody(userId, parsed.value, { protein_g, kcal });
    return { ok: true };
  } catch (e) {
    console.error("comecar: salvar", e);
    return { ok: false, message: "Não deu para salvar agora. Tente de novo." };
  }
}
