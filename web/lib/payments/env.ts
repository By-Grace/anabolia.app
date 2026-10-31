/** Configuração de pagamento lida do ambiente. Sem dependências: o middleware (Edge) importa daqui. */
const isProduction = () => process.env.VERCEL_ENV === "production";

/** Assinaturas de teste só valem fora de produção (o banco é o mesmo para dev e produção). */
export function allowTestSubscriptions(): boolean {
  return !isProduction();
}

/** O provedor em uso: PAYMENT_PROVIDER; fora de produção, "teste" por padrão; em produção, nunca "teste". */
export function configuredProviderId(): string | null {
  const id = process.env.PAYMENT_PROVIDER ?? (isProduction() ? null : "teste");
  if (id === "teste" && isProduction()) return null;
  return id;
}
