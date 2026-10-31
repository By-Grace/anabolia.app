import type { SupabaseClient } from "@supabase/supabase-js";

/** Garante um usuário: usa a sessão existente ou entra como anônimo. */
export async function ensureSession(client: SupabaseClient): Promise<{ userId: string }> {
  const { data } = await client.auth.getUser();
  if (data.user) return { userId: data.user.id };
  const { data: anon, error } = await client.auth.signInAnonymously();
  if (error || !anon.user) {
    throw new Error(`Não foi possível iniciar a sessão: ${error?.message ?? "sem usuário"}`);
  }
  return { userId: anon.user.id };
}
