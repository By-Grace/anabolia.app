import { describe, it, expect, vi } from "vitest";
import { safeNext, sendLoginLink, verifyLoginCode } from "@/lib/auth/login";

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

describe("sendLoginLink com falha passageira", () => {
  it("erro ao ler a sessão (não 'sem sessão') não cria outra conta: devolve erro", async () => {
    const auth = {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: { name: "AuthRetryableFetchError", message: "fetch failed" } }),
      updateUser: vi.fn(), signInWithOtp: vi.fn(),
    };
    expect(await sendLoginLink({ auth } as never, "a@b.com", REDIRECT)).toEqual({ ok: false, message: "Não deu para enviar o link agora. Tente de novo." });
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
  });
  it("diz se o link é de entrada ou de conversão da conta anônima (para validar o código de 6 dígitos)", async () => {
    const anon = fakeAuth({ id: "anon", is_anonymous: true });
    expect(await sendLoginLink(anon.client, "a@b.com", REDIRECT, { withKind: true })).toEqual({ ok: true, kind: "email_change" });
    const fresh = fakeAuth(null);
    expect(await sendLoginLink(fresh.client, "a@b.com", REDIRECT, { withKind: true })).toEqual({ ok: true, kind: "email" });
  });
});

describe("verifyLoginCode", () => {
  it("valida o código de 6 dígitos com o tipo certo", async () => {
    const auth = { verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: null }) };
    expect(await verifyLoginCode({ auth } as never, " A@B.com ", "123 456", "email_change")).toEqual({ ok: true });
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: "a@b.com", token: "123456", type: "email_change" });
  });
  it("aceita o código de 8 dígitos que este projeto do Supabase envia", async () => {
    const auth = { verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: null }) };
    expect(await verifyLoginCode({ auth } as never, "a@b.com", "1234 5678", "email")).toEqual({ ok: true });
    expect(auth.verifyOtp).toHaveBeenCalledWith({ email: "a@b.com", token: "12345678", type: "email" });
  });

  it("código com formato errado nem chega ao Supabase; código recusado vira mensagem", async () => {
    const auth = { verifyOtp: vi.fn().mockResolvedValue({ data: {}, error: { message: "Token has expired or is invalid" } }) };
    expect(await verifyLoginCode({ auth } as never, "a@b.com", "12a", "email")).toEqual({ ok: false, message: "Digite só os números do código do e-mail." });
    expect(await verifyLoginCode({ auth } as never, "a@b.com", "12345", "email")).toEqual({ ok: false, message: "Digite só os números do código do e-mail." });
    expect(auth.verifyOtp).not.toHaveBeenCalled();
    expect(await verifyLoginCode({ auth } as never, "a@b.com", "123456", "email")).toEqual({ ok: false, message: "Código errado ou vencido. Peça outro link." });
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
  it("recusa caracteres de controle e barras invertidas que o navegador transforma em outro site", () => {
    expect(safeNext("/\t/evil.com")).toBe("/");
    expect(safeNext("/\n/evil.com")).toBe("/");
    expect(safeNext("/a\\b")).toBe("/");
    expect(safeNext("/hoje#topo")).toBe("/hoje#topo");
  });
});
