import type { SupabaseClient } from "@supabase/supabase-js";
import type { MealSlot } from "@/lib/recipes/schema";
import { DEFAULT_GOAL, type Goal, type MealLog } from "@/lib/domain/day";
import { clampPortions } from "@/lib/domain/scale";
import { localDayKey } from "./day-key";

export interface DayRepo {
  getGoal(userId: string): Promise<Goal>;
  getLogs(userId: string, dayKey: string): Promise<MealLog[]>;
  logMeal(userId: string, input: { recipeSlug: string; portions: number; slot: MealSlot; at?: Date }): Promise<MealLog>;
  getFavorites(userId: string): Promise<string[]>;
  toggleFavorite(userId: string, slug: string): Promise<boolean>;
  deleteLog(userId: string, id: string): Promise<void>;
}

type LogRow = { id: string; recipe_slug: string; portions: number; slot: MealSlot; logged_at: string };

function toLog(row: LogRow): MealLog {
  return {
    id: row.id,
    recipeSlug: row.recipe_slug,
    portions: row.portions,
    slot: row.slot,
    loggedAt: new Date(row.logged_at).toISOString(),
  };
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function supabaseDayRepo(client: SupabaseClient): DayRepo {
  return {
    async getGoal(userId) {
      const row = check(
        await client.from("profiles").select("goal_protein_g, goal_kcal").eq("user_id", userId).maybeSingle()
      ) as { goal_protein_g: number | null; goal_kcal: number | null } | null;
      if (!row || !row.goal_protein_g || !row.goal_kcal) return DEFAULT_GOAL;
      return { protein_g: row.goal_protein_g, kcal: row.goal_kcal, isDefault: false };
    },

    async getLogs(userId, dayKey) {
      const rows = check(
        await client
          .from("meal_logs")
          .select("id, recipe_slug, portions, slot, logged_at")
          .eq("user_id", userId)
          .eq("day_key", dayKey)
          .order("logged_at", { ascending: true })
      ) as LogRow[] | null;
      return (rows ?? []).map(toLog);
    },

    async logMeal(userId, { recipeSlug, portions, slot, at }) {
      const when = at ?? new Date();
      const row = check(
        await client
          .from("meal_logs")
          .insert({
            user_id: userId,
            recipe_slug: recipeSlug,
            portions: clampPortions(portions),
            slot,
            day_key: localDayKey(when),
            logged_at: when.toISOString(),
          })
          .select("id, recipe_slug, portions, slot, logged_at")
          .single()
      ) as LogRow;
      return toLog(row);
    },

    async getFavorites(userId) {
      const rows = check(
        await client.from("favorites").select("recipe_slug").eq("user_id", userId)
      ) as { recipe_slug: string }[] | null;
      return (rows ?? []).map((r) => r.recipe_slug);
    },

    async toggleFavorite(userId, slug) {
      const existing = check(
        await client.from("favorites").select("recipe_slug").eq("user_id", userId).eq("recipe_slug", slug).maybeSingle()
      );
      if (existing) {
        check(await client.from("favorites").delete().eq("user_id", userId).eq("recipe_slug", slug));
        return false;
      }
      check(await client.from("favorites").insert({ user_id: userId, recipe_slug: slug }));
      return true;
    },

    async deleteLog(userId, id) {
      check(await client.from("meal_logs").delete().eq("user_id", userId).eq("id", id));
    },
  };
}
