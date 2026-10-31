import { describe, it, expect } from "vitest";
import { getRecipes, getRecipe } from "@/lib/recipes/load";
import { RecipeSchema } from "@/lib/recipes/schema";

describe("receitas", () => {
  it("carrega as 3 receitas seed válidas", () => {
    const all = getRecipes();
    expect(all.map((r) => r.slug)).toEqual([
      "bowl-carne-batata-doce",
      "frango-crocante-arroz-tostado",
      "tapioca-frango-omelete",
    ]);
    for (const r of all) expect(() => RecipeSchema.parse(r)).not.toThrow();
  });

  it("frango crocante tem 42 g de proteína e 610 kcal por porção, 22 min, 7 passos", () => {
    const r = getRecipe("frango-crocante-arroz-tostado")!;
    expect(r.perPortion.protein_g).toBe(42);
    expect(r.perPortion.kcal).toBe(610);
    expect(r.minutes).toBe(22);
    expect(r.steps).toHaveLength(7);
    expect(r.basePortions).toBe(2);
  });

  it("schema rejeita receita sem ingredientes e aceita receita sem foto", () => {
    const base = getRecipe("tapioca-frango-omelete")!;
    expect(() => RecipeSchema.parse({ ...base, ingredients: [] })).toThrow();
    expect(() => RecipeSchema.parse({ ...base, photo: undefined })).not.toThrow();
  });

  it("getRecipe de slug inexistente retorna undefined", () => {
    expect(getRecipe("nada")).toBeUndefined();
  });
});
