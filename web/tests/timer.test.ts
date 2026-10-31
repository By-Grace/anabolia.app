import { describe, it, expect } from "vitest";
import { createTimer, fmtClock } from "@/lib/cook/timer";

function clock(start = 0) {
  let t = start;
  return { now: () => t, tick: (s: number) => { t += s * 1000; } };
}

describe("timer", () => {
  it("conta a partir do start e congela no pause", () => {
    const c = clock();
    const t = createTimer(180, c.now);
    expect(t.remaining()).toBe(180);
    c.tick(5);
    expect(t.remaining()).toBe(180);
    t.start(); c.tick(13);
    expect(t.remaining()).toBe(167);
    t.pause(); c.tick(30);
    expect(t.remaining()).toBe(167);
    t.start(); c.tick(7);
    expect(t.remaining()).toBe(160);
  });
  it("done em 0 e nunca negativo", () => {
    const c = clock();
    const t = createTimer(10, c.now);
    t.start(); c.tick(25);
    expect(t.remaining()).toBe(0);
    expect(t.done()).toBe(true);
  });
  it("fmtClock formata m:ss", () => {
    expect(fmtClock(180)).toBe("3:00");
    expect(fmtClock(167)).toBe("2:47");
    expect(fmtClock(5)).toBe("0:05");
  });
});
