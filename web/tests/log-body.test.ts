import { describe, it, expect } from "vitest";
import { parseLogMealBody } from "@/lib/cook/log-body";

describe("parseLogMealBody", () => {
  it("aceita corpo válido e usa 1 porção por padrão", () => {
    expect(parseLogMealBody({ recipeSlug: "frango-crocante-arroz-tostado", slot: "jantar" }))
      .toEqual({ ok: true, value: { recipeSlug: "frango-crocante-arroz-tostado", slot: "jantar", portions: 1 } });
  });
  it("recusa refeição inválida", () => {
    expect(parseLogMealBody({ recipeSlug: "frango-crocante-arroz-tostado", slot: "ceia" })).toMatchObject({ ok: false, status: 400 });
  });
  it("recusa receita que não existe com 404", () => {
    expect(parseLogMealBody({ recipeSlug: "nada", slot: "jantar" })).toMatchObject({ ok: false, status: 404 });
  });
  it("recusa porções fora de 1..8", () => {
    expect(parseLogMealBody({ recipeSlug: "frango-crocante-arroz-tostado", slot: "jantar", portions: 9 })).toMatchObject({ ok: false, status: 400 });
  });
});
