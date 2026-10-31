import { hasAccess, type Subscription } from "@/lib/domain/access";

export type GateState = { user: boolean; anonymous: boolean; access: boolean };

const PUBLIC = ["/entrar", "/auth/", "/assinar", "/api/pagamento/"];
const APP = ["/hoje", "/receitas", "/cozinhar", "/lista", "/perfil", "/api/log-meal"];
/** Quem tem conta mas ainda não assinou pode fazer o cadastro: no fluxo do spec ele vem antes do paywall. */
const BEFORE_PAYWALL = ["/", "/comecar"];

const under = (path: string, prefix: string) =>
  prefix.endsWith("/") ? path.startsWith(prefix) : path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`);

/**
 * Para onde mandar a pessoa, ou null para seguir. Desligado (PAYWALL != "on"), nunca bloqueia.
 * Sem conta permanente → entrar (voltando para onde estava). Conta sem assinatura → paywall nas telas do app.
 */
export function gate(path: string, s: GateState, paywall: boolean, opts: { hasCode?: boolean } = {}): string | null {
  if (!paywall) return null;
  // Link do e-mail que caiu na raiz: a raiz repassa o código para a troca pela sessão.
  if (path === "/" && opts.hasCode) return null;
  if (PUBLIC.some((p) => under(path, p))) return null;
  const guarded = BEFORE_PAYWALL.includes(path) || APP.some((p) => under(path, p));
  if (!guarded) return null;
  if (!s.user || s.anonymous) return path === "/" ? "/entrar" : `/entrar?next=${encodeURIComponent(path)}`;
  if (BEFORE_PAYWALL.includes(path)) return null;
  return s.access ? null : "/assinar";
}

/** Falha passageira ao ler a assinatura não tranca quem paga: a tela de assinatura confere de novo. */
export async function resolveAccess(read: () => Promise<Subscription | null>, now: Date, opts: { allowTest?: boolean } = {}): Promise<boolean> {
  try {
    return hasAccess(await read(), now, opts);
  } catch {
    return true;
  }
}
