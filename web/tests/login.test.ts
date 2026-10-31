import { describe, it, expect, vi } from "vitest";
import { safeNext, sendLoginLink } from "@/lib/auth/login";

const REDIRECT = "https://app.test/auth/callback?next=%2Fhoje";

function fakeAuth(user: unknown, opts: { updateError?: unknown; otpError?: unknown } = {}) {
  const auth = {
    getUser: vi.fn().mockResolvedValue(user ? { data: { user }, error: null } : { data: { user: null }, error: { name: "AuthSessionMissingError", message: "x" } }),
    updateUser: vi.fn().mockResolvedValue({ data: {}, error: opts.updateError ?? null }),
    signInWithOtp: vi.fn().mockResolvedValue({ data: {}, error: opts.otpError ?? null }),
  };
  return { client: { auth } as never, auth };
}

describe("sendLoginLink", () => {
  it("conta anônima vira permanente pelo e-mail (updateUser), sem criar outra conta", async () => {
    const { client, auth } = fakeAuth({ id: "anon", is_anonymous: true });
    expect(await sendLoginLink(client, " Eduardo@Exemplo.com ", REDIRECT)).toEqual({ ok: true });
    expect(auth.updateUser).toHaveBeenCalledWith({ email: "eduardo@exemplo.com" }, { emailRedirectTo: REDIRECT });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("anônimo com e-mail que já tem conta entra na conta existente (signInWithOtp)", async () => {
    const { client, auth } = fakeAuth({ id: "anon", is_anonymous: true }, { updateError: { code: "email_exists", message: "exists" } });
    expect(await sendLoginLink(client, "a@b.com", REDIRECT)).toEqual({ ok: true });
    expect(auth.signInWithOtp).toHaveBeenCalledWith({ email: "a@b.com", options: { emailRedirectTo: REDIRECT, shouldCreateUser: true } });
  });

  it("sem sessão manda o link de entrar, criando a conta se for nova", async () => {
    const { client, auth } = fakeAuth(null);
    expect(await sendLoginLink(client, "a@b.com", REDIRECT)).toEqual({ ok: true });
    expect(auth.updateUser).not.toHaveBeenCalled();
    expect(auth.signInWithOtp).toHaveBeenCalledOnce();
  });

  it("e-mail inválido não chama o Supabase", async () => {
    const { client, auth } = fakeAuth(null);
    expect(await sendLoginLink(client, "eduardo@", REDIRECT)).toEqual({ ok: false, message: "Confira o e-mail." });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });

  it("limite de envio vira mensagem clara; outros erros, mensagem genérica", async () => {
    const limited = fakeAuth(null, { otpError: { code: "over_email_send_rate_limit", message: "rate" } });
    expect(await sendLoginLink(limited.client, "a@b.com", REDIRECT)).toEqual({ ok: false, message: "Muitos pedidos seguidos. Espere um minuto e tente de novo." });
    const other = fakeAuth(null, { otpError: { code: "unexpected_failure", message: "x" } });
    expect(await sendLoginLink(other.client, "a@b.com", REDIRECT)).toEqual({ ok: false, message: "Não deu para enviar o link agora. Tente de novo." });
  });
});

describe("safeNext", () => {
  it("aceita só caminho interno", () => {
    expect(safeNext("/hoje")).toBe("/hoje");
    expect(safeNext("/receitas?slot=cafe")).toBe("/receitas?slot=cafe");
    expect(safeNext("https://mal.com")).toBe("/");
    expect(safeNext("//mal.com")).toBe("/");
    expect(safeNext("/\\mal.com")).toBe("/");
    expect(safeNext(null)).toBe("/");
  });
});
