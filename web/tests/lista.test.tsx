import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ListaView } from "@/app/lista/ListaView";
import type { ShoppingGroup } from "@/lib/domain/shopping";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));

const groups: ShoppingGroup[] = [
  { slug: "strogonoff", name: "Strogonoff de frango", portions: 2, items: [
    { index: 0, name: "peito de frango", amount: "400 g", checked: true },
    { index: 2, name: "creme de leite", amount: "200 g", checked: false },
  ] },
  { slug: "tapioca", name: "Tapioca", portions: 1, items: [
    { index: 0, name: "goma de tapioca", amount: "60 g", checked: false },
    { index: 1, name: "ovo", amount: "100 g", household: "2 un", checked: false },
  ] },
];

const view = (p: Partial<Parameters<typeof ListaView>[0]> = {}) => {
  const props = { groups, onCheck: vi.fn().mockResolvedValue(true), onRemove: vi.fn().mockResolvedValue(true), onClear: vi.fn().mockResolvedValue(true), ...p };
  render(<ListaView {...props} />);
  return props;
};

describe("ListaView", () => {
  it("agrupa por receita com 'N porções' e o contexto 'N receitas · M de T comprados'", () => {
    view();
    expect(screen.getByRole("heading", { level: 1, name: "Lista" })).toBeInTheDocument();
    expect(screen.getByText("2 receitas · 1 de 4 comprados")).toBeInTheDocument();
    const strog = within(screen.getByRole("region", { name: "Strogonoff de frango" }));
    expect(strog.getByText("2 porções")).toBeInTheDocument();
    expect(strog.getAllByRole("checkbox").map((c) => c.getAttribute("aria-checked"))).toEqual(["true", "false"]);
    expect(within(screen.getByRole("region", { name: "Tapioca" })).getByText("1 porção")).toBeInTheDocument();
    expect(screen.getByText("2 un")).toBeInTheDocument();
  });

  it("marcar item chama onCheck(slug, index, true) e marca na hora", async () => {
    const props = view();
    const item = screen.getByRole("checkbox", { name: "creme de leite, 200 g" });
    await userEvent.click(item);
    expect(props.onCheck).toHaveBeenCalledWith("strogonoff", 2, true);
    expect(item).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("2 receitas · 2 de 4 comprados")).toBeInTheDocument();
  });

  it("falha ao marcar desfaz a marca e mostra alerta", async () => {
    view({ onCheck: vi.fn().mockResolvedValue(false) });
    const item = screen.getByRole("checkbox", { name: "ovo, 100 g" });
    await userEvent.click(item);
    expect(await screen.findByRole("alert")).toHaveTextContent("Não deu para salvar. Tente de novo.");
    expect(item).toHaveAttribute("aria-checked", "false");
  });

  it("tirar uma receita chama onRemove e some o grupo", async () => {
    const props = view();
    await userEvent.click(screen.getByRole("button", { name: "Tirar Tapioca da lista" }));
    expect(props.onRemove).toHaveBeenCalledWith("tapioca");
    expect(screen.queryByRole("region", { name: "Tapioca" })).not.toBeInTheDocument();
  });

  it("Limpar pede confirmação; Cancelar não chama onClear; confirmar chama e mostra a lista vazia", async () => {
    const props = view();
    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getByText("Limpar a lista inteira?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));
    expect(props.onClear).not.toHaveBeenCalled();
    expect(screen.queryByText("Limpar a lista inteira?")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Limpar" }));
    await userEvent.click(screen.getByRole("button", { name: "Limpar lista" }));
    expect(props.onClear).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Sua lista está vazia")).toBeInTheDocument();
  });

  it("lista vazia mostra 'Sua lista está vazia' e link para /receitas, sem 'Limpar'", () => {
    view({ groups: [] });
    expect(screen.getByText("Sua lista está vazia")).toBeInTheDocument();
    expect(screen.getByText("Abra uma receita e toque em Pôr na lista de compras.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver receitas" })).toHaveAttribute("href", "/receitas");
    expect(screen.queryByRole("button", { name: "Limpar" })).not.toBeInTheDocument();
  });

  it("com erro de carregamento não afirma lista vazia e oferece 'Tentar de novo'", () => {
    view({ groups: [], error: "Não deu para carregar a sua lista agora." });
    expect(screen.getByRole("alert")).toHaveTextContent("Não deu para carregar a sua lista agora.");
    expect(screen.queryByText("Sua lista está vazia")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeInTheDocument();
  });
});
