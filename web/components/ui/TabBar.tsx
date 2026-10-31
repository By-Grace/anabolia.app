"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookIcon, HomeIcon, ListIcon, PersonIcon } from "./icons";

const TABS = [
  { id: "hoje", label: "Hoje", href: "/hoje", Icon: HomeIcon },
  { id: "receitas", label: "Receitas", href: "/receitas", Icon: BookIcon },
  { id: "lista", label: "Lista", href: null, Icon: ListIcon },
  { id: "perfil", label: "Perfil", href: null, Icon: PersonIcon },
] as const;

/** Rotas que mostram a barra. Receita e modo cozinhar têm a própria ação no rodapé. */
const ROOTS = ["/hoje", "/receitas"];

/**
 * Barra flutuante de vidro (padrão iOS 26 / WhatsApp): cápsula afastada da borda, translúcida,
 * com uma lente que desliza até a aba ativa. Vive no layout raiz para a lente animar entre telas.
 */
export function TabBar() {
  const pathname = usePathname() ?? "";
  if (!ROOTS.includes(pathname)) return null;
  const active = TABS.findIndex((t) => t.href === pathname);

  return (
    <nav aria-label="Principal" className="pointer-events-none fixed inset-x-0 bottom-0 z-20 flex justify-center px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}>
      <ul className="glass pointer-events-auto relative grid h-[64px] w-full max-w-[440px] grid-cols-4 rounded-full p-1">
        <li aria-hidden="true" className="tab-lens absolute inset-y-1 left-1 w-[calc((100%-0.5rem)/4)] rounded-full"
          style={{ transform: `translateX(${Math.max(0, active) * 100}%)`, opacity: active < 0 ? 0 : 1 }} />
        {TABS.map(({ id, label, href, Icon }, i) => {
          const on = i === active;
          const base = "relative z-10 flex h-full flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-semibold";
          return (
            <li key={id}>
              {href ? (
                <Link href={href} aria-current={on ? "page" : undefined}
                  className={`${base} transition-colors duration-300 ${on ? "text-acc" : "text-ink/75 active:scale-95"}`}>
                  <Icon size={25} weight={on ? "fill" : "regular"} />{label}
                </Link>
              ) : (
                <span aria-disabled="true" aria-label={`${label}, em breve`} title="Em breve" className={`${base} text-grey`}>
                  <Icon size={25} className="text-ring" />{label}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
