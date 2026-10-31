"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { safeNext, sendLoginLink, type SendResult } from "@/lib/auth/login";
import { supabaseServer } from "@/lib/supabase/server";

/** Endereço do site para o link do e-mail (precisa estar na lista de redirecionamento do Supabase). */
async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3100";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function sendLoginLinkAction(email: string, next: string): Promise<SendResult> {
  try {
    const client = await supabaseServer();
    const redirectTo = `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
    return await sendLoginLink(client, email, redirectTo);
  } catch (e) {
    console.error("entrar: link", e);
    return { ok: false, message: "Não deu para enviar o link agora. Tente de novo." };
  }
}

export async function signOutAction(): Promise<void> {
  const client = await supabaseServer();
  await client.auth.signOut();
  redirect("/entrar");
}
