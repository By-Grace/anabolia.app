export const DEFAULT_TZ = "America/Sao_Paulo";

/** "AAAA-MM-DD" do dia local no fuso informado (padrão: São Paulo). */
export function localDayKey(date: Date, tz: string = DEFAULT_TZ): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

/** Hora local (0–23) no fuso informado. */
export function localHour(date: Date, tz: string = DEFAULT_TZ): number {
  const h = new Intl.DateTimeFormat("en-GB", { timeZone: tz, hour: "2-digit", hour12: false }).format(date);
  return Number(h) % 24;
}
