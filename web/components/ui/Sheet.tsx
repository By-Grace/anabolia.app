"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";

/**
 * Folha que sobe de baixo (padrão da folha de filtros): véu 30%, raio 28 no topo, alça, título 22/700
 * com uma ação de texto opcional à direita. Foco vai para o painel, Esc e toque no véu fecham, a página não rola.
 */
export function Sheet({ title, onClose, action, children }: {
  title: string; onClose: () => void; action?: ReactNode; children: ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
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
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}
        className="outline-none absolute inset-x-0 bottom-0 mx-auto max-w-[480px] rounded-t-[28px] bg-paper px-5 pt-2.5 shadow-[0_-10px_40px_rgba(0,0,0,.15)] animate-[sheetIn_.42s_cubic-bezier(.16,1,.3,1)]"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
        <div aria-hidden="true" className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-track" />
        <div className="mb-5 flex items-baseline justify-between">
          <h2 id={titleId} className="text-[22px] font-bold tracking-[-0.02em]">{title}</h2>
          {action}
        </div>
        {children}
      </div>
    </div>
  );
}
