"use client";

import { useState } from "react";
import type { DayBar } from "@/lib/domain/history";
import { fmtInt } from "@/lib/format";

const ddmm = (key: string) => `${key.slice(8, 10)}/${key.slice(5, 7)}`;
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/**
 * Sete colunas verticais na gramática da barra de proteína: trilho cinza com a altura da meta,
 * preenchimento laranja até onde o dia chegou (teto na meta). Tocar numa coluna mostra o valor na leitura acima.
 */
export function WeekChart({ days, goal_g }: { days: DayBar[]; goal_g: number }) {
  const [sel, setSel] = useState(days.length - 1);
  const d = days[sel] ?? days[days.length - 1];
  const label = d.isToday ? "Hoje" : `${cap(d.weekday)}, ${ddmm(d.dayKey)}`;

  return (
    <div>
      <p data-testid="week-readout" aria-live="polite" className="num text-[13px] font-medium text-grey">
        {label} · <span className="font-bold text-ink">{fmtInt(d.protein_g)} g</span> de {fmtInt(goal_g)} g
      </p>
      <ul aria-label="Proteína por dia" className="mt-3 grid grid-cols-7">
        {days.map((day, i) => {
          const on = i === sel;
          const name = `${day.weekday}, ${ddmm(day.dayKey)}: ${fmtInt(day.protein_g)} g${day.met ? ", meta batida" : ""}`;
          return (
            <li key={day.dayKey}>
              <button type="button" aria-label={name} aria-pressed={on} onClick={() => setSel(i)}
                onPointerEnter={(e) => { if (e.pointerType === "mouse") setSel(i); }}
                className="flex w-full flex-col items-center gap-2 rounded-[12px] py-1.5">
                <span aria-hidden="true" className="relative h-[96px] w-[10px] overflow-hidden rounded-full bg-track">
                  {day.protein_g > 0 && (
                    <span className="bar-up absolute inset-x-0 bottom-0 rounded-full bg-acc"
                      style={{ height: `${Math.max(day.progress * 100, 10)}%`, animationDelay: `${i * 40}ms` }} />
                  )}
                </span>
                <span aria-hidden="true" className={"text-[12px] " +
                  (on ? "font-bold text-ink" : day.isToday ? "font-semibold text-ink" : "font-medium text-grey")}>
                  {day.isToday ? "hoje" : day.weekday}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
