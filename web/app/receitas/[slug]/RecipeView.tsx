"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/recipes/schema";
import { MEAL_SLOT_LABEL } from "@/lib/recipes/schema";
import { scaleIngredients } from "@/lib/domain/scale";
import { fmtInt, fmtQty } from "@/lib/format";
import { Stat } from "@/components/ui/Stat";
import { Stepper } from "@/components/ui/Stepper";
import { ButtonLink } from "@/components/ui/Button";
import { ChevronLeft, CheckIcon, PlateIcon } from "@/components/ui/icons";

export function RecipeView({ recipe }: { recipe: Recipe }) {
  const router = useRouter();
  const [portions, setPortions] = useState(recipe.basePortions);
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const ingredients = scaleIngredients(recipe, portions);
  const slots = recipe.slot.map((s) => MEAL_SLOT_LABEL[s]).join(" · ");

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
        <button type="button" onClick={() => router.back()} aria-label="Voltar"
          className="absolute left-4 grid size-9 place-items-center rounded-full bg-black/35 text-white backdrop-blur-md"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 14px)" }}>
          <ChevronLeft size={20} />
        </button>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-5 pb-[18px] pt-24 text-white">
          <span className="mb-2 inline-block rounded-md bg-acc px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em]">{slots}</span>
          <h1 className="text-[28px] font-bold leading-[1.08] tracking-[-0.022em] text-balance">{recipe.name}</h1>
        </div>
      </div>

      <div className="px-5">
        <div className="mt-[18px] grid grid-cols-3">
          <Stat value={`${fmtInt(recipe.perPortion.protein_g)} g`} label="proteína" />
          <Stat value={String(recipe.minutes)} label="min" />
          <Stat value={fmtInt(recipe.perPortion.kcal)} label="kcal" />
        </div>
        <p className="mt-2 text-center text-xs font-medium text-grey">Valores por porção</p>

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
                <li key={ing.name} data-testid="ingredient">
                  <button type="button" onClick={() => toggle(i)} aria-pressed={on}
                    className="flex w-full items-center gap-3 border-t border-hair py-2.5 text-left text-[15px] first:border-t-0">
                    <span className={"grid size-[22px] flex-none place-items-center rounded-[7px] border-2 text-white " +
                      (on ? "border-acc bg-acc" : "border-ring")}>
                      {on && <CheckIcon />}
                    </span>
                    <span className={"flex-1 " + (on ? "text-grey line-through decoration-1" : "")}>{ing.name}</span>
                    <span data-testid="qty" className="num font-bold">{fmtQty(ing)}</span>
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
        <div className="mx-auto flex max-w-[440px]">
          <ButtonLink href={`/cozinhar/${recipe.slug}?p=${portions}`}>Começar a cozinhar</ButtonLink>
        </div>
      </div>
    </article>
  );
}
