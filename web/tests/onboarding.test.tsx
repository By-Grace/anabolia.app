import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Onboarding } from "@/app/comecar/Onboarding";
import { Segmented } from "@/components/ui/Segmented";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn(), back: vi.fn() }) }));

const continuar = () => screen.getByRole("button", { name: "Continuar" });

async function fillStep1(age = "30") {
  await userEvent.click(screen.getByRole("radio", { name: "Homem" }));
  await userEvent.type(screen.getByLabelText("Idade"), age);
}
async function fillStep2(weight = "80", height = "180") {
  await userEvent.type(screen.getByLabelText("Peso"), weight);
  await userEvent.type(screen.getByLabelText("Altura"), height);
}

describe("Onboarding", () => {
  beforeEach(() => push.mockClear());

  it("passo 1 só libera Continuar com sexo e idade válidos (15 bloqueia, 30 libera)", async () => {
    render(<Onboarding onSave={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Sobre você" })).toBeInTheDocument();
    expect(continuar()).toBeDisabled();
    await fillStep1("15");
    expect(continuar()).toBeDisabled();
    await userEvent.clear(screen.getByLabelText("Idade"));
    await userEvent.type(screen.getByLabelText("Idade"), "30");
    expect(continuar()).toBeEnabled();
  });

  it("percorre os 4 passos com homem/30/80/180/moderado e mostra '160 g' e '3.150 kcal'", async () => {
    render(<Onboarding onSave={vi.fn()} />);
    await fillStep1();
    await userEvent.click(continuar());
    expect(screen.getByRole("heading", { name: "Seu corpo" })).toBeInTheDocument();
    await fillStep2();
    await userEvent.click(continuar());
    expect(screen.getByRole("heading", { name: "Quanto você se mexe" })).toBeInTheDocument();
    expect(continuar()).toBeDisabled();
    await userEvent.click(screen.getByRole("radio", { name: /Moderado/ }));
    await userEvent.click(continuar());
    expect(screen.getByRole("heading", { name: "Sua meta diária" })).toBeInTheDocument();
    expect(screen.getByTestId("goal-protein")).toHaveTextContent("160g");
    expect(screen.getByTestId("goal-kcal")).toHaveTextContent("3.150kcal");
    expect(screen.getByText(/Mifflin-St Jeor/)).toBeInTheDocument();
  });

  it("aceita peso '80,5' e calcula com 80,5 kg (proteína 160 g, múltiplo de 5)", async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<Onboarding onSave={onSave} />);
    await fillStep1();
    await userEvent.click(continuar());
    await fillStep2("80,5");
    expect(continuar()).toBeEnabled();
    await userEvent.click(continuar());
    await userEvent.click(screen.getByRole("radio", { name: /Moderado/ }));
    await userEvent.click(continuar());
    await userEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(onSave).toHaveBeenCalledWith({ sex: "m", age: 30, weightKg: 80.5, heightCm: 180, activity: "moderado" });
  });

  it("Começar chama onSave e depois leva para /hoje", async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: true });
    render(<Onboarding onSave={onSave} initial={{ sex: "m", age: 30, weightKg: 80, heightCm: 180, activity: "moderado" }} />);
    for (let i = 0; i < 3; i++) await userEvent.click(continuar());
    await userEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith("/hoje");
  });

  it("erro de onSave aparece em role=alert e não sai da tela", async () => {
    const onSave = vi.fn().mockResolvedValue({ ok: false, message: "Não deu para salvar agora. Tente de novo." });
    render(<Onboarding onSave={onSave} initial={{ sex: "f", age: 25, weightKg: 60, heightCm: 165, activity: "leve" }} />);
    for (let i = 0; i < 3; i++) await userEvent.click(continuar());
    await userEvent.click(screen.getByRole("button", { name: "Começar" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não deu para salvar agora. Tente de novo.");
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Começar" })).toBeEnabled();
  });

  it("Voltar no passo 2 retorna ao passo 1 mantendo a idade digitada", async () => {
    render(<Onboarding onSave={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Voltar" })).not.toBeInTheDocument();
    await fillStep1("34");
    await userEvent.click(continuar());
    await userEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByLabelText("Idade")).toHaveValue("34");
    expect(screen.getByRole("radio", { name: "Homem" })).toHaveAttribute("aria-checked", "true");
  });

  it("com initial preenchido, abre com os valores do perfil e oferece sair para o Perfil", async () => {
    render(<Onboarding onSave={vi.fn()} exitHref="/perfil"
      initial={{ sex: "f", age: 25, weightKg: 60.5, heightCm: 165, activity: "leve" }} />);
    expect(screen.getByRole("radio", { name: "Mulher" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByLabelText("Idade")).toHaveValue("25");
    await userEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(push).toHaveBeenCalledWith("/perfil");
    await userEvent.click(continuar());
    expect(screen.getByLabelText("Peso")).toHaveValue("60,5");
  });

  it("mostra o progresso: 4 pílulas e 'Passo 1 de 4' para leitor de tela", () => {
    render(<Onboarding onSave={vi.fn()} />);
    expect(screen.getAllByTestId("pill")).toHaveLength(4);
    expect(screen.getByText("Passo 1 de 4")).toBeInTheDocument();
  });
});

describe("Segmented sem escolha", () => {
  it("com value null nenhuma opção fica marcada e a primeira recebe o foco do teclado", () => {
    render(<Segmented label="Sexo" options={[{ value: "m", label: "Homem" }, { value: "f", label: "Mulher" }]} value={null} onChange={vi.fn()} />);
    const radios = screen.getAllByRole("radio");
    expect(radios.map((r) => r.getAttribute("aria-checked"))).toEqual(["false", "false"]);
    expect(radios[0]).toHaveAttribute("tabindex", "0");
  });
});
