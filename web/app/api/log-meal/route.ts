import { NextResponse } from "next/server";
import { parseLogMealBody } from "@/lib/cook/log-body";
import { supabaseServer } from "@/lib/supabase/server";
import { ensureSession } from "@/lib/supabase/session";
import { supabaseDayRepo } from "@/lib/data/day-repo";

export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Corpo da requisição não é JSON." }, { status: 400 });
  }
  const parsed = parseLogMealBody(raw);
  if (!parsed.ok) return NextResponse.json({ error: parsed.message }, { status: parsed.status });

  try {
    const client = await supabaseServer();
    const { userId } = await ensureSession(client);
    const log = await supabaseDayRepo(client).logMeal(userId, parsed.value);
    return NextResponse.json({ log }, { status: 201 });
  } catch (e) {
    console.error("log-meal POST", e);
    return NextResponse.json({ error: "Não foi possível registrar a refeição." }, { status: 500 });
  }
}
