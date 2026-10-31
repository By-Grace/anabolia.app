import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getProvider } from "@/lib/payments";
import { signTeste, testePaidEvent } from "@/lib/payments/teste";
import { applyPaymentEvent } from "@/lib/payments/apply";
import type { PaymentEvent } from "@/lib/domain/access";
import { fakeSupabase } from "./fake-supabase";

const SECRET = "s3gredo-de-teste";
const body = JSON.stringify({ id: "ev-1", type: "pago", email: "a@b.com", userId: "u1", providerRef: "r1", periodEnd: "2026-12-01T12:00:00.000Z" });
const req = (b: string, sig?: string) =>
  new Request("http://x/api/pagamento/webhook/teste", { method: "POST", body: b, headers: sig ? { "x-assinatura": sig } : {} });

describe("adaptador de teste", () => {
  beforeEach(() => { process.env.PAYMENT_WEBHOOK_SECRET = SECRET; });
  afterEach(() => { delete process.env.PAYMENT_WEBHOOK_SECRET; });

  it("aceita corpo com assinatura HMAC certa e normaliza o evento", async () => {
    const r = await getProvider("teste")!.parseWebhook(req(body, signTeste(body, SECRET)));
    expect(r?.event).toEqual({ id: "ev-1", provider: "teste", type: "pago", email: "a@b.com", userId: "u1", providerRef: "r1", periodEnd: "2026-12-01T12:00:00.000Z" });
    expect(r?.raw).toEqual(JSON.parse(body));
  });

  it("recusa assinatura errada ou ausente", async () => {
    expect(await getProvider("teste")!.parseWebhook(req(body, signTeste(body, "outro")))).toBeNull();
    expect(await getProvider("teste")!.parseWebhook(req(body))).toBeNull();
  });

  it("recusa corpo inválido mesmo assinado", async () => {
    const bad = JSON.stringify({ id: "ev-1", type: "voou" });
    expect(await getProvider("teste")!.parseWebhook(req(bad, signTeste(bad, SECRET)))).toBeNull();
  });

  it("sem segredo configurado, avisa em vez de aceitar", async () => {
    delete process.env.PAYMENT_WEBHOOK_SECRET;
    await expect(getProvider("teste")!.parseWebhook(req(body, "x"))).rejects.toThrow("Falta PAYMENT_WEBHOOK_SECRET");
  });

  it("checkout de teste é a página interna e o pagamento simulado vale 30 dias", async () => {
    expect(await getProvider("teste")!.checkoutUrl({ userId: "u1", email: "a@b.com" })).toBe("/assinar/teste");
    const e = testePaidEvent("u1", "a@b.com", new Date("2026-11-01T12:00:00Z"));
    expect(e).toMatchObject({ provider: "teste", type: "pago", userId: "u1", periodEnd: "2026-12-01T12:00:00.000Z" });
  });

  it("cancelar devolve o evento 'cancelado' da pessoa", async () => {
    const e = await getProvider("teste")!.cancel("u1");
    expect(e).toMatchObject({ provider: "teste", type: "cancelado", userId: "u1" });
  });
});

describe("provedores", () => {
  it("padrão é o de teste; desconhecido devolve null", () => {
    delete process.env.PAYMENT_PROVIDER;
    expect(getProvider()?.id).toBe("teste");
    expect(getProvider("xyz")).toBeNull();
  });

  it("OnProfit ainda não configurada recusa com mensagem clara", async () => {
    await expect(getProvider("onprofit")!.checkoutUrl({ userId: "u1", email: "a@b.com" })).rejects.toThrow("OnProfit ainda não configurada");
  });
});

describe("applyPaymentEvent", () => {
  const ev: PaymentEvent = { id: "ev-1", provider: "teste", type: "pago", email: "a@b.com", userId: null, providerRef: "r1", periodEnd: "2026-12-01T12:00:00.000Z" };

  it("resolve a pessoa pelo e-mail, grava o evento e a assinatura ativa", async () => {
    const { client, calls } = fakeSupabase((op) => {
      if (op.table === "rpc:user_id_by_email") return { data: "u7", error: null };
      return { data: null, error: null };
    });
    expect(await applyPaymentEvent(client, ev, { cru: true })).toBe("aplicado");
    expect(calls.find((c) => c.table === "payment_events")?.payload).toMatchObject({ user_id: "u7" });
    expect(calls.find((c) => c.table === "subscriptions" && c.kind === "upsert")?.payload).toMatchObject({ user_id: "u7", status: "ativa" });
  });

  it("evento repetido não grava a assinatura de novo", async () => {
    const { client, calls } = fakeSupabase((op) => {
      if (op.table === "payment_events") return { data: null, error: { message: "duplicate", code: "23505" } };
      return { data: null, error: null };
    });
    expect(await applyPaymentEvent(client, { ...ev, userId: "u1" }, {})).toBe("repetido");
    expect(calls.some((c) => c.table === "subscriptions")).toBe(false);
  });

  it("se gravar a assinatura falha, apaga o evento para o reenvio do provedor valer", async () => {
    const { client, calls } = fakeSupabase((op) => {
      if (op.table === "subscriptions" && op.kind === "upsert") return { data: null, error: { message: "caiu" } };
      return { data: null, error: null };
    });
    await expect(applyPaymentEvent(client, { ...ev, userId: "u1" }, {})).rejects.toThrow("caiu");
    expect(calls.find((c) => c.table === "payment_events" && c.kind === "delete")?.filters)
      .toEqual({ provider: "teste", provider_event_id: "ev-1" });
  });

  it("e-mail sem conta registra o evento e devolve 'sem-usuario'", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    expect(await applyPaymentEvent(client, ev, {})).toBe("sem-usuario");
    expect(calls.some((c) => c.table === "payment_events")).toBe(true);
    expect(calls.some((c) => c.table === "subscriptions")).toBe(false);
  });
});

describe("rota do webhook", () => {
  beforeEach(() => { process.env.PAYMENT_WEBHOOK_SECRET = SECRET; vi.resetModules(); });
  afterEach(() => { delete process.env.PAYMENT_WEBHOOK_SECRET; vi.doUnmock("@/lib/supabase/admin"); });

  async function post(provider: string, r: Request) {
    const { client } = fakeSupabase(() => ({ data: null, error: null }));
    vi.doMock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => client }));
    const { POST } = await import("@/app/api/pagamento/webhook/[provider]/route");
    return POST(r, { params: Promise.resolve({ provider }) });
  }

  it("200 com assinatura certa, 401 errada, 404 provedor desconhecido, 503 sem segredo", async () => {
    expect((await post("teste", req(body, signTeste(body, SECRET)))).status).toBe(200);
    expect((await post("teste", req(body, "errada"))).status).toBe(401);
    expect((await post("nada", req(body, signTeste(body, SECRET)))).status).toBe(404);
    delete process.env.PAYMENT_WEBHOOK_SECRET;
    expect((await post("teste", req(body, "x"))).status).toBe(503);
  });
});
