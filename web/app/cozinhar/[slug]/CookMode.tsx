"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/recipes/schema";
import { slotForHour } from "@/lib/domain/suggest";
import { clampPortions } from "@/lib/domain/scale";
import { localHour } from "@/lib/data/day-key";
import { createTimer, fmtClock, type Timer } from "@/lib/cook/timer";
import { scaleHint } from "@/lib/cook/scale-hint";
import { ChevronLeft, FlameIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { buttonClass } from "@/components/ui/Button";

export function CookMode({ recipe, portions, now = () => new Date() }: { recipe: Recipe; portions: number; now?: () => Date }) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [, force] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const step = recipe.steps[i];
  const last = i === recipe.steps.length - 1;
  const factor = clampPortions(portions) / recipe.basePortions;

  const timer = useMemo<Timer | null>(() => (step.seconds ? createTimer(step.seconds) : null), [step]);
  const touchX = useRef<number | null>(null);

  // Atualiza o relógio enquanto roda.
  useEffect(() => {
    if (!timer) return;
    const id = setInterval(() => {
      force((n) => n + 1);
      if (timer.done()) {
        clearInterval(id);
        if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
      }
    }, 250);
    return () => clearInterval(id);
  }, [timer]);

  // Tela acesa enquanto cozinha.
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {});
    return () => { lock?.release().catch(() => {}); };
  }, []);

  const go = (d: number) => {
    setError(null);
    setI((v) => Math.min(recipe.steps.length - 1, Math.max(0, v + d)));
  };

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/log-meal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeSlug: recipe.slug, portions: 1, slot: slotForHour(localHour(now())) }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.push("/hoje");
    } catch {
      setError("Não deu para marcar agora. Tente de novo.");
      setSaving(false);
    }
  };

  const toggleTimer = () => {
    if (!timer) return;
    if (timer.running()) timer.pause(); else timer.start();
    force((n) => n + 1);
  };

  return (
    <main
      className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-5"
      style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 16px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 18px)" }}
      onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 60) go(dx < 0 ? 1 : -1);
      }}
    >
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => router.back()} aria-label="Sair do modo cozinhar"
          className="grid size-9 flex-none place-items-center rounded-full bg-soft"><ChevronLeft size={20} /></button>
        <div className="flex flex-1 gap-1.5" aria-hidden="true">
          {recipe.steps.map((_, k) => (
            <i key={k} data-testid="pill" data-on={k <= i}
              className={"h-1.5 flex-1 rounded-full transition-colors " + (k <= i ? "bg-acc" : "bg-track")} />
          ))}
        </div>
      </div>

      <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.06em] text-grey">
        Passo {i + 1} de {recipe.steps.length}
      </p>
      <p key={i} className="mt-2 text-[28px] font-bold leading-[1.15] tracking-[-0.022em] text-balance animate-[stepIn_.35s_cubic-bezier(.16,1,.3,1)]">
        {step.text}
      </p>

      {step.ingredientHint && (
        <span className="mt-[18px] inline-flex items-center gap-2 self-start rounded-xl bg-acc-soft px-3 py-2.5 text-sm font-semibold text-acc-text num">
          <FlameIcon size={16} />{scaleHint(step.ingredientHint, factor)}
        </span>
      )}

      <div className="mt-auto pb-6 pt-8 text-center">
        {timer && (
          <>
            <button type="button" onClick={toggleTimer} aria-label={timer.running() ? "Pausar cronômetro" : "Iniciar cronômetro"}
              className="mx-auto block">
              <span data-testid="clock" className={"num block text-[104px] font-bold leading-none tracking-[-0.04em] " + (timer.done() ? "text-ink" : "text-acc")}>
                {timer.done() ? "Pronto" : fmtClock(timer.remaining())}
              </span>
            </button>
            {!timer.done() && (
              <button type="button" onClick={toggleTimer} aria-hidden="true" tabIndex={-1}
                className="mt-4 inline-grid size-[52px] place-items-center rounded-full bg-soft">
                {timer.running() ? <PauseIcon /> : <PlayIcon />}
              </button>
            )}
          </>
        )}
      </div>

      {error && <p role="alert" className="mb-3 rounded-2xl bg-acc-soft px-4 py-3 text-sm font-medium text-acc-text">{error}</p>}

      <div className="flex gap-2.5">
        <button type="button" onClick={() => go(-1)} disabled={i === 0} aria-label="Passo anterior" className={buttonClass("secondary")}>
          <ChevronLeft size={20} />
        </button>
        {last ? (
          <button type="button" onClick={finish} disabled={saving} className={buttonClass("primary")}>
            {saving ? "Marcando…" : "Marquei, comi"}
          </button>
        ) : (
          <button type="button" onClick={() => go(1)} className={buttonClass("primary")}>Próximo passo</button>
        )}
      </div>
    </main>
  );
}
