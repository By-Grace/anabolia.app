import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export type SendResult = { ok: true } | { ok: false; message: string };

const EmailSchema = z.string().trim().toLowerCase().pipe(z.email());
const FAIL = "Não deu para enviar o link agora. Tente de novo.";
const RATE = "Muitos pedidos seguidos. Espere um minuto e tente de novo.";

type AuthErr = { code?: string; message?: string } | null;
const messageFor = (e: NonNullable<AuthErr>) => (e.code === "over_email_send_rate_limit" ? RATE : FAIL);

/**
 * Manda o link mágico. Conta anônima (quem já marcou refeições sem conta) vira permanente pelo e-mail,
 * sem perder nada; se o e-mail já tem conta, entra nela. Sem sessão, entra ou cria a conta.
 */
export async function sendLoginLink(client: SupabaseClient, rawEmail: string, redirectTo: string): Promise<SendResult> {
  const parsed = EmailSchema.safeParse(rawEmail);
  if (!parsed.success) return { ok: false, message: "Confira o e-mail." };
  const email = parsed.data;

  const { data } = await client.auth.getUser();
  if (data?.user?.is_anonymous) {
    const { error } = await client.auth.updateUser({ email }, { emailRedirectTo: redirectTo });
    if (!error) return { ok: true };
    if ((error as AuthErr)?.code !== "email_exists") return { ok: false, message: messageFor(error as NonNullable<AuthErr>) };
  }

  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
  return error ? { ok: false, message: messageFor(error as NonNullable<AuthErr>) } : { ok: true };
}

/** Só caminho interno ("/hoje"); qualquer outra coisa vira "/". Evita redirecionar para outro site. */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) return "/";
  return next;
}
