"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { MealSlot } from "@/lib/recipes/schema";
import { SetRow, type SetState } from "@/components/ui/SetRow";
import { loggedUrl, postMeal } from "@/lib/client/meals";

export type MealRowData = {
  slot: MealSlot;
  label: string;
  state: SetState;
  sub: string;
  value: string;
  href?: string;
  /** Receita que o círculo marca direto (só na próxima refeição). */
  quickLogSlug?: string;
  animate?: boolean;
};

export function MealRows({ rows }: { rows: MealRowData[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [pending, setPending] = useState<MealSlot | null>(null);
  const [error, setError] = useState<string | null>(null);

  const quickLog = async (slug: string, slot: MealSlot) => {
    if (busy) return;
    setBusy(true);
    setPending(slot);
    setError(null);
    try {
      const id = await postMeal(slug, slot);
      router.replace(loggedUrl(id));
    } catch {
      setPending(null);
      setError("Não deu para marcar agora. Tente de novo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {rows.map((r) => {
        const optimistic = pending === r.slot;
        return (
          <SetRow key={r.slot} label={r.label} sub={r.sub}
            value={optimistic ? r.value.replace(/^\+/, "") : r.value}
            state={optimistic ? "done" : r.state} href={r.href} animate={optimistic || r.animate}
            onCheck={r.quickLogSlug && !optimistic ? () => quickLog(r.quickLogSlug!, r.slot) : undefined} />
        );
      })}
      {error && <p role="alert" className="mt-2 text-sm font-medium text-ink">{error}</p>}
    </>
  );
}
