import { describe, it, expect } from "vitest";
import { supabaseListRepo } from "@/lib/data/list-repo";
import { fakeSupabase } from "./fake-supabase";

describe("supabaseListRepo", () => {
  it("getList devolve as entradas do usuário", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: [{ recipe_slug: "a", portions: 2, checked: [1] }], error: null }));
    expect(await supabaseListRepo(client).getList("u1")).toEqual([{ recipeSlug: "a", portions: 2, checked: [1] }]);
    expect(calls[0]).toMatchObject({ table: "shopping_list", kind: "select", filters: { user_id: "u1" } });
  });

  it("add de receita nova faz upsert de user_id, recipe_slug e portions com onConflict user_id,recipe_slug", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    await supabaseListRepo(client).add("u1", "a", 3);
    expect(calls.find((c) => c.kind === "upsert")).toMatchObject({
      payload: { user_id: "u1", recipe_slug: "a", portions: 3 }, options: { onConflict: "user_id,recipe_slug" },
    });
  });

  it("add com outras porções troca as porções e desmarca os itens (as quantidades mudaram)", async () => {
    const { client, calls } = fakeSupabase((op) => ({ data: op.kind === "select" ? { portions: 2 } : null, error: null }));
    await supabaseListRepo(client).add("u1", "a", 4);
    expect(calls.find((c) => c.kind === "update")).toMatchObject({ payload: { portions: 4, checked: [] }, filters: { user_id: "u1", recipe_slug: "a" } });
  });

  it("add com as mesmas porções não mexe no que já foi marcado", async () => {
    const { client, calls } = fakeSupabase((op) => ({ data: op.kind === "select" ? { portions: 2 } : null, error: null }));
    await supabaseListRepo(client).add("u1", "a", 2);
    expect(calls.filter((c) => c.kind !== "select")).toHaveLength(0);
  });

  it("setChecked(true) acrescenta o índice uma vez só; setChecked(false) remove", async () => {
    let stored = [1];
    const { client, calls } = fakeSupabase((op) => {
      if (op.kind === "select") return { data: { checked: stored }, error: null };
      stored = (op.payload as { checked: number[] }).checked;
      return { data: null, error: null };
    });
    const repo = supabaseListRepo(client);
    await repo.setChecked("u1", "a", 4, true);
    expect(stored).toEqual([1, 4]);
    await repo.setChecked("u1", "a", 4, true);
    expect(stored).toEqual([1, 4]);
    await repo.setChecked("u1", "a", 1, false);
    expect(stored).toEqual([4]);
    expect(calls.find((c) => c.kind === "update")!.filters).toEqual({ user_id: "u1", recipe_slug: "a" });
  });

  it("setChecked numa receita que não está na lista não grava nada", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    await supabaseListRepo(client).setChecked("u1", "a", 0, true);
    expect(calls.filter((c) => c.kind === "update")).toHaveLength(0);
  });

  it("remove apaga uma receita; clear apaga só as linhas do usuário", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    const repo = supabaseListRepo(client);
    await repo.remove("u1", "a");
    await repo.clear("u1");
    expect(calls.map((c) => [c.kind, c.filters])).toEqual([
      ["delete", { user_id: "u1", recipe_slug: "a" }],
      ["delete", { user_id: "u1" }],
    ]);
  });
});
