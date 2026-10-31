import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PerfilView } from "@/app/perfil/PerfilView";
import { weekHistory, type DayLog } from "@/lib/domain/history";
import type { Profile } from "@/lib/data/profile-repo";
import { fakeRecipe } from "./fixtures";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh, push: vi.fn() }) }));

const TODAY = new Date("2026-11-02T00:00:00Z"); // domingo, 01/11, 21h em SP
const goal = { protein_g: 160, kcal: 3150, isDefault: false };
const profile: Profile = { body: { sex: "m", age: 30, weightKg: 80, heightCm: 180, activity: "moderado" }, goal };
const recipes = [fakeRecipe("a", 80), fakeRecipe("b", 40)];
const log = (dayKey: string, slug: string, portions = 1): DayLog => ({
  id: dayKey + slug, recipeSlug: slug, portions, slot: "almoco", loggedAt: `${dayKey}T15:00:00.000Z`, dayKey,
});
const week = weekHistory([log("2026-10-30", "a", 2), log("2026-10-31", "a", 2), log("2026-11-01", "b")], recipes, goal, TODAY);
const emptyWeek = weekHistory([], recipes, goal, TODAY);

const view = (p: Partial<Parameters<typeof PerfilView>[0]> = {}) => {
  const props = {
    profile, week,
    onSaveWeight: vi.fn().mockResolvedValue({ ok: true, goal: { protein_g: 165, kcal: 3200, isDefault: false } }),
    onSaveGoal: vi.fn().mockResolvedValue({ ok: true, goal: { protein_g: 170, kcal: 3300, isDefault: false } }),
    ...p,
  };
  render(<PerfilView {...props} />);
  return props;
};

describe("PerfilView", () => {
  beforeEach(() => refresh.mockClear());

  it("mostra 'Perfil', a meta '160 g' e '3.150 kcal' e o peso '80 kg'", () => {
    view();
    expect(screen.getByRole("heading", { level: 1, name: "Perfil" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar meta de proteína, 160 g" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar meta de calorias, 3.150 kcal" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar peso, 80 kg" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Recalcular com os meus dados" })).toHaveAttribute("href", "/comecar?de=perfil");
    expect(screen.getByText("180 cm · 30 anos · nível moderado")).toBeInTheDocument();
    expect(screen.getByText("A coluna cheia é a meta.")).toBeInTheDocument();
  });

  it("gráfico tem 7 colunas com o valor de cada dia e o resumo '2 de 7 na meta'", async () => {
    view();
    const chart = within(screen.getByRole("list", { name: "Proteína por dia" }));
    const cols = chart.getAllByRole("button");
    expect(cols).toHaveLength(7);
    expect(cols[5]).toHaveAccessibleName("sáb, 31/10: 160 g, meta batida");
    expect(cols[6]).toHaveAccessibleName("dom, 01/11: 40 g");
    expect(screen.getByText("2 de 7 na meta")).toBeInTheDocument();
    expect(screen.getByText("Média de 120 g nos dias registrados.")).toBeInTheDocument();
    // começa mostrando hoje; tocar numa coluna troca a leitura
    expect(screen.getByTestId("week-readout")).toHaveTextContent("Hoje · 40 g de 160 g");
    await userEvent.click(cols[5]);
    expect(screen.getByTestId("week-readout")).toHaveTextContent("Sáb, 31/10 · 160 g de 160 g");
  });

  it("sem corpo salvo mostra 'Você está usando a meta padrão.' e o link 'Calcular minha meta' para /comecar", () => {
    view({ profile: { body: null, goal: { protein_g: 160, kcal: 3100, isDefault: true } } });
    expect(screen.getByText("Você está usando a meta padrão.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Calcular minha meta" })).toHaveAttribute("href", "/comecar?de=perfil");
    expect(screen.queryByRole("button", { name: /Editar peso/ })).not.toBeInTheDocument();
  });

  it("meta digitada à mão sem cadastro: não diz 'meta padrão' e oferece calcular com os dados", () => {
    view({ profile: { body: null, goal: { protein_g: 170, kcal: 3300, isDefault: false } } });
    expect(screen.queryByText("Você está usando a meta padrão.")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Calcular com os meus dados" })).toHaveAttribute("href", "/comecar?de=perfil");
  });

  it("editar peso: '82,5' chama onSaveWeight(82.5), fecha a folha e mostra a meta devolvida", async () => {
    const props = view();
    await userEvent.click(screen.getByRole("button", { name: "Editar peso, 80 kg" }));
    const sheet = within(screen.getByRole("dialog", { name: "Peso" }));
    expect(sheet.getByText("A meta é recalculada com o peso novo.")).toBeInTheDocument();
    // o título da folha já diz "Peso": o rótulo do campo fica só para leitor de tela
    expect(sheet.getByText("Peso", { selector: "label" })).toHaveClass("sr-only");
    await userEvent.clear(sheet.getByLabelText("Peso"));
    await userEvent.type(sheet.getByLabelText("Peso"), "82,5");
    await userEvent.click(sheet.getByRole("button", { name: "Salvar" }));
    expect(props.onSaveWeight).toHaveBeenCalledWith(82.5);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar meta de proteína, 165 g" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Editar peso, 82,5 kg" })).toBeInTheDocument();
    expect(refresh).toHaveBeenCalled();
  });

  it("editar meta: 30 g é recusado na folha com a faixa válida e onSaveGoal não é chamado", async () => {
    const props = view();
    await userEvent.click(screen.getByRole("button", { name: "Editar meta de proteína, 160 g" }));
    const sheet = within(screen.getByRole("dialog", { name: "Meta diária" }));
    await userEvent.clear(sheet.getByLabelText("Proteína"));
    await userEvent.type(sheet.getByLabelText("Proteína"), "30");
    expect(sheet.getByLabelText("Proteína")).toHaveAttribute("aria-invalid", "true");
    expect(sheet.getByText("De 40 a 400 g")).toBeInTheDocument();
    expect(sheet.getByRole("button", { name: "Salvar" })).toBeDisabled();
    expect(props.onSaveGoal).not.toHaveBeenCalled();
  });

  it("editar meta válida chama onSaveGoal com proteína e calorias", async () => {
    const props = view();
    await userEvent.click(screen.getByRole("button", { name: "Editar meta de calorias, 3.150 kcal" }));
    const sheet = within(screen.getByRole("dialog", { name: "Meta diária" }));
    await userEvent.clear(sheet.getByLabelText("Proteína"));
    await userEvent.type(sheet.getByLabelText("Proteína"), "170");
    await userEvent.clear(sheet.getByLabelText("Calorias"));
    await userEvent.type(sheet.getByLabelText("Calorias"), "3300");
    await userEvent.click(sheet.getByRole("button", { name: "Salvar" }));
    expect(props.onSaveGoal).toHaveBeenCalledWith({ protein_g: 170, kcal: 3300 });
    expect(screen.getByRole("button", { name: "Editar meta de calorias, 3.300 kcal" })).toBeInTheDocument();
  });

  it("erro da ação aparece em role=alert dentro da folha e a folha continua aberta", async () => {
    view({ onSaveWeight: vi.fn().mockResolvedValue({ ok: false, message: "Não deu para salvar agora. Tente de novo." }) });
    await userEvent.click(screen.getByRole("button", { name: "Editar peso, 80 kg" }));
    const sheet = within(screen.getByRole("dialog", { name: "Peso" }));
    await userEvent.click(sheet.getByRole("button", { name: "Salvar" }));
    expect(await sheet.findByRole("alert")).toHaveTextContent("Não deu para salvar agora. Tente de novo.");
    expect(screen.getByRole("dialog", { name: "Peso" })).toBeInTheDocument();
  });

  it("com erro de carregamento não afirma meta padrão nem semana vazia e oferece 'Tentar de novo'", async () => {
    view({ profile: { body: null, goal: { protein_g: 160, kcal: 3100, isDefault: true } }, week: emptyWeek,
      error: "Não deu para carregar o seu perfil agora." });
    expect(screen.getByRole("alert")).toHaveTextContent("Não deu para carregar o seu perfil agora.");
    expect(screen.queryByText("Você está usando a meta padrão.")).not.toBeInTheDocument();
    expect(screen.queryByText(/Meta de 160 g por dia/)).not.toBeInTheDocument();
    expect(screen.queryByText("Nenhuma refeição marcada nesta semana.")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Tentar de novo" }));
    expect(refresh).toHaveBeenCalled();
  });

  it("semana sem registros mostra 'Nenhuma refeição marcada nesta semana.'", () => {
    view({ week: emptyWeek });
    expect(screen.getByText("Nenhuma refeição marcada nesta semana.")).toBeInTheDocument();
    expect(screen.getByText("0 de 7 na meta")).toBeInTheDocument();
  });
});
