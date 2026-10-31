import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Subscription } from "@/lib/domain/access";

const getUser = vi.fn();
const readSubscription = vi.fn();
const applyPaymentEvent = vi.fn();
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: async () => ({ auth: { getUser } }) }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({ admin: true }) }));
vi.mock("@/lib/data/subscription-repo", () => ({ readSubscription: (...a: unknown[]) => readSubscription(...a) }));
vi.mock("@/lib/payments/apply", () => ({ applyPaymentEvent: (...a: unknown[]) => applyPaymentEvent(...a) }));
import { cancelSubscriptionAction } from "@/app/perfil/actions";

const active: Subscription = { provider: "teste", providerRef: "r1", status: "ativa", currentPeriodEnd: "2026-12-01T12:00:00.000Z", cancelAtPeriodEnd: false };
const permanent = { data: { user: { id: "u1", email: "a@b.com", is_anonymous: false } } };

describe("cancelSubscriptionAction", () => {
  beforeEach(() => { getUser.mockReset(); readSubscription.mockReset(); applyPaymentEvent.mockReset(); });

  it("pede ao provedor da assinatura, aplica 'cancelado' para a pessoa e devolve o novo estado", async () => {
    getUser.mockResolvedValue(permanent);
    const canceled = { ...active, status: "cancelada", cancelAtPeriodEnd: true };
    readSubscription.mockResolvedValueOnce(active).mockResolvedValueOnce(canceled);
    applyPaymentEvent.mockResolvedValue("aplicado");
    expect(await cancelSubscriptionAction()).toEqual({ ok: true, subscription: canceled });
    expect(applyPaymentEvent.mock.calls[0][1]).toMatchObject({ provider: "teste", type: "cancelado", userId: "u1" });
  });

  it("sem conta permanente ou sem assinatura, não chama o provedor", async () => {
    getUser.mockResolvedValue({ data: { user: { id: "anon", is_anonymous: true } } });
    expect(await cancelSubscriptionAction()).toEqual({ ok: false, message: "Entre na sua conta para cancelar." });
    getUser.mockResolvedValue(permanent);
    readSubscription.mockResolvedValue(null);
    expect(await cancelSubscriptionAction()).toEqual({ ok: false, message: "Você não tem assinatura ativa." });
    expect(applyPaymentEvent).not.toHaveBeenCalled();
  });

  it("provedor ainda não configurado vira mensagem clara", async () => {
    getUser.mockResolvedValue(permanent);
    readSubscription.mockResolvedValue({ ...active, provider: "onprofit" });
    expect(await cancelSubscriptionAction()).toEqual({ ok: false, message: "O cancelamento ainda não está disponível pelo app. Fale com o suporte." });
  });

  it("só cancela assinatura ativa ainda não cancelada (a ação é um endpoint público)", async () => {
    getUser.mockResolvedValue(permanent);
    for (const s of [{ ...active, status: "reembolsada" }, { ...active, status: "cancelada", cancelAtPeriodEnd: true }]) {
      readSubscription.mockResolvedValueOnce(s);
      expect(await cancelSubscriptionAction()).toEqual({ ok: false, message: "Você não tem assinatura ativa." });
    }
    expect(applyPaymentEvent).not.toHaveBeenCalled();
  });
});
