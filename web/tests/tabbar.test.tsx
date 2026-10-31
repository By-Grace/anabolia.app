import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TabBar } from "@/components/ui/TabBar";

let pathname = "/hoje";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));

describe("TabBar flutuante", () => {
  it("aparece em /hoje com a aba ativa marcada", () => {
    pathname = "/hoje";
    render(<TabBar />);
    expect(screen.getByRole("link", { name: "Hoje" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Receitas" })).not.toHaveAttribute("aria-current");
  });
  it("marca Receitas em /receitas", () => {
    pathname = "/receitas";
    render(<TabBar />);
    expect(screen.getByRole("link", { name: "Receitas" })).toHaveAttribute("aria-current", "page");
  });
  it("some nas telas de receita e de cozinhar", () => {
    pathname = "/receitas/frango-crocante-arroz-tostado";
    const { container } = render(<TabBar />);
    expect(container).toBeEmptyDOMElement();
    pathname = "/cozinhar/frango-crocante-arroz-tostado";
    const r2 = render(<TabBar />);
    expect(r2.container).toBeEmptyDOMElement();
  });
  it("Lista e Perfil seguem nomeadas e marcadas como em breve", () => {
    pathname = "/hoje";
    render(<TabBar />);
    expect(screen.getByLabelText("Lista, em breve")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByLabelText("Perfil, em breve")).toHaveAttribute("aria-disabled", "true");
  });
});
