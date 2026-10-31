import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_GOAL, type Goal } from "@/lib/domain/day";
import type { Activity, Body, Sex } from "@/lib/domain/goal";

export type Profile = { body: Body | null; goal: Goal };
export type GoalInput = { protein_g: number; kcal: number };

export interface ProfileRepo {
  getProfile(userId: string, now?: Date): Promise<Profile>;
  saveBody(userId: string, body: Body, goal: GoalInput, now?: Date): Promise<void>;
  saveGoal(userId: string, goal: GoalInput, now?: Date): Promise<void>;
}

type Row = {
  goal_protein_g: number | null; goal_kcal: number | null;
  sex: Sex | null; birth_year: number | null; weight_kg: number | string | null; height_cm: number | null; activity: Activity | null;
};

const COLUMNS = "goal_protein_g, goal_kcal, sex, birth_year, weight_kg, height_cm, activity";

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

function toProfile(row: Row | null, now: Date): Profile {
  if (!row) return { body: null, goal: DEFAULT_GOAL };
  const goal = row.goal_protein_g && row.goal_kcal
    ? { protein_g: row.goal_protein_g, kcal: row.goal_kcal, isDefault: false }
    : DEFAULT_GOAL;
  const { sex, birth_year, weight_kg, height_cm, activity } = row;
  const body = sex && birth_year && weight_kg != null && height_cm && activity
    ? { sex, age: now.getFullYear() - birth_year, weightKg: Number(weight_kg), heightCm: height_cm, activity }
    : null;
  return { body, goal };
}

export function supabaseProfileRepo(client: SupabaseClient): ProfileRepo {
  return {
    async getProfile(userId, now = new Date()) {
      const row = check(
        await client.from("profiles").select(COLUMNS).eq("user_id", userId).maybeSingle()
      ) as Row | null;
      return toProfile(row, now);
    },

    async saveBody(userId, body, goal, now = new Date()) {
      check(await client.from("profiles").upsert({
        user_id: userId,
        sex: body.sex,
        birth_year: now.getFullYear() - body.age,
        weight_kg: body.weightKg,
        height_cm: body.heightCm,
        activity: body.activity,
        goal_protein_g: goal.protein_g,
        goal_kcal: goal.kcal,
        updated_at: now.toISOString(),
      }, { onConflict: "user_id" }));
    },

    async saveGoal(userId, goal, now = new Date()) {
      check(await client.from("profiles").upsert({
        user_id: userId, goal_protein_g: goal.protein_g, goal_kcal: goal.kcal, updated_at: now.toISOString(),
      }, { onConflict: "user_id" }));
    },
  };
}
