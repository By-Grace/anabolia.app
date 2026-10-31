"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext, sendLoginLink, verifyLoginCode, type CodeKind, type SendResult } from "@/lib/auth/login";
import { supabaseServer } from "@/lib/supabase/server";

/** Endereço do site para o link do e-mail (precisa estar na lista de redirecionamento do Supabase). */
async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3100";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function sendLoginLinkAction(email: string, next: string): Promise<SendResult & { kind?: CodeKind }> {
  try {
    const client = await supabaseServer();
    const redirectTo = `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
    return await sendLoginLink(client, email, redirectTo, { withKind: true });
  } catch (e) {
    console.error("entrar: link", e);
    return { ok: false, message: "Não deu para enviar o link agora. Tente de novo." };
  }
}

/** Entrar pelo código de 6 dígitos; certo, segue para o destino. */
export async function verifyCodeAction(email: string, code: string, kind: CodeKind, next: string): Promise<SendResult> {
  const k: CodeKind = kind === "email_change" ? "email_change" : "email";
  let res: SendResult;
  try {
    res = await verifyLoginCode(await supabaseServer(), email, code, k);
  } catch (e) {
    console.error("entrar: código", e);
    return { ok: false, message: "Não deu para entrar agora. Tente de novo." };
  }
  if (!res.ok) return res;
  redirect(safeNext(next));
}

export async function signOutAction(): Promise<void> {
  const client = await supabaseServer();
  await client.auth.signOut();
  redirect("/entrar");
}
