import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Library } from "@/app/receitas/Library";
import { getRecipes } from "@/lib/recipes/load";

const recipes = getRecipes();
const names = () => screen.queryAllByTestId("recipe-row").map((el) => el.getAttribute("data-slug"));

describe("Library", () => {
  it("filtra por refeição 'Café' e mostra só a tapioca", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Café" }));
    expect(names()).toEqual(["tapioca-frango-omelete"]);
  });

  it("começa no slot vindo da URL", () => {
    render(<Library recipes={recipes} favorites={[]} initialSlot="cafe" onToggleFavorite={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Café" })).toHaveAttribute("aria-pressed", "true");
    expect(names()).toEqual(["tapioca-frango-omelete"]);
  });

  it("filtro de tempo 'Até 15 min' mostra só a tapioca; 'Até 30 min' mostra as 3", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "Até 15 min" }));
    expect(names()).toEqual(["tapioca-frango-omelete"]);
    await userEvent.click(screen.getByRole("button", { name: "Até 30 min" }));
    expect(names()).toHaveLength(3);
  });

  it("proteína '45 g+' mostra só o bowl", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.click(screen.getByRole("button", { name: "45 g+" }));
    expect(names()).toEqual(["bowl-carne-batata-doce"]);
  });

  it("busca 'batata' encontra o bowl por ingrediente, sem depender de acento", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.type(screen.getByRole("searchbox", { name: "Buscar receita ou ingrediente" }), "batata");
    expect(names()).toEqual(["bowl-carne-batata-doce"]);
    await userEvent.clear(screen.getByRole("searchbox"));
    await userEvent.type(screen.getByRole("searchbox"), "feijao");
    expect(names()).toEqual(["bowl-carne-batata-doce"]);
  });

  it("'Favoritas' lista só as favoritas e o coração alterna e chama onToggleFavorite", async () => {
    const onToggle = vi.fn().mockResolvedValue(true);
    render(<Library recipes={recipes} favorites={["frango-crocante-arroz-tostado"]} onToggleFavorite={onToggle} />);
    await userEvent.click(screen.getByRole("button", { name: "Favoritas" }));
    expect(names()).toEqual(["frango-crocante-arroz-tostado"]);
    await userEvent.click(screen.getByRole("button", { name: "Favoritas" }));
    const row = screen.getAllByTestId("recipe-row").find((el) => el.getAttribute("data-slug") === "tapioca-frango-omelete")!;
    await userEvent.click(within(row).getByRole("button", { name: "Favoritar Tapioca de frango com omelete" }));
    expect(onToggle).toHaveBeenCalledWith("tapioca-frango-omelete");
    expect(within(row).getByRole("button", { name: "Remover dos favoritos Tapioca de frango com omelete" })).toBeInTheDocument();
  });

  it("estado vazio quando nada bate com os filtros", async () => {
    render(<Library recipes={recipes} favorites={[]} onToggleFavorite={vi.fn()} />);
    await userEvent.type(screen.getByRole("searchbox"), "lasanha");
    expect(screen.getByText("Nenhuma receita com esses filtros")).toBeInTheDocument();
  });
});
