"use client";

import { useState } from "react";
import Link from "next/link";
import type { ShoppingGroup } from "@/lib/domain/shopping";
import { ButtonLink, buttonClass } from "@/components/ui/Button";
import { CheckIcon, CloseIcon } from "@/components/ui/icons";
import { ErrorNotice } from "@/app/hoje/ErrorNotice";

const FAIL = "Não deu para salvar. Tente de novo.";
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function ListaView({ groups: initial, onCheck, onRemove, onClear, error }: {
  groups: ShoppingGroup[];
  onCheck: (slug: string, index: number, checked: boolean) => Promise<boolean>;
  onRemove: (slug: string) => Promise<boolean>;
  onClear: () => Promise<boolean>;
  error?: string;
}) {
  const [groups, setGroups] = useState(initial);
  const [confirming, setConfirming] = useState(false);
  const [alert, setAlert] = useState<string | null>(null);

  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const bought = groups.reduce((n, g) => n + g.items.filter((i) => i.checked).length, 0);

  const mark = (slug: string, index: number, checked: boolean) =>
    setGroups((gs) => gs.map((g) => g.slug !== slug ? g : {
      ...g, items: g.items.map((i) => (i.index === index ? { ...i, checked } : i)),
    }));

  // Otimista: muda na hora; se o servidor recusar, volta e avisa.
  const check = async (slug: string, index: number, checked: boolean) => {
    setAlert(null);
    mark(slug, index, checked);
    const ok = await onCheck(slug, index, checked).catch(() => false);
    if (!ok) { mark(slug, index, !checked); setAlert(FAIL); }
  };

  const remove = async (slug: string) => {
    setAlert(null);
    const before = groups;
    setGroups((gs) => gs.filter((g) => g.slug !== slug));
    const ok = await onRemove(slug).catch(() => false);
    if (!ok) { setGroups(before); setAlert(FAIL); }
  };

  const clear = async () => {
    setAlert(null);
    setConfirming(false);
    const before = groups;
    setGroups([]);
    const ok = await onClear().catch(() => false);
    if (!ok) { setGroups(before); setAlert(FAIL); }
  };

  const empty = groups.length === 0;

  return (
    <>
      <header className="mb-5">
        <p className="num text-[13px] font-medium text-grey">
          {empty || error ? "Compras das suas receitas" : `${plural(groups.length, "receita", "receitas")} · ${bought} de ${total} comprados`}
        </p>
        <div className="mt-0.5 flex items-baseline justify-between">
          <h1 className="text-[34px] font-bold leading-[1.05] tracking-[-0.025em]">Lista</h1>
          {!empty && !error && !confirming && (
            <button type="button" onClick={() => setConfirming(true)} className="h-11 text-[15px] font-semibold text-acc">Limpar</button>
          )}
        </div>
      </header>

      {error ? <ErrorNotice message={error} /> : (
        <>
          {confirming && (
            <div className="mb-5 rounded-[16px] bg-soft px-4 py-4 animate-[fadeIn_.2s_ease]">
              <p className="text-[16px] font-semibold tracking-[-0.01em]">Limpar a lista inteira?</p>
              <p className="mt-1 text-[14px] text-grey">Tira as {plural(groups.length, "receita", "receitas")} e o que já foi marcado.</p>
              <div className="mt-4 flex gap-2.5">
                <button type="button" onClick={() => setConfirming(false)} className={`${buttonClass("soft")} h-11 flex-1 bg-white`}>Cancelar</button>
                <button type="button" onClick={clear} className={`${buttonClass("primary")} h-11 text-[16px]`}>Limpar lista</button>
              </div>
            </div>
          )}

          {alert && <p role="alert" className="mb-4 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">{alert}</p>}

          {empty ? (
            <section className="pt-10 text-center">
              <h2 className="text-[19px] font-bold tracking-[-0.015em]">Sua lista está vazia</h2>
              <p className="mx-auto mt-1.5 max-w-[280px] text-[15px] leading-snug text-grey">Abra uma receita e toque em Pôr na lista de compras.</p>
              <ButtonLink href="/receitas" variant="soft" className="mt-6">Ver receitas</ButtonLink>
            </section>
          ) : (
            groups.map((g) => {
              const headId = `lista-${g.slug}`;
              const done = g.items.filter((i) => i.checked).length;
              return (
                <section key={g.slug} aria-labelledby={headId} className="mb-6">
                  <div className="mb-1 flex items-center gap-3">
                    <Link href={`/receitas/${g.slug}`} className="min-w-0 flex-1">
                      <h2 id={headId} className="truncate text-[19px] font-bold tracking-[-0.015em]">{g.name}</h2>
                      <p className="num mt-0.5 text-[13px] font-medium text-grey">
                        <span>{plural(g.portions, "porção", "porções")}</span> · {done} de {g.items.length}
                      </p>
                    </Link>
                    <button type="button" onClick={() => remove(g.slug)} aria-label={`Tirar ${g.name} da lista`}
                      className="grid size-9 flex-none place-items-center rounded-full bg-soft text-grey">
                      <CloseIcon />
                    </button>
                  </div>
                  <ul>
                    {g.items.map((it) => (
                      <li key={it.index}>
                        <button type="button" role="checkbox" aria-checked={it.checked} aria-label={`${it.name}, ${it.amount}`}
                          onClick={() => check(g.slug, it.index, !it.checked)}
                          className="flex w-full items-center gap-3 border-t border-hair py-2.5 text-left text-[15px] first:border-t-0">
                          <span className={"grid size-[22px] flex-none place-items-center rounded-[7px] border-2 text-white transition-colors " +
                            (it.checked ? "border-acc bg-acc" : "border-ring")}>
                            {it.checked && <CheckIcon />}
                          </span>
                          <span className={"min-w-0 flex-1 " + (it.checked ? "text-grey line-through decoration-1" : "")}>
                            {it.name}
                            {it.household && <span className="num ml-1.5 text-[13px] text-grey">{it.household}</span>}
                          </span>
                          <span className={"num font-bold " + (it.checked ? "text-grey" : "")}>{it.amount}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })
          )}
        </>
      )}
    </>
  );
}
