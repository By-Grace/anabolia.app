"use client";

import { useEffect, useRef, useState } from "react";
import { Segmented } from "@/components/ui/Segmented";
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
  const panel = useRef<HTMLDivElement>(null);
  const n = count(draft);

  useEffect(() => {
    // Foco vai para a folha (leitores de tela anunciam o título) sem acender contorno num controle.
    panel.current?.focus({ preventScroll: true });
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40">
      <div className="absolute inset-0 bg-black/30 animate-[fadeIn_.25s_ease]" onClick={onClose} />
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby="filtros-titulo" tabIndex={-1}
        className="outline-none absolute inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-[28px] bg-paper px-5 pt-2.5 shadow-[0_-10px_40px_rgba(0,0,0,.15)] animate-[sheetIn_.42s_cubic-bezier(.16,1,.3,1)]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-track" />
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id="filtros-titulo" className="text-[22px] font-bold tracking-[-0.02em]">Filtros</h2>
          <button type="button" onClick={() => setDraft(NO_EXTRA)} className="h-11 text-[15px] font-semibold text-acc">Limpar</button>
        </div>

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
      </div>
    </div>
  );
}
