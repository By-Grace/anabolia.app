"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CheckIcon } from "./icons";

export type SetState = "done" | "todo" | "next";

/**
 * Uma refeição do dia, como uma série de treino.
 * `href` torna o texto um link; `onCheck` torna o círculo um botão de marcar; `animate` preenche o círculo ao montar.
 */
export function SetRow({ label, sub, value, state, href, onCheck, animate }: {
  label: string; sub?: string; value: string; state: SetState;
  href?: string; onCheck?: () => void; animate?: boolean;
}) {
  const [filled, setFilled] = useState(state === "done" && !animate);
  useEffect(() => {
    if (state !== "done") { setFilled(false); return; }
    if (!animate) { setFilled(true); return; }
    const id = setTimeout(() => setFilled(true), 350);
    return () => clearTimeout(id);
  }, [state, animate]);

  const muted = state === "todo";
  const ring = (
    <span className={
      "grid size-[26px] flex-none place-items-center rounded-full border-2 transition-colors duration-500 " +
      (filled ? "border-acc bg-acc text-white" : state === "next" ? "border-ink" : state === "done" ? "border-acc" : "border-ring")
    }>
      {state === "done" && <span data-testid="set-check" className={"transition-opacity duration-300 " + (filled ? "opacity-100" : "opacity-0")}><CheckIcon /></span>}
    </span>
  );

  const body = (
    <>
      <span className={"min-w-0 flex-1 text-base font-semibold tracking-[-0.01em] " + (muted ? "text-grey" : "")}>
        {label}
        {sub && <span className="block truncate text-[13px] font-medium text-grey">{sub}</span>}
      </span>
      <span className={"num text-base font-bold " + (muted ? "text-grey" : "")}>{value}</span>
    </>
  );

  return (
    <div data-testid="meal-row" data-state={state} data-label={label}
      className="flex items-center gap-3 border-t border-hair py-3 first:border-t-0">
      {onCheck ? (
        <button type="button" onClick={onCheck} aria-label={`Marcar ${label} como feito`} className="-m-2 p-2">{ring}</button>
      ) : ring}
      {href ? <Link href={href} className="flex min-w-0 flex-1 items-center gap-3">{body}</Link> : <div className="flex min-w-0 flex-1 items-center gap-3">{body}</div>}
    </div>
  );
}
