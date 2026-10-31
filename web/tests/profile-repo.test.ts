import { describe, it, expect } from "vitest";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { DEFAULT_GOAL } from "@/lib/domain/day";
import { fakeSupabase } from "./fake-supabase";

const NOW = new Date("2026-11-01T15:00:00Z");
const full = {
  goal_protein_g: 160, goal_kcal: 3150, sex: "m", birth_year: 1996, weight_kg: "80.5", height_cm: 180, activity: "moderado",
};

describe("supabaseProfileRepo", () => {
  it("getProfile sem linha devolve body null e DEFAULT_GOAL", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    expect(await supabaseProfileRepo(client).getProfile("u1", NOW)).toEqual({ body: null, goal: DEFAULT_GOAL });
    expect(calls[0]).toMatchObject({ table: "profiles", kind: "select", filters: { user_id: "u1" } });
  });

  it("getProfile com linha completa converte birth_year em idade e weight_kg em número", async () => {
    const { client } = fakeSupabase(() => ({ data: full, error: null }));
    expect(await supabaseProfileRepo(client).getProfile("u1", NOW)).toEqual({
      body: { sex: "m", age: 30, weightKg: 80.5, heightCm: 180, activity: "moderado" },
      goal: { protein_g: 160, kcal: 3150, isDefault: false },
    });
  });

  it("getProfile com corpo incompleto (sem activity) devolve body null e a meta salva", async () => {
    const { client } = fakeSupabase(() => ({ data: { ...full, activity: null }, error: null }));
    const p = await supabaseProfileRepo(client).getProfile("u1", NOW);
    expect(p.body).toBeNull();
    expect(p.goal).toEqual({ protein_g: 160, kcal: 3150, isDefault: false });
  });

  it("saveBody faz upsert do corpo, da meta e de updated_at, com birth_year = ano atual − idade", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    await supabaseProfileRepo(client).saveBody(
      "u1", { sex: "f", age: 25, weightKg: 60.5, heightCm: 165, activity: "leve" }, { protein_g: 120, kcal: 2150 }, NOW,
    );
    expect(calls[0].kind).toBe("upsert");
    expect(calls[0].table).toBe("profiles");
    expect(calls[0].payload).toEqual({
      user_id: "u1", sex: "f", birth_year: 2001, weight_kg: 60.5, height_cm: 165, activity: "leve",
      goal_protein_g: 120, goal_kcal: 2150, updated_at: NOW.toISOString(),
    });
    expect(calls[0].options).toEqual({ onConflict: "user_id" });
  });

  it("saveGoal faz upsert só de goal_protein_g, goal_kcal e updated_at", async () => {
    const { client, calls } = fakeSupabase(() => ({ data: null, error: null }));
    await supabaseProfileRepo(client).saveGoal("u1", { protein_g: 170, kcal: 3300 }, NOW);
    expect(calls[0].payload).toEqual({ user_id: "u1", goal_protein_g: 170, goal_kcal: 3300, updated_at: NOW.toISOString() });
  });

  it("erro do Supabase vira exceção com a mensagem", async () => {
    const { client } = fakeSupabase(() => ({ data: null, error: { message: "boom" } }));
    await expect(supabaseProfileRepo(client).getProfile("u1")).rejects.toThrow("boom");
    await expect(supabaseProfileRepo(client).saveGoal("u1", { protein_g: 170, kcal: 3300 })).rejects.toThrow("boom");
  });
});
