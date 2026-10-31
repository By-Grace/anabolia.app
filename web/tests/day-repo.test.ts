import { describe, it, expect } from "vitest";
import { supabaseDayRepo } from "@/lib/data/day-repo";
import { DEFAULT_GOAL } from "@/lib/domain/day";
import { fakeSupabase } from "./fake-supabase";

describe("supabaseDayRepo", () => {
  it("getGoal sem profile devolve DEFAULT_GOAL", async () => {
    const { client } = fakeSupabase(() => ({ data: null, error: null }));
    expect(await supabaseDayRepo(client).getGoal("u1")).toEqual(DEFAULT_GOAL);
  });

  it("getGoal com profile devolve a meta do usuário", async () => {
    const { client } = fakeSupabase(() => ({ data: { goal_protein_g: 180, goal_kcal: 3300 }, error: null }));
    expect(await supabaseDayRepo(client).getGoal("u1")).toEqual({ protein_g: 180, kcal: 3300, isDefault: false });
  });

  it("logMeal grava day_key do dia local e devolve MealLog", async () => {
    const { client, calls } = fakeSupabase((op) => ({
      data: { id: "l1", ...(op.payload as object), logged_at: "2026-11-01T02:30:00+00:00" },
      error: null,
    }));
    const log = await supabaseDayRepo(client).logMeal("u1", {
      recipeSlug: "frango-crocante-arroz-tostado", portions: 2, slot: "jantar", at: new Date("2026-11-01T02:30:00Z"),
    });
    expect(calls[0].kind).toBe("insert");
    expect(calls[0].payload).toMatchObject({ user_id: "u1", recipe_slug: "frango-crocante-arroz-tostado", portions: 2, slot: "jantar", day_key: "2026-10-31" });
    expect(log).toEqual({ id: "l1", recipeSlug: "frango-crocante-arroz-tostado", portions: 2, slot: "jantar", loggedAt: "2026-11-01T02:30:00.000Z" });
  });

  it("getLogs filtra por usuário e dia", async () => {
    const { client, calls } = fakeSupabase(() => ({
      data: [{ id: "l1", recipe_slug: "a", portions: 1, slot: "cafe", logged_at: "2026-10-31T11:00:00+00:00" }],
      error: null,
    }));
    const logs = await supabaseDayRepo(client).getLogs("u1", "2026-10-31");
    expect(calls[0].filters).toEqual({ user_id: "u1", day_key: "2026-10-31" });
    expect(logs).toHaveLength(1);
    expect(logs[0].recipeSlug).toBe("a");
  });

  it("toggleFavorite insere quando ausente e apaga quando presente", async () => {
    let present = false;
    const { client, calls } = fakeSupabase((op) => {
      if (op.kind === "select") return { data: present ? { recipe_slug: "a" } : null, error: null };
      if (op.kind === "insert") { present = true; return { data: null, error: null }; }
      present = false; return { data: null, error: null };
    });
    const repo = supabaseDayRepo(client);
    expect(await repo.toggleFavorite("u1", "a")).toBe(true);
    expect(await repo.toggleFavorite("u1", "a")).toBe(false);
    expect(calls.map((c) => c.kind)).toEqual(["select", "insert", "select", "delete"]);
  });

  it("erro do Supabase vira exceção com a mensagem", async () => {
    const { client } = fakeSupabase(() => ({ data: null, error: { message: "permission denied" } }));
    await expect(supabaseDayRepo(client).getLogs("u1", "2026-10-31")).rejects.toThrow("permission denied");
  });
});
