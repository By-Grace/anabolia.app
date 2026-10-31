import { describe, it, expect } from "vitest";
import { onboardingRoutes } from "@/app/comecar/routes";

describe("saídas do cadastro", () => {
  it("aberto pelo Perfil: volta e termina no Perfil", () => {
    expect(onboardingRoutes("perfil", false)).toEqual({ exitHref: "/perfil", doneHref: "/perfil" });
    expect(onboardingRoutes("perfil", true)).toEqual({ exitHref: "/perfil", doneHref: "/perfil" });
  });
  it("aberto por Hoje: volta e termina em Hoje", () => {
    expect(onboardingRoutes("hoje", false)).toEqual({ exitHref: "/hoje", doneHref: "/hoje" });
  });
  it("primeira vez, pela entrada do app: sem saída, termina em Hoje", () => {
    expect(onboardingRoutes(undefined, false)).toEqual({ exitHref: undefined, doneHref: "/hoje" });
    expect(onboardingRoutes("qualquer", false)).toEqual({ exitHref: undefined, doneHref: "/hoje" });
  });
  it("quem já tem os dados e chega sem origem pode sair para o Perfil", () => {
    expect(onboardingRoutes(undefined, true)).toEqual({ exitHref: "/perfil", doneHref: "/hoje" });
  });
});
