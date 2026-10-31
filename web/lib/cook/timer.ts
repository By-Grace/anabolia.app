export type Timer = { start(): void; pause(): void; remaining(): number; done(): boolean; running(): boolean };

/** Cronômetro regressivo puro; o relógio é injetável para teste. */
export function createTimer(seconds: number, now: () => number = Date.now): Timer {
  const total = seconds * 1000;
  let elapsed = 0;
  let startedAt: number | null = null;
  const spent = () => elapsed + (startedAt === null ? 0 : now() - startedAt);
  return {
    start() { if (startedAt === null && spent() < total) startedAt = now(); },
    pause() { if (startedAt !== null) { elapsed += now() - startedAt; startedAt = null; } },
    remaining() { return Math.max(0, Math.ceil((total - spent()) / 1000)); },
    done() { return spent() >= total; },
    running() { return startedAt !== null && spent() < total; },
  };
}

export function fmtClock(seconds: number): string {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
