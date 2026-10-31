import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecipeView } from "@/app/receitas/[slug]/RecipeView";
import { getRecipe } from "@/lib/recipes/load";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ back: vi.fn(), push }) }));

const frango = getRecipe("frango-crocante-arroz-tostado")!;
const qtyOf = (name: string) =>
  within(screen.getAllByTestId("ingredient").find((el) => el.textContent?.includes(name))!).getByTestId("qty").textContent;

describe("RecipeView", () => {
  it("mostra título, refeições e as 3 stats por porção '42 g', '22', '610'", () => {
    render(<RecipeView recipe={frango} />);
    expect(screen.getByRole("heading", { level: 1, name: "Frango crocante com arroz tostado" })).toBeInTheDocument();
    expect(screen.getByText("Almoço · Jantar · valores por porção")).toBeInTheDocument();
    const stats = screen.getAllByTestId("stat").map((s) => s.textContent);
    expect(stats).toEqual(["42 gproteína", "22min", "610kcal"]);
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

  it("mostra gramas na coluna da direita e a medida caseira em cinza ao lado do nome", async () => {
    render(<RecipeView recipe={frango} />);
    expect(qtyOf("ovo")).toBe("50 g");
    expect(qtyOf("alho")).toBe("6 g");
    const row = (n: string) => screen.getAllByTestId("ingredient").find((el) => el.textContent?.includes(n))!;
    expect(within(row("ovo")).getByTestId("household")).toHaveTextContent("1 un");
    await userEvent.click(screen.getByRole("button", { name: "Menos uma porção" }));
    expect(qtyOf("ovo")).toBe("25 g");
    expect(within(row("ovo")).getByTestId("household")).toHaveTextContent("½ un");
  });

  it("'Marquei, comi' na receita registra 1 porção e volta para Hoje com a refeição marcada", async () => {
    const fetchMock = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ log: { id: "l7" } }), { status: 201 }));
    render(<RecipeView recipe={frango} now={() => new Date("2026-11-01T00:00:00Z")} />);
    await userEvent.click(screen.getByRole("button", { name: "Marquei, comi" }));
    expect(JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string)).toEqual({ recipeSlug: "frango-crocante-arroz-tostado", portions: 1, slot: "jantar" });
    expect(push).toHaveBeenCalledWith("/hoje?marcou=l7");
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
