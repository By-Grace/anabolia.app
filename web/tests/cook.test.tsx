import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CookMode } from "@/app/cozinhar/[slug]/CookMode";
import { getRecipe } from "@/lib/recipes/load";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, back: vi.fn() }) }));

const frango = getRecipe("frango-crocante-arroz-tostado")!;
const NIGHT = () => new Date("2026-11-01T00:00:00Z"); // 21h em São Paulo
const next = () => userEvent.click(screen.getByRole("button", { name: "Próximo passo" }));

describe("CookMode", () => {
  beforeEach(() => { push.mockReset(); vi.restoreAllMocks(); });

  it("abre no passo 1 de 7 com as pílulas de progresso", () => {
    render(<CookMode recipe={frango} portions={2} now={NIGHT} />);
    expect(screen.getByText("Passo 1 de 7")).toBeInTheDocument();
    const pills = screen.getAllByTestId("pill");
    expect(pills).toHaveLength(7);
    expect(pills.filter((p) => p.dataset.on === "true")).toHaveLength(1);
    expect(screen.getByText("1/7")).toBeInTheDocument();
  });

  it("no passo 3 mostra o chip do ingrediente e o cronômetro 3:00", async () => {
    render(<CookMode recipe={frango} portions={2} now={NIGHT} />);
    await next(); await next();
    expect(screen.getByText("Passo 3 de 7")).toBeInTheDocument();
    expect(screen.getByText("peito de frango · 400 g · fogo alto")).toBeInTheDocument();
    expect(screen.getByTestId("clock")).toHaveTextContent("3:00");
  });

  it("escala a quantidade do chip pelas porções escolhidas", async () => {
    render(<CookMode recipe={frango} portions={3} now={NIGHT} />);
    await next(); await next();
    expect(screen.getByText("peito de frango · 600 g · fogo alto")).toBeInTheDocument();
  });

  it("passo sem tempo não renderiza cronômetro", () => {
    render(<CookMode recipe={frango} portions={2} now={NIGHT} />);
    expect(screen.queryByTestId("clock")).not.toBeInTheDocument();
  });

  it("'Próximo passo' avança, 'Passo anterior' volta e no último passo o botão vira 'Marquei, comi'", async () => {
    render(<CookMode recipe={frango} portions={2} now={NIGHT} />);
    await next();
    await userEvent.click(screen.getByRole("button", { name: "Passo anterior" }));
    expect(screen.getByText("Passo 1 de 7")).toBeInTheDocument();
    for (let i = 0; i < 6; i++) await next();
    expect(screen.getByText("Passo 7 de 7")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Marquei, comi" })).toBeInTheDocument();
  });

  it("o cronômetro continua rodando ao trocar de passo e aparece como lembrete nos outros passos", async () => {
    let t = 0;
    const clock = () => t;
    render(<CookMode recipe={frango} portions={2} now={NIGHT} clock={clock} />);
    await next(); await next();
    await userEvent.click(screen.getByRole("button", { name: "Iniciar cronômetro" }));
    t += 10_000;
    await next();
    expect(screen.getByRole("button", { name: /Cronômetro do passo 3: 2:50/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Passo anterior" }));
    expect(screen.getByTestId("clock")).toHaveTextContent("2:50");
  });

  it("'Marquei, comi' registra 1 porção no jantar e volta para /hoje", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ log: { id: "l1" } }), { status: 201 }));
    render(<CookMode recipe={frango} portions={2} now={NIGHT} />);
    for (let i = 0; i < 6; i++) await next();
    await userEvent.click(screen.getByRole("button", { name: "Marquei, comi" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/log-meal", expect.objectContaining({ method: "POST" }));
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toEqual({ recipeSlug: "frango-crocante-arroz-tostado", portions: 1, slot: "jantar" });
    expect(push).toHaveBeenCalledWith("/hoje?marcou=l1");
  });

  it("se o registro falhar, avisa e não sai da tela", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("{}", { status: 500 }));
    render(<CookMode recipe={frango} portions={2} now={NIGHT} />);
    for (let i = 0; i < 6; i++) await next();
    await userEvent.click(screen.getByRole("button", { name: "Marquei, comi" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não deu para marcar agora. Tente de novo.");
    expect(push).not.toHaveBeenCalled();
  });
});
