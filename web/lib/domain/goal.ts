import { z } from "zod";

export type Sex = "m" | "f";
export type Activity = "leve" | "moderado" | "alto" | "muito_alto";
export type Body = { sex: Sex; age: number; weightKg: number; heightCm: number; activity: Activity };

export const ACTIVITIES: { value: Activity; label: string; hint: string; factor: number }[] = [
  { value: "leve", label: "Leve", hint: "Treino até 3 vezes por semana e passo o dia sentado", factor: 1.375 },
  { value: "moderado", label: "Moderado", hint: "Treino de 3 a 5 vezes por semana", factor: 1.55 },
  { value: "alto", label: "Alto", hint: "Treino quase todo dia ou trabalho em pé", factor: 1.725 },
  { value: "muito_alto", label: "Muito alto", hint: "Treino pesado todo dia e trabalho físico", factor: 1.9 },
];

export const LIMITS = { age: [16, 90], weightKg: [35, 250], heightCm: [130, 230] } as const;

/** Limites de meta aceitos pelo banco (profiles.goal_*). */
export const GOAL_LIMITS = { protein_g: [40, 400], kcal: [1200, 7000] } as const;

/** Superávit para ganhar massa e proteína por kg (decisões da parte 3). */
export const SURPLUS = 0.15;
export const PROTEIN_PER_KG = 2;

/** "80,5", "80.5" ou " 80 " → número; vazio ou inválido → null. */
export function parseNumber(s: string): number | null {
  const t = s.trim();
  if (!/^\d+(?:[.,]\d+)?$/.test(t)) return null;
  return Number(t.replace(",", "."));
}

const range = ([min, max]: readonly [number, number], msg: string) => z.number().min(min, msg).max(max, msg);

export const BodySchema = z.object({
  sex: z.enum(["m", "f"], "Escolha o sexo."),
  age: range(LIMITS.age, "Idade entre 16 e 90 anos.").int("Idade em anos inteiros."),
  weightKg: range(LIMITS.weightKg, "Peso entre 35 e 250 kg."),
  heightCm: range(LIMITS.heightCm, "Altura entre 130 e 230 cm."),
  activity: z.enum(["leve", "moderado", "alto", "muito_alto"], "Escolha o nível de atividade."),
});

export function parseBody(raw: unknown): { ok: true; value: Body } | { ok: false; message: string } {
  const r = BodySchema.safeParse(raw);
  if (r.success) return { ok: true, value: r.data };
  return { ok: false, message: r.error.issues[0]?.message ?? "Dados inválidos." };
}

const clamp = (n: number, [min, max]: readonly [number, number]) => Math.min(max, Math.max(min, n));
const roundTo = (n: number, step: number) => Math.round(n / step) * step;

/** Mifflin-St Jeor × fator de atividade, +15% para ganhar massa; proteína 2 g/kg. */
export function calcGoal(b: Body): { protein_g: number; kcal: number; bmr: number; tdee: number } {
  const bmr = 10 * b.weightKg + 6.25 * b.heightCm - 5 * b.age + (b.sex === "m" ? 5 : -161);
  const factor = ACTIVITIES.find((a) => a.value === b.activity)?.factor ?? ACTIVITIES[0].factor;
  const tdee = bmr * factor;
  return {
    bmr: Math.round(bmr),
    tdee: Math.round(tdee),
    kcal: clamp(roundTo(tdee * (1 + SURPLUS), 50), GOAL_LIMITS.kcal),
    protein_g: clamp(roundTo(b.weightKg * PROTEIN_PER_KG, 5), GOAL_LIMITS.protein_g),
  };
}
