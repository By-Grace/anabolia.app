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
  for (;;) {
    const done = page.getByRole("button", { name: "Marquei, comi" });
    if (await done.isVisible()) { await done.click(); break; }
    await page.getByRole("button", { name: "Próximo passo" }).click();
  }

  await page.waitForURL("**/hoje");
  await expect(remaining).toContainText(String(Math.max(0, before - protein)));
});
