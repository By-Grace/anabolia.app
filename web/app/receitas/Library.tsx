"use client";

import { useMemo, useState } from "react";
import type { MealSlot, Recipe } from "@/lib/recipes/schema";
import { MEAL_SLOTS, MEAL_SLOT_LABEL } from "@/lib/recipes/schema";
import { filterRecipes } from "@/lib/domain/filter";
import { RecipeRow } from "@/components/RecipeRow";
import { SearchIcon } from "@/components/ui/icons";

const TIMES = [15, 30] as const;
const PROTEINS = [30, 40, 45] as const;

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick}
      className={"h-9 flex-none whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors " +
        (on ? "bg-ink text-white" : "bg-soft text-ink")}>
      {children}
    </button>
  );
}

export function Library({ recipes, favorites, initialSlot, onToggleFavorite }: {
  recipes: Recipe[];
  favorites: string[];
  initialSlot?: MealSlot;
  onToggleFavorite: (slug: string) => Promise<boolean> | void;
}) {
  const [slot, setSlot] = useState<MealSlot | undefined>(initialSlot);
  const [maxMinutes, setMaxMinutes] = useState<number | undefined>();
  const [minProtein, setMinProtein] = useState<number | undefined>();
  const [query, setQuery] = useState("");
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [favs, setFavs] = useState<string[]>(favorites);

  const list = useMemo(
    () => filterRecipes(recipes, { slot, maxMinutes, minProtein, query, favoritesOnly, favorites: favs }),
    [recipes, slot, maxMinutes, minProtein, query, favoritesOnly, favs]
  );

  const toggleFav = (slug: string) => {
    const wasFav = favs.includes(slug);
    setFavs((f) => (wasFav ? f.filter((s) => s !== slug) : [...f, slug]));
    Promise.resolve(onToggleFavorite(slug)).catch(() => {
      setFavs((f) => (wasFav ? [...f, slug] : f.filter((s) => s !== slug)));
    });
  };

  return (
    <>
      <label className="flex h-11 items-center gap-2 rounded-xl bg-soft px-3 text-grey">
        <SearchIcon size={18} />
        <input type="search" id="busca" value={query} onChange={(e) => setQuery(e.target.value)}
          aria-label="Buscar receita ou ingrediente" placeholder="Receita ou ingrediente"
          className="h-full min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-grey" />
      </label>

      <div className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        <Chip on={favoritesOnly} onClick={() => setFavoritesOnly((v) => !v)}>Favoritas</Chip>
        {MEAL_SLOTS.map((s) => (
          <Chip key={s} on={slot === s} onClick={() => setSlot((v) => (v === s ? undefined : s))}>{MEAL_SLOT_LABEL[s]}</Chip>
        ))}
      </div>
      <div className="-mx-5 mt-2 flex gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none]">
        {TIMES.map((m) => (
          <Chip key={m} on={maxMinutes === m} onClick={() => setMaxMinutes((v) => (v === m ? undefined : m))}>Até {m} min</Chip>
        ))}
        {PROTEINS.map((p) => (
          <Chip key={p} on={minProtein === p} onClick={() => setMinProtein((v) => (v === p ? undefined : p))}>{p} g+</Chip>
        ))}
      </div>

      {list.length ? (
        <ul className="mt-3">
          {list.map((r) => (
            <RecipeRow key={r.slug} recipe={r} favorite={favs.includes(r.slug)} onToggleFavorite={toggleFav} />
          ))}
        </ul>
      ) : (
        <p className="mt-10 text-center text-[15px] text-grey">Nenhuma receita com esses filtros</p>
      )}
    </>
  );
}
