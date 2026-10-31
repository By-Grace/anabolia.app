import type { SupabaseClient } from "@supabase/supabase-js";
import { applyEvent, type PaymentEvent } from "@/lib/domain/access";
import { markApplied, readSubscription, recordEvent, userIdByEmail, writeSubscription } from "@/lib/data/subscription-repo";

/**
 * Aplica um evento de pagamento com a chave de serviço. Registra o evento; se ele já tinha sido aplicado,
 * para aí (webhook repetido não estende o período duas vezes). Só marca como aplicado depois de gravar a
 * assinatura: se o processo cair no meio, o reenvio do provedor aplica. Sem conta para o e-mail, só registra.
 */
export async function applyPaymentEvent(admin: SupabaseClient, e: PaymentEvent, raw: unknown): Promise<"aplicado" | "repetido" | "sem-usuario"> {
  const userId = e.userId ?? (e.email ? await userIdByEmail(admin, e.email) : null);
  const seen = await recordEvent(admin, { ...e, userId }, raw);
  if (seen === "aplicado") return "repetido";
  if (!userId) return "sem-usuario";
  const prev = await readSubscription(admin, userId);
  await writeSubscription(admin, userId, applyEvent(prev, e));
  await markApplied(admin, e);
  return "aplicado";
}
