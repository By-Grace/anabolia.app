import { redirect } from "next/navigation";
import { supabaseProfileRepo } from "@/lib/data/profile-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

/** Entrada do app: sem meta própria vai para o cadastro; com meta, para Hoje. Falha do Supabase vai para Hoje. */
export default async function Home() {
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
