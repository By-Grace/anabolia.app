import { describe, it, expect } from "vitest";
import { shoppingGroups } from "@/lib/domain/shopping";
import { fakeRecipe } from "./fixtures";

const tapioca = fakeRecipe("tapioca", 40, ["cafe"], {
  name: "Tapioca",
  basePortions: 2,
  ingredients: [
    { name: "peito de frango", qty: 200, unit: "g", ref: "frango" },
    { name: "sal", qty: 0, unit: "a gosto" },
    { name: "água", qty: 100, unit: "ml", grams: 100, ref: "agua" },
    { name: "ovo", qty: 2, unit: "un", grams: 100, ref: "ovo" },
  ],
});

describe("shoppingGroups", () => {
  it("escala pelas porções da lista e mantém o índice original do ingrediente", () => {
    const [g] = shoppingGroups([{ recipeSlug: "tapioca", portions: 4, checked: [] }], [tapioca]);
    expect(g).toMatchObject({ slug: "tapioca", name: "Tapioca", portions: 4 });
    expect(g.items).toEqual([
      { index: 0, name: "peito de frango", amount: "400 g", checked: false },
      { index: 3, name: "ovo", amount: "200 g", household: "4 un", checked: false },
    ]);
  });

  it("tira 'a gosto' e água", () => {
    const [g] = shoppingGroups([{ recipeSlug: "tapioca", portions: 2, checked: [] }], [tapioca]);
    expect(g.items.map((i) => i.name)).toEqual(["peito de frango", "ovo"]);
  });

  it("marca checked pelos índices guardados", () => {
    const [g] = shoppingGroups([{ recipeSlug: "tapioca", portions: 2, checked: [3] }], [tapioca]);
    expect(g.items.map((i) => i.checked)).toEqual([false, true]);
  });

  it("ignora receita que não existe mais e mantém a ordem das entradas", () => {
    const outra = fakeRecipe("bowl", 50, ["almoco"], { name: "Bowl" });
    const groups = shoppingGroups([
      { recipeSlug: "bowl", portions: 1, checked: [] },
      { recipeSlug: "sumiu", portions: 1, checked: [] },
      { recipeSlug: "tapioca", portions: 2, checked: [] },
    ], [tapioca, outra]);
    expect(groups.map((g) => g.slug)).toEqual(["bowl", "tapioca"]);
  });
});
