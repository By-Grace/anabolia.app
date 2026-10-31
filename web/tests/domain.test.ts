import { describe, it, expect } from "vitest";
import { getRecipe, getRecipes } from "@/lib/recipes/load";
import { scaleIngredients, macrosFor } from "@/lib/domain/scale";
import { dayTotals, DEFAULT_GOAL, type MealLog } from "@/lib/domain/day";
import { slotForHour, suggest } from "@/lib/domain/suggest";
import { fakeRecipe } from "./fixtures";

const frango = getRecipe("frango-crocante-arroz-tostado")!;
const log = (recipeSlug: string, portions = 1, slot: MealLog["slot"] = "almoco"): MealLog => ({
  id: recipeSlug + slot, recipeSlug, portions, slot, loggedAt: "2026-10-31T15:00:00.000Z",
});

describe("escala de porções", () => {
  it("escala 400 g de frango para 3 porções em base 2 → 600 g; 'a gosto' não escala", () => {
    const ing = scaleIngredients(frango, 3);
    expect(ing.find((i) => i.name === "peito de frango")!.qty).toBe(600);
    const sal = ing.find((i) => i.unit === "a gosto")!;
    expect(sal.qty).toBe(0);
  });
  it("porções clampam em [1,8]: 0 → 1, 9 → 8", () => {
    expect(scaleIngredients(frango, 0).find((i) => i.name === "peito de frango")!.qty).toBe(200);
    expect(scaleIngredients(frango, 9).find((i) => i.name === "peito de frango")!.qty).toBe(1600);
  });
  it("ingrediente de 1 un em 1 porção de base 2 não vira 0", () => {
    expect(scaleIngredients(frango, 1).find((i) => i.name === "ovo")!.qty).toBe(1);
  });
  it("macrosFor multiplica por porções e clampa", () => {
    expect(macrosFor(frango, 3)).toEqual({ kcal: 1830, protein_g: 126, carbs_g: 174, fat_g: 63 });
    expect(macrosFor(frango, 0).protein_g).toBe(42);
  });
});

describe("totais do dia", () => {
  const recipes = [fakeRecipe("a", 31, ["cafe"]), fakeRecipe("b", 42)];
  it("dayTotals com 2 refeições (31 g + 42 g) e meta 160 → faltam 87, progress 0.456, goalMet false, mealsDone 2", () => {
    const t = dayTotals([log("a", 1, "cafe"), log("b")], recipes, { protein_g: 160, kcal: 3100, isDefault: false });
    expect(t.protein_g).toBe(73);
    expect(t.remainingProtein_g).toBe(87);
    expect(t.progress).toBeCloseTo(0.456, 3);
    expect(t.goalMet).toBe(false);
    expect(t.mealsDone).toBe(2);
  });
  it("dayTotals acima da meta → remaining 0, progress 1, goalMet true", () => {
    const t = dayTotals([log("b", 4)], recipes, { protein_g: 160, kcal: 3100, isDefault: false });
    expect(t.protein_g).toBe(168);
    expect(t.remainingProtein_g).toBe(0);
    expect(t.progress).toBe(1);
    expect(t.goalMet).toBe(true);
  });
  it("dayTotals sem meta usa DEFAULT_GOAL e marca isDefault", () => {
    expect(DEFAULT_GOAL).toEqual({ protein_g: 160, kcal: 3100, isDefault: true });
    expect(dayTotals([log("b")], recipes).remainingProtein_g).toBe(118);
  });
  it("log de receita que não existe mais é ignorado", () => {
    const t = dayTotals([log("sumiu"), log("b")], recipes, DEFAULT_GOAL);
    expect(t.protein_g).toBe(42);
    expect(t.mealsDone).toBe(1);
  });
});

describe("sugestões", () => {
  it("slotForHour(21) = jantar, (8) = cafe, (12) = almoco, (16) = lanche, (2) = jantar", () => {
    expect([21, 8, 12, 16, 2, 5, 11, 15, 18, 4].map(slotForHour)).toEqual(
      ["jantar", "cafe", "almoco", "lanche", "jantar", "cafe", "almoco", "lanche", "jantar", "jantar"]
    );
  });
  it("suggest para jantar com 87 g faltando ordena bowl (45) antes de frango (42); tapioca fora do slot é excluída", () => {
    expect(suggest(getRecipes(), 87, "jantar").map((r) => r.slug)).toEqual([
      "bowl-carne-batata-doce",
      "frango-crocante-arroz-tostado",
    ]);
  });
  it("suggest respeita limit", () => {
    expect(suggest(getRecipes(), 87, "jantar", 1)).toHaveLength(1);
  });
});
