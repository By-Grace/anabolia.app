import { onprofitProvider } from "./onprofit";
import { testeProvider } from "./teste";
import type { PaymentProvider } from "./types";

const PROVIDERS: Record<string, PaymentProvider> = { teste: testeProvider, onprofit: onprofitProvider };

/** Provedor pelo id (padrão: PAYMENT_PROVIDER, ou "teste"). Desconhecido devolve null. */
export function getProvider(id: string = process.env.PAYMENT_PROVIDER ?? "teste"): PaymentProvider | null {
  return PROVIDERS[id] ?? null;
}

export { PaymentConfigError } from "./types";
export type { PaymentProvider } from "./types";
