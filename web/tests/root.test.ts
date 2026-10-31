import { describe, it, expect, vi } from "vitest";

const redirect = vi.fn((url: string) => { throw Object.assign(new Error("NEXT_REDIRECT"), { url }); });
vi.mock("next/navigation", () => ({ redirect: (u: string) => redirect(u) }));
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: async () => ({ auth: { getUser: async () => ({ data: { user: null }, error: { name: "AuthSessionMissingError" } }) } }) }));
import Home from "@/app/page";

const target = async (sp: Record<string, string>) => {
  try { await Home({ searchParams: Promise.resolve(sp) }); return null; } catch (e) { return (e as { url?: string }).url; }
};

describe("entrada do app", () => {
  it("link do e-mail que caiu na raiz (Site URL do Supabase) segue para a troca do código", async () => {
    expect(await target({ code: "abc" })).toBe("/auth/callback?code=abc&next=%2F");
  });
  it("sem código, visitante novo vai para o cadastro", async () => {
    expect(await target({})).toBe("/comecar");
  });
});
