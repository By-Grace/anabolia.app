import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabaseEnv } from "./env";

/**
 * Cliente com a chave de serviço: ignora RLS. Só para o servidor (webhook de pagamento e checkout de teste).
 * Nunca importar em componente client; a chave não tem prefixo NEXT_PUBLIC_ e não chega ao navegador.
 */
export function supabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") throw new Error("supabaseAdmin só roda no servidor");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY no servidor");
  return createClient(supabaseEnv().url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
