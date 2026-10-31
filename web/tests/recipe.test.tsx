import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeView } from "@/app/receitas/[slug]/RecipeView";
import { getRecipe } from "@/lib/recipes/load";

vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), push: vi.fn() }) }));

const frango = getRecipe("frango-crocante-arroz-tostado")!;
const qtyOf = (name: string) =>
  within(screen.getAllByTestId("ingredient").find((el) => el.textContent?.includes(name))!).getByTestId("qty").textContent;

describe("RecipeView", () => {
  it("mostra título, refeições e as 3 stats por porção '42 g', '22', '610'", () => {
    render(<RecipeView recipe={frango} />);
    expect(screen.getByRole("heading", { level: 1, name: "Frango crocante com arroz tostado" })).toBeInTheDocument();
    expect(screen.getByText("Almoço · Jantar")).toBeInTheDocument();
    const stats = screen.getAllByTestId("stat").map((s) => s.textContent);
    expect(stats).toEqual(["42 gproteína", "22min", "610kcal"]);
    expect(screen.getByText("Valores por porção")).toBeInTheDocument();
  });

  it("stepper em 3 porções escala peito de frango para 600 g e mantém as stats por porção", async () => {
    render(<RecipeView recipe={frango} />);
    expect(qtyOf("peito de frango")).toBe("400 g");
    await userEvent.click(screen.getByRole("button", { name: "Mais uma porção" }));
    expect(qtyOf("peito de frango")).toBe("600 g");
    expect(qtyOf("sal e pimenta")).toBe("a gosto");
    expect(screen.getAllByTestId("stat")[0]).toHaveTextContent("42 g");
  });

  it("'Começar a cozinhar' aponta para o modo cozinhar com as porções escolhidas", async () => {
    render(<RecipeView recipe={frango} />);
    expect(screen.getByRole("link", { name: "Começar a cozinhar" })).toHaveAttribute("href", "/cozinhar/frango-crocante-arroz-tostado?p=2");
    await userEvent.click(screen.getByRole("button", { name: "Mais uma porção" }));
    expect(screen.getByRole("link", { name: "Começar a cozinhar" })).toHaveAttribute("href", "/cozinhar/frango-crocante-arroz-tostado?p=3");
  });

  it("lista o preparo numerado", () => {
    render(<RecipeView recipe={frango} />);
    expect(within(screen.getByRole("list", { name: "Preparo" })).getAllByRole("listitem")).toHaveLength(7);
  });

  it("receita sem foto renderiza placeholder e não quebra", () => {
    render(<RecipeView recipe={{ ...frango, photo: undefined }} />);
    expect(screen.getByTestId("photo-placeholder")).toBeInTheDocument();
  });
});
