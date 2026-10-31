import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import { PLAN, type PaymentEvent } from "@/lib/domain/access";
import { PaymentConfigError, type PaymentProvider } from "./types";

export const SIGNATURE_HEADER = "x-assinatura";

export function signTeste(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

function sameSignature(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

const BodySchema = z.object({
  id: z.string().min(1),
  type: z.enum(["pago", "pendente", "atrasado", "cancelado", "reembolsado"]),
  email: z.string().email().nullish(),
  userId: z.string().min(1).nullish(),
  providerRef: z.string().min(1).nullish(),
  periodEnd: z.string().datetime().nullish(),
});

/** Pagamento aprovado no checkout de teste: 30 dias a partir de agora. */
export function testePaidEvent(userId: string, email: string | null, now = new Date()): PaymentEvent {
  return {
    id: `teste-${randomUUID()}`, provider: "teste", type: "pago", email, userId,
    providerRef: `teste-${userId}`, periodEnd: new Date(now.getTime() + PLAN.periodDays * 86_400_000).toISOString(),
  };
}

export const testeProvider: PaymentProvider = {
  id: "teste",

  async checkoutUrl() {
    return "/assinar/teste";
  },

  async parseWebhook(req) {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) throw new PaymentConfigError("Falta PAYMENT_WEBHOOK_SECRET");
    const raw = await req.text();
    const sig = req.headers.get(SIGNATURE_HEADER) ?? "";
    if (!sameSignature(sig, signTeste(raw, secret))) return null;
    let json: unknown;
    try { json = JSON.parse(raw); } catch { return null; }
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) return null;
    const b = parsed.data;
    return {
      raw: json,
      event: { id: b.id, provider: "teste", type: b.type, email: b.email ?? null, userId: b.userId ?? null, providerRef: b.providerRef ?? null, periodEnd: b.periodEnd ?? null },
    };
  },

  async cancel(userId) {
    return { id: `teste-cancel-${randomUUID()}`, provider: "teste", type: "cancelado", email: null, userId, providerRef: `teste-${userId}`, periodEnd: null };
  },
};
