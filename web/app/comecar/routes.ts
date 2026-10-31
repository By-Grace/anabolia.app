/**
 * De onde o cadastro foi aberto decide a saída e o destino final:
 * pelo Perfil, volta e termina no Perfil; por Hoje, em Hoje; na primeira vez (entrada do app), sem saída.
 */
const ORIGINS: Record<string, string> = { perfil: "/perfil", hoje: "/hoje" };

export function onboardingRoutes(de: string | undefined, hasBody: boolean): { exitHref: string | undefined; doneHref: string } {
  const origin = de ? ORIGINS[de] : undefined;
  if (origin) return { exitHref: origin, doneHref: origin };
  return { exitHref: hasBody ? "/perfil" : undefined, doneHref: "/hoje" };
}
