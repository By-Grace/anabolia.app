import type { ReactNode } from "react";
import { TabBar, type Tab } from "./TabBar";

export function AppShell({ title, date, active, children }: { title?: string; date?: string; active: Tab; children: ReactNode }) {
  return (
    <>
      <main className="mx-auto min-h-dvh max-w-[480px] px-5 pb-[calc(96px+env(safe-area-inset-bottom,0px))]"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)" }}>
        {(date || title) && (
          <header className="mb-5">
            {date && <p className="text-[13px] font-medium text-grey">{date}</p>}
            {title && <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">{title}</h1>}
          </header>
        )}
        {children}
      </main>
      <TabBar active={active} />
    </>
  );
}
