import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

export type SendResult = { ok: true } | { ok: false; message: string };
/** Tipo do código do e-mail: entrada normal ou conversão da conta anônima (troca de e-mail). */
export type CodeKind = "email" | "email_change";

const EmailSchema = z.string().trim().toLowerCase().pipe(z.email());
const FAIL = "Não deu para enviar o link agora. Tente de novo.";
const RATE = "Muitos pedidos seguidos. Espere um minuto e tente de novo.";

type AuthErr = { code?: string; message?: string } | null;
const messageFor = (e: NonNullable<AuthErr>) => (e.code === "over_email_send_rate_limit" ? RATE : FAIL);

/**
 * Manda o link mágico. Conta anônima (quem já marcou refeições sem conta) vira permanente pelo e-mail,
 * sem perder nada; se o e-mail já tem conta, entra nela. Sem sessão, entra ou cria a conta.
 */
export async function sendLoginLink(client: SupabaseClient, rawEmail: string, redirectTo: string): Promise<SendResult>;
export async function sendLoginLink(client: SupabaseClient, rawEmail: string, redirectTo: string, opts: { withKind: true }): Promise<(SendResult & { kind?: CodeKind })>;
export async function sendLoginLink(client: SupabaseClient, rawEmail: string, redirectTo: string, opts?: { withKind?: boolean }): Promise<SendResult & { kind?: CodeKind }> {
  const parsed = EmailSchema.safeParse(rawEmail);
  if (!parsed.success) return { ok: false, message: "Confira o e-mail." };
  const email = parsed.data;
  const done = (kind: CodeKind) => (opts?.withKind ? { ok: true as const, kind } : { ok: true as const });

  const { data, error: sessionError } = await client.auth.getUser();
  // Falha passageira ao ler a sessão: não arriscar criar outra conta e deixar para trás o que a anônima tinha.
  if (sessionError && (sessionError as { name?: string }).name !== "AuthSessionMissingError") return { ok: false, message: FAIL };
  if (data?.user?.is_anonymous) {
    const { error } = await client.auth.updateUser({ email }, { emailRedirectTo: redirectTo });
    if (!error) return done("email_change");
    if ((error as AuthErr)?.code !== "email_exists") return { ok: false, message: messageFor(error as NonNullable<AuthErr>) };
  }

  const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTo, shouldCreateUser: true } });
  return error ? { ok: false, message: messageFor(error as NonNullable<AuthErr>) } : done("email");
}

/**
 * Entrar digitando o código numérico do e-mail. Necessário no app instalado do iPhone, que não
 * compartilha cookies com o Safari onde o link abre (o link com PKCE só vale no navegador que pediu).
 */
export async function verifyLoginCode(client: SupabaseClient, rawEmail: string, rawCode: string, kind: CodeKind): Promise<SendResult> {
  const email = EmailSchema.safeParse(rawEmail);
  const token = rawCode.replace(/\s+/g, "");
  // O tamanho do código é configuração do Supabase (6 a 10); este projeto manda 8.
  if (!/^\d{6,10}$/.test(token)) return { ok: false, message: "Digite só os números do código do e-mail." };
  if (!email.success) return { ok: false, message: "Confira o e-mail." };
  const { error } = await client.auth.verifyOtp({ email: email.data, token, type: kind });
  return error ? { ok: false, message: "Código errado ou vencido. Peça outro link." } : { ok: true };
}

/**
 * Só caminho interno ("/hoje"); qualquer outra coisa vira "/". Evita redirecionar para outro site,
 * inclusive pelos truques que o navegador normaliza ("/\t/site.com", barra invertida).
 */
export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  if (/[\u0000-\u001f\u007f\\]/.test(next)) return "/";
  const base = "https://anabolia.invalid";
  try {
    const u = new URL(next, base);
    if (u.origin !== base) return "/";
    return `${u.pathname}${u.search}${u.hash}`;
  } catch {
    return "/";
  }
}
