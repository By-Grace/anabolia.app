import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { supabaseEnv } from "./env";

/** Cliente Supabase para Server Components, Route Handlers e Server Actions. */
export async function supabaseServer() {
  const { url, anonKey } = supabaseEnv();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          for (const { name, value, options } of list) store.set(name, value, options);
        } catch {
          // Server Component: cookies são só leitura. O middleware renova a sessão.
        }
      },
    },
  });
}
