"use client";

import { useState } from "react";
import type { CodeKind, SendResult } from "@/lib/auth/login";
import { Button, buttonClass } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/icons";

const FAIL = "Não deu para enviar o link agora. Tente de novo.";

/** Entrar sem senha: e-mail, link mágico, e Google/Apple quando configurados no Supabase. */
export function EntrarView({ next, onSend, onVerify, google = false, apple = false, linkError = false }: {
  next: string;
  onSend: (email: string, next: string) => Promise<SendResult & { kind?: CodeKind }>;
  /** Entrar pelo código de 6 dígitos do e-mail (o link não funciona no app instalado do iPhone). */
  onVerify?: (email: string, code: string, kind: CodeKind, next: string) => Promise<SendResult>;
  google?: boolean; apple?: boolean; linkError?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [kind, setKind] = useState<CodeKind>("email");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    const value = email.trim();
    const res = await onSend(value, next).catch((): SendResult & { kind?: CodeKind } => ({ ok: false, message: FAIL }));
    if (res.ok) { setSent(value); setKind(res.kind ?? "email"); setCode(""); setCodeError(null); }
    else setError(res.message);
    setSending(false);
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onVerify || !sent || verifying) return;
    setVerifying(true);
    setCodeError(null);
    try {
      const res = await onVerify(sent, code, kind, next);
      if (!res.ok) setCodeError(res.message);
    } catch (err) {
      // Código certo: a ação redireciona (exceção do Next), deixa passar.
      if ((err as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw err;
      setCodeError("Não deu para entrar agora. Tente de novo.");
    }
    setVerifying(false);
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
          {onVerify && (
            <form onSubmit={verify} noValidate className="mt-7">
              <label htmlFor="codigo" className="mb-2 block text-[15px] font-semibold">Código de 6 dígitos</label>
              <p className="mb-2 text-[13px] text-grey">Se o link abrir em outro navegador, digite aqui o código do mesmo e-mail.</p>
              <input id="codigo" inputMode="numeric" autoComplete="one-time-code" maxLength={7} value={code}
                onChange={(ev) => setCode(ev.target.value.replace(/[^\d ]/g, ""))} placeholder="000000"
                className="num h-[54px] w-full rounded-[12px] bg-soft px-4 text-[22px] font-bold tracking-[0.2em] placeholder:text-ring" />
              {codeError && <p role="alert" className="mt-3 text-sm font-medium text-ink">{codeError}</p>}
              <button type="submit" disabled={verifying || code.replace(/\s/g, "").length !== 6} className={`${buttonClass("primary")} mt-4 w-full`}>
                {verifying ? "Entrando…" : "Entrar com o código"}
              </button>
            </form>
          )}
          <Button variant="text" className="-ml-2 mt-4" onClick={() => setSent(null)}>Usar outro e-mail</Button>
        </div>
      ) : (
        <form onSubmit={submit} noValidate>
          <h1 className="mt-0.5 text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Entrar</h1>
          <p className="mt-2 text-[15px] leading-snug text-grey">Receba um link no seu e-mail para entrar. Sem senha.</p>

          {linkError && (
            <p className="mt-5 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">Esse link não abriu aqui. Ele vence, só vale uma vez e só funciona no navegador onde você pediu. Peça outro e, se precisar, use o código de 6 dígitos do e-mail.</p>
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
