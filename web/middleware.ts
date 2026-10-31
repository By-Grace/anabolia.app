import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Só renova a sessão existente (tokens em cookie). Não cria contas:
 * a sessão anônima nasce na primeira ação que grava (marcar refeição, favoritar).
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;
  if (!request.cookies.getAll().some((c) => c.name.startsWith("sb-"))) return response;

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
  await client.auth.getUser().catch(() => {});
  return response;
}

export const config = {
  matcher: ["/hoje", "/receitas/:path*", "/cozinhar/:path*", "/api/:path*"],
};
