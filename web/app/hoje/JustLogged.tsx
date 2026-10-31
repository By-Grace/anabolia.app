"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteMeal } from "@/lib/client/meals";
import { CheckIcon } from "@/components/ui/icons";

/** O fim da "série": confirma o que entrou no dia e oferece desfazer por alguns segundos. */
export function JustLogged({ id, text }: { id: string; text: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setOpen(false);
      try { window.history.replaceState(null, "", "/hoje"); } catch {}
    }, 8000);
    return () => clearTimeout(t);
  }, []);

  if (!open) return null;

  const undo = async () => {
    setBusy(true);
    try {
      await deleteMeal(id);
      router.replace("/hoje");
    } catch {
      setBusy(false);
    }
  };

  return (
    <div role="status" className="fixed inset-x-0 z-30 flex justify-center px-4"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 86px)" }}>
      <div className="flex w-full max-w-[440px] items-center gap-3 rounded-2xl bg-ink px-4 py-3 text-white shadow-[0_10px_30px_rgba(0,0,0,.25)] animate-[toastIn_.4s_cubic-bezier(.16,1,.3,1)]">
        <span className="grid size-6 flex-none place-items-center rounded-full bg-acc"><CheckIcon /></span>
        <span className="num flex-1 text-[15px] font-semibold">{text}</span>
        <button type="button" onClick={undo} disabled={busy} className="text-[15px] font-semibold text-white/80 underline-offset-4 hover:underline">
          Desfazer
        </button>
      </div>
    </div>
  );
}
