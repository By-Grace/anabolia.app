import type { Recipe } from "@/lib/recipes/schema";
import { DEFAULT_TZ, localDayKey } from "@/lib/data/day-key";
import type { Goal, MealLog } from "./day";
import { macrosFor } from "./scale";

export type DayLog = MealLog & { dayKey: string };

export type DayBar = {
  dayKey: string;
  weekday: string;
  protein_g: number;
  progress: number;
  met: boolean;
  isToday: boolean;
};

const DAY_MS = 86_400_000;
const keyToUtcNoon = (key: string) => {
  const [y, m, d] = key.split("-").map(Number);
  return Date.UTC(y, m - 1, d, 12);
};
const utcKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const weekdayFmt = new Intl.DateTimeFormat("pt-BR", { weekday: "short", timeZone: "UTC" });

/** As `n` chaves de dia que terminam hoje (no fuso), da mais antiga para hoje. Conta em UTC ao meio-dia: sem horário de verão. */
export function lastDayKeys(today: Date, n = 7, tz: string = DEFAULT_TZ): string[] {
  const end = keyToUtcNoon(localDayKey(today, tz));
  return Array.from({ length: n }, (_, i) => utcKey(end - (n - 1 - i) * DAY_MS));
}

/** "sáb" para "2026-10-31". */
export function weekdayOf(key: string): string {
  return weekdayFmt.format(new Date(keyToUtcNoon(key))).replace(".", "").toLowerCase();
}

/** Proteína por dia nos últimos 7 dias, contra a meta. Receitas que sumiram do conteúdo não contam. */
export function weekHistory(logs: DayLog[], recipes: Recipe[], goal: Goal, today: Date, tz: string = DEFAULT_TZ) {
  const keys = lastDayKeys(today, 7, tz);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const totals = new Map(keys.map((k) => [k, 0]));
  const logged = new Set<string>();
  for (const l of logs) {
    const recipe = bySlug.get(l.recipeSlug);
    if (!recipe || !totals.has(l.dayKey)) continue;
    totals.set(l.dayKey, totals.get(l.dayKey)! + macrosFor(recipe, l.portions).protein_g);
    logged.add(l.dayKey);
  }
  const target = Math.max(1, goal.protein_g);
  const days: DayBar[] = keys.map((dayKey, i) => {
    const protein_g = totals.get(dayKey)!;
    return {
      dayKey,
      weekday: weekdayOf(dayKey),
      protein_g,
      progress: Math.min(1, protein_g / target),
      met: protein_g >= goal.protein_g,
      isToday: i === keys.length - 1,
    };
  });
  const loggedDays = days.filter((d) => logged.has(d.dayKey));
  const averageLogged_g = loggedDays.length
    ? Math.round(loggedDays.reduce((s, d) => s + d.protein_g, 0) / loggedDays.length)
    : 0;
  return { days, averageLogged_g, metCount: days.filter((d) => d.met).length };
}

export type WeekHistory = ReturnType<typeof weekHistory>;
