import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadIngredientDb, gramsOf, computePerPortion } from "@/lib/recipes/nutrition";
import { getRecipes } from "@/lib/recipes/load";

const db = loadIngredientDb();

describe("tabela de ingredientes", () => {
  it("peito de frango vem da TACO #409 (21,5 g de proteína por 100 g cru)", () => {
    const f = db.get("peito-frango")!;
    expect(f.per100g.protein_g).toBeCloseTo(21.5, 1);
    expect(f.fonte).toMatch(/TACO #409/);
  });

  it("todo ingrediente tem fonte e macros válidos", () => {
    for (const info of db.values()) {
      expect(info.fonte, info.id).toMatch(/TACO #\d+|Rótulo/);
      for (const v of Object.values(info.per100g)) expect(v, info.id).toBeGreaterThanOrEqual(0);
    }
  });

  it("converte medidas caseiras em gramas", () => {
    expect(gramsOf({ name: "ovo", qty: 1, unit: "un", ref: "ovo" }, db.get("ovo")!)).toBe(50);
    expect(gramsOf({ name: "alho", qty: 2, unit: "dente", ref: "alho" }, db.get("alho")!)).toBe(6);
    expect(gramsOf({ name: "azeite", qty: 15, unit: "ml", ref: "azeite" }, db.get("azeite")!)).toBeCloseTo(13.8, 1);
    expect(gramsOf({ name: "peito de frango", qty: 400, unit: "g", ref: "peito-frango" }, db.get("peito-frango")!)).toBe(400);
    expect(gramsOf({ name: "sal", qty: 0, unit: "a gosto" }, undefined)).toBe(0);
  });
});

describe("macros calculados", () => {
  it("200 g de frango + 100 g de arroz cozido, 1 porção", () => {
    const m = computePerPortion(
      [{ name: "peito de frango", qty: 200, unit: "g", ref: "peito-frango" }, { name: "arroz cozido", qty: 100, unit: "g", ref: "arroz-cozido" }],
      1, db
    );
    const f = db.get("peito-frango")!.per100g, a = db.get("arroz-cozido")!.per100g;
    expect(m.protein_g).toBe(Math.round(f.protein_g * 2 + a.protein_g));
    expect(m.kcal).toBe(Math.round(f.kcal * 2 + a.kcal));
  });

  it("divide pelo número de porções-base", () => {
    const one = computePerPortion([{ name: "peito de frango", qty: 400, unit: "g", ref: "peito-frango" }], 1, db);
    const two = computePerPortion([{ name: "peito de frango", qty: 400, unit: "g", ref: "peito-frango" }], 2, db);
    expect(two.protein_g).toBe(Math.round(one.protein_g / 2));
  });

  it("ingrediente com ref desconhecida é erro claro", () => {
    expect(() => computePerPortion([{ name: "x", qty: 10, unit: "g", ref: "nao-existe" }], 1, db)).toThrow(/nao-existe/);
  });

  it("nenhuma receita digita macros: todas calculam pela tabela", () => {
    const dir = join(__dirname, "../content/recipes");
    for (const f of readdirSync(dir).filter((x) => x.endsWith(".json"))) {
      const raw = JSON.parse(readFileSync(join(dir, f), "utf8"));
      expect(raw.perPortion, f).toBeUndefined();
      for (const ing of raw.ingredients) if (ing.unit !== "a gosto") expect(ing.ref, `${f}: ${ing.name}`).toBeTruthy();
    }
    for (const r of getRecipes()) expect(r.perPortion.protein_g, r.slug).toBeGreaterThan(0);
  });

  it("medida caseira ganha gramas na receita carregada", () => {
    const frango = getRecipes().find((r) => r.slug === "frango-crocante-arroz-tostado")!;
    expect(frango.ingredients.find((i) => i.name === "ovo")!.grams).toBe(50);
  });
});
