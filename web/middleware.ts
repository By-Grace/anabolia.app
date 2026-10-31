import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { gate, resolveAccess } from "@/lib/auth/gate";
import { readSubscription } from "@/lib/data/subscription-repo";

/**
 * 1. Renova a sessão existente (tokens em cookie). Não cria contas: a sessão anônima nasce na primeira
 *    ação que grava (marcar refeição, favoritar, pôr na lista, salvar a meta).
 * 2. Com PAYWALL=on, aplica o bloqueio: sem conta → entrar; conta sem assinatura → paywall.
 *    Desligado, nada muda para quem usa hoje.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const paywall = process.env.PAYWALL === "on";
  const hasSession = request.cookies.getAll().some((c) => c.name.startsWith("sb-"));
  if (!url || !anonKey) return response;
  if (!paywall && !hasSession) return response;

  const client = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        for (const { name, value } of list) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of list) response.cookies.set(name, value, options);
      },
    },
  });

  let user: { id: string; is_anonymous?: boolean } | null = null;
  if (hasSession) {
    const { data } = await client.auth.getUser().catch(() => ({ data: { user: null } }));
    user = data.user;
  }
  if (!paywall) return response;

  const path = request.nextUrl.pathname;
  const permanent = !!user && !user.is_anonymous;
  const access = permanent ? await resolveAccess(() => readSubscription(client, user!.id), new Date()) : false;
  const dest = gate(path, { user: !!user, anonymous: !!user?.is_anonymous, access }, true);
  if (!dest) return response;

  if (path.startsWith("/api/")) {
    return NextResponse.json({ error: permanent ? "Assinatura necessária." : "Entre na sua conta." }, { status: permanent ? 402 : 401 });
  }
  const redirect = NextResponse.redirect(new URL(dest, request.url));
  // Mantém os cookies de sessão renovados neste mesmo pedido.
  for (const c of response.cookies.getAll()) redirect.cookies.set(c);
  return redirect;
}

export const config = {
  matcher: ["/", "/hoje", "/comecar", "/lista", "/perfil", "/receitas/:path*", "/cozinhar/:path*", "/api/:path*"],
};
