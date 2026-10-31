import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNext } from "@/lib/auth/login";
import { supabaseServer } from "@/lib/supabase/server";

/** Volta do link mágico (ou do Google/Apple): troca o código pela sessão e segue para o destino. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = safeNext(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;

  let ok = false;
  try {
    const client = await supabaseServer();
    if (code) ok = !(await client.auth.exchangeCodeForSession(code)).error;
    else if (tokenHash && type) ok = !(await client.auth.verifyOtp({ token_hash: tokenHash, type })).error;
  } catch (e) {
    console.error("auth callback", e);
  }
  return NextResponse.redirect(new URL(ok ? next : "/entrar?erro=link", url.origin));
}
