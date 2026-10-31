"use client";

import { useId, useRef } from "react";

/**
 * Campo numérico grande: rótulo acima, número em rounded 34/700 com a unidade em cinza logo ao lado,
 * dica embaixo. Superfície suave, sem borda (o foco usa o anel global). Valor é texto: aceita "80,5".
 */
export function NumberField({ label, unit, value, onChange, hint, invalid = false, decimal = false, autoFocus = false, hideLabel = false }: {
  label: string; unit: string; value: string; onChange: (v: string) => void;
  hint?: string; invalid?: boolean; decimal?: boolean; autoFocus?: boolean;
  /** Quando o título em volta (ex.: a folha) já nomeia o campo: o rótulo fica só para leitor de tela. */
  hideLabel?: boolean;
}) {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const hintId = `${id}-dica`;
  return (
    <div>
      <label htmlFor={id} className={hideLabel ? "sr-only" : "mb-2 block text-[15px] font-semibold"}>{label}</label>
      {/* O campo ocupa só a largura do número; tocar em qualquer ponto da superfície abre o teclado. */}
      <div data-testid="number-surface" onClick={() => input.current?.focus()}
        className="field-surface flex h-[72px] cursor-text items-baseline gap-1.5 rounded-[16px] bg-soft px-4 pt-[14px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-acc">
        <input ref={input} id={id} value={value} autoFocus={autoFocus} autoComplete="off" enterKeyHint="next"
          inputMode={decimal ? "decimal" : "numeric"} aria-describedby={hint ? hintId : undefined} aria-invalid={invalid || undefined}
          onChange={(e) => onChange(e.target.value.replace(/[^\d.,]/g, ""))}
          size={Math.max(1, value.length)}
          className="num min-w-[1ch] max-w-full bg-transparent text-[34px] font-bold leading-none tracking-[-0.02em] outline-none placeholder:text-ring"
          placeholder="0" style={{ fieldSizing: "content" } as React.CSSProperties} />
        <span aria-hidden="true" className="flex-none text-[18px] font-semibold text-grey">{unit}</span>
      </div>
      {hint && (
        <p id={hintId} className={"mt-2 text-[13px] " + (invalid ? "font-semibold text-ink" : "font-medium text-grey")}>{hint}</p>
      )}
    </div>
  );
}
