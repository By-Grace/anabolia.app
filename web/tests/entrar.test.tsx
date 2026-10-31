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
    expect(screen.getByText("Esse link não abriu aqui. Ele vence, só vale uma vez e só funciona no navegador onde você pediu. Peça outro e, se precisar, use o código do e-mail.")).toBeInTheDocument();
  });

  it("Google e Apple só aparecem com as flags", () => {
    const { rerender } = render(<EntrarView next="/" onSend={vi.fn()} />);
    expect(screen.queryByRole("button", { name: /Google/ })).not.toBeInTheDocument();
    rerender(<EntrarView next="/" onSend={vi.fn()} google apple />);
    expect(screen.getByRole("button", { name: "Continuar com Google" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continuar com Apple" })).toBeInTheDocument();
  });

  it("no app instalado, dá para entrar digitando o código de 6 dígitos do e-mail", async () => {
    const onSend = vi.fn().mockResolvedValue({ ok: true, kind: "email_change" });
    const onVerify = vi.fn().mockResolvedValue({ ok: true });
    render(<EntrarView next="/assinar" onSend={onSend} onVerify={onVerify} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: "Receber link" }));
    await userEvent.type(await screen.findByLabelText("Código do e-mail"), "123456");
    await userEvent.click(screen.getByRole("button", { name: "Entrar com o código" }));
    expect(onVerify).toHaveBeenCalledWith("a@b.com", "123456", "email_change", "/assinar");
  });

  it("código recusado mostra o erro e deixa tentar de novo", async () => {
    const onVerify = vi.fn().mockResolvedValue({ ok: false, message: "Código errado ou vencido. Peça outro link." });
    render(<EntrarView next="/" onSend={vi.fn().mockResolvedValue({ ok: true, kind: "email" })} onVerify={onVerify} />);
    await userEvent.type(screen.getByLabelText("E-mail"), "a@b.com");
    await userEvent.click(screen.getByRole("button", { name: "Receber link" }));
    await userEvent.type(await screen.findByLabelText("Código do e-mail"), "000000");
    await userEvent.click(screen.getByRole("button", { name: "Entrar com o código" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Código errado ou vencido. Peça outro link.");
    expect(screen.getByRole("button", { name: "Entrar com o código" })).toBeEnabled();
  });
});
