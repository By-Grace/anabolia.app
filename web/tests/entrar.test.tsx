import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { EntrarView } from "@/app/entrar/EntrarView";

vi.mock("@/lib/supabase/client", () => ({ supabaseBrowser: () => ({ auth: { signInWithOAuth: vi.fn() } }) }));

describe("EntrarView", () => {
  it("envia o e-mail com o destino e mostra 'Confira seu e-mail'", async () => {
    const onSend = vi.fn().mockResolvedValue({ ok: true });
    render(<EntrarView next="/assinar" onSend={onSend} />);
    expect(screen.getByRole("heading", { level: 1, name: "Entrar" })).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("E-mail"), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: "Receber link" }));
    expect(onSend).toHaveBeenCalledWith("a@b.com", "/assinar");
    expect(await screen.findByRole("heading", { name: "Confira seu e-mail" })).toBeInTheDocument();
    expect(screen.getByText(/a@b\.com/)).toBeInTheDocument();
  });

  it("'Usar outro e-mail' volta ao formulário", async () => {
    render(<EntrarView next="/" onSend={vi.fn().mockResolvedValue({ ok: true })} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: "Receber link" }));
    await userEvent.click(await screen.findByRole("button", { name: "Usar outro e-mail" }));
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("erro do envio aparece em role=alert e fica no formulário", async () => {
    render(<EntrarView next="/" onSend={vi.fn().mockResolvedValue({ ok: false, message: "Confira o e-mail." })} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "x@y.z");
    await userEvent.click(screen.getByRole("button", { name: "Receber link" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Confira o e-mail.");
    expect(screen.getByLabelText("E-mail")).toBeInTheDocument();
  });

  it("link expirado mostra o aviso para pedir outro", () => {
    render(<EntrarView next="/" onSend={vi.fn()} linkError />);
    expect(screen.getByText("Esse link expirou ou já foi usado. Peça outro.")).toBeInTheDocument();
  });

  it("Google e Apple só aparecem com as flags", () => {
    const { rerender } = render(<EntrarView next="/" onSend={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Google/ })).not.toBeInTheDocument();
    rerender(<EntrarView next="/" onSend={vi.fn()} google apple />);
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar com Apple" })).toBeInTheDocument();
  });
});
