import { redirect } from "next/navigation";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

/** Entrada do app: sem meta própria vai para o cadastro; com meta, para Hoje. Falha do Supabase vai para Hoje. */
export default async function Home({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  // Se o Supabase mandou o link do e-mail para a raiz (Site URL), repassa o código para a troca pela sessão.
  const { code } = await searchParams;
  if (code) redirect(`/auth/callback?code=${encodeURIComponent(code)}&next=%2F`);
  let target = "/hoje";
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (!userId || (await supabaseProfileRepo(client).getProfile(userId)).goal.isDefault) target = "/comecar";
  } catch {
    target = "/hoje";
  }
  redirect(target);
}
