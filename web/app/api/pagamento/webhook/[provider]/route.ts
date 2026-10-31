import { NextResponse } from "next/server";
import { getProvider, PaymentConfigError } from "@/lib/payments";
import { applyPaymentEvent } from "@/lib/payments/apply";
import { supabaseAdmin } from "@/lib/supabase/admin";

/** Webhook de pagamento: verifica a assinatura do provedor, registra e aplica o evento. */
export async function POST(request: Request, { params }: { params: Promise<{ provider: string }> }) {
  const { provider: id } = await params;
  const provider = getProvider(id);
  if (!provider) return NextResponse.json({ error: "Provedor desconhecido." }, { status: 404 });

  let parsed;
  try {
    parsed = await provider.parseWebhook(request);
  } catch (e) {
    if (e instanceof PaymentConfigError) return NextResponse.json({ error: e.message }, { status: 503 });
    throw e;
  }
  if (!parsed) return NextResponse.json({ error: "Assinatura inválida." }, { status: 401 });

  try {
    const result = await applyPaymentEvent(supabaseAdmin(), parsed.event, parsed.raw);
    return NextResponse.json({ result });
  } catch (e) {
    console.error("webhook de pagamento", e);
    return NextResponse.json({ error: "Falha ao aplicar o evento." }, { status: 500 });
  }
}
