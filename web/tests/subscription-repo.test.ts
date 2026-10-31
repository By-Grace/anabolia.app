import { describe, it, expect } from "vitest";
import { readSubscription, recordEvent, userIdByEmail, writeSubscription } from "@/lib/data/subscription-repo";
import type { PaymentEvent, Subscription } from "@/lib/domain/access";
import { fakeSupabase } from "./fake-supabase";

const sub: Subscription = { provider: "teste", providerRef: "r1", status: "ativa", currentPeriodEnd: "2026-12-01T12:00:00.000Z", cancelAtPeriodEnd: false };
const ev: PaymentEvent = { id: "e1", provider: "teste", type: "pago", email: "a@b.com", userId: "u1", providerRef: "r1", periodEnd: sub.currentPeriodEnd };

describe("subscription-repo", () => {
  it("readSubscription converte as colunas e devolve null sem linha", async () => {
    const row = { provider: "teste", provider_ref: "r1", status: "ativa", current_period_end: "2026-12-01T12:00:00+00:00", cancel_at_period_end: false };
    const { client, calls } = fakeSupabase(() => ({ data: row, error: null }));
    expect(await readSubscription(client, "u1")).toEqual(sub);
    expect(calls[0]).toMatchObject({ table: "subscriptions", filters: { user_id: "u1" } });
    const empty = fakeSupabase(() => ({ data: null, error: null }));
    expect(await readSubscription(empty.client, "u1")).toBeNull();
  });

  it("recordEvent grava o evento e devolve 'novo'", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    expect(await recordEvent(client, ev, { bruto: 1 })).toBe("novo");
    expect(calls[0]).toMatchObject({
      table: "payment_events", kind: "insert",
      payload: { provider: "teste", provider_event_id: "e1", type: "pago", user_id: "u1", email: "a@b.com", payload: { bruto: 1 } },
    });
  });

  it("recordEvent com evento já existente: 'aplicado' se já foi aplicado, 'pendente' se não", async () => {
    const applied = fakeSupabase((op) => op.kind === "insert"
      ? { data: null, error: { message: "duplicate key", code: "23505" } }
      : { data: { applied_at: "2026-11-01T12:00:00Z" }, error: null });
    expect(await recordEvent(applied.client, ev, {})).toBe("aplicado");
    const pending = fakeSupabase((op) => op.kind === "insert"
      ? { data: null, error: { message: "duplicate key", code: "23505" } }
      : { data: { applied_at: null }, error: null });
    expect(await recordEvent(pending.client, ev, {})).toBe("pendente");
  });

  it("recordEvent propaga outros erros", async () => {
    const { client } = fakeSupabase(() => ({ data: null, error: { message: "boom", code: "XX000" } }));
    await expect(recordEvent(client, ev, {})).rejects.toThrow("boom");
  });

  it("userIdByEmail chama a função do banco com o e-mail em minúsculas", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: "u9", error: null }));
    expect(await userIdByEmail(client, " A@B.com ")).toBe("u9");
    expect(calls[0]).toMatchObject({ table: "rpc:user_id_by_email", payload: { p_email: "a@b.com" } });
  });

  it("writeSubscription faz upsert por user_id", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    await writeSubscription(client, "u1", sub, new Date("2026-11-01T12:00:00Z"));
    expect(calls[0]).toMatchObject({
      table: "subscriptions", kind: "upsert", options: { onConflict: "user_id" },
      payload: { user_id: "u1", provider: "teste", provider_ref: "r1", status: "ativa", current_period_end: sub.currentPeriodEnd, cancel_at_period_end: false, updated_at: "2026-11-01T12:00:00.000Z" },
    });
  });
});
