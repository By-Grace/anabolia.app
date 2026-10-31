export type ProviderId = "teste" | "onprofit" | "stripe";
export type SubStatus = "ativa" | "pendente" | "atrasada" | "cancelada" | "reembolsada";

export type Subscription = {
  provider: ProviderId;
  providerRef: string | null;
  status: SubStatus;
  /** ISO. Até quando o período pago vale. */
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
};

/** Evento de pagamento já normalizado pelo adaptador do provedor. */
export type PaymentEvent = {
  id: string;
  provider: ProviderId;
  type: "pago" | "pendente" | "atrasado" | "cancelado" | "reembolsado";
  email: string | null;
  userId: string | null;
  providerRef: string | null;
  periodEnd: string | null;
};

export const PLAN = { id: "mensal", priceCents: 2990, label: "R$ 29,90 por mês", periodDays: 30 } as const;

const inPeriod = (sub: Subscription, now: Date) =>
  sub.currentPeriodEnd !== null && new Date(sub.currentPeriodEnd).getTime() > now.getTime();

/** Ativa dá acesso; cancelada ou atrasada, só até o fim do período pago; reembolsada corta na hora. */
export function hasAccess(sub: Subscription | null, now: Date): boolean {
  if (!sub) return false;
  if (sub.status === "ativa") return true;
  if (sub.status === "cancelada" || sub.status === "atrasada") return inPeriod(sub, now);
  return false;
}

/** Próximo estado da assinatura depois de um evento. Função pura: quem grava é o servidor. */
export function applyEvent(prev: Subscription | null, e: PaymentEvent): Subscription {
  const base: Subscription = prev ?? {
    provider: e.provider, providerRef: e.providerRef, status: "pendente", currentPeriodEnd: null, cancelAtPeriodEnd: false,
  };
  const ref = e.providerRef ?? base.providerRef;
  switch (e.type) {
    case "pago":
      return { ...base, provider: e.provider, providerRef: ref, status: "ativa", currentPeriodEnd: e.periodEnd ?? base.currentPeriodEnd, cancelAtPeriodEnd: false };
    case "pendente":
      return prev && prev.status === "ativa" ? { ...prev, providerRef: ref } : { ...base, providerRef: ref, status: "pendente" };
    case "atrasado":
      return { ...base, providerRef: ref, status: "atrasada" };
    case "cancelado":
      return { ...base, providerRef: ref, status: "cancelada", cancelAtPeriodEnd: true };
    case "reembolsado":
      return { ...base, providerRef: ref, status: "reembolsada", cancelAtPeriodEnd: false };
  }
}
