"use client";

import { useState } from "react";
import type { SendResult } from "@/lib/auth/login";
import { Button, buttonClass } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";

const FAIL = "Não deu para enviar o link agora. Tente de novo.";

/** Entrar sem senha: e-mail, link mágico, e Google/Apple quando configurados no Supabase. */
export function EntrarView({ next, onSend, google = false, apple = false, linkError = false }: {
  next: string; onSend: (email: string, next: string) => Promise<SendResult>;
  google?: boolean; apple?: boolean; linkError?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    const value = email.trim();
    const res = await onSend(value, next).catch((): SendResult => ({ ok: false, message: FAIL }));
    if (res.ok) setSent(value);
    else setError(res.message);
    setSending(false);
  };

  const oauth = async (provider: "google" | "apple") => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    // Carrega o cliente do Supabase só aqui: quem entra pelo e-mail não baixa a biblioteca.
    const { supabaseBrowser } = await import("@/lib/supabase/client");
    const { error: err } = await supabaseBrowser().auth.signInWithOAuth({ provider, options: { redirectTo } });
    if (err) setError(FAIL);
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}>
      <p className="text-[13px] font-medium text-grey">Anaból[IA]</p>

      {sent ? (
        <div className="animate-[stepIn_.32s_cubic-bezier(.22,1,.36,1)]">
          <span aria-hidden="true" className="mt-10 grid size-12 place-items-center rounded-full bg-acc text-white"><CheckIcon size={22} /></span>
          <h1 className="mt-5 text-[28px] font-bold leading-[1.1] tracking-[-0.022em]">Confira seu e-mail</h1>
          <p className="mt-2 text-[15px] leading-snug text-grey">
            Enviamos um link para <span className="font-semibold text-ink">{sent}</span>. Abra no celular para entrar.
          </p>
          <Button variant="text" className="-ml-2 mt-4" onClick={() => setSent(null)}>Usar outro e-mail</Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Entrar</h1>
          <p className="mt-2 text-[15px] leading-snug text-grey">Receba um link no seu e-mail para entrar. Sem senha.</p>

          {linkError && (
            <p className="mt-5 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">Esse link expirou ou já foi usado. Peça outro.</p>
          )}

          <label htmlFor="email" className="mb-2 mt-7 block text-[15px] font-semibold">E-mail</label>
          <input id="email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
            enterKeyHint="send" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="voce@exemplo.com"
            className="h-[54px] w-full rounded-[12px] bg-soft px-4 text-[17px] placeholder:text-ring" />

          {error && <p role="alert" className="mt-3 text-sm font-medium text-ink">{error}</p>}

          <button type="submit" disabled={sending || !email.trim()} className={`${buttonClass("primary")} mt-6 w-full`}>
            {sending ? "Enviando…" : "Receber link"}
          </button>

          {(google || apple) && (
            <div className="mt-6">
              <p className="mb-3 text-center text-[13px] font-medium text-grey">ou</p>
              <div className="space-y-2.5">
                {google && <Button variant="soft" className="w-full" onClick={() => oauth("google")}>Continuar com Google</Button>}
                {apple && <Button variant="soft" className="w-full" onClick={() => oauth("apple")}>Continuar com Apple</Button>}
              </div>
            </div>
          )}
        </form>
      )}
    </main>
  );
}
