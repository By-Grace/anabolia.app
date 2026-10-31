import { describe, it, expect } from "vitest";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { getRecipes } from "@/lib/recipes/load";
import { MEAL_SLOTS } from "@/lib/recipes/schema";

const recipes = getRecipes();
const MAIN = new Set(["almoco", "jantar"]);

describe("cardápio v1 (docs/conteudo/cardapio-v1.md)", () => {
  it("tem 40 receitas, uma por arquivo, com slug igual ao nome do arquivo", () => {
    const files = readdirSync(join(__dirname, "../content/recipes")).filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
    expect(recipes).toHaveLength(40);
    expect(recipes.map((r) => r.slug).sort()).toEqual(files.sort());
  });

  it("toda refeição do dia tem pelo menos 10 opções", () => {
    for (const s of MEAL_SLOTS) expect(recipes.filter((r) => r.slot.includes(s)).length, s).toBeGreaterThanOrEqual(10);
  });

  it("proteína por porção: 25 g ou mais em tudo; 40 g ou mais quando a receita é principalmente almoço/jantar", () => {
    for (const r of recipes) {
      expect(r.perPortion.protein_g, r.slug).toBeGreaterThanOrEqual(25);
      if (MAIN.has(r.slot[0])) expect(r.perPortion.protein_g, r.slug).toBeGreaterThanOrEqual(40);
    }
  });

  it("nenhuma receita passa de 45 minutos e todas têm passos e cronômetros plausíveis", () => {
    for (const r of recipes) {
      expect(r.minutes, r.slug).toBeLessThanOrEqual(45);
      expect(r.steps.length, r.slug).toBeGreaterThanOrEqual(2);
      for (const s of r.steps) if (s.seconds) expect(s.seconds, `${r.slug}: ${s.text}`).toBeLessThanOrEqual(2400);
    }
  });

  it("toda receita tem foto no disco e a origem da foto declarada", () => {
    for (const r of recipes) {
      expect(r.photo, r.slug).toBeTruthy();
      expect(existsSync(join(__dirname, "../public", r.photo!)), r.photo).toBe(true);
      expect(r.photoSource, r.slug).toMatch(/gerada|real/);
    }
  });
});
