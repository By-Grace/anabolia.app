import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { ensureSession } from "@/lib/supabase/session";

/** Garante sessão (anônima nesta fase) antes de qualquer página do app, gravando os cookies na resposta. */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

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

  try {
    await ensureSession(client);
  } catch {
    // Sem sessão a página mostra o estado de erro; não derruba a navegação.
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/|icons/|recipes/|sw.js|manifest.webmanifest|favicon).*)"],
};
