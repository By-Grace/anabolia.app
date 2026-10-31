import { describe, it, expect } from "vitest";
import { lastDayKeys, weekHistory, type DayLog } from "@/lib/domain/history";
import { fakeRecipe } from "./fixtures";

// 21h de 01/11 em São Paulo = 00h UTC de 02/11
const TODAY = new Date("2026-11-02T00:00:00Z");
const goal = { protein_g: 100, kcal: 3000, isDefault: false };
const recipes = [fakeRecipe("a", 40), fakeRecipe("b", 60)];
const log = (dayKey: string, recipeSlug: string, portions = 1): DayLog => ({
  id: dayKey + recipeSlug + portions, recipeSlug, portions, slot: "almoco", loggedAt: `${dayKey}T15:00:00.000Z`, dayKey,
});

describe("lastDayKeys", () => {
  it("em 01/11 (21h SP) devolve 26/10 a 01/11, do mais antigo para hoje", () => {
    expect(lastDayKeys(TODAY)).toEqual([
      "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-01",
    ]);
  });

  it("aceita outro tamanho de janela e atravessa a virada do ano", () => {
    expect(lastDayKeys(new Date("2027-01-01T15:00:00Z"), 3)).toEqual(["2026-12-30", "2026-12-31", "2027-01-01"]);
  });
});

describe("weekHistory", () => {
  it("soma por dia, marca meta batida, dá 0 aos dias vazios e marca hoje", () => {
    const w = weekHistory([log("2026-10-31", "a"), log("2026-10-31", "b"), log("2026-11-01", "a")], recipes, goal, TODAY);
    expect(w.days).toHaveLength(7);
    expect(w.days.map((d) => d.protein_g)).toEqual([0, 0, 0, 0, 0, 100, 40]);
    expect(w.days.map((d) => d.met)).toEqual([false, false, false, false, false, true, false]);
    expect(w.days[6]).toMatchObject({ dayKey: "2026-11-01", isToday: true, progress: 0.4 });
    expect(w.days.filter((d) => d.isToday)).toHaveLength(1);
  });

  it("progresso tem teto de 1 quando passa da meta", () => {
    const w = weekHistory([log("2026-10-30", "b", 3)], recipes, goal, TODAY);
    expect(w.days[4]).toMatchObject({ protein_g: 180, progress: 1, met: true });
  });

  it("weekday vem em 3 letras minúsculas sem ponto: 2026-10-31 é 'sáb' e 2026-11-01 é 'dom'", () => {
    const w = weekHistory([], recipes, goal, TODAY);
    expect(w.days.map((d) => d.weekday)).toEqual(["seg", "ter", "qua", "qui", "sex", "sáb", "dom"]);
  });

  it("ignora log de receita que não existe mais e log fora da janela", () => {
    const w = weekHistory([log("2026-11-01", "sumiu"), log("2026-10-20", "a")], recipes, goal, TODAY);
    expect(w.days.every((d) => d.protein_g === 0)).toBe(true);
    expect(w.averageLogged_g).toBe(0);
  });

  it("averageLogged_g é a média só dos dias com registro; metCount conta os dias com meta batida", () => {
    const w = weekHistory([log("2026-10-31", "b", 2), log("2026-11-01", "a")], recipes, goal, TODAY);
    expect(w.averageLogged_g).toBe(80);
    expect(w.metCount).toBe(1);
  });
});
