import Link from "next/link";
import type { Recipe } from "@/lib/recipes/schema";
import { MEAL_SLOTS, MEAL_SLOT_LABEL } from "@/lib/recipes/schema";
import { dayTotals, type Goal, type MealLog } from "@/lib/domain/day";
import { macrosFor } from "@/lib/domain/scale";
import { slotForHour, suggest } from "@/lib/domain/suggest";
import { localHour } from "@/lib/data/day-key";
import { dayLabel, fmtInt, recipeMeta } from "@/lib/format";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { SetRow, type SetState } from "@/components/ui/SetRow";

export function HojeView({ recipes, logs, goal, now, error }: {
  recipes: Recipe[]; logs: MealLog[]; goal: Goal; now: Date; error?: string;
}) {
  const t = dayTotals(logs, recipes, goal);
  const slot = slotForHour(localHour(now));
  const next = suggest(recipes, t.remainingProtein_g, slot, 1)[0];
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));

  const rows = MEAL_SLOTS.map((s) => {
    const done = logs.filter((l) => l.slot === s && bySlug.has(l.recipeSlug));
    if (done.length) {
      const protein = done.reduce((acc, l) => acc + macrosFor(bySlug.get(l.recipeSlug)!, l.portions).protein_g, 0);
      return { s, state: "done" as SetState, sub: done.map((l) => bySlug.get(l.recipeSlug)!.name).join(" + "), value: `${fmtInt(protein)} g` };
    }
    if (s === slot && next) return { s, state: "next" as SetState, sub: next.name, value: `+${fmtInt(next.perPortion.protein_g)} g` };
    return { s, state: "todo" as SetState, sub: "escolher", value: "—" };
  });
  const doneCount = rows.filter((r) => r.state === "done").length;

  return (
    <>
      <header className="mb-5">
        <p className="text-[13px] font-medium text-grey">{dayLabel(now)}</p>
        <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Hoje</h1>
      </header>

      {error && (
        <p role="status" className="mb-4 rounded-2xl bg-acc-soft px-4 py-3 text-sm font-medium text-acc-text">{error}</p>
      )}

      <section aria-label="Proteína de hoje" className="rounded-[18px] bg-soft px-[18px] pb-[18px] pt-4">
        <div data-testid="remaining" className="num text-[44px] font-bold leading-none tracking-[-0.02em]">
          {t.goalMet ? (
            <>Meta batida</>
          ) : (
            <>
              {fmtInt(t.remainingProtein_g)}
              <small className="ml-1 text-lg font-semibold tracking-normal text-grey">g para fechar</small>
            </>
          )}
        </div>
        <p className="mt-1.5 text-[13px] font-medium text-grey num">
          {fmtInt(t.protein_g)} de {fmtInt(goal.protein_g)} g de proteína · {fmtInt(t.kcal)} de {fmtInt(goal.kcal)} kcal
          {goal.isDefault && <> · meta padrão</>}
        </p>
        <div className="mt-3.5">
          <ProgressBar value={t.progress} label="Proteína do dia" />
        </div>
      </section>

      {next && (
        <section aria-labelledby="proxima" className="mt-6">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 id="proxima" className="text-[19px] font-bold tracking-[-0.015em]">Próxima refeição</h2>
            <Link href={`/receitas?slot=${slot}`} className="text-sm font-semibold text-acc">Trocar</Link>
          </div>
          <PhotoCard src={next.photo} title={next.name} meta={recipeMeta(next)} href={`/receitas/${next.slug}`} />
        </section>
      )}

      <section aria-labelledby="refeicoes" className="mt-6">
        <div className="mb-1 flex items-baseline justify-between">
          <h2 id="refeicoes" className="text-[19px] font-bold tracking-[-0.015em]">Refeições</h2>
          <span className="text-[13px] font-semibold text-grey num">{doneCount} de 4</span>
        </div>
        {rows.map((r) => (
          <SetRow key={r.s} label={MEAL_SLOT_LABEL[r.s]} sub={r.sub} value={r.value} state={r.state} />
        ))}
      </section>
    </>
  );
}
