import { describe, it, expect } from "vitest";
import { PLAN, applyEvent, hasAccess, type PaymentEvent, type Subscription } from "@/lib/domain/access";

const NOW = new Date("2026-11-01T12:00:00Z");
const FUTURE = "2026-11-20T12:00:00.000Z";
const PAST = "2026-10-20T12:00:00.000Z";
const sub = (s: Partial<Subscription> = {}): Subscription => ({
  provider: "teste", providerRef: "r1", status: "ativa", currentPeriodEnd: FUTURE, cancelAtPeriodEnd: false, ...s,
});
const ev = (type: PaymentEvent["type"], e: Partial<PaymentEvent> = {}): PaymentEvent => ({
  id: "e1", provider: "teste", type, email: "a@b.com", userId: "u1", providerRef: "r1", periodEnd: null, ...e,
});

describe("hasAccess", () => {
  it("sem assinatura não tem acesso", () => {
    expect(hasAccess(null, NOW)).toBe(false);
  });
  it("ativa tem acesso; pendente não", () => {
    expect(hasAccess(sub(), NOW)).toBe(true);
    expect(hasAccess(sub({ status: "pendente" }), NOW)).toBe(false);
  });
  it("cancelada ou atrasada mantém o acesso até o fim do período", () => {
    expect(hasAccess(sub({ status: "cancelada" }), NOW)).toBe(true);
    expect(hasAccess(sub({ status: "atrasada" }), NOW)).toBe(true);
    expect(hasAccess(sub({ status: "cancelada", currentPeriodEnd: PAST }), NOW)).toBe(false);
    expect(hasAccess(sub({ status: "atrasada", currentPeriodEnd: null }), NOW)).toBe(false);
  });
  it("reembolsada corta na hora, mesmo com período no futuro", () => {
    expect(hasAccess(sub({ status: "reembolsada" }), NOW)).toBe(false);
  });
});

describe("applyEvent", () => {
  it("pago vira ativa com o novo fim do período e desfaz o cancelamento agendado", () => {
    const next = applyEvent(sub({ status: "cancelada", cancelAtPeriodEnd: true }), ev("pago", { periodEnd: "2026-12-01T12:00:00.000Z" }));
    expect(next).toMatchObject({ status: "ativa", currentPeriodEnd: "2026-12-01T12:00:00.000Z", cancelAtPeriodEnd: false });
  });
  it("pago sem assinatura anterior cria a assinatura com provedor e referência do evento", () => {
    expect(applyEvent(null, ev("pago", { periodEnd: FUTURE, providerRef: "r9" }))).toEqual({
      provider: "teste", providerRef: "r9", status: "ativa", currentPeriodEnd: FUTURE, cancelAtPeriodEnd: false,
    });
  });
  it("cancelado mantém o fim do período e marca o cancelamento", () => {
    expect(applyEvent(sub(), ev("cancelado"))).toMatchObject({ status: "cancelada", currentPeriodEnd: FUTURE, cancelAtPeriodEnd: true });
  });
  it("pendente sobre uma ativa não derruba o acesso; sem assinatura vira pendente", () => {
    expect(applyEvent(sub(), ev("pendente")).status).toBe("ativa");
    expect(applyEvent(null, ev("pendente")).status).toBe("pendente");
  });
  it("atrasado vira atrasada mantendo o fim; reembolsado vira reembolsada", () => {
    expect(applyEvent(sub(), ev("atrasado"))).toMatchObject({ status: "atrasada", currentPeriodEnd: FUTURE });
    expect(applyEvent(sub(), ev("reembolsado")).status).toBe("reembolsada");
  });
});

describe("PLAN", () => {
  it("é R$ 29,90 por mês, 30 dias", () => {
    expect(PLAN).toEqual({ id: "mensal", priceCents: 2990, label: "R$ 29,90 por mês", periodDays: 30 });
  });
});
