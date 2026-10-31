"use client";

import { useId } from "react";

/**
 * Campo numérico grande: rótulo acima, número em rounded 34/700 com a unidade em cinza logo ao lado,
 * dica embaixo. Superfície suave, sem borda (o foco usa o anel global). Valor é texto: aceita "80,5".
 */
export function NumberField({ label, unit, value, onChange, hint, invalid = false, decimal = false, autoFocus = false }: {
  label: string; unit: string; value: string; onChange: (v: string) => void;
  hint?: string; invalid?: boolean; decimal?: boolean; autoFocus?: boolean;
}) {
  const id = useId();
  const hintId = `${id}-dica`;
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-[15px] font-semibold">{label}</label>
      <div className="flex h-[72px] items-baseline gap-1.5 rounded-[16px] bg-soft px-4 pt-[14px] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-acc">
        <input id={id} value={value} autoFocus={autoFocus} autoComplete="off" enterKeyHint="next"
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
