import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HojeView } from "@/app/hoje/HojeView";
import { getRecipes } from "@/lib/recipes/load";
import type { MealLog } from "@/lib/domain/day";
import { fakeRecipe } from "./fixtures";

// 21h em São Paulo = 00h UTC do dia seguinte
const NIGHT = new Date("2026-11-01T00:00:00Z");
const goal = { protein_g: 160, kcal: 3100, isDefault: false };
const log = (recipeSlug: string, slot: MealLog["slot"], portions = 1): MealLog => ({
  id: recipeSlug + slot, recipeSlug, slot, portions, loggedAt: "2026-10-31T12:00:00.000Z",
});

describe("HojeView", () => {
  const fixtures = [fakeRecipe("tapioca-teste", 31, ["cafe"]), fakeRecipe("bowl-teste", 42, ["almoco"]), ...getRecipes()];

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

  it("às 21h a próxima refeição é do jantar e o card mostra o bowl com '+45 g proteína · 25 min · 680 kcal'", () => {
    render(<HojeView recipes={getRecipes()} logs={[]} goal={goal} now={NIGHT} />);
    expect(screen.getByRole("link", { name: /Bowl de carne com batata-doce/ })).toHaveAttribute("href", "/receitas/bowl-carne-batata-doce");
    expect(screen.getByText("+45 g proteína · 25 min · 680 kcal")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Trocar" })).toHaveAttribute("href", "/receitas?slot=jantar");
  });

  it("lista as 4 refeições: café e almoço feitos, lanche a fazer, jantar é a próxima", () => {
    const { container } = render(<HojeView recipes={fixtures} logs={[log("tapioca-teste", "cafe"), log("bowl-teste", "almoco")]} goal={goal} now={NIGHT} />);
    const rows = [...container.querySelectorAll("[data-state]")].map((el) => [el.getAttribute("data-label"), el.getAttribute("data-state")]);
    expect(rows).toEqual([["Café", "done"], ["Almoço", "done"], ["Lanche", "todo"], ["Jantar", "next"]]);
    expect(screen.getByText("2 de 4")).toBeInTheDocument();
  });

  it("mostra a data local por extenso", () => {
    render(<HojeView recipes={fixtures} logs={[]} goal={goal} now={NIGHT} />);
    expect(screen.getByText("Sábado, 31 de outubro")).toBeInTheDocument();
  });
});
