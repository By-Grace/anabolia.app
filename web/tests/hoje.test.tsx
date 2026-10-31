import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HojeView } from "@/app/hoje/HojeView";

import type { MealLog } from "@/lib/domain/day";
import { fakeRecipe, demoMenu } from "./fixtures";

const replace = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ replace, refresh, push: vi.fn() }) }));

// 21h em São Paulo = 00h UTC do dia seguinte
const NIGHT = new Date("2026-11-01T00:00:00Z");
const goal = { protein_g: 160, kcal: 3100, isDefault: false };
const log = (recipeSlug: string, slot: MealLog["slot"], portions = 1): MealLog => ({
  id: recipeSlug + slot, recipeSlug, slot, portions, loggedAt: "2026-10-31T12:00:00.000Z",
});

describe("HojeView", () => {
  const fixtures = [fakeRecipe("tapioca-teste", 31, ["cafe"]), fakeRecipe("bowl-teste", 42, ["almoco"]), ...demoMenu];

  it("com 2 refeições (31+42) e meta 160 mostra '87 g para fechar', '73 de 160 g de proteína' e barra 46%", () => {
    render(<HojeView recipes={fixtures} logs={[log("tapioca-teste", "cafe"), log("bowl-teste", "almoco")]} goal={goal} now={NIGHT} />);
    expect(screen.getByTestId("remaining")).toHaveTextContent("87g para fechar");
    expect(screen.getByText(/73 de 160 g de proteína/)).toBeInTheDocument();
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "46");
  });

  it("com meta batida mostra 'Meta batida' e barra 100%", () => {
    render(<HojeView recipes={fixtures} logs={[log("bowl-teste", "almoco", 4)]} goal={goal} now={NIGHT} />);
    expect(screen.getByTestId("remaining")).toHaveTextContent("Meta batida");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("sem meta mostra 'meta padrão' ao lado da sublinha", () => {
    render(<HojeView recipes={fixtures} logs={[]} goal={{ protein_g: 160, kcal: 3100, isDefault: true }} now={NIGHT} />);
    expect(screen.getByText(/meta padrão/)).toBeInTheDocument();
  });

  it("com meta padrão oferece o link 'calcular a minha' para /comecar; com meta própria, não", () => {
    const { rerender } = render(<HojeView recipes={fixtures} logs={[]} goal={{ protein_g: 160, kcal: 3100, isDefault: true }} now={NIGHT} />);
    expect(screen.getByRole("link", { name: "calcular a minha" })).toHaveAttribute("href", "/comecar?de=hoje");
    rerender(<HojeView recipes={fixtures} logs={[]} goal={goal} now={NIGHT} />);
    expect(screen.queryByRole("link", { name: "calcular a minha" })).not.toBeInTheDocument();
  });

  it("às 21h a próxima refeição é do jantar e o card mostra o bowl com '+45 g proteína · 25 min · 680 kcal'", () => {
    render(<HojeView recipes={demoMenu} logs={[]} goal={goal} now={NIGHT} />);
    const card = within(screen.getByRole("region", { name: "Próxima refeição" }));
    expect(card.getByRole("link", { name: /Bowl de carne com batata-doce/ })).toHaveAttribute("href", "/receitas/bowl-carne-batata-doce");
    expect(screen.getByText("+45 g proteína · 25 min · 680 kcal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trocar" })).toHaveAttribute("href", "/receitas?slot=jantar");
  });

  it("lista as 4 refeições: café e almoço feitos, lanche a fazer, jantar é a próxima", () => {
    render(<HojeView recipes={fixtures} logs={[log("tapioca-teste", "cafe"), log("bowl-teste", "almoco")]} goal={goal} now={NIGHT} />);
    const rows = screen.getAllByTestId("meal-row").map((el) => [el.getAttribute("data-label"), el.getAttribute("data-state")]);
    expect(rows).toEqual([["Café", "done"], ["Almoço", "done"], ["Lanche", "todo"], ["Jantar", "next"]]);
    expect(screen.getByText("2 de 4")).toBeInTheDocument();
  });

  it("mostra a data local por extenso", () => {
    render(<HojeView recipes={fixtures} logs={[]} goal={goal} now={NIGHT} />);
    expect(screen.getByText("Sábado, 31 de outubro")).toBeInTheDocument();
  });

  beforeEach(() => { replace.mockReset(); refresh.mockReset(); vi.restoreAllMocks(); });

  it("linha 'escolher' leva à biblioteca filtrada e a próxima leva à receita", () => {
    render(<HojeView recipes={demoMenu} logs={[]} goal={goal} now={NIGHT} />);
    const rows = screen.getAllByTestId("meal-row");
    expect(within(rows.find((r) => r.dataset.label === "Lanche")!).getByRole("link")).toHaveAttribute("href", "/receitas?slot=lanche");
    expect(within(rows.find((r) => r.dataset.label === "Jantar")!).getByRole("link")).toHaveAttribute("href", "/receitas/bowl-carne-batata-doce");
  });

  it("o círculo preenche na hora do toque, antes da resposta do servidor", async () => {
    vi.spyOn(globalThis, "fetch").mockReturnValue(new Promise(() => {}));
    render(<HojeView recipes={demoMenu} logs={[]} goal={goal} now={NIGHT} />);
    await userEvent.click(screen.getByRole("button", { name: "Marcar Jantar como feito" }));
    const jantar = screen.getAllByTestId("meal-row").find((r) => r.dataset.label === "Jantar")!;
    expect(jantar.dataset.state).toBe("done");
  });

  it("o círculo da próxima refeição marca direto, sem cozinhar", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ log: { id: "l3" } }), { status: 201 }));
    render(<HojeView recipes={demoMenu} logs={[]} goal={goal} now={NIGHT} />);
    await userEvent.click(screen.getByRole("button", { name: "Marcar Jantar como feito" }));
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({ recipeSlug: "bowl-carne-batata-doce", portions: 1, slot: "jantar" });
    expect(replace).toHaveBeenCalledWith("/hoje?marcou=l3");
  });

  it("com erro de carregamento não afirma '0 de 160' e oferece 'Tentar de novo'", async () => {
    render(<HojeView recipes={fixtures} logs={[]} goal={goal} now={NIGHT} error="Não deu para carregar o seu dia agora." />);
    expect(screen.getByTestId("remaining")).toHaveTextContent("—");
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(refresh).toHaveBeenCalled();
  });

  it("logo depois de marcar: '+42 g · Jantar marcado', barra parte do valor anterior e 'Desfazer' apaga", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));
    const logs = [log("tapioca-teste", "cafe"), { ...log("frango-crocante-arroz-tostado", "jantar"), id: "l5" }];
    render(<HojeView recipes={fixtures} logs={logs} goal={goal} now={NIGHT} justLogged="l5" />);
    expect(screen.getByRole("status")).toHaveTextContent("+42 g · Jantar marcado");
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "46");
    expect(bar.firstElementChild).toHaveStyle({ width: "19%" });
    await userEvent.click(screen.getByRole("button", { name: "Desfazer" }));
    expect(fetchMock).toHaveBeenCalledWith("/api/log-meal/l5", expect.objectContaining({ method: "DELETE" }));
    expect(replace).toHaveBeenCalledWith("/hoje");
  });

  it("com a refeição do horário já feita, não sugere de novo a mesma refeição", () => {
    render(<HojeView recipes={fixtures} logs={[{ ...log("frango-crocante-arroz-tostado", "jantar") }]} goal={goal} now={NIGHT} />);
    expect(screen.queryByRole("heading", { name: "Próxima refeição" })).not.toBeInTheDocument();
  });

  it("com o café já feito de manhã, a próxima refeição passa a ser o almoço", () => {
    const MORNING = new Date("2026-10-31T13:38:00Z"); // 10h38 em São Paulo
    render(<HojeView recipes={demoMenu} logs={[log("tapioca-frango-omelete", "cafe")]} goal={goal} now={MORNING} />);
    const card = within(screen.getByRole("region", { name: "Próxima refeição" }));
    expect(card.getByRole("link", { name: /Bowl de carne/ })).toHaveAttribute("href", "/receitas/bowl-carne-batata-doce");
    expect(card.getByRole("link", { name: "Trocar" })).toHaveAttribute("href", "/receitas?slot=almoco");
    const almoco = screen.getAllByTestId("meal-row").find((r) => r.dataset.label === "Almoço")!;
    expect(almoco.dataset.state).toBe("next");
  });
});
