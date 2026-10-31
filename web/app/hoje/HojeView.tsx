import Link from "next/link";
import type { MealSlot, Recipe } from "@/lib/recipes/schema";
import { MEAL_SLOTS, MEAL_SLOT_LABEL } from "@/lib/recipes/schema";
import { dayTotals, type Goal, type MealLog } from "@/lib/domain/day";
import { macrosFor } from "@/lib/domain/scale";
import { slotForHour, suggest } from "@/lib/domain/suggest";
import { localHour } from "@/lib/data/day-key";
import { dayLabel, fmtInt, recipeMeta } from "@/lib/format";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { MealRows, type MealRowData } from "./MealRows";
import { JustLogged } from "./JustLogged";
import { ErrorNotice } from "./ErrorNotice";

export function HojeView({ recipes, logs, goal, now, error, justLogged }: {
  recipes: Recipe[]; logs: MealLog[]; goal: Goal; now: Date; error?: string; justLogged?: string;
}) {
  const t = dayTotals(logs, recipes, goal);
  const bySlug = new Map(recipes.map((r) => [r.slug, r]));
  const isDone = (s: MealSlot) => logs.some((l) => l.slot === s && bySlug.has(l.recipeSlug));
  // A próxima refeição é a primeira ainda não feita a partir do horário atual (até o jantar).
  const slot = MEAL_SLOTS.slice(MEAL_SLOTS.indexOf(slotForHour(localHour(now)))).find((s) => !isDone(s));
  const next = slot ? suggest(recipes, t.remainingProtein_g, slot, 1)[0] : undefined;

  const fresh = justLogged ? logs.find((l) => l.id === justLogged && bySlug.has(l.recipeSlug)) : undefined;
  const freshProtein = fresh ? macrosFor(bySlug.get(fresh.recipeSlug)!, fresh.portions).protein_g : 0;
  const fromProgress = fresh ? Math.max(0, t.protein_g - freshProtein) / Math.max(1, goal.protein_g) : undefined;

  const rows: MealRowData[] = MEAL_SLOTS.map((s) => {
    const label = MEAL_SLOT_LABEL[s];
    const done = logs.filter((l) => l.slot === s && bySlug.has(l.recipeSlug));
    if (done.length) {
      const protein = done.reduce((acc, l) => acc + macrosFor(bySlug.get(l.recipeSlug)!, l.portions).protein_g, 0);
      return {
        slot: s, label, state: "done", value: `${fmtInt(protein)} g`,
        sub: done.map((l) => bySlug.get(l.recipeSlug)!.name).join(" + "),
        href: `/receitas/${done[done.length - 1].recipeSlug}`,
        animate: fresh?.slot === s,
      };
    }
    if (s === slot && next) {
      return { slot: s, label, state: "next", sub: next.name, value: `+${fmtInt(next.perPortion.protein_g)} g`,
        href: `/receitas/${next.slug}`, quickLogSlug: next.slug };
    }
    return { slot: s, label, state: "todo", sub: "escolher", value: "—", href: `/receitas?slot=${s}` };
  });
  const doneCount = rows.filter((r) => r.state === "done").length;

  return (
    <>
      <header className="mb-5">
        <p className="text-[13px] font-medium text-grey">{dayLabel(now)}</p>
        <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Hoje</h1>
      </header>

      {error && <ErrorNotice message={error} />}

      <section aria-label="Proteína de hoje" className="rounded-[18px] bg-soft px-[18px] pb-[18px] pt-4">
        <div data-testid="remaining" className="num text-[44px] font-bold leading-none tracking-[-0.02em]">
          {error ? (
            <>—<small className="ml-1 text-lg font-semibold tracking-normal text-grey">g para fechar</small></>
          ) : t.goalMet ? (
            <>Meta batida</>
          ) : (
            <>
              {fmtInt(t.remainingProtein_g)}
              <small className="ml-1 text-lg font-semibold tracking-normal text-grey">g para fechar</small>
            </>
          )}
        </div>
        {error ? (
          <p className="mt-1.5 text-[13px] font-medium text-grey">Sem os dados de hoje por enquanto.</p>
        ) : (
          <>
            <p className="mt-1.5 text-[13px] font-medium text-grey num">
              {fmtInt(t.protein_g)} de {fmtInt(goal.protein_g)} g de proteína · {fmtInt(t.kcal)} de {fmtInt(goal.kcal)} kcal
              {goal.isDefault && <> · meta padrão</>}
            </p>
            <div className="mt-3.5">
              <ProgressBar value={t.progress} from={fromProgress} label="Proteína do dia" />
            </div>
          </>
        )}
      </section>

      {next && slot && (
        <section aria-labelledby="proxima" className="mt-6">
          <div className="mb-2.5 flex items-baseline justify-between">
            <h2 id="proxima" className="text-[19px] font-bold tracking-[-0.015em]">Próxima refeição</h2>
            <Link href={`/receitas?slot=${slot}`} className="text-sm font-semibold text-acc">Trocar</Link>
          </div>
          <PhotoCard src={next.photo} title={next.name} meta={recipeMeta(next)} href={`/receitas/${next.slug}`} />
        </section>
      )}

      {!error && (
        <section aria-labelledby="refeicoes" className="mt-6">
          <div className="mb-1 flex items-baseline justify-between">
            <h2 id="refeicoes" className="text-[19px] font-bold tracking-[-0.015em]">Refeições</h2>
            <span className="text-[13px] font-semibold text-grey num">{doneCount} de 4</span>
          </div>
          <MealRows rows={rows} />
        </section>
      )}

      {fresh && (
        <JustLogged id={fresh.id} text={`+${fmtInt(freshProtein)} g · ${MEAL_SLOT_LABEL[fresh.slot]} marcado`} />
      )}
    </>
  );
}
