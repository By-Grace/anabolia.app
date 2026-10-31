"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Goal } from "@/lib/domain/day";
import { ACTIVITIES, LIMITS, parseNumber, GOAL_LIMITS } from "@/lib/domain/goal";
import type { WeekHistory } from "@/lib/domain/history";
import type { Profile } from "@/lib/data/profile-repo";
import { fmtInt } from "@/lib/format";
import { Sheet } from "@/components/ui/Sheet";
import { NumberField } from "@/components/ui/NumberField";
import { buttonClass, ButtonLink } from "@/components/ui/Button";
import { ChevronRight } from "@/components/ui/icons";
import { ErrorNotice } from "@/app/hoje/ErrorNotice";
import { WeekChart } from "./WeekChart";

export type Result = { ok: true; goal: Goal } | { ok: false; message: string };

const fmtKg = (kg: number) => String(Math.round(kg * 10) / 10).replace(".", ",");
const inRange = (n: number | null, [min, max]: readonly [number, number]) => n !== null && n >= min && n <= max;
const FAIL = "Não deu para salvar agora. Tente de novo.";

function Row({ label, sub, value, aria, onClick }: { label: string; sub?: string; value: string; aria: string; onClick: () => void }) {
  return (
    <button type="button" aria-label={aria} onClick={onClick}
      className="flex w-full items-center gap-3 border-t border-hair py-3 text-left first:border-t-0">
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold tracking-[-0.01em]">{label}</span>
        {sub && <span className="mt-0.5 block truncate text-[13px] font-medium text-grey">{sub}</span>}
      </span>
      <span className="num text-[16px] font-bold">{value}</span>
      <ChevronRight size={16} className="flex-none text-ring" />
    </button>
  );
}

export function PerfilView({ profile, week, onSaveWeight, onSaveGoal, error }: {
  profile: Profile;
  week: WeekHistory;
  onSaveWeight: (kg: number) => Promise<Result>;
  onSaveGoal: (g: { protein_g: number; kcal: number }) => Promise<Result>;
  error?: string;
}) {
  const router = useRouter();
  const [goal, setGoal] = useState(profile.goal);
  const [body, setBody] = useState(profile.body);
  const [sheet, setSheet] = useState<"peso" | "meta" | null>(null);
  const close = useCallback(() => setSheet(null), []);

  const saved = (g: Goal) => { setGoal(g); setSheet(null); router.refresh(); };
  const activity = body ? ACTIVITIES.find((a) => a.value === body.activity)?.label.toLowerCase() : "";

  return (
    <>
      <header className="mb-5">
        <p className="num text-[13px] font-medium text-grey">Meta de {fmtInt(goal.protein_g)} g por dia</p>
        <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Perfil</h1>
      </header>

      {error ? <ErrorNotice message={error} /> : (<>
      <section aria-labelledby="semana">
        <div className="mb-2.5 flex items-baseline justify-between">
          <h2 id="semana" className="text-[19px] font-bold tracking-[-0.015em]">Últimos 7 dias</h2>
          <span className="num text-[13px] font-semibold text-grey">{week.metCount} de 7 na meta</span>
        </div>
        <div className="rounded-[18px] bg-soft px-[18px] pb-3 pt-4">
          <WeekChart days={week.days} goal_g={goal.protein_g} />
        </div>
        <p className="num mt-2.5 text-[13px] font-medium text-grey">
          <span>
            {week.averageLogged_g > 0
              ? `Média de ${fmtInt(week.averageLogged_g)} g nos dias registrados.`
              : "Nenhuma refeição marcada nesta semana."}
          </span>{" "}
          <span>A coluna cheia é a meta do dia.</span>
        </p>
      </section>

      <section aria-labelledby="meta" className="mt-6">
        <h2 id="meta" className="mb-1 text-[19px] font-bold tracking-[-0.015em]">Meta diária</h2>
        <Row label="Proteína" value={`${fmtInt(goal.protein_g)} g`} aria={`Editar meta de proteína, ${fmtInt(goal.protein_g)} g`}
          onClick={() => setSheet("meta")} />
        <Row label="Calorias" value={`${fmtInt(goal.kcal)} kcal`} aria={`Editar meta de calorias, ${fmtInt(goal.kcal)} kcal`}
          onClick={() => setSheet("meta")} />
        {body && (
          <Link href="/comecar" className="mt-1 inline-flex h-11 items-center text-[15px] font-semibold text-acc">
            Recalcular com os meus dados
          </Link>
        )}
      </section>

      {body ? (
        <section aria-labelledby="dados" className="mt-6">
          <h2 id="dados" className="mb-1 text-[19px] font-bold tracking-[-0.015em]">Seus dados</h2>
          <Row label="Peso" sub={`${fmtInt(body.heightCm)} cm · ${body.age} anos · atividade ${activity}`}
            value={`${fmtKg(body.weightKg)} kg`} aria={`Editar peso, ${fmtKg(body.weightKg)} kg`} onClick={() => setSheet("peso")} />
        </section>
      ) : (
        <section className="mt-6 rounded-[18px] bg-soft px-[18px] py-4">
          <p className="text-[16px] font-semibold tracking-[-0.01em]">Você está usando a meta padrão.</p>
          <p className="mt-1 text-[15px] leading-snug text-grey">Responda 4 perguntas e a meta passa a ser a sua.</p>
          <ButtonLink href="/comecar" className="mt-4 w-full">Calcular minha meta</ButtonLink>
        </section>
      )}
      </>)}

      {sheet === "peso" && body && (
        <WeightSheet initial={body.weightKg} onClose={close}
          onSave={async (kg) => {
            const r = await onSaveWeight(kg);
            if (r.ok) { setBody({ ...body, weightKg: kg }); saved(r.goal); }
            return r;
          }} />
      )}
      {sheet === "meta" && (
        <GoalSheet initial={goal} onClose={close}
          onSave={async (g) => {
            const r = await onSaveGoal(g);
            if (r.ok) saved(r.goal);
            return r;
          }} />
      )}
    </>
  );
}

function useSave<T>(save: (v: T) => Promise<Result>) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const run = async (v: T) => {
    setSaving(true);
    setError(null);
    try {
      const r = await save(v);
      if (!r.ok) setError(r.message);
    } catch {
      setError(FAIL);
    }
    setSaving(false);
  };
  return { saving, error, run };
}

function SaveButton({ disabled, saving }: { disabled: boolean; saving: boolean }) {
  return (
    <button type="submit" disabled={disabled || saving} className={`${buttonClass("primary")} mt-7 w-full`}>
      {saving ? "Salvando…" : "Salvar"}
    </button>
  );
}

function WeightSheet({ initial, onSave, onClose }: { initial: number; onSave: (kg: number) => Promise<Result>; onClose: () => void }) {
  const [text, setText] = useState(fmtKg(initial));
  const kg = parseNumber(text);
  const ok = inRange(kg, LIMITS.weightKg);
  const { saving, error, run } = useSave(onSave);
  return (
    <Sheet title="Peso" onClose={onClose}>
      <form noValidate onSubmit={(e) => { e.preventDefault(); if (ok) run(Math.round(kg! * 10) / 10); }}>
        <NumberField label="Peso" unit="kg" decimal value={text} onChange={setText} invalid={text.trim() !== "" && !ok}
          hint={ok || text.trim() === "" ? "A meta é recalculada com o peso novo." : `De ${LIMITS.weightKg[0]} a ${LIMITS.weightKg[1]} kg`} />
        {error && <p role="alert" className="mt-4 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">{error}</p>}
        <SaveButton disabled={!ok} saving={saving} />
      </form>
    </Sheet>
  );
}

function GoalSheet({ initial, onSave, onClose }: {
  initial: Goal; onSave: (g: { protein_g: number; kcal: number }) => Promise<Result>; onClose: () => void;
}) {
  const [p, setP] = useState(String(initial.protein_g));
  const [k, setK] = useState(String(initial.kcal));
  const protein = parseNumber(p);
  const kcal = parseNumber(k);
  const pOk = inRange(protein, GOAL_LIMITS.protein_g) && Number.isInteger(protein);
  const kOk = inRange(kcal, GOAL_LIMITS.kcal) && Number.isInteger(kcal);
  const { saving, error, run } = useSave(onSave);
  return (
    <Sheet title="Meta diária" onClose={onClose}>
      <form noValidate className="space-y-5" onSubmit={(e) => { e.preventDefault(); if (pOk && kOk) run({ protein_g: protein!, kcal: kcal! }); }}>
        <NumberField label="Proteína" unit="g" value={p} onChange={setP} invalid={!pOk}
          hint={`De ${GOAL_LIMITS.protein_g[0]} a ${GOAL_LIMITS.protein_g[1]} g`} />
        <NumberField label="Calorias" unit="kcal" value={k} onChange={setK} invalid={!kOk}
          hint={`De ${fmtInt(GOAL_LIMITS.kcal[0])} a ${fmtInt(GOAL_LIMITS.kcal[1])} kcal`} />
        {error && <p role="alert" className="rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">{error}</p>}
        <SaveButton disabled={!pOk || !kOk} saving={saving} />
      </form>
    </Sheet>
  );
}
