import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth/login";
import { supabaseServer } from "@/lib/supabase/server";
import { EntrarView } from "./EntrarView";
import { sendLoginLinkAction, verifyCodeAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar · Anaból[IA]" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next: rawNext, erro } = await searchParams;
  const next = safeNext(rawNext);
  // Quem já tem conta (não anônima) não precisa desta tela.
  try {
    const { data } = await (await supabaseServer()).auth.getUser();
    if (data.user && !data.user.is_anonymous) redirect(next);
  } catch (e) {
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) throw e;
  }
  return (
    <EntrarView next={next} onSend={sendLoginLinkAction} onVerify={verifyCodeAction} linkError={erro === "link"}
      google={process.env.NEXT_PUBLIC_LOGIN_GOOGLE === "on"} apple={process.env.NEXT_PUBLIC_LOGIN_APPLE === "on"} />
  );
}
