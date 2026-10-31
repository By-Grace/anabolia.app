"use client";

import { useState } from "react";
import type { ActionResult } from "./actions";
import { fmtDayMonth } from "@/lib/format";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";

const FAIL = "Não deu para abrir o pagamento agora. Tente de novo.";

/** Paywall: o que vem, quanto custa, a garantia. Um botão. */
export function AssinarView({ recipeCount, access, periodEnd, onStart }: {
  recipeCount: number; access: boolean; periodEnd?: string | null; onStart: () => Promise<ActionResult>;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await onStart();
      if (res && !res.ok) setError(res.message);
    } catch (e) {
      // O redirecionamento para o checkout chega como exceção do Next: deixa passar.
      if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
      setError(FAIL);
    }
    setBusy(false);
  };

  const perks = [`${recipeCount} receitas com a proteína calculada`, "Meta diária e histórico da semana", "Lista de compras das suas receitas"];

  return (
    <main className="mx-auto min-h-dvh max-w-[480px] px-5 pb-[calc(140px+env(safe-area-inset-bottom,0px))]"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)" }}>
      <p className="text-[13px] font-medium text-grey">Anaból[IA]</p>
      <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Assinatura</h1>

      {access ? (
        <>
          <p className="mt-3 text-[15px] leading-snug text-grey">
            {periodEnd ? `Sua assinatura está ativa até ${fmtDayMonth(periodEnd)}.` : "Sua assinatura está ativa."}
          </p>
          <ButtonLink href="/hoje" className="mt-6 w-full">Ir para Hoje</ButtonLink>
        </>
      ) : (
        <>
          <ul className="mt-6">
            {perks.map((p) => (
              <li key={p} className="flex items-center gap-3 border-t border-hair py-3 first:border-t-0">
                <span aria-hidden="true" className="grid size-[22px] flex-none place-items-center rounded-full bg-acc text-white"><CheckIcon size={12} /></span>
                <span className="text-[16px] font-semibold tracking-[-0.01em]">{p}</span>
              </li>
            ))}
          </ul>

          <section aria-label="Preço" className="mt-6 rounded-[18px] bg-soft px-[18px] pb-[18px] pt-4">
            <div data-testid="price" className="num leading-none"><span className="text-[44px] font-bold tracking-[-0.02em]">R$ 29,90</span><small className="ml-1.5 text-[17px] font-semibold text-grey">por mês</small></div>
            <p className="mt-3 text-[14px] leading-snug text-grey">Pix ou cartão. Cancela quando quiser no Perfil.</p>
            <p className="mt-1 text-[14px] leading-snug text-grey">Garantia de 7 dias: se não gostar, devolvemos o valor.</p>
          </section>

          <div className="fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-white from-70% to-white/0 px-5 pt-3"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
            <div className="mx-auto max-w-[440px]">
              {error && <p role="alert" className="mb-2 text-sm font-medium text-ink">{error}</p>}
              <button type="button" onClick={start} disabled={busy} className={`${buttonClass("primary")} w-full`}>
                {busy ? "Abrindo…" : "Assinar por R$ 29,90/mês"}
              </button>
            </div>
          </div>
        </>
      )}
    </main>
  );
}
