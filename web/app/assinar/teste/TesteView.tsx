"use client";

import { useState } from "react";
import Link from "next/link";
import type { ActionResult } from "../actions";
import { buttonClass } from "@/components/ui/Button";

/** Checkout falso do adaptador de teste. Existe até o pagamento de verdade ser ligado. */
export function TesteView({ onPay }: { onPay: () => Promise<ActionResult> }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pay = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await onPay();
      if (res && !res.ok) setError(res.message);
    } catch (e) {
      if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
      setError("Não deu para registrar o pagamento de teste.");
    }
    setBusy(false);
  };
  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
      <p className="text-[13px] font-medium text-grey">Pagamento de teste</p>
      <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Checkout</h1>
      <p className="mt-3 text-[15px] leading-snug text-grey">Nada é cobrado. Este passo existe até o pagamento de verdade (OnProfit) ser ligado.</p>
      <section className="mt-6 flex items-baseline justify-between rounded-[18px] bg-soft px-[18px] py-4">
        <span className="text-[16px] font-semibold">Anaból[IA] mensal</span>
        <span className="num text-[16px] font-bold">R$ 29,90</span>
      </section>
      <div className="mt-auto pt-8">
        {error && <p role="alert" className="mb-3 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">{error}</p>}
        <button type="button" onClick={pay} disabled={busy} className={`${buttonClass("primary")} w-full`}>
          {busy ? "Registrando…" : "Simular pagamento aprovado"}
        </button>
        <Link href="/assinar" className="mt-1 flex h-11 items-center justify-center text-[15px] font-semibold text-acc">Voltar</Link>
      </div>
    </main>
  );
}
