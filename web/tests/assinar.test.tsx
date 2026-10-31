import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AssinarView } from "@/app/assinar/AssinarView";
import { TesteView } from "@/app/assinar/teste/TesteView";

describe("AssinarView", () => {
  it("mostra o que vem na assinatura com o número real de receitas, o preço e a garantia", async () => {
    const onStart = vi.fn().mockResolvedValue(undefined);
    render(<AssinarView recipeCount={52} access={false} onStart={onStart} />);
    expect(screen.getByRole("heading", { level: 1, name: "Assinatura" })).toBeInTheDocument();
    expect(screen.getByText("52 receitas com a proteína calculada")).toBeInTheDocument();
    expect(screen.getByText("Meta diária e histórico da semana")).toBeInTheDocument();
    expect(screen.getByText("Lista de compras das suas receitas")).toBeInTheDocument();
    expect(screen.getByTestId("price")).toHaveTextContent("R$ 29,90por mês");
    expect(screen.getByText("Pix ou cartão. Cancela quando quiser no Perfil.")).toBeInTheDocument();
    expect(screen.getByText("Garantia de 7 dias: se não gostar, devolvemos o valor.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Assinar por R$ 29,90/mês" }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it("erro ao abrir o checkout aparece em role=alert", async () => {
    render(<AssinarView recipeCount={52} access={false} onStart={vi.fn().mockResolvedValue({ ok: false, message: "O pagamento ainda não está disponível. Tente mais tarde." })} />);
    await userEvent.click(screen.getByRole("button", { name: "Assinar por R$ 29,90/mês" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("O pagamento ainda não está disponível. Tente mais tarde.");
  });

  it("com acesso mostra a assinatura ativa e o caminho para Hoje, sem botão de assinar", () => {
    render(<AssinarView recipeCount={52} access periodEnd="2026-12-01T12:00:00.000Z" onStart={vi.fn()} />);
    expect(screen.getByText("Sua assinatura está ativa até 01/12.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir para Hoje" })).toHaveAttribute("href", "/hoje");
    expect(screen.queryByRole("button", { name: /Assinar/ })).not.toBeInTheDocument();
  });
});

describe("TesteView", () => {
  it("deixa claro que nada é cobrado e simula o pagamento", async () => {
    const onPay = vi.fn().mockResolvedValue(undefined);
    render(<TesteView onPay={onPay} />);
    expect(screen.getByText(/Nada é cobrado/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Simular pagamento aprovado" }));
    expect(onPay).toHaveBeenCalledOnce();
    expect(screen.getByRole("link", { name: "Voltar" })).toHaveAttribute("href", "/assinar");
  });
});

// Ações: o Supabase, o redirecionamento e a aplicação do evento são trocados por dublês.
const redirect = vi.fn((url: string) => { throw Object.assign(new Error("NEXT_REDIRECT"), { url }); });
const getUser = vi.fn();
const applyPaymentEvent = vi.fn();
vi.mock("next/navigation", () => ({ redirect: (u: string) => redirect(u), notFound: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({ supabaseServer: async () => ({ auth: { getUser } }) }));
vi.mock("@/lib/supabase/admin", () => ({ supabaseAdmin: () => ({}) }));
vi.mock("@/lib/payments/apply", () => ({ applyPaymentEvent: (...a: unknown[]) => applyPaymentEvent(...a) }));

const permanent = { data: { user: { id: "u1", email: "a@b.com", is_anonymous: false } }, error: null };
const anonymous = { data: { user: { id: "anon", email: null, is_anonymous: true } }, error: null };
const redirectedTo = async (p: Promise<unknown>) => { try { await p; return null; } catch (e) { return (e as { url?: string }).url ?? null; } };

describe("ações da assinatura", () => {
  beforeEach(() => { redirect.mockClear(); getUser.mockReset(); applyPaymentEvent.mockReset(); delete process.env.PAYMENT_PROVIDER; delete process.env.VERCEL_ENV; });
  afterEach(() => { delete process.env.PAYMENT_PROVIDER; delete process.env.VERCEL_ENV; });

  it("sem conta permanente, assinar manda para entrar e volta para /assinar", async () => {
    const { startCheckoutAction } = await import("@/app/assinar/actions");
    getUser.mockResolvedValue(anonymous);
    expect(await redirectedTo(startCheckoutAction())).toBe("/entrar?next=%2Fassinar");
  });

  it("com conta, abre o checkout do provedor (no teste, a página interna)", async () => {
    const { startCheckoutAction } = await import("@/app/assinar/actions");
    getUser.mockResolvedValue(permanent);
    expect(await redirectedTo(startCheckoutAction())).toBe("/assinar/teste");
  });

  it("OnProfit ainda não configurada vira mensagem, não erro", async () => {
    const { startCheckoutAction } = await import("@/app/assinar/actions");
    process.env.PAYMENT_PROVIDER = "onprofit";
    getUser.mockResolvedValue(permanent);
    expect(await startCheckoutAction()).toEqual({ ok: false, message: "O pagamento ainda não está disponível. Tente mais tarde." });
  });

  it("pagamento simulado é recusado em produção", async () => {
    const { simulateTestPaymentAction } = await import("@/app/assinar/actions");
    process.env.VERCEL_ENV = "production";
    getUser.mockResolvedValue(permanent);
    expect(await simulateTestPaymentAction()).toEqual({ ok: false, message: "Pagamento de teste não existe em produção." });
    expect(applyPaymentEvent).not.toHaveBeenCalled();
  });

  it("fora de produção aplica 'pago' para a pessoa e leva para Hoje", async () => {
    const { simulateTestPaymentAction } = await import("@/app/assinar/actions");
    getUser.mockResolvedValue(permanent);
    applyPaymentEvent.mockResolvedValue("aplicado");
    expect(await redirectedTo(simulateTestPaymentAction())).toBe("/hoje");
    expect(applyPaymentEvent.mock.calls[0][1]).toMatchObject({ provider: "teste", type: "pago", userId: "u1", email: "a@b.com" });
  });
});
