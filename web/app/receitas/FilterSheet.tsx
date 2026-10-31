"use client";

import { useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
import { Sheet } from "@/components/ui/Sheet";
import { buttonClass } from "@/components/ui/Button";
import { QUICK_MAX_MINUTES, type TimeChoice } from "@/lib/domain/filter";

export type Extra = { time: TimeChoice | "todas"; minProtein: number };
export const NO_EXTRA: Extra = { time: "todas", minProtein: 0 };

export const TIME_OPTIONS: { value: Extra["time"]; label: string }[] = [
  { value: "todas", label: "Todas" },
  { value: "rapidas", label: "Rápidas" },
  { value: "demoradas", label: "Demoradas" },
];
export const PROTEIN_OPTIONS = [
  { value: 0, label: "Qualquer" },
  { value: 30, label: "30 g+" },
  { value: 40, label: "40 g+" },
];

const plural = (n: number) => (n === 1 ? "1 receita" : `${n} receitas`);

/**
 * Filtros secundários atrás de um toque (revelação progressiva, Lei de Tesler).
 * O rascunho só vale ao tocar em "Ver N receitas"; fechar descarta.
 */
export function FilterSheet({ initial, count, onApply, onClose }: {
  initial: Extra; count: (draft: Extra) => number; onApply: (e: Extra) => void; onClose: () => void;
}) {
  const [draft, setDraft] = useState<Extra>(initial);
  const n = count(draft);

  return (
    <Sheet title="Filtros" onClose={onClose}
      action={<button type="button" onClick={() => setDraft(NO_EXTRA)} className="h-11 text-[15px] font-semibold text-acc">Limpar</button>}>
      <p className="mb-2 text-[15px] font-semibold">Tempo de preparo</p>
      <Segmented label="Tempo de preparo" size="lg" options={TIME_OPTIONS} value={draft.time}
        onChange={(v) => setDraft((d) => ({ ...d, time: v }))} />
      <p className="mt-2 text-[13px] text-grey">
        Rápidas: até {QUICK_MAX_MINUTES} min. Demoradas: mais de {QUICK_MAX_MINUTES} min.
      </p>

      <p className="mb-2 mt-6 text-[15px] font-semibold">Proteína por porção</p>
      <Segmented label="Proteína por porção" size="lg" options={PROTEIN_OPTIONS} value={draft.minProtein}
        onChange={(v) => setDraft((d) => ({ ...d, minProtein: v }))} />

      <button type="button" onClick={() => onApply(draft)} disabled={n === 0}
        className={`${buttonClass("primary")} mt-8 w-full`}>
        {n === 0 ? "Nenhuma receita" : `Ver ${plural(n)}`}
      </button>
    </Sheet>
  );
}
