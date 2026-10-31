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

/** 0.5 → "½", 1.5 → "1½", 2 → "2" */
export function fmtHalf(n: number): string {
  const whole = Math.floor(n);
  const half = n - whole >= 0.5;
  if (!half) return fmtInt(whole);
  return whole === 0 ? "½" : `${fmtInt(whole)}½`;
}

type Q = { qty: number; unit: string; grams?: number };

/** Medida caseira: "1 un", "½ un", "2 dentes", "15 ml". */
export function fmtHousehold(i: Q): string {
  if (i.unit === "a gosto") return "a gosto";
  if (i.unit === "g") return `${fmtInt(i.qty)} g`;
  const unit = i.qty > 1 && PLURAL[i.unit] ? PLURAL[i.unit] : i.unit;
  return `${fmtHalf(i.qty)} ${unit}`;
}

/** Coluna principal: sempre gramas quando houver peso; senão a medida caseira. */
export function fmtWeight(i: Q): string {
  if (i.unit === "a gosto") return "a gosto";
  if (i.unit === "g") return `${fmtInt(i.qty)} g`;
  if (i.grams) return `${fmtInt(i.grams)} g`;
  return fmtHousehold(i);
}

/** Compatível com o formato anterior. */
export const fmtQty = fmtWeight;

/** "01/12" no fuso local. */
export function fmtDayMonth(iso: string, tz: string = DEFAULT_TZ): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: tz, day: "2-digit", month: "2-digit" }).format(new Date(iso));
}
