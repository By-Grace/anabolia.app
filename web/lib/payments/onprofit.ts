import { PaymentConfigError, type PaymentProvider } from "./types";

const NOT_READY = "OnProfit ainda não configurada";

/**
 * Esqueleto do adaptador OnProfit (checkout hospedado + webhooks de pedido, status, cancelamento e pagamento).
 * Fica recusando até existir a conta, o produto de R$ 29,90/mês e o segredo do webhook.
 */
export const onprofitProvider: PaymentProvider = {
  id: "onprofit",
  async checkoutUrl() { throw new PaymentConfigError(NOT_READY); },
  async parseWebhook() { throw new PaymentConfigError(NOT_READY); },
  async cancel() { throw new PaymentConfigError(NOT_READY); },
};
