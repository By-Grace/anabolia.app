"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/recipes/schema";
import { MEAL_SLOT_LABEL } from "@/lib/recipes/schema";
import { scaleIngredients } from "@/lib/domain/scale";
import { slotForHour } from "@/lib/domain/suggest";
import { localHour } from "@/lib/data/day-key";
import { fmtHousehold, fmtInt, fmtWeight } from "@/lib/format";
import { loggedUrl, postMeal } from "@/lib/client/meals";
import { Stat } from "@/components/ui/Stat";
import { Stepper } from "@/components/ui/Stepper";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ChevronLeft, CheckIcon, PlateIcon } from "@/components/ui/icons";

export function RecipeView({ recipe, now = () => new Date() }: { recipe: Recipe; now?: () => Date }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portions, setPortions] = useState(recipe.basePortions);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const ingredients = scaleIngredients(recipe, portions);
  const slots = recipe.slot.map((s) => MEAL_SLOT_LABEL[s]).join(" · ");

  const ate = async () => {
    setSaving(true);
    setError(null);
    try {
      const id = await postMeal(recipe.slug, slotForHour(localHour(now())));
      router.push(loggedUrl(id));
    } catch {
      setError("Não deu para marcar agora. Tente de novo.");
      setSaving(false);
    }
  };

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push("/receitas");
  };

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  return (
    <article className="mx-auto max-w-[480px] pb-[calc(110px+env(safe-area-inset-bottom,0px))]">
      <div className="relative h-[380px] bg-soft">
        {recipe.photo ? (
          <Image src={recipe.photo} alt={recipe.name} fill priority sizes="(max-width: 480px) 100vw, 480px" className="object-cover" />
        ) : (
          <div data-testid="photo-placeholder" className="absolute inset-0 grid place-items-center text-ring"><PlateIcon size={64} /></div>
        )}
        <button type="button" onClick={goBack} aria-label="Voltar"
          className="absolute left-4 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 14px)" }}>
          <ChevronLeft size={20} />
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-[18px] pt-24 text-white">
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-balance">{recipe.name}</h1>
        </div>
      </div>

      <div className="px-5">
        <div className="mt-[18px] grid grid-cols-3">
          <Stat value={`${fmtInt(recipe.perPortion.protein_g)} g`} label="proteína" />
          <Stat value={String(recipe.minutes)} label="min" />
          <Stat value={fmtInt(recipe.perPortion.kcal)} label="kcal" />
        </div>
        <p className="mt-2 text-center text-xs font-medium text-grey">{slots} · valores por porção</p>

        <section aria-labelledby="ingredientes" className="mt-6">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="ingredientes" className="text-[19px] font-bold tracking-[-0.015em]">Ingredientes</h2>
            <div className="flex items-center gap-2 text-sm font-medium text-grey">
              <span>Porções</span>
              <Stepper value={portions} onChange={setPortions} />
            </div>
          </div>
          <ul>
            {ingredients.map((ing, i) => {
              const on = checked.has(i);
              return (
                <li key={`${i}-${ing.name}`} data-testid="ingredient">
                  <button type="button" onClick={() => toggle(i)} aria-pressed={on}
                    className="flex w-full items-center gap-3 border-t border-hair py-2.5 text-left text-[15px] first:border-t-0">
                    <span className={"grid size-[22px] flex-none place-items-center rounded-[7px] border-2 text-white " +
                      (on ? "border-acc bg-acc" : "border-ring")}>
                      {on && <CheckIcon />}
                    </span>
                    <span className={"min-w-0 flex-1 " + (on ? "text-grey line-through decoration-1" : "")}>
                      {ing.name}
                      {ing.unit !== "g" && ing.unit !== "a gosto" && ing.grams && (
                        <span data-testid="household" className="num ml-1.5 text-[13px] text-grey">{fmtHousehold(ing)}</span>
                      )}
                    </span>
                    <span data-testid="qty" className="num font-bold">{fmtWeight(ing)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="preparo" className="mt-6">
          <h2 id="preparo" className="mb-2 text-[19px] font-bold tracking-[-0.015em]">Preparo</h2>
          <ol aria-label="Preparo">
            {recipe.steps.map((s, i) => (
              <li key={i} className="flex gap-3 border-t border-hair py-3 text-[15px] leading-snug first:border-t-0">
                <span className="num w-5 flex-none font-bold text-grey">{i + 1}</span>
                <span>{s.text}</span>
              </li>
            ))}
          </ol>
          {recipe.tip && <p className="mt-3 rounded-2xl bg-soft px-4 py-3 text-[15px] text-ink">{recipe.tip}</p>}
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white from-70% to-white/0 px-5 pt-3"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
        {error && <p role="alert" className="mx-auto mb-2 max-w-[440px] text-sm font-medium text-ink">{error}</p>}
        <div className="mx-auto flex max-w-[440px] gap-2.5">
          <ButtonLink href={`/cozinhar/${recipe.slug}?p=${portions}`}>Começar a cozinhar</ButtonLink>
          <Button variant="soft" onClick={ate} disabled={saving}>{saving ? "Marcando…" : "Marquei, comi"}</Button>
        </div>
      </div>
    </article>
  );
}
