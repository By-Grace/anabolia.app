"use client";

import { useCallback, useMemo, useState } from "react";
import type { MealSlot, Recipe } from "@/lib/recipes/schema";
import { MEAL_SLOTS, MEAL_SLOT_LABEL } from "@/lib/recipes/schema";
import { filterRecipes } from "@/lib/domain/filter";
import { RecipeRow } from "@/components/RecipeRow";
import { Segmented } from "@/components/ui/Segmented";
import { CloseIcon, FiltersIcon, HeartIcon, SearchIcon } from "@/components/ui/icons";
import { FilterSheet, NO_EXTRA, PROTEIN_OPTIONS, TIME_OPTIONS, type Extra } from "./FilterSheet";

type SlotValue = MealSlot | "todas";
const SLOT_OPTIONS = [{ value: "todas" as SlotValue, label: "Todas" }, ...MEAL_SLOTS.map((s) => ({ value: s as SlotValue, label: MEAL_SLOT_LABEL[s] }))];
const plural = (n: number) => (n === 1 ? "1 receita" : `${n} receitas`);
const labelOf = <T,>(opts: { value: T; label: string }[], v: T) => opts.find((o) => o.value === v)?.label ?? "";

/**
 * Biblioteca. Leis de UX aplicadas: Hick (de 10 chips para 1 seletor + 2 botões),
 * Tesler (tempo — todas, rápidas ou demoradas — e proteína atrás de "Filtros"), Jakob (controle segmentado do iOS),
 * Fitts (alvos de 44 pt), atenção seletiva (contagem de resultados e filtros ativos visíveis).
 */
export function Library({ recipes, favorites, initialSlot, onToggleFavorite }: {
  recipes: Recipe[];
  favorites: string[];
  initialSlot?: MealSlot;
  onToggleFavorite: (slug: string) => Promise<boolean> | void;
}) {
  const [slot, setSlot] = useState<SlotValue>(initialSlot ?? "todas");
  const [query, setQuery] = useState("");
  const [extra, setExtra] = useState<Extra>(NO_EXTRA);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>(favorites);
  const [sheet, setSheet] = useState(false);

  const run = useCallback(
    (e: Extra) => filterRecipes(recipes, {
      slot: slot === "todas" ? undefined : slot,
      time: e.time === "todas" ? undefined : e.time,
      minProtein: e.minProtein || undefined,
      query, favoritesOnly, favorites: favs,
    }),
    [recipes, slot, query, favoritesOnly, favs]
  );
  const list = useMemo(() => run(extra), [run, extra]);
  const activeCount = (extra.time !== "todas" ? 1 : 0) + (extra.minProtein ? 1 : 0);

  const toggleFav = (slug: string) => {
    const wasFav = favs.includes(slug);
    setFavs((f) => (wasFav ? f.filter((s) => s !== slug) : [...f, slug]));
    Promise.resolve(onToggleFavorite(slug)).catch(() => {
      setFavs((f) => (wasFav ? [...f, slug] : f.filter((s) => s !== slug)));
    });
  };

  const clearAll = () => { setSlot("todas"); setQuery(""); setExtra(NO_EXTRA); setFavoritesOnly(false); };

  const iconBtn = "relative grid size-11 flex-none place-items-center rounded-xl transition-colors";

  return (
    <>
      <div className="flex items-center gap-2">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-soft px-3 text-grey">
          <SearchIcon />
          <input type="search" id="busca" value={query} onChange={(e) => setQuery(e.target.value)}
            aria-label="Buscar receita ou ingrediente" placeholder="Receita ou ingrediente"
            className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-grey" />
        </label>
        <button type="button" aria-label="Só favoritas" aria-pressed={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}
          className={`${iconBtn} ${favoritesOnly ? "bg-acc-soft text-acc" : "bg-soft text-ink"}`}>
          <HeartIcon size={22} filled={favoritesOnly} />
        </button>
        <button type="button" aria-label={activeCount ? `Filtros, ${activeCount} ${activeCount === 1 ? "ativo" : "ativos"}` : "Filtros"}
          aria-haspopup="dialog" onClick={() => setSheet(true)}
          className={`${iconBtn} ${activeCount ? "bg-ink text-white" : "bg-soft text-ink"}`}>
          <FiltersIcon />
          {activeCount > 0 && (
            <span aria-hidden="true" className="num absolute -right-1 -top-1 grid size-5 place-items-center rounded-full bg-acc text-[11px] font-bold text-white ring-2 ring-white">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      <div className="mt-3">
        <Segmented label="Refeição" options={SLOT_OPTIONS} value={slot} onChange={setSlot} />
      </div>

      <div className="mt-3 flex min-h-7 flex-wrap items-center gap-2">
        <span className="num mr-auto text-[13px] font-medium text-grey" aria-live="polite">{plural(list.length)}</span>
        {extra.time !== "todas" && (
          <ActiveChip label={labelOf(TIME_OPTIONS, extra.time)} onRemove={() => setExtra((e) => ({ ...e, time: "todas" }))} />
        )}
        {extra.minProtein > 0 && (
          <ActiveChip label={labelOf(PROTEIN_OPTIONS, extra.minProtein)} onRemove={() => setExtra((e) => ({ ...e, minProtein: 0 }))} />
        )}
      </div>

      {list.length ? (
        <ul className="mt-1">
          {list.map((r) => (
            <RecipeRow key={r.slug} recipe={r} favorite={favs.includes(r.slug)} onToggleFavorite={toggleFav} />
          ))}
        </ul>
      ) : (
        <div className="mt-12 text-center">
          <p className="text-[15px] text-grey">Nenhuma receita com esses filtros</p>
          <button type="button" onClick={clearAll} className="mt-2 h-11 px-3 text-[15px] font-semibold text-acc">Limpar filtros</button>
        </div>
      )}

      {sheet && (
        <FilterSheet initial={extra} count={(d) => run(d).length}
          onApply={(e) => { setExtra(e); setSheet(false); }} onClose={() => setSheet(false)} />
      )}
    </>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button type="button" onClick={onRemove} aria-label={`Remover filtro ${label}`}
      className="inline-flex h-7 items-center gap-1.5 rounded-full bg-ink pl-3 pr-2 text-[13px] font-semibold text-white">
      {label}<CloseIcon size={12} />
    </button>
  );
}
