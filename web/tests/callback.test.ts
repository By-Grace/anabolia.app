import { describe, it, expect, vi, beforeEach } from "vitest";

const auth = { exchangeCodeForSession: vi.fn(), verifyOtp: vi.fn() };
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: async () => ({ auth }) }));
import { GET } from "@/app/auth/callback/route";

const call = async (qs: string) => (await GET(new Request(`https://app.test/auth/callback?${qs}`))).headers.get("location");

describe("volta do link mágico", () => {
  beforeEach(() => { auth.exchangeCodeForSession.mockReset(); auth.verifyOtp.mockReset(); });

  it("código válido leva ao destino interno", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    expect(await call("code=abc&next=%2Fassinar")).toBe("https://app.test/assinar");
  });
  it("destino externo vira a entrada do app", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: null });
    expect(await call("code=abc&next=https%3A%2F%2Fmal.com")).toBe("https://app.test/");
  });
  it("token_hash com type usa verifyOtp", async () => {
    auth.verifyOtp.mockResolvedValue({ error: null });
    expect(await call("token_hash=t1&type=email&next=%2Fhoje")).toBe("https://app.test/hoje");
    expect(auth.verifyOtp).toHaveBeenCalledWith({ token_hash: "t1", type: "email" });
  });
  it("link expirado ou sem código volta para entrar com o aviso", async () => {
    auth.exchangeCodeForSession.mockResolvedValue({ error: { message: "expired" } });
    expect(await call("code=velho")).toBe("https://app.test/entrar?erro=link");
    expect(await call("")).toBe("https://app.test/entrar?erro=link");
  });
});
