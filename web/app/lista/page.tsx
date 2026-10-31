import { AppShell } from "@/components/ui/AppShell";
import { getRecipes } from "@/lib/recipes/load";
import { shoppingGroups, type ListEntry } from "@/lib/domain/shopping";
import { supabaseListRepo } from "@/lib/data/list-repo";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { ListaView } from "./ListaView";
import { clearListAction, removeFromListAction, setItemCheckedAction } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lista · Anaból[IA]" };

export default async function ListaPage() {
  let entries: ListEntry[] = [];
  let error: string | undefined;
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (userId) entries = await supabaseListRepo(client).getList(userId);
  } catch {
    error = "Não deu para carregar a sua lista agora.";
  }
  return (
    <AppShell>
      <ListaView groups={shoppingGroups(entries, getRecipes())} error={error}
        onCheck={setItemCheckedAction} onRemove={removeFromListAction} onClear={clearListAction} />
    </AppShell>
  );
}
