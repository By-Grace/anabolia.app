import type { SupabaseClient } from "@supabase/supabase-js";

type AuthErr = { name?: string; message?: string } | null;

const isSessionMissing = (e: AuthErr) => !!e && e.name === "AuthSessionMissingError";

function authError(e: NonNullable<AuthErr>): Error {
  return new Error(e.message || "Falha ao verificar a sessão");
}

/** Só lê: devolve o id do usuário ou null se não houver sessão. Nunca cria conta. Erros passageiros propagam. */
export async function getUserId(client: SupabaseClient): Promise<string | null> {
  const { data, error } = await client.auth.getUser();
  if (data?.user) return data.user.id;
  if (!error || isSessionMissing(error)) return null;
  throw authError(error);
}

/**
 * Para ações que gravam (route handlers e server actions, onde cookies podem ser escritos):
 * usa a sessão existente ou entra como anônimo SOMENTE quando não existe sessão.
 * Numa falha passageira do Supabase, propaga o erro em vez de trocar a conta da pessoa.
 */
export async function ensureSession(client: SupabaseClient): Promise<{ userId: string }> {
  const existing = await getUserId(client);
  if (existing) return { userId: existing };
  const { data: anon, error } = await client.auth.signInAnonymously();
  if (error || !anon.user) {
    throw new Error(`Não foi possível iniciar a sessão: ${error?.message ?? "sem usuário"}`);
  }
  return { userId: anon.user.id };
}
