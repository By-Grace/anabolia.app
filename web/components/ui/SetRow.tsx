import { CheckIcon } from "./icons";

export type SetState = "done" | "todo" | "next";

export function SetRow({ label, sub, value, state }: { label: string; sub?: string; value: string; state: SetState }) {
  const muted = state === "todo";
  return (
    <div data-state={state} data-label={label} className="flex items-center gap-3 border-t border-hair py-3 first:border-t-0">
      <span
        className={
          "grid size-[26px] flex-none place-items-center rounded-full border-2 transition-colors " +
          (state === "done" ? "border-acc bg-acc text-white" : state === "next" ? "border-acc" : "border-ring")
        }
      >
        {state === "done" && <span data-testid="set-check"><CheckIcon /></span>}
      </span>
      <div className={"min-w-0 flex-1 text-base font-semibold tracking-[-0.01em] " + (muted ? "text-grey" : "")}>
        {label}
        {sub && <span className="block truncate text-[13px] font-medium text-grey">{sub}</span>}
      </div>
      <div className={"num text-base font-bold " + (muted ? "text-grey" : "")}>{value}</div>
    </div>
  );
}
