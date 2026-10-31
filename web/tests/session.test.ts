import { describe, it, expect, vi } from "vitest";
import { ensureSession, getUserId } from "@/lib/supabase/session";

function fakeAuth(getUser: () => unknown, signIn = vi.fn().mockResolvedValue({ data: { user: { id: "anon-1" } }, error: null })) {
  return { client: { auth: { getUser: vi.fn().mockImplementation(getUser), signInAnonymously: signIn } } as never, signIn };
}
const missing = { name: "AuthSessionMissingError", message: "Auth session missing!", __isAuthError: true };
const network = { name: "AuthRetryableFetchError", message: "fetch failed", __isAuthError: true };

describe("sessão", () => {
  it("ensureSession usa o usuário existente sem criar outro", async () => {
    const { client, signIn } = fakeAuth(() => ({ data: { user: { id: "u1" } }, error: null }));
    expect(await ensureSession(client)).toEqual({ userId: "u1" });
    expect(signIn).not.toHaveBeenCalled();
  });
  it("ensureSession entra como anônimo só quando não existe sessão", async () => {
    const { client, signIn } = fakeAuth(() => ({ data: { user: null }, error: missing }));
    expect(await ensureSession(client)).toEqual({ userId: "anon-1" });
    expect(signIn).toHaveBeenCalledOnce();
  });
  it("ensureSession NÃO troca a conta numa falha passageira do Supabase", async () => {
    const { client, signIn } = fakeAuth(() => ({ data: { user: null }, error: network }));
    await expect(ensureSession(client)).rejects.toThrow("fetch failed");
    expect(signIn).not.toHaveBeenCalled();
  });
  it("getUserId devolve null sem sessão e nunca cria usuário", async () => {
    const { client, signIn } = fakeAuth(() => ({ data: { user: null }, error: missing }));
    expect(await getUserId(client)).toBeNull();
    expect(signIn).not.toHaveBeenCalled();
  });
  it("getUserId propaga erro passageiro", async () => {
    const { client } = fakeAuth(() => ({ data: { user: null }, error: network }));
    await expect(getUserId(client)).rejects.toThrow("fetch failed");
  });
});
