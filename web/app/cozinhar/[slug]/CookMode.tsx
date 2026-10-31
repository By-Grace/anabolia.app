"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Recipe } from "@/lib/recipes/schema";
import { slotForHour } from "@/lib/domain/suggest";
import { clampPortions } from "@/lib/domain/scale";
import { localHour } from "@/lib/data/day-key";
import { createTimer, fmtClock, type Timer } from "@/lib/cook/timer";
import { scaleHint } from "@/lib/cook/scale-hint";
import { beep, unlockAudio } from "@/lib/cook/beep";
import { loggedUrl, postMeal } from "@/lib/client/meals";
import { ChevronLeft, FlameIcon, PauseIcon, PlayIcon } from "@/components/ui/icons";
import { StepPills } from "@/components/ui/StepPills";
import { buttonClass } from "@/components/ui/Button";

type WakeLock = { release: () => Promise<void> };

export function CookMode({ recipe, portions, now = () => new Date(), clock = Date.now }: {
  recipe: Recipe; portions: number; now?: () => Date; clock?: () => number;
}) {
  const router = useRouter();
  const [i, setI] = useState(0);
  const [, force] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const total = recipe.steps.length;
  const step = recipe.steps[i];
  const last = i === total - 1;
  const factor = clampPortions(portions) / recipe.basePortions;

  // Um cronômetro por passo, guardado fora do render: sobrevive a "próximo", "anterior" e deslizes.
  const timers = useRef(new Map<number, Timer>());
  const alerted = useRef(new Set<number>());
  const timerFor = useCallback((k: number): Timer | null => {
    const s = recipe.steps[k];
    if (!s?.seconds) return null;
    let t = timers.current.get(k);
    if (!t) { t = createTimer(s.seconds, clock); timers.current.set(k, t); }
    return t;
  }, [recipe.steps, clock]);
  const timer = timerFor(i);
  const others = [...timers.current.entries()].filter(([k, t]) => k !== i && t.running());

  useEffect(() => {
    const id = setInterval(() => {
      let anyRunning = false;
      for (const [k, t] of timers.current) {
        if (t.running()) anyRunning = true;
        else if (t.done() && !alerted.current.has(k)) {
          alerted.current.add(k);
          beep();
          if ("vibrate" in navigator) navigator.vibrate?.([200, 100, 200]);
          anyRunning = true;
        }
      }
      if (anyRunning) force((n) => n + 1);
    }, 250);
    return () => clearInterval(id);
  }, []);

  // Tela acesa enquanto cozinha; readquire ao voltar de outro app.
  useEffect(() => {
    let lock: WakeLock | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<WakeLock> } };
    const acquire = () => { nav.wakeLock?.request("screen").then((l) => { lock = l; }).catch(() => {}); };
    const onVisible = () => { if (document.visibilityState === "visible") acquire(); };
    acquire();
    document.addEventListener("visibilitychange", onVisible);
    return () => { document.removeEventListener("visibilitychange", onVisible); lock?.release().catch(() => {}); };
  }, []);

  const go = (d: number) => {
    setError(null);
    setI((v) => Math.min(total - 1, Math.max(0, v + d)));
  };

  const toggleTimer = () => {
    if (!timer) return;
    unlockAudio();
    if (timer.running()) timer.pause(); else timer.start();
    force((n) => n + 1);
  };

  const finish = async () => {
    setSaving(true);
    setError(null);
    try {
      const id = await postMeal(recipe.slug, slotForHour(localHour(now())));
      router.push(loggedUrl(id));
    } catch {
      setError("Não deu para marcar agora. Tente de novo.");
      setSaving(false);
    }
  };

  const exit = () => {
    if (window.history.length > 1) router.back();
    else router.push(`/receitas/${recipe.slug}`);
  };

  const touchX = useRef<number | null>(null);

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
        <button type="button" onClick={exit} aria-label="Sair do modo cozinhar"
          className="grid size-9 flex-none place-items-center rounded-full bg-soft"><ChevronLeft size={20} /></button>
        <StepPills total={total} current={i} />
      </div>

      {others.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {others.map(([k, t]) => (
            <button key={k} type="button" onClick={() => setI(k)}
              aria-label={`Cronômetro do passo ${k + 1}: ${fmtClock(t.remaining())}`}
              className="num inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-[13px] font-semibold text-white">
              <span className="size-1.5 animate-pulse rounded-full bg-acc" />Passo {k + 1} · {fmtClock(t.remaining())}
            </button>
          ))}
        </div>
      )}

      <p key={i} className="mt-5 text-[28px] font-bold leading-[1.15] tracking-[-0.022em] text-balance animate-[stepIn_.35s_cubic-bezier(.16,1,.3,1)]">
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

      {error && <p role="alert" className="mb-3 rounded-2xl bg-soft px-4 py-3 text-sm font-medium text-ink">{error}</p>}

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
