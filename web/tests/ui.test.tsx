import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { SetRow } from "@/components/ui/SetRow";
import { Stepper } from "@/components/ui/Stepper";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { Button } from "@/components/ui/Button";
import { NumberField } from "@/components/ui/NumberField";

describe("componentes da direção B", () => {
  it("ProgressBar expõe aria-valuenow em porcentagem inteira e clampa", () => {
    const { rerender } = render(<ProgressBar value={0.456} label="Proteína" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "46");
    rerender(<ProgressBar value={1.2} label="Proteína" />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("ProgressBar com 'from' anuncia o valor final e começa a largura no valor anterior", () => {
    render(<ProgressBar value={0.72} from={0.46} label="Proteína" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "72");
    expect(bar.firstElementChild).toHaveStyle({ width: "46%" });
  });

  it("SetRow done renderiza o check e todo não", () => {
    const { rerender } = render(<SetRow label="Café" sub="Tapioca" value="31 g" state="done" />);
    expect(screen.getByTestId("set-check")).toBeInTheDocument();
    rerender(<SetRow label="Lanche" sub="escolher" value="—" state="todo" />);
    expect(screen.queryByTestId("set-check")).not.toBeInTheDocument();
  });

  it("Stepper não desce de 1 nem sobe de 8 e chama onChange com o novo valor", async () => {
    const onChange = vi.fn();
    const { rerender } = render(<Stepper value={1} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Menos uma porção" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "Mais uma porção" }));
    expect(onChange).toHaveBeenCalledWith(2);
    rerender(<Stepper value={8} onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Mais uma porção" })).toBeDisabled();
  });

  it("PhotoCard sem src mostra o placeholder e mantém título e meta", () => {
    render(<PhotoCard title="Bowl de carne" meta="+45 g proteína · 25 min · 680 kcal" href="/receitas/x" />);
    expect(screen.getByTestId("photo-placeholder")).toBeInTheDocument();
    expect(screen.getByText("Bowl de carne")).toBeInTheDocument();
    expect(screen.getByText("+45 g proteína · 25 min · 680 kcal")).toBeInTheDocument();
  });

  it("Button primary tem a classe do acento e role button", () => {
    render(<Button variant="primary">Cozinhar</Button>);
    const b = screen.getByRole("button", { name: "Cozinhar" });
    expect(b.className).toMatch(/bg-acc\b/);
  });

  it("NumberField: tocar em qualquer lugar da superfície põe o foco no campo", async () => {
    render(<NumberField label="Idade" unit="anos" value="" onChange={vi.fn()} />);
    await userEvent.click(screen.getByTestId("number-surface"));
    expect(screen.getByLabelText("Idade")).toHaveFocus();
  });
});
