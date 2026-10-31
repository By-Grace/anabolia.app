import type { SupabaseClient } from "@supabase/supabase-js";
import { applyEvent, type PaymentEvent } from "@/lib/domain/access";
import { forgetEvent, readSubscription, recordEvent, userIdByEmail, writeSubscription } from "@/lib/data/subscription-repo";

/**
 * Aplica um evento de pagamento com a chave de serviço. Grava o evento primeiro: se ele já tinha chegado,
 * para aí (webhook repetido não estende o período duas vezes). Sem conta para o e-mail, só registra.
 */
export async function applyPaymentEvent(admin: SupabaseClient, e: PaymentEvent, raw: unknown): Promise<"aplicado" | "repetido" | "sem-usuario"> {
  const userId = e.userId ?? (e.email ? await userIdByEmail(admin, e.email) : null);
  const fresh = await recordEvent(admin, { ...e, userId }, raw);
  if (!fresh) return "repetido";
  if (!userId) return "sem-usuario";
  try {
    const prev = await readSubscription(admin, userId);
    await writeSubscription(admin, userId, applyEvent(prev, e));
  } catch (err) {
    // Sem isto, o reenvio do provedor cairia em "repetido" e a assinatura nunca seria gravada.
    await forgetEvent(admin, e).catch(() => {});
    throw err;
  }
  return "aplicado";
}
