import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListEntry } from "@/lib/domain/shopping";
import { clampPortions } from "@/lib/domain/scale";

export interface ListRepo {
  getList(userId: string): Promise<ListEntry[]>;
  add(userId: string, slug: string, portions: number): Promise<void>;
  /** Grava o estado final do item (idempotente): dois toques rápidos terminam no último. */
  setChecked(userId: string, slug: string, index: number, checked: boolean): Promise<void>;
  remove(userId: string, slug: string): Promise<void>;
  clear(userId: string): Promise<void>;
}

function check<T>(res: { data: T; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return res.data;
}

export function supabaseListRepo(client: SupabaseClient): ListRepo {
  const table = () => client.from("shopping_list");
  return {
    async getList(userId) {
      const rows = check(
        await table().select("recipe_slug, portions, checked").eq("user_id", userId).order("added_at", { ascending: true })
      ) as { recipe_slug: string; portions: number; checked: number[] | null }[] | null;
      return (rows ?? []).map((r) => ({ recipeSlug: r.recipe_slug, portions: r.portions, checked: r.checked ?? [] }));
    },

    async add(userId, slug, portions) {
      check(await table().upsert(
        { user_id: userId, recipe_slug: slug, portions: clampPortions(portions) },
        { onConflict: "user_id,recipe_slug" },
      ));
    },

    async setChecked(userId, slug, index, on) {
      const row = check(
        await table().select("checked").eq("user_id", userId).eq("recipe_slug", slug).maybeSingle()
      ) as { checked: number[] | null } | null;
      if (!row) return;
      const set = new Set(row.checked ?? []);
      if (on) set.add(index);
      else set.delete(index);
      check(await table().update({ checked: [...set].sort((a, b) => a - b) }).eq("user_id", userId).eq("recipe_slug", slug));
    },

    async remove(userId, slug) {
      check(await table().delete().eq("user_id", userId).eq("recipe_slug", slug));
    },

    async clear(userId) {
      check(await table().delete().eq("user_id", userId));
    },
  };
}
