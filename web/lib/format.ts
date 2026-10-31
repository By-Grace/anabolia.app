import { DEFAULT_TZ } from "@/lib/data/day-key";

const int = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });

export const fmtInt = (n: number) => int.format(Math.round(n));

/** "Sábado, 31 de outubro" no fuso local. */
export function dayLabel(date: Date, tz: string = DEFAULT_TZ): string {
  const s = new Intl.DateTimeFormat("pt-BR", { timeZone: tz, weekday: "long", day: "numeric", month: "long" }).format(date);
  const clean = s.replace("-feira", "");
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/** "+45 g proteína · 25 min · 680 kcal" */
export function recipeMeta(r: { minutes: number; perPortion: { protein_g: number; kcal: number } }): string {
  return `+${fmtInt(r.perPortion.protein_g)} g proteína · ${r.minutes} min · ${fmtInt(r.perPortion.kcal)} kcal`;
}

const PLURAL: Record<string, string> = { dente: "dentes", colher: "colheres" };

/** "400 g", "2 dentes", "1 un", "a gosto" */
export function fmtQty(i: { qty: number; unit: string }): string {
  if (i.unit === "a gosto") return "a gosto";
  const unit = i.qty > 1 && PLURAL[i.unit] ? PLURAL[i.unit] : i.unit;
  return `${fmtInt(i.qty)} ${unit}`;
}
