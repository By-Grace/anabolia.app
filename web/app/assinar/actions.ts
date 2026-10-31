"use server";

import { redirect } from "next/navigation";
import { getProvider, PaymentConfigError } from "@/lib/payments";
import { applyPaymentEvent } from "@/lib/payments/apply";
import { testePaidEvent } from "@/lib/payments/teste";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { supabaseServer } from "@/lib/supabase/server";

export type ActionResult = { ok: false; message: string } | void;

const UNAVAILABLE = "O pagamento ainda não está disponível. Tente mais tarde.";
const LOGIN = `/entrar?next=${encodeURIComponent("/assinar")}`;

/** Assinar exige conta com e-mail: é por ele que o provedor reconhece quem pagou. */
async function permanentUser(): Promise<{ id: string; email: string } | null> {
  const { data } = await (await supabaseServer()).auth.getUser();
  const u = data?.user;
  return u && !u.is_anonymous && u.email ? { id: u.id, email: u.email } : null;
}

export async function startCheckoutAction(): Promise<ActionResult> {
  const user = await permanentUser();
  if (!user) redirect(LOGIN);
  const provider = getProvider();
  if (!provider) return { ok: false, message: UNAVAILABLE };
  let url: string;
  try {
    url = await provider.checkoutUrl({ userId: user.id, email: user.email });
  } catch (e) {
    if (!(e instanceof PaymentConfigError)) console.error("assinar: checkout", e);
    return { ok: false, message: UNAVAILABLE };
  }
  redirect(url);
}

/** Só no adaptador de teste e nunca em produção: aprova um pagamento de 30 dias para a pessoa. */
export async function simulateTestPaymentAction(): Promise<ActionResult> {
  if (process.env.VERCEL_ENV === "production") return { ok: false, message: "Pagamento de teste não existe em produção." };
  if (getProvider()?.id !== "teste") return { ok: false, message: UNAVAILABLE };
  const user = await permanentUser();
  if (!user) redirect(LOGIN);
  try {
    await applyPaymentEvent(supabaseAdmin(), testePaidEvent(user.id, user.email), { simulado: true });
  } catch (e) {
    console.error("assinar: pagamento de teste", e);
    return { ok: false, message: "Não deu para registrar o pagamento de teste." };
  }
  redirect("/hoje");
}
