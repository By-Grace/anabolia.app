import { describe, it, expect } from "vitest";
import { ACTIVITIES, LIMITS, calcGoal, parseBody, parseNumber, type Body } from "@/lib/domain/goal";

const body = (b: Partial<Body> = {}): Body => ({ sex: "m", age: 30, weightKg: 80, heightCm: 180, activity: "moderado", ...b });

describe("calcGoal", () => {
  it("homem 30 anos, 80 kg, 180 cm, moderado → 160 g e 3.150 kcal", () => {
    expect(calcGoal(body())).toMatchObject({ bmr: 1780, tdee: 2759, protein_g: 160, kcal: 3150 });
  });

  it("mulher 25 anos, 60 kg, 165 cm, leve → 120 g e 2.150 kcal", () => {
    expect(calcGoal(body({ sex: "f", age: 25, weightKg: 60, heightCm: 165, activity: "leve" })))
      .toMatchObject({ protein_g: 120, kcal: 2150 });
  });

  it("proteína arredonda para múltiplo de 5: 72,5 kg → 145 g", () => {
    expect(calcGoal(body({ weightKg: 72.5 })).protein_g).toBe(145);
    expect(calcGoal(body({ weightKg: 71 })).protein_g).toBe(140);
  });

  it("meta fica dentro dos limites do banco (40–400 g, 1200–7000 kcal) nos extremos de entrada", () => {
    const low = calcGoal({ sex: "f", age: 90, weightKg: 35, heightCm: 130, activity: "leve" });
    expect(low.kcal).toBe(1200);
    expect(low.protein_g).toBe(70);
    const high = calcGoal({ sex: "m", age: 16, weightKg: 250, heightCm: 230, activity: "muito_alto" });
    expect(high.kcal).toBe(7000);
    expect(high.protein_g).toBe(400);
  });
});

describe("parseNumber", () => {
  it("aceita '80,5', '80.5', ' 80 ' e recusa '', 'abc', '8,0,1'", () => {
    expect(parseNumber("80,5")).toBe(80.5);
    expect(parseNumber("80.5")).toBe(80.5);
    expect(parseNumber(" 80 ")).toBe(80);
    expect(parseNumber("")).toBeNull();
    expect(parseNumber("abc")).toBeNull();
    expect(parseNumber("8,0,1")).toBeNull();
  });
});

describe("parseBody", () => {
  it("aceita um corpo válido", () => {
    expect(parseBody(body())).toEqual({ ok: true, value: body() });
  });

  it("recusa idade 15, peso 251 e atividade desconhecida com mensagem em pt-BR", () => {
    for (const bad of [body({ age: 15 }), body({ weightKg: 251 }), { ...body(), activity: "sedentario" }]) {
      const r = parseBody(bad);
      expect(r.ok).toBe(false);
      if (!r.ok) expect(r.message).toMatch(/[a-zà-ú]/i);
    }
    expect(parseBody(body({ age: 15 }))).toEqual({ ok: false, message: "Idade entre 16 e 90 anos." });
    expect(parseBody(body({ weightKg: 251 }))).toEqual({ ok: false, message: "Peso entre 35 e 250 kg." });
  });

  it("os limites publicados batem com a validação", () => {
    expect(LIMITS).toEqual({ age: [16, 90], weightKg: [35, 250], heightCm: [130, 230] });
    expect(parseBody(body({ heightCm: 129 })).ok).toBe(false);
    expect(parseBody(body({ heightCm: 230 })).ok).toBe(true);
  });
});

describe("ACTIVITIES", () => {
  it("tem 4 opções na ordem leve, moderado, alto, muito_alto, com os fatores da decisão", () => {
    expect(ACTIVITIES.map((a) => a.value)).toEqual(["leve", "moderado", "alto", "muito_alto"]);
    expect(ACTIVITIES.map((a) => a.factor)).toEqual([1.375, 1.55, 1.725, 1.9]);
    expect(ACTIVITIES[0]).toMatchObject({ label: "Leve", hint: "Treino até 3 vezes por semana e passo o dia sentado" });
  });
});
