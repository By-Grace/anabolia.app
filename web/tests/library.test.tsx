import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Library } from "@/app/receitas/Library";
import { getRecipes } from "@/lib/recipes/load";

const recipes = getRecipes();
const slugs = () => screen.queryAllByTestId("recipe-row").map((el) => el.getAttribute("data-slug"));

describe("Library", () => {
  it("mostra só busca, um seletor de refeição, favoritas e um botão de filtros (sem a fileira de chips)", () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    expect(screen.getByRole("radiogroup", { name: "Refeição" })).toBeInTheDocument();
    expect(within(screen.getByRole("radiogroup", { name: "Refeição" })).getAllByRole("radio").map((r) => r.textContent))
      .toEqual(["Todas", "Café", "Almoço", "Lanche", "Jantar"]);
    expect(screen.getByRole("button", { name: "Só favoritas" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Filtros" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Até 15 min" })).not.toBeInTheDocument();
    expect(screen.getByText("3 receitas")).toBeInTheDocument();
  });

  it("filtra por refeição 'Café' e mostra só a tapioca", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("radio", { name: "Café" }));
    expect(slugs()).toEqual(["tapioca-frango-omelete"]);
    expect(screen.getByText("1 receita")).toBeInTheDocument();
  });

  it("começa no slot vindo da URL", () => {
    render(<Library recipes={recipes} favorites={[]} initialSlot="cafe" onToggleFavorite={vi.fn()} />);
    expect(screen.getByRole("radio", { name: "Café" })).toHaveAttribute("aria-checked", "true");
    expect(slugs()).toEqual(["tapioca-frango-omelete"]);
  });

  it("tempo e proteína ficam na folha de filtros; aplicar mostra o resultado e a contagem no botão", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    const sheet = within(screen.getByRole("dialog", { name: "Filtros" }));
    await userEvent.click(sheet.getByRole("radio", { name: "Até 15 min" }));
    expect(sheet.getByRole("button", { name: "Ver 1 receita" })).toBeInTheDocument();
    await userEvent.click(sheet.getByRole("button", { name: "Ver 1 receita" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(slugs()).toEqual(["tapioca-frango-omelete"]);
    expect(screen.getByRole("button", { name: "Filtros, 1 ativo" })).toBeInTheDocument();
  });

  it("proteína '40 g+' deixa bowl e frango", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    const sheet = within(screen.getByRole("dialog", { name: "Filtros" }));
    expect(sheet.getAllByRole("radio").map((r) => r.textContent)).toEqual(["Qualquer", "Até 15 min", "Até 30 min", "Qualquer", "30 g+", "40 g+"]);
    await userEvent.click(sheet.getByRole("radio", { name: "40 g+" }));
    await userEvent.click(sheet.getByRole("button", { name: "Ver 2 receitas" }));
    expect(slugs()).toEqual(["bowl-carne-batata-doce", "frango-crocante-arroz-tostado"]);
  });

  it("filtro ativo aparece como etiqueta removível", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Filtros" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("radio", { name: "Até 15 min" }));
    await userEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Ver 1 receita" }));
    await userEvent.click(screen.getByRole("button", { name: "Remover filtro Até 15 min" }));
    expect(slugs()).toHaveLength(3);
  });

  it("busca 'batata' encontra o bowl por ingrediente, sem depender de acento", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar receita ou ingrediente" }), "batata");
    expect(slugs()).toEqual(["bowl-carne-batata-doce"]);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "feijao");
    expect(slugs()).toEqual(["bowl-carne-batata-doce"]);
  });

  it("'Só favoritas' lista só as favoritas e o coração da linha alterna e chama onToggleFavorite", async () => {
    const onToggle = vi.fn().mockResolvedValue(true);
    render(<Library recipes={recipes} favorites={["frango-crocante-arroz-tostado"]} onToggleFavorite={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Só favoritas" }));
    expect(screen.getByRole("button", { name: "Só favoritas" })).toHaveAttribute("aria-pressed", "true");
    expect(slugs()).toEqual(["frango-crocante-arroz-tostado"]);
    await userEvent.click(screen.getByRole("button", { name: "Só favoritas" }));
    const row = screen.getAllByTestId("recipe-row").find((el) => el.getAttribute("data-slug") === "tapioca-frango-omelete")!;
    await userEvent.click(within(row).getByRole("button", { name: "Favoritar Tapioca de frango com omelete" }));
    expect(onToggle).toHaveBeenCalledWith("tapioca-frango-omelete");
    expect(within(row).getByRole("button", { name: "Remover dos favoritos Tapioca de frango com omelete" })).toBeInTheDocument();
  });

  it("estado vazio oferece 'Limpar filtros'", async () => {
    render(<Library recipes={recipes} favorites={[]} initialSlot="cafe" onToggleFavorite={vi.fn()} />);
    await userEvent.type(screen.getByRole("searchbox"), "lasanha");
    expect(screen.getByText("Nenhuma receita com esses filtros")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Limpar filtros" }));
    expect(slugs()).toHaveLength(3);
  });
});
