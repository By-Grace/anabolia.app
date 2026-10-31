import type { SupabaseClient } from "@supabase/supabase-js";
import type { PaymentEvent, Subscription } from "@/lib/domain/access";

type Row = {
  provider: Subscription["provider"]; provider_ref: string | null; status: Subscription["status"];
  current_period_end: string | null; cancel_at_period_end: boolean;
};
type Res<T> = { data: T; error: { message: string; code?: string } | null };

function check<T>(res: Res<T>): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

/** Leitura com o cliente da pessoa (RLS: só a própria). */
export async function readSubscription(client: SupabaseClient, userId: string): Promise<Subscription | null> {
  const row = check(
    await client.from("subscriptions")
      .select("provider, provider_ref, status, current_period_end, cancel_at_period_end")
      .eq("user_id", userId).maybeSingle()
  ) as Row | null;
  if (!row) return null;
  return {
    provider: row.provider,
    providerRef: row.provider_ref,
    status: row.status,
    currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end).toISOString() : null,
    cancelAtPeriodEnd: row.cancel_at_period_end,
  };
}

/**
 * Grava o evento. "novo" na primeira vez; se já tinha chegado, "aplicado" (webhook repetido, ignorar)
 * ou "pendente" (registrado mas não aplicado: uma queda no meio; o reenvio aplica). Só chave de serviço.
 */
export async function recordEvent(admin: SupabaseClient, e: PaymentEvent, payload: unknown): Promise<"novo" | "aplicado" | "pendente"> {
  const res = (await admin.from("payment_events").insert({
    provider: e.provider, provider_event_id: e.id, type: e.type, user_id: e.userId, email: e.email, payload,
  })) as Res<unknown>;
  if (res.error?.code !== "23505") { check(res); return "novo"; }
  const row = check(
    await admin.from("payment_events").select("applied_at").eq("provider", e.provider).eq("provider_event_id", e.id).maybeSingle()
  ) as { applied_at: string | null } | null;
  return row?.applied_at ? "aplicado" : "pendente";
}

export async function markApplied(admin: SupabaseClient, e: PaymentEvent, now = new Date()): Promise<void> {
  check(await admin.from("payment_events").update({ applied_at: now.toISOString() })
    .eq("provider", e.provider).eq("provider_event_id", e.id) as Res<unknown>);
}

export async function userIdByEmail(admin: SupabaseClient, email: string): Promise<string | null> {
  const id = check((await admin.rpc("user_id_by_email", { p_email: email.trim().toLowerCase() })) as Res<string | null>);
  return id ?? null;
}

export async function writeSubscription(admin: SupabaseClient, userId: string, sub: Subscription, now = new Date()): Promise<void> {
  check(await admin.from("subscriptions").upsert({
    user_id: userId,
    provider: sub.provider,
    provider_ref: sub.providerRef,
    status: sub.status,
    current_period_end: sub.currentPeriodEnd,
    cancel_at_period_end: sub.cancelAtPeriodEnd,
    updated_at: now.toISOString(),
  }, { onConflict: "user_id" }) as Res<unknown>);
}
