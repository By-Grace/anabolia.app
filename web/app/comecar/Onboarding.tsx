"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ACTIVITIES, LIMITS, calcGoal, parseNumber, type Activity, type Body, type Sex } from "@/lib/domain/goal";
import { fmtInt } from "@/lib/format";
import { Segmented } from "@/components/ui/Segmented";
import { NumberField } from "@/components/ui/NumberField";
import { StepPills } from "@/components/ui/StepPills";
import { buttonClass } from "@/components/ui/Button";
import { CheckIcon, ChevronLeft } from "@/components/ui/icons";

export type SaveResult = { ok: true } | { ok: false; message: string };

type Draft = { sex: Sex | null; age: string; weight: string; height: string; activity: Activity | null };

const TITLES = ["Sobre você", "Seu corpo", "Quanto você se mexe", "Sua meta diária"] as const;
const SUBS = [
  "Idade e sexo mudam quanto o seu corpo gasta em repouso.",
  "Peso e altura entram na conta do seu gasto e da sua proteína.",
  "Conte o treino e o resto do dia.",
  "",
];
const SEX_OPTIONS: { value: Sex; label: string }[] = [{ value: "m", label: "Homem" }, { value: "f", label: "Mulher" }];

const inRange = (n: number | null, [min, max]: readonly [number, number]) => n !== null && n >= min && n <= max;
const toText = (n?: number) => (n === undefined ? "" : String(n).replace(".", ","));

/** Cadastro em 4 telas: uma pergunta por tela, resultado calculado na hora, gravado só no "Começar". */
export function Onboarding({ initial, onSave, exitHref, doneHref = "/hoje" }: {
  initial?: Partial<Body>; onSave: (b: Body) => Promise<SaveResult>; exitHref?: string; doneHref?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [d, setD] = useState<Draft>({
    sex: initial?.sex ?? null,
    age: toText(initial?.age),
    weight: toText(initial?.weightKg),
    height: toText(initial?.heightCm),
    activity: initial?.activity ?? null,
  });
  const set = (patch: Partial<Draft>) => setD((prev) => ({ ...prev, ...patch }));

  const age = parseNumber(d.age);
  const weight = parseNumber(d.weight);
  const height = parseNumber(d.height);
  const ageOk = inRange(age, LIMITS.age) && Number.isInteger(age);
  const weightOk = inRange(weight, LIMITS.weightKg);
  const heightOk = inRange(height, LIMITS.heightCm);
  const valid = [d.sex !== null && ageOk, weightOk && heightOk, d.activity !== null, true][step];

  const body = (): Body => ({
    sex: d.sex!, age: age!, weightKg: Math.round(weight! * 10) / 10, heightCm: Math.round(height!), activity: d.activity!,
  });
  const goal = step === 3 ? calcGoal(body()) : null;

  const back = () => {
    setError(null);
    if (step > 0) setStep(step - 1);
    else if (exitHref) router.push(exitHref);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || saving) return;
    if (step < 3) { setStep(step + 1); return; }
    setSaving(true);
    setError(null);
    try {
      const res = await onSave(body());
      if (res.ok) { router.push(doneHref); return; }
      setError(res.message);
    } catch {
      setError("Não deu para salvar agora. Tente de novo.");
    }
    setSaving(false);
  };

  const touched = (s: string) => s.trim() !== "";

  return (
    <form onSubmit={submit} noValidate
      className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
      <div className="flex h-9 items-center gap-3">
        {(step > 0 || exitHref) && (
          <button type="button" onClick={back} aria-label="Voltar"
            className="grid size-9 flex-none place-items-center rounded-full bg-soft"><ChevronLeft size={20} /></button>
        )}
        <StepPills total={4} current={step} />
      </div>

      <div key={step} className="animate-[stepIn_.32s_cubic-bezier(.22,1,.36,1)]">
        <h1 className="mt-8 text-[28px] font-bold leading-[1.1] tracking-[-0.022em] text-balance">{TITLES[step]}</h1>
        {SUBS[step] && <p className="mt-2 text-[15px] leading-snug text-grey">{SUBS[step]}</p>}

        {step === 0 && (
          <div className="mt-7 space-y-6">
            <div>
              <p className="mb-2 text-[15px] font-semibold">Sexo</p>
              <Segmented label="Sexo" size="lg" options={SEX_OPTIONS} value={d.sex} onChange={(v) => set({ sex: v })} />
            </div>
            <NumberField label="Idade" unit="anos" value={d.age} onChange={(v) => set({ age: v })}
              hint={`De ${LIMITS.age[0]} a ${LIMITS.age[1]} anos`} invalid={touched(d.age) && !ageOk} />
          </div>
        )}

        {step === 1 && (
          <div className="mt-7 space-y-6">
            <NumberField label="Peso" unit="kg" decimal autoFocus value={d.weight} onChange={(v) => set({ weight: v })}
              hint={`De ${LIMITS.weightKg[0]} a ${LIMITS.weightKg[1]} kg`} invalid={touched(d.weight) && !weightOk} />
            <NumberField label="Altura" unit="cm" value={d.height} onChange={(v) => set({ height: v })}
              hint={`De ${LIMITS.heightCm[0]} a ${LIMITS.heightCm[1]} cm`} invalid={touched(d.height) && !heightOk} />
          </div>
        )}

        {step === 2 && (
          <div role="radiogroup" aria-label="Nível de atividade" className="mt-5">
            {ACTIVITIES.map((a) => {
              const on = d.activity === a.value;
              return (
                <button key={a.value} type="button" role="radio" aria-checked={on} onClick={() => set({ activity: a.value })}
                  className="flex w-full items-center gap-3 border-t border-hair py-3.5 text-left first:border-t-0">
                  <span className={"grid size-[26px] flex-none place-items-center rounded-full text-white transition-colors " +
                    (on ? "bg-acc" : "border-2 border-ring")}>
                    {on && <CheckIcon />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[16px] font-semibold tracking-[-0.01em]">{a.label}</span>
                    <span className="mt-0.5 block text-[13px] font-medium leading-snug text-grey">{a.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {step === 3 && goal && (
          <>
            <section aria-label="Meta calculada" className="mt-6 rounded-[18px] bg-soft px-[18px] pb-[18px] pt-4">
              <div data-testid="goal-protein" className="num text-[44px] font-bold leading-none tracking-[-0.02em]">
                {fmtInt(goal.protein_g)}<small className="ml-1 text-lg font-semibold tracking-normal text-grey">g</small>
              </div>
              <p className="mt-1.5 text-[13px] font-medium text-grey">de proteína por dia</p>
              <div className="mt-4 border-t border-hair pt-4">
                <div data-testid="goal-kcal" className="num text-[26px] font-bold leading-none tracking-[-0.02em]">
                  {fmtInt(goal.kcal)}<small className="ml-1 text-[15px] font-semibold tracking-normal text-grey">kcal</small>
                </div>
                <p className="mt-1.5 text-[13px] font-medium text-grey">de energia por dia</p>
              </div>
            </section>
            <p className="mt-4 text-[15px] leading-snug text-grey">
              Calculada pela fórmula de Mifflin-St Jeor, 15% acima do seu gasto para ganhar massa, com 2 g de proteína por kg.
              Dá para ajustar no Perfil.
            </p>
          </>
        )}
      </div>

      <div className="mt-auto pt-8">
        {error && <p role="alert" className="mb-3 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">{error}</p>}
        <button type="submit" disabled={!valid || saving} className={`${buttonClass("primary")} w-full`}>
          {step < 3 ? "Continuar" : saving ? "Salvando…" : "Começar"}
        </button>
      </div>
    </form>
  );
}
