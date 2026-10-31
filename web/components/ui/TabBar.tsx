import Link from "next/link";
import { BookIcon, HomeIcon, ListIcon, PersonIcon } from "./icons";

export type Tab = "hoje" | "receitas" | "lista" | "perfil";

const TABS: { id: Tab; label: string; href: string | null; Icon: typeof HomeIcon }[] = [
  { id: "hoje", label: "Hoje", href: "/hoje", Icon: HomeIcon },
  { id: "receitas", label: "Receitas", href: "/receitas", Icon: BookIcon },
  { id: "lista", label: "Lista", href: null, Icon: ListIcon },
  { id: "perfil", label: "Perfil", href: null, Icon: PersonIcon },
];

export function TabBar({ active }: { active: Tab }) {
  return (
    <nav aria-label="Principal"
      className="fixed inset-x-0 bottom-0 z-20 border-t border-hair bg-white/90 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
      <ul className="mx-auto flex h-[60px] max-w-[480px] items-start justify-around px-3 pt-2">
        {TABS.map(({ id, label, href, Icon }) => {
          const on = id === active;
          const cls = "flex flex-col items-center gap-1 text-[11px] font-semibold " + (on ? "text-acc" : "text-grey");
          return (
            <li key={id}>
              {href ? (
                <Link href={href} className={cls} aria-current={on ? "page" : undefined}><Icon />{label}</Link>
              ) : (
                <span className={cls + " opacity-40"} aria-disabled="true" title="Em breve"><Icon />{label}</span>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
