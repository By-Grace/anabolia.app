import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";

function env(): Record<string, string> {
  try {
    return Object.fromEntries(
      readFileSync(".env.local", "utf8").split("\n").filter((l) => l.includes("=")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)])
    );
  } catch {
    return {};
  }
}

async function anonymousEnabled(): Promise<string | null> {
  const e = env();
  const url = e.NEXT_PUBLIC_SUPABASE_URL;
  const key = e.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return "web/.env.local sem as chaves do Supabase";
  const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } });
  const body = (await res.json()) as { external?: { anonymous_users?: boolean } };
  return body.external?.anonymous_users ? null : "login anônimo desligado no Supabase (Authentication → Sign In / Providers)";
}

test("loop central: Hoje → receita → cozinhar → marcar → Hoje atualiza", async ({ page }) => {
  const reason = await anonymousEnabled();
  test.skip(reason !== null, reason ?? "");

  await page.goto("/hoje");
  const remaining = page.getByTestId("remaining");
  await expect(remaining).toContainText("g para fechar");
  const before = Number((await remaining.innerText()).match(/\d+/)![0]);

  await page.getByRole("link", { name: /\+\d+ g proteína/ }).first().click();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const protein = Number((await page.getByTestId("stat").first().innerText()).match(/\d+/)![0]);

  await page.getByRole("link", { name: "Começar a cozinhar" }).click();
  // A página da receita também tem "Marquei, comi": só procurar depois de o modo cozinhar abrir.
  await page.waitForURL("**/cozinhar/**");
  for (;;) {
    const done = page.getByRole("button", { name: "Marquei, comi" });
    if (await done.isVisible()) { await done.click(); break; }
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }

  await page.waitForURL("**/hoje");
  await expect(remaining).toContainText(String(Math.max(0, before - protein)));
});

test("parte 3: cadastro → Hoje com a meta própria → pôr na lista → Lista e Perfil", async ({ page }) => {
  const reason = await anonymousEnabled();
  test.skip(reason !== null, reason ?? "");

  // Visitante novo cai no cadastro.
  await page.goto("/");
  await page.waitForURL("**/comecar");
  await page.getByRole("radio", { name: "Homem" }).click();
  await page.getByLabel("Idade").fill("30");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByLabel("Peso").fill("80");
  await page.getByLabel("Altura").fill("180");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.getByRole("radio", { name: /Moderado/ }).click();
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByTestId("goal-protein")).toContainText("160");
  await page.getByRole("button", { name: "Começar" }).click();

  await page.waitForURL("**/hoje");
  await expect(page.getByText(/de 160 g de proteína/)).toBeVisible();
  await expect(page.getByText(/meta padrão/)).toHaveCount(0);

  await page.goto("/receitas/strogonoff-frango");
  await page.getByRole("button", { name: "Pôr na lista de compras" }).click();
  await expect(page.getByText("Na lista")).toBeVisible();
  await page.getByRole("link", { name: "Ver lista" }).click();
  await page.waitForURL("**/lista");
  await expect(page.getByRole("region", { name: "Strogonoff de frango com arroz" })).toBeVisible();

  await page.getByRole("link", { name: "Perfil" }).click();
  await page.waitForURL("**/perfil");
  await expect(page.getByRole("button", { name: "Editar meta de proteína, 160 g" })).toBeVisible();
});
