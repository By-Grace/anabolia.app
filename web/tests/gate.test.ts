import { describe, it, expect } from "vitest";
import { gate, resolveAccess } from "@/lib/auth/gate";

const none = { user: false, anonymous: false, access: false };
const anon = { user: true, anonymous: true, access: false };
const member = { user: true, anonymous: false, access: false };
const paid = { user: true, anonymous: false, access: true };

describe("gate com PAYWALL ligado", () => {
  it("rotas públicas nunca bloqueiam", () => {
    for (const p of ["/entrar", "/auth/callback", "/assinar", "/assinar/teste", "/api/pagamento/webhook/teste"]) {
      expect(gate(p, none, true)).toBeNull();
    }
  });
  it("sem conta permanente vai para entrar, com volta para onde estava", () => {
    expect(gate("/hoje", none, true)).toBe("/entrar?next=%2Fhoje");
    expect(gate("/receitas/strogonoff-frango", anon, true)).toBe("/entrar?next=%2Freceitas%2Fstrogonoff-frango");
    expect(gate("/", none, true)).toBe("/entrar");
    expect(gate("/comecar", anon, true)).toBe("/entrar?next=%2Fcomecar");
  });
  it("conta sem assinatura pode fazer o cadastro e cai no paywall nas telas do app", () => {
    expect(gate("/", member, true)).toBeNull();
    expect(gate("/comecar", member, true)).toBeNull();
    for (const p of ["/hoje", "/receitas", "/cozinhar/x", "/lista", "/perfil", "/api/log-meal"]) {
      expect(gate(p, member, true)).toBe("/assinar");
    }
  });
  it("assinante passa", () => {
    for (const p of ["/", "/hoje", "/receitas", "/lista", "/perfil", "/api/log-meal/abc"]) expect(gate(p, paid, true)).toBeNull();
  });
});

describe("gate com PAYWALL desligado", () => {
  it("nada muda para quem usa hoje", () => {
    for (const p of ["/", "/hoje", "/lista", "/perfil", "/api/log-meal"]) expect(gate(p, none, false)).toBeNull();
  });
});

describe("resolveAccess", () => {
  const now = new Date("2026-11-01T12:00:00Z");
  it("usa a assinatura lida", async () => {
    expect(await resolveAccess(async () => ({ provider: "teste", providerRef: null, status: "ativa", currentPeriodEnd: null, cancelAtPeriodEnd: false }), now)).toBe(true);
    expect(await resolveAccess(async () => null, now)).toBe(false);
  });
  it("falha passageira na leitura não tranca quem paga", async () => {
    expect(await resolveAccess(async () => { throw new Error("fetch failed"); }, now)).toBe(true);
  });

describe("raiz com código de login", () => {
  it("visitante sem sessão em /?code=… não é mandado para entrar: a raiz repassa o código", () => {
    expect(gate("/", none, true, { hasCode: true })).toBeNull();
  });
});
});
