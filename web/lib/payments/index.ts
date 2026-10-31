import { onprofitProvider } from "./onprofit";
import { testeProvider } from "./teste";
import type { PaymentProvider } from "./types";
import { configuredProviderId } from "./env";

const PROVIDERS: Record<string, PaymentProvider> = { teste: testeProvider, onprofit: onprofitProvider };

/** Provedor pelo id (padrão: o configurado). Desconhecido ou teste em produção devolve null. */
export function getProvider(id: string | null = configuredProviderId()): PaymentProvider | null {
  if (!id || (id === "teste" && process.env.VERCEL_ENV === "production")) return null;
  return PROVIDERS[id] ?? null;
}

export { PaymentConfigError } from "./types";
export { allowTestSubscriptions, configuredProviderId } from "./env";
export type { PaymentProvider } from "./types";
