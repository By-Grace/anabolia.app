import { describe, it, expect } from "vitest";
import { getRecipes, getRecipe } from "@/lib/recipes/load";
import { RecipeSchema } from "@/lib/recipes/schema";

describe("receitas", () => {
  it("carrega o cardápio válido, incluindo as 3 receitas originais, em ordem alfabética", () => {
    const all = getRecipes();
    for (const slug of ["bowl-carne-batata-doce", "frango-crocante-arroz-tostado", "tapioca-frango-omelete"]) {
      expect(all.some((r) => r.slug === slug), slug).toBe(true);
    }
    const names = all.map((r) => r.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
    for (const r of all) expect(() => RecipeSchema.parse(r)).not.toThrow();
  });

  it("frango crocante: 22 min, 7 passos, 2 porções, macros calculados pela TACO", () => {
    const r = getRecipe("frango-crocante-arroz-tostado")!;
    expect(r.perPortion.protein_g).toBe(53);
    expect(r.perPortion.kcal).toBe(605);
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
