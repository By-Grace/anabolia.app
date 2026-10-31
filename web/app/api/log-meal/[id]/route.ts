import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { getUserId } from "@/lib/supabase/session";
import { supabaseDayRepo } from "@/lib/data/day-repo";

/** Desfaz uma refeição marcada. RLS garante que só o dono apaga. */
export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Id inválido." }, { status: 400 });
  try {
    const client = await supabaseServer();
    const userId = await getUserId(client);
    if (!userId) return NextResponse.json({ error: "Sem sessão." }, { status: 401 });
    await supabaseDayRepo(client).deleteLog(userId, id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    console.error("log-meal DELETE", e);
    return NextResponse.json({ error: "Não foi possível desfazer." }, { status: 500 });
  }
}
