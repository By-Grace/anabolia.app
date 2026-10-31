type Ctx = AudioContext;

let ctx: Ctx | null = null;

/** Cria/destrava o áudio. Precisa ser chamado dentro de um toque do usuário (regra do iOS). */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return;
  try {
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    ctx = null;
  }
}

/** Três bipes curtos. Silencioso se o áudio não foi destravado. */
export function beep(): void {
  if (!ctx) return;
  const t0 = ctx.currentTime;
  for (let k = 0; k < 3; k++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, t0 + k * 0.3);
    gain.gain.exponentialRampToValueAtTime(0.4, t0 + k * 0.3 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + k * 0.3 + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0 + k * 0.3);
    osc.stop(t0 + k * 0.3 + 0.22);
  }
}
