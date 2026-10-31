import type { PaymentEvent, ProviderId, Subscription } from "@/lib/domain/access";

/** Erro de configuração do provedor (segredo ausente, provedor não configurado): a rota responde 503. */
export class PaymentConfigError extends Error {}

/**
 * A única interface que o app usa para falar com pagamento (spec 3.7): criar a assinatura (checkout),
 * receber o webhook, cancelar. Cada provedor é um adaptador trocável.
 */
export interface PaymentProvider {
  id: ProviderId;
  /** URL do checkout (hospedado pelo provedor; no teste, uma página interna). */
  checkoutUrl(u: { userId: string; email: string }): Promise<string>;
  /** Verifica a assinatura do webhook e normaliza. null = recusado. Lança PaymentConfigError se faltar configuração. */
  parseWebhook(req: Request): Promise<{ event: PaymentEvent; raw: unknown } | null>;
  /** Pede o cancelamento ao provedor e devolve o evento a aplicar. */
  cancel(userId: string, sub?: Subscription | null): Promise<PaymentEvent>;
}
