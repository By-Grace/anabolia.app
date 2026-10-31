"use server";

import { GOAL_LIMITS, LIMITS, calcGoal } from "@/lib/domain/goal";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession, getUserId } from "@/lib/supabase/session";
import type { Result } from "./PerfilView";

const FAIL = "Não deu para salvar agora. Tente de novo.";
const inRange = (n: unknown, [min, max]: readonly [number, number]): n is number =>
  typeof n === "number" && Number.isFinite(n) && n >= min && n <= max;

/** Peso novo recalcula a meta com os dados guardados do cadastro. */
export async function updateWeightAction(kg: number): Promise<Result> {
  if (!inRange(kg, LIMITS.weightKg)) return { ok: false, message: "Peso entre 35 e 250 kg." };
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    const repo = supabaseProfileRepo(client);
    const profile = userId ? await repo.getProfile(userId) : null;
    if (!userId || !profile?.body) return { ok: false, message: "Calcule a sua meta primeiro." };
    const body = { ...profile.body, weightKg: Math.round(kg * 10) / 10 };
    const { protein_g, kcal } = calcGoal(body);
    await repo.saveBody(userId, body, { protein_g, kcal });
    return { ok: true, goal: { protein_g, kcal, isDefault: false } };
  } catch (e) {
    console.error("perfil: peso", e);
    return { ok: false, message: FAIL };
  }
}

/** Meta digitada à mão: vale até a próxima mudança de peso ou recálculo. */
export async function saveGoalAction(g: { protein_g: number; kcal: number }): Promise<Result> {
  if (!inRange(g?.protein_g, GOAL_LIMITS.protein_g) || !Number.isInteger(g.protein_g)) {
    return { ok: false, message: "Proteína entre 40 e 400 g." };
  }
  if (!inRange(g?.kcal, GOAL_LIMITS.kcal) || !Number.isInteger(g.kcal)) {
    return { ok: false, message: "Calorias entre 1.200 e 7.000 kcal." };
  }
  try {
    const client = await supabaseServer();
    const { userId } = await ensureSession(client);
    await supabaseProfileRepo(client).saveGoal(userId, { protein_g: g.protein_g, kcal: g.kcal });
    return { ok: true, goal: { protein_g: g.protein_g, kcal: g.kcal, isDefault: false } };
  } catch (e) {
    console.error("perfil: meta", e);
    return { ok: false, message: FAIL };
  }
}
