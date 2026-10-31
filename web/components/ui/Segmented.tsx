"use client";

import { useRef } from "react";

export type SegOption<T extends string | number> = { value: T; label: string };

/**
 * Controle segmentado do iOS (Lei de Jakob): uma escolha por vez, todas visíveis, polegar que desliza.
 * Acessível como radiogroup com setas do teclado.
 */
export function Segmented<T extends string | number>({ label, options, value, onChange, size = "md" }: {
  label: string; options: SegOption<T>[]; value: T | null; onChange: (v: T) => void; size?: "md" | "lg";
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  // value null = nada escolhido ainda: sem polegar, nenhuma opção marcada, a primeira recebe o foco.
  const found = options.findIndex((o) => o.value === value);
  const idx = Math.max(0, found);
  const n = options.length;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (idx + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div role="radiogroup" aria-label={label} onKeyDown={onKey}
      className={`relative grid rounded-[12px] bg-soft p-[3px] ${size === "lg" ? "h-11" : "h-10"}`}
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      <span aria-hidden="true" className="seg-thumb absolute inset-y-[3px] left-[3px] rounded-[9px] bg-white shadow-[0_1px_3px_rgba(0,0,0,.12),0_1px_1px_rgba(0,0,0,.04)]"
        style={{ width: `calc((100% - 6px) / ${n})`, transform: `translateX(${idx * 100}%)`, opacity: found < 0 ? 0 : 1 }} />
      {options.map((o, i) => {
        const on = i === found;
        return (
          <button key={String(o.value)} ref={(el) => { refs.current[i] = el; }} type="button" role="radio" aria-checked={on}
            tabIndex={i === idx ? 0 : -1} onClick={() => onChange(o.value)}
            className={`relative z-10 truncate px-1 text-[14px] transition-colors ${on ? "font-semibold text-ink" : "font-medium text-grey"}`}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
