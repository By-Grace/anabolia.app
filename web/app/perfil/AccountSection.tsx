"use client";

import { useState } from "react";
import Link from "next/link";
import type { Subscription } from "@/lib/domain/access";
import { fmtDayMonth } from "@/lib/format";
import { ButtonLink, buttonClass } from "@/components/ui/Button";

export type Account = { email: string | null; subscription: Subscription | null; access: boolean; subscriptionError?: boolean };
export type CancelResult = { ok: true; subscription: Subscription | null } | { ok: false; message: string };

const FAIL = "Não deu para cancelar agora. Tente de novo.";

function statusText(sub: Subscription | null, access: boolean): string | null {
  if (!sub || !access) return null;
  const until = sub.currentPeriodEnd ? fmtDayMonth(sub.currentPeriodEnd) : null;
  if (sub.status === "ativa" && !sub.cancelAtPeriodEnd) return until ? `Ativa, renova em ${until}` : "Ativa";
  if (sub.status === "atrasada") return until ? `Pagamento atrasado, acesso até ${until}` : "Pagamento atrasado";
  return until ? `Cancelada, acesso até ${until}` : "Cancelada";
}

/** Conta no Perfil (spec 3.8): e-mail, assinatura, cancelar e sair. Sem conta: o caminho para criar. */
export function AccountSection({ account, onCancel, onSignOut }: {
  account: Account; onCancel: () => Promise<CancelResult>; onSignOut: () => Promise<void>;
}) {
  const [sub, setSub] = useState(account.subscription);
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!account.email) {
    return (
      <section aria-labelledby="conta" className="mt-6">
        <h2 id="conta" className="text-[19px] font-bold tracking-[-0.015em]">Conta</h2>
        <p className="mt-1.5 text-[15px] leading-snug text-grey">Crie uma conta para guardar seus dados e usar em outro celular.</p>
        <ButtonLink href={`/entrar?next=${encodeURIComponent("/perfil")}`} variant="soft" className="mt-4">Criar conta</ButtonLink>
      </section>
    );
  }

  const status = statusText(sub, account.access || sub?.status === "cancelada");
  const cancellable = !!sub && sub.status === "ativa" && !sub.cancelAtPeriodEnd;
  const until = sub?.currentPeriodEnd ? fmtDayMonth(sub.currentPeriodEnd) : null;

  const cancel = async () => {
    setBusy(true);
    setError(null);
    const res = await onCancel().catch((): CancelResult => ({ ok: false, message: FAIL }));
    if (res.ok) { setSub(res.subscription); setConfirming(false); }
    else setError(res.message);
    setBusy(false);
  };

  return (
    <section aria-labelledby="conta" className="mt-6">
      <h2 id="conta" className="mb-1 text-[19px] font-bold tracking-[-0.015em]">Conta</h2>
      <div className="flex items-center gap-3 border-t border-hair py-3">
        <span className="flex-none text-[16px] font-semibold tracking-[-0.01em]">E-mail</span>
        <span className="min-w-0 flex-1 truncate text-right text-[15px] text-grey">{account.email}</span>
      </div>
      <div className="flex items-center gap-3 border-t border-hair py-3">
        <span className="min-w-0 flex-1">
          <span className="block text-[16px] font-semibold tracking-[-0.01em]">Assinatura</span>
          <span className="num mt-0.5 block text-[13px] font-medium text-grey">
            {account.subscriptionError ? "Não deu para ver a assinatura agora." : status ?? "Sem assinatura"}
          </span>
        </span>
        {!status && !account.subscriptionError && <Link href="/assinar" className="inline-flex h-11 items-center px-2 text-[15px] font-semibold text-acc">Assinar</Link>}
      </div>

      {confirming && (
        <div className="mb-2 mt-1 rounded-[16px] bg-soft px-4 py-4 animate-[fadeIn_.2s_ease]">
          <p className="text-[16px] font-semibold tracking-[-0.01em]">Cancelar a assinatura?</p>
          {until && <p className="num mt-1 text-[14px] text-grey">Você mantém o acesso até {until}.</p>}
          {error && <p role="alert" className="mt-2 text-sm font-medium text-ink">{error}</p>}
          <div className="mt-4 flex gap-2.5">
            <button type="button" onClick={() => { setConfirming(false); setError(null); }} className={`${buttonClass("soft")} h-11 flex-1 bg-white`}>Manter</button>
            <button type="button" onClick={cancel} disabled={busy} className={`${buttonClass("primary")} h-11 text-[16px]`}>
              {busy ? "Cancelando…" : "Confirmar cancelamento"}
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-start">
        {cancellable && !confirming && (
          <button type="button" onClick={() => setConfirming(true)} className="-ml-2 h-11 px-2 text-[15px] font-semibold text-acc">Cancelar assinatura</button>
        )}
        <button type="button" onClick={() => onSignOut()} className="-ml-2 h-11 px-2 text-[15px] font-semibold text-acc">Sair</button>
      </div>
    </section>
  );
}
