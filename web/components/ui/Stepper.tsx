"use client";

import { MAX_PORTIONS, MIN_PORTIONS } from "@/lib/domain/scale";
import { MinusIcon, PlusIcon } from "./icons";

export function Stepper({ value, onChange, min = MIN_PORTIONS, max = MAX_PORTIONS }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  const btn = "grid h-8 w-9 place-items-center text-lg leading-none text-ink disabled:text-ring";
  return (
    <div role="group" aria-label="Porções" className="inline-flex items-center overflow-hidden rounded-[10px] bg-soft">
      <button type="button" className={btn} aria-label="Menos uma porção" disabled={value <= min} onClick={() => onChange(value - 1)}><MinusIcon /></button>
      <span className="num min-w-7 text-center text-[15px] font-bold" aria-live="polite">{value}</span>
      <button type="button" className={btn} aria-label="Mais uma porção" disabled={value >= max} onClick={() => onChange(value + 1)}><PlusIcon /></button>
    </div>
  );
}
