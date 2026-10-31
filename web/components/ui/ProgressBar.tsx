"use client";

import { useEffect, useState } from "react";

const pctOf = (v: number | undefined) => Math.round(Math.min(1, Math.max(0, Number.isFinite(v) ? (v as number) : 0)) * 100);

/** Barra de progresso. Com `from`, monta no valor anterior e sobe até `value` (o momento "série concluída"). */
export function ProgressBar({ value, from, label }: { value: number; from?: number; label: string }) {
  const target = pctOf(value);
  const [shown, setShown] = useState(from === undefined ? target : pctOf(from));

  useEffect(() => {
    if (shown === target) return;
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setShown(target)));
    return () => cancelAnimationFrame(id);
  }, [target, shown]);

  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={target}
      className="relative h-2.5 w-full overflow-hidden rounded-full bg-track">
      <div className="absolute inset-y-0 left-0 rounded-full bg-acc transition-[width] duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)]"
        style={{ width: `${shown}%` }} />
    </div>
  );
}
